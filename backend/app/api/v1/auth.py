from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.domain.models.user import User, PatientProfile, UserRole
from app.infrastructure.db.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: UserRole = UserRole.PATIENT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    is_new: bool

class CompleteOnboardingPayload(BaseModel):
    age: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    chronic_conditions: List[str] = []
    allergies: List[str] = []

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------

def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """FastAPI dependency – decodes the JWT and fetches the SQLAlchemy User."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    elif request.cookies.get("medgraph_token"):
        token = request.cookies.get("medgraph_token")
        
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
        
    return user

def require_role(*allowed_roles: UserRole):
    """Enforces role-based access control based on DB state."""
    def _check(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return user
    return _check

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user and issues a JWT access token."""
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        phone=payload.phone,
        role=payload.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token_payload = {
        "sub": new_user.id,
        "email": new_user.email,
        "role": new_user.role.value
    }
    encoded_token = create_access_token(token_payload)
    return {
        "access_token": encoded_token,
        "token_type": "bearer",
        "role": new_user.role.value,
        "is_new": True
    }

@router.post("/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user and issues a JWT access token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token_payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.value
    }
    encoded_token = create_access_token(token_payload)
    
    # Check if patient profile exists
    is_new = False
    if user.role == UserRole.PATIENT:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
        if not profile:
            is_new = True
            
    return {
        "access_token": encoded_token,
        "token_type": "bearer",
        "role": user.role.value,
        "is_new": is_new
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """Returns the current authenticated user profile."""
    return {
        "user_id": user.id,
        "email": user.email,
        "phone": user.phone,
        "role": user.role.value,
        "is_verified": user.is_verified,
        "created_at": user.created_at
    }

@router.post("/onboarding/complete")
def complete_onboarding(
    payload: CompleteOnboardingPayload,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Completes the patient or caretaker onboarding by persisting profile details."""
    if user.role == UserRole.PATIENT:
        existing_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
        if existing_profile:
            existing_profile.age = payload.age
            existing_profile.height = payload.height
            existing_profile.weight = payload.weight
            existing_profile.chronic_conditions = payload.chronic_conditions
            existing_profile.allergies = payload.allergies
        else:
            profile = PatientProfile(
                user_id=user.id,
                age=payload.age,
                height=payload.height,
                weight=payload.weight,
                chronic_conditions=payload.chronic_conditions,
                allergies=payload.allergies
            )
            db.add(profile)
        db.commit()
    
    return {"success": True, "message": "Onboarding complete"}

# Note: We replaced the google-callback code for V2, bridging frontend to normal email auth. 
