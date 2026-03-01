from typing import Any, Dict
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.future import select

from app.api.dependencies import get_db, get_ocr_service, rate_limit_dependency, get_medication_repository
from app.api.v1.auth import get_current_user, require_role
from app.domain.models.user import User, UserRole
from app.domain.models.prescription import Prescription, AnalysisStatus
from app.services.ocr.ocr_service import OCRService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"],
    dependencies=[Depends(rate_limit_dependency)],
)

ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit

async def process_ocr_in_background(
    prescription_id: str,
    image_bytes: bytes,
    known_drugs: list[str],
    ocr_service: OCRService,
    db: Session
):
    """Background task to run heavy OCR and update the prescription status."""
    logger.info(f"Starting background OCR processing for prescription {prescription_id}")
    try:
        raw_result = await ocr_service.extract_drug_from_image(image_bytes, known_drugs)
        # Re-fetch prescription within the background session context or use the original session
        # Actually it's safer to get a fresh session for the background task to avoid thread issues with SQLite/SQLAlchemy
        prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
        if prescription:
            prescription.analysis_status = AnalysisStatus.PROCESSED
            prescription.matched_drugs = raw_result.get("matched_drugs", [])
            prescription.extracted_text = raw_result.get("raw_text", "")
            db.commit()
            logger.info(f"Successfully processed OCR for prescription {prescription_id}")
    except Exception as e:
        logger.error(f"OCR background processing failed for prescription {prescription_id}: {str(e)}")
        prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
        if prescription:
            prescription.analysis_status = AnalysisStatus.FAILED
            db.commit()


@router.post("/upload", response_model=Dict[str, Any], status_code=status.HTTP_202_ACCEPTED)
async def upload_prescription(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    current_user: User = Depends(require_role([UserRole.PATIENT, UserRole.CARETAKER, UserRole.DOCTOR])),
    ocr_service: OCRService = Depends(get_ocr_service),
    known_drugs: list[str] = Depends(get_medication_repository),
    db: Session = Depends(get_db)
):
    if str(image.content_type).lower() not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Allowed types are: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )

    image_bytes = await image.read()

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the maximum limit of 5MB.",
        )

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is completely empty.",
        )

    # 1. Create PENDING prescription
    prescription = Prescription(
        patient_id=current_user.id,
        analysis_status=AnalysisStatus.PENDING,
        image_url=image.filename # Mocking image URL for now
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    # 2. Add OCR extraction to background task
    background_tasks.add_task(
        process_ocr_in_background,
        prescription.id,
        image_bytes,
        known_drugs,
        ocr_service,
        db
    )

    return {
        "success": True, 
        "message": "Prescription uploaded successfully. OCR analysis is running in the background.",
        "prescription_id": prescription.id,
        "status": prescription.analysis_status
    }


@router.get("/{prescription_id}", response_model=Dict[str, Any])
async def get_prescription(
    prescription_id: str,
    current_user: User = Depends(require_role([UserRole.PATIENT, UserRole.CARETAKER, UserRole.DOCTOR])),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
        
    # Standard multi-tenant safety barrier (doctors can see any for now, but restrict to patient_id if Patient)
    if current_user.role == UserRole.PATIENT and prescription.patient_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this prescription")
        
    return {
        "id": prescription.id,
        "patient_id": prescription.patient_id,
        "upload_date": prescription.upload_date,
        "status": prescription.analysis_status,
        "matched_drugs": prescription.matched_drugs,
        "extracted_text": prescription.extracted_text
    }


@router.get("/", response_model=Dict[str, Any])
async def list_prescriptions(
    current_user: User = Depends(require_role([UserRole.PATIENT, UserRole.CARETAKER])),
    db: Session = Depends(get_db)
):
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == current_user.id).order_by(Prescription.upload_date.desc()).all()
    return {
        "prescriptions": [
            {
                "id": p.id,
                "upload_date": p.upload_date,
                "status": p.analysis_status,
                "matched_drugs": p.matched_drugs
            } for p in prescriptions
        ]
    }
