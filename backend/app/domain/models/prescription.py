from datetime import datetime, timezone
import uuid
import enum

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum as SQLEnum, Time
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class AnalysisStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    # Storing patient_id directly to avoid forced foreign key constraints if users live across DB boundaries
    # Alternatively could be ForeignKey("users.id")
    patient_id = Column(String, index=True, nullable=False) 
    
    upload_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    image_url = Column(String, nullable=True)
    analysis_status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False)
    
    # Raw extracted text 
    extracted_text = Column(String, nullable=True)
    # Matched drugs array
    matched_drugs = Column(JSON, default=list)

    # relations
    schedules = relationship("MedicationSchedule", back_populates="prescription", cascade="all, delete-orphan")

class MedicationSchedule(Base):
    __tablename__ = "medication_schedules"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    prescription_id = Column(String, ForeignKey("prescriptions.id"), nullable=False)
    patient_id = Column(String, index=True, nullable=False)
    
    drug_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    scheduled_time = Column(Time, nullable=False)
    
    # relations
    prescription = relationship("Prescription", back_populates="schedules")
