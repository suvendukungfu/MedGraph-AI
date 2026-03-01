from __future__ import annotations

import time
import re
from typing import List

from fastapi import Depends, HTTPException, Request, status

from app.core.config import get_settings
from app.infrastructure.cache.cache import CacheClient, get_cache_client
from app.infrastructure.db.database import get_db, get_mongo_db
from app.services.interactions.interaction_engine import InteractionEngine
from app.services.interactions.models import InteractionRecord, SeverityLevel
from app.services.ocr.ocr_service import OCRService
from app.services.scheduling.schedule_optimizer import ScheduleOptimizer


def get_ocr_service() -> OCRService:
    return OCRService()


def get_interaction_engine() -> InteractionEngine:
    return InteractionEngine()


def get_schedule_optimizer() -> ScheduleOptimizer:
    return ScheduleOptimizer()


def get_cache() -> CacheClient:
    return get_cache_client()


def get_medication_repository() -> list[str]:
    """
    Fetches the full list of canonical drug names from the 'drugs' collection.
    Used for OCR fuzzy matching.
    """
    db = get_mongo_db()
    if db is None:
        return ["ASPIRIN", "WARFARIN", "METFORMIN", "AMOXICILLIN", "LISINOPRIL"]
    
    try:
        # Fetch generic names from the drugs collection
        cursor = db["drugs"].find({}, {"generic_name": 1, "_id": 0})
        return list({doc["generic_name"].upper() for doc in cursor if doc.get("generic_name")})
    except Exception:
        return ["ASPIRIN", "WARFARIN"]


def fetch_relevant_interactions(drug_list: List[str]) -> List[InteractionRecord]:
    """
    Optimized MongoDB fetcher that only retrieves interactions involving 
    the drugs currently in the clinical evaluation list.
    Uses case-insensitive regex to match drug names.
    """
    db = get_mongo_db()
    if db is None:
        # Static baseline for local dev
        return [
            InteractionRecord(
                drug_a="ASPIRIN",
                drug_b="WARFARIN",
                severity=SeverityLevel.SEVERE,
                explanation="Increased bleeding risk.",
            )
        ]

    try:
        # Create case-insensitive regex patterns for each drug to handle Title Case or mixed casing in Mongo
        patterns = []
        for d in drug_list:
            escaped_d = re.escape(d.strip())
            patterns.append(re.compile(f"^{escaped_d}$", re.IGNORECASE))
        
        query = {
            "$or": [
                {"drug1_name": {"$in": patterns}},
                {"drug2_name": {"$in": patterns}},
                {"drug_a": {"$in": patterns}},
                {"drug_b": {"$in": patterns}}
            ]
        }
        
        cursor = db["interactions"].find(query)
        records = []
        for doc in cursor:
            drug_a = doc.get("drug1_name") or doc.get("drug_a") or ""
            drug_b = doc.get("drug2_name") or doc.get("drug_b") or ""
            severity_str = doc.get("severity", "MILD").upper()
            explanation = doc.get("interaction_type") or doc.get("explanation") or "No explanation provided."

            if not drug_a or not drug_b:
                continue

            try:
                severity = SeverityLevel(severity_str)
            except ValueError:
                severity = SeverityLevel.MILD

            # Internal engine expects UPPERCASE
            records.append(
                InteractionRecord(
                    drug_a=drug_a.upper(),
                    drug_b=drug_b.upper(),
                    severity=severity,
                    explanation=explanation,
                )
            )
        return records
    except Exception:
        return []

def get_interaction_records() -> List[InteractionRecord]:
    """
    Legacy dependency. Returns an empty list to avoid large memory spikes.
    Call fetch_relevant_interactions(drug_list) instead for production loads.
    """
    return []


def rate_limit_dependency(
    request: Request,
    cache: CacheClient = Depends(get_cache),
) -> None:
    settings = get_settings()

    if not settings.rate_limit_enabled:
        return

    if request.url.path in {"/health", "/health/live", "/health/ready"}:
        return

    client_ip = request.client.host if request.client else "unknown"
    bucket = int(time.time() // 60)
    key = f"rate-limit:{client_ip}:{request.url.path}:{bucket}"

    current_count = cache.increment(key, ttl=70)
    if current_count > settings.rate_limit_per_minute:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please retry in 1 minute.",
        )


__all__ = [
    "get_db",
    "get_cache",
    "get_ocr_service",
    "get_interaction_engine",
    "get_schedule_optimizer",
    "get_medication_repository",
    "get_interaction_records",
    "fetch_relevant_interactions",
    "rate_limit_dependency",
]
