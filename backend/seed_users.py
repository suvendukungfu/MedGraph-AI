"""Seed demo users into the SQLite database for local development."""
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.infrastructure.db.database import engine, SessionLocal, init_database
from app.domain.models.user import User, UserRole
from app.core.security import get_password_hash

# Create all tables
init_database()

DEMO_USERS = [
    {"email": "doctor@medgraph.ai",    "password": "doctor123",    "role": UserRole.DOCTOR,    "phone": "555-100-0001"},
    {"email": "patient@medgraph.ai",   "password": "patient123",   "role": UserRole.PATIENT,   "phone": "555-200-0002"},
    {"email": "admin@medgraph.ai",     "password": "admin123",     "role": UserRole.ADMIN,     "phone": "555-300-0003"},
    {"email": "caretaker@medgraph.ai", "password": "caretaker123", "role": UserRole.CARETAKER, "phone": "555-400-0004"},
]

db = SessionLocal()

for u in DEMO_USERS:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        print(f"  ✓ Already exists: {u['email']}")
        continue
    new_user = User(
        email=u["email"],
        password_hash=get_password_hash(u["password"]),
        phone=u["phone"],
        role=u["role"],
    )
    db.add(new_user)
    print(f"  ✚ Created: {u['email']} (role={u['role'].value})")

db.commit()
db.close()
print("\n✅ Seed complete!")
