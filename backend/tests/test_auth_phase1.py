from fastapi.testclient import TestClient
from main import app
from app.infrastructure.db.database import get_db, SessionLocal
from app.domain.models.user import Base, User, UserRole

# Set up test database specific configurations if necessary,
# but using the existing engine works well enough for integration tests
client = TestClient(app)

def setup_module(module):
    """Setup before any tests run"""
    from app.infrastructure.db.database import engine
    Base.metadata.create_all(bind=engine)

def teardown_module(module):
    """Teardown after all tests run"""
    from app.infrastructure.db.database import engine
    # Optionally drop tables if using a dedicated test db
    pass

def test_user_registration():
    """Test standard valid user registration"""
    payload = {
        "email": "test_register@medgraph.ai",
        "password": "securepassword123",
        "phone": "555-1234",
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
        "email": "test_register@medgraph.ai",
        "password": "securepassword123",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400

def test_user_login():
    """Test logging in with established credentials returns JWT"""
    payload = {
        "email": "test_register@medgraph.ai",
        "password": "securepassword123",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "patient"
    assert data["is_new"] is True # Because no PatientProfile was created yet

def test_invalid_login_fails():
    """Invalid credentials return 401"""
    payload = {
        "email": "test_register@medgraph.ai",
        "password": "wrongpassword999",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401

def test_get_me_with_jwt():
    """Testing protected endpoint requiring get_current_user dependency"""
    # 1. Login to get token
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "test_register@medgraph.ai",
        "password": "securepassword123",
    })
    token = login_resp.json()["access_token"]
    
    # 2. Access /me
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    
    data = me_resp.json()
    assert data["email"] == "test_register@medgraph.ai"
    assert data["role"] == "patient"
