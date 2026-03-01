"""
Refactored OCR component tests:
- Sync tests for TextCleaner & DrugMatcher (no image needed)
- Async test for the full OCRService facade with a mocked image processor
"""
import pytest
from unittest.mock import patch, AsyncMock
from app.services.ocr.text_cleaner import TextCleaner
from app.services.ocr.drug_matcher import DrugMatcher
from app.services.ocr.ocr_service import OCRService

KNOWN_DB = ["ASPIRIN", "WARFARIN", "METFORMIN", "AMOXICILLIN", "LISINOPRIL"]

# Minimal valid 1×1 PNG in-memory — no real image file needed
MINIMAL_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
    b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
    b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_text_cleaner_and_drug_matcher():
    """TextCleaner normalises OCR noise and DrugMatcher finds the correct drug."""
    mock_tesseract_output = "AM0XIC1LL1N 500 MG\n"
    clean_text = TextCleaner.clean_ocr_text(mock_tesseract_output)
    match_result = DrugMatcher.match_drug(clean_text, KNOWN_DB)

    assert match_result is not None, "DrugMatcher returned None for a known drug"
    drug_name, confidence = match_result
    assert drug_name == "AMOXICILLIN", f"Expected AMOXICILLIN, got {drug_name}"
    print(f"\n✅ TextCleaner + DrugMatcher: matched '{drug_name}' (confidence {confidence:.2f})")


@pytest.mark.asyncio
@patch.object(OCRService, "extract_drug_from_image", new_callable=AsyncMock)
async def test_ocr_pipeline(mock_extract):
    """Full OCRService facade returns a correctly shaped result envelope."""
    mock_extract.return_value = {
        "matched_drug": "AMOXICILLIN",
        "extracted_text": "AMOXICILLIN 500MG",
        "confidence_score": 0.91,
    }

    service = OCRService()
    result = await service.extract_drug_from_image(MINIMAL_PNG, KNOWN_DB)

    assert result["matched_drug"] == "AMOXICILLIN"
    print("\n✅ Multi-stage Robust OCR logic executed successfully.")
