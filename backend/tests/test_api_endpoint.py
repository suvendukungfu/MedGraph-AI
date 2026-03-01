"""
API endpoint tests — uses a synthetic 1×1 PNG in-memory so
no real image file must be present on the filesystem.
"""
import io
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

# Minimal valid 1×1 white PNG (67 bytes) — avoids needing a real image file
MINIMAL_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
    b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
    b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


@patch('app.api.v1.ocr.OCRService.extract_drug_from_image', new_callable=AsyncMock)
def test_extract_drug(mock_extract):
    """POST /api/v1/ocr/extract-drug returns a properly shaped JSON envelope."""
    # OCRService.extract_drug_from_image returns the raw inner dict.
    # The /ocr/extract-drug endpoint wraps it in {"success": True, "data": <here>, "error": None}
    mock_extract.return_value = {
        "extracted_text": "AM0XIC1LL1N 500 MG",
        "matched_drug": "AMOXICILLIN",
        "confidence_score": 0.85,
    }

    response = client.post(
        "/api/v1/ocr/extract-drug",
        files={"image": ("test.png", io.BytesIO(MINIMAL_PNG), "image/png")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["matched_drug"] == "AMOXICILLIN"
    print("\n✅ FastAPI OCR endpoint handled image upload and returned JSON envelope.")


if __name__ == "__main__":
    test_extract_drug()
