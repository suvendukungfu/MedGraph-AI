from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import (
    get_cache,
    get_interaction_engine,
    fetch_relevant_interactions,
    rate_limit_dependency,
)
from app.core.config import get_settings
from app.infrastructure.cache.cache import CacheClient, build_cache_key
from app.services.interactions.interaction_engine import InteractionEngine
from app.services.interactions.models import InteractionRecord

router = APIRouter(
    prefix="/check-interactions",
    tags=["Interaction Engine"],
    dependencies=[Depends(rate_limit_dependency)],
)

settings = get_settings()


class PrescriptionsRequest(BaseModel):
    prescribed_drugs: List[str]


@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def check_interactions(
    request: PrescriptionsRequest,
    engine: InteractionEngine = Depends(get_interaction_engine),
    cache: CacheClient = Depends(get_cache),
):
    if not request.prescribed_drugs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medication list cannot be empty.",
        )

    # 1. Normalize drugs for consistent caching and matching
    normalized_drugs = sorted({drug.strip().upper() for drug in request.prescribed_drugs if drug.strip()})
    
    # 2. Key interactions by drugs involved to avoid cache collisions
    cache_key = build_cache_key(
        namespace="interactions",
        payload={"drugs": normalized_drugs, "v": "mongo-prod-1"},
    )

    # 3. Quick check for cached clinical results
    cached_result = cache.get_json(cache_key)
    if cached_result is not None:
        return {"success": True, "data": cached_result, "error": None}

    try:
        # 4. Fetch only the clinical records from MongoDB that involve the prescribed drugs
        db_records = fetch_relevant_interactions(normalized_drugs)
        
        # 5. Execute graph analysis engine on real clinical data
        raw_result = engine.analyze_prescription(normalized_drugs, db_records)
        
        # 6. Materialize results in cache for high-performance retrieval
        cache.set_json(cache_key, raw_result, ttl=settings.cache_ttl_seconds)
        
        return {"success": True, "data": raw_result, "error": None}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interaction engine failure: {str(exc)}",
        )
