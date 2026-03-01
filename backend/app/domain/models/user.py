import enum
from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    CARETAKER = "caretaker"
    ADMIN = "admin"
    DOCTOR = "doctor"

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.PATIENT)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    patient_profile = relationship("PatientProfile", foreign_keys="[PatientProfile.user_id]", back_populates="user", uselist=False, cascade="all, delete-orphan")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    age = Column(String, nullable=True)
    weight = Column(String, nullable=True)
    height = Column(String, nullable=True)
    
    chronic_conditions = Column(JSON, default=list, nullable=False)
    allergies = Column(JSON, default=list, nullable=False)
    
    caretaker_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="patient_profile")
    caretaker = relationship("User", foreign_keys=[caretaker_id])
