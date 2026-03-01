import uuid
from fastapi.testclient import TestClient
from main import app
from app.infrastructure.db.database import get_db, SessionLocal, engine
from app.domain.models.user import Base, User, UserRole

client = TestClient(app)

# Generate a unique email per test run to avoid duplicate conflicts
_unique = uuid.uuid4().hex[:8]
TEST_EMAIL = f"test_{_unique}@medgraph.ai"
TEST_PASSWORD = "securepassword123"
TEST_PHONE = "555-1234"

def setup_module(module):
    """Ensure tables exist before tests run."""
    Base.metadata.create_all(bind=engine)

def teardown_module(module):
    """Clean up test user after all tests complete."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == TEST_EMAIL).first()
        if user:
            db.delete(user)
            db.commit()
    finally:
        db.close()

def test_user_registration():
    """Test standard valid user registration"""
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "phone": TEST_PHONE,
        "role": "patient"
    }

    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert "access_token" in data
    assert data["role"] == "patient"
    assert data["is_new"] is True

def test_duplicate_registration_fails():
    """Duplicate email should return 400"""
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400

def test_user_login():
    """Test logging in with established credentials returns JWT"""
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["role"] == "patient"
    assert data["is_new"] is True  # Because no PatientProfile was created yet

def test_invalid_login_fails():
    """Invalid credentials return 401"""
    payload = {
        "email": TEST_EMAIL,
        "password": "wrongpassword999",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401

def test_get_me_with_jwt():
    """Testing protected endpoint requiring get_current_user dependency"""
    # 1. Login to get token
    login_resp = client.post("/api/v1/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    })
    token = login_resp.json()["access_token"]

    # 2. Access /me
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200

    data = me_resp.json()
    assert data["email"] == TEST_EMAIL
    assert data["role"] == "patient"
