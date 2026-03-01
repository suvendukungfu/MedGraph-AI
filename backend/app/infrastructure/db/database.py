from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv

from app.core.config import get_settings
from app.domain.models.adherence import Base as AdherenceBase
from app.domain.models.user import Base as UserBase
from app.domain.models.prescription import Base as PrescriptionBase

# Initialize environment variables from .env
load_dotenv()

settings = get_settings()

# --- SQLAlchemy (SQLite/Relational) ---
_connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(
    settings.database_url,
    echo=settings.sqlalchemy_echo,
    future=True,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)

# --- MongoDB (Atlas) ---
mongo_uri = os.getenv("MONGO_URI")
mongo_client = None
if mongo_uri:
    try:
        # Strip quotes if they exist in .env
        clean_uri = mongo_uri.strip('"').strip("'")
        mongo_client = MongoClient(clean_uri, tls=True, tlsCAFile=certifi.where())
    except Exception:
        mongo_client = None

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mongo_db():
    if not mongo_client:
        return None
    # Use the same DB name as seed_atlas.py: "medgraph_ai"
    return mongo_client.get_database("medgraph_ai")

def init_database() -> None:
    AdherenceBase.metadata.create_all(bind=engine)
    UserBase.metadata.create_all(bind=engine)
    PrescriptionBase.metadata.create_all(bind=engine)

def check_database_health() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        relational_ok = True
    except Exception:
        relational_ok = False

    mongo_ok = False
    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            mongo_ok = True
        except Exception:
            mongo_ok = False
    else:
        mongo_ok = (not mongo_uri) # OK if not configured

    return relational_ok and mongo_ok
