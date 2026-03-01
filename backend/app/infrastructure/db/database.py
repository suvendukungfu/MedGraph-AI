from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from pymongo import MongoClient
import certifi

from app.core.config import get_settings
from app.domain.models.adherence import Base as AdherenceBase


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
# We fetch MONGO_URI from env directly as it might not be in settings yet
mongo_uri = os.getenv("MONGO_URI")
mongo_client = None
if mongo_uri:
    try:
        mongo_client = MongoClient(mongo_uri, tls=True, tlsCAFile=certifi.where())
    except Exception:
        # Graceful failure for dev environments without Atlas
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
    return mongo_client.get_database("medgraph_ai")

def init_database() -> None:
    """
    Creates known ORM tables on startup.
    In production, prefer Alembic migrations for all schema changes.
    """
    AdherenceBase.metadata.create_all(bind=engine)


def check_database_health() -> bool:
    # Check relational DB
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        relational_ok = True
    except Exception:
        relational_ok = False

    # Check Mongo
    mongo_ok = False
    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            mongo_ok = True
        except Exception:
            mongo_ok = False
    else:
        # If no client configured, we treat it as OK if the app doesn't strictly require it 
        # but for this specific task, it seems important.
        mongo_ok = False

    return relational_ok and (not mongo_uri or mongo_ok)
