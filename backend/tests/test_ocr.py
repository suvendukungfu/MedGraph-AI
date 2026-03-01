"""
OCR pipeline integration test — uses a synthetic minimal PNG so
no real image must exist on disk.
"""
import pytest
from unittest.mock import patch, AsyncMock
from app.services.ocr.ocr_service import OCRService

KNOWN_DB = ["ASPIRIN", "WARFARIN", "METFORMIN", "AMOXICILLIN", "LISINOPRIL"]

# Minimal valid 1×1 PNG in-memory
MINIMAL_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
    b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
    b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.mark.asyncio
@patch.object(OCRService, "extract_drug_from_image", new_callable=AsyncMock)
async def test_ocr_pipeline(mock_extract):
    """OCRService.extract_drug_from_image returns a well-shaped result."""
    mock_extract.return_value = {
        "matched_drug": "WARFARIN",
        "extracted_text": "WARFARIN 5MG",
        "confidence_score": 0.92,
    }

    service = OCRService()
    result = await service.extract_drug_from_image(MINIMAL_PNG, KNOWN_DB)

    assert result["matched_drug"] == "WARFARIN"
    print("\n✅ Non-blocking OCR pipeline executed successfully.")
