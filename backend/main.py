from __future__ import annotations

import logging
from logging.config import dictConfig

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, interactions, jobs, ocr, scheduling, prescriptions
from app.core.config import get_settings
from app.infrastructure.cache.cache import get_cache_client
from app.infrastructure.db.database import check_database_health, init_database
from app.services.ocr.ocr_service import get_ocr_runtime_status
from app.workers.celery_app import celery_app

import structlog
from contextlib import asynccontextmanager

settings = get_settings()

structlog.configure(
    processors=[
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    ocr_status = get_ocr_runtime_status()
    logger.info(
        "OCR runtime check",
        ready=ocr_status["ready"],
        configured_tesseract_cmd=ocr_status["configured_tesseract_cmd"],
        ocr_language=ocr_status["ocr_language"],
        message=ocr_status["message"],
    )
    logger.info("Application startup complete")
    yield
    logger.info("Application shutting down")

app = FastAPI(
    title=settings.app_name,
    description="A graph-based polypharmacy safety and medication coordination platform.",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(prescriptions.router, prefix="/api/v1")
app.include_router(ocr.router, prefix="/api/v1")
app.include_router(interactions.router, prefix="/api/v1")
app.include_router(scheduling.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")




@app.get("/health", tags=["System"])
async def health_check():
    ocr_status = get_ocr_runtime_status()
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.environment,
        "ocr_ready": ocr_status["ready"],
        "ocr_message": ocr_status["message"],
    }


@app.get("/health/live", tags=["System"])
async def liveness_check():
    return {"status": "alive"}


@app.get("/health/ready", tags=["System"])
async def readiness_check():
    db_ok = check_database_health()
    cache_ok = get_cache_client().ping()
    ocr_status = get_ocr_runtime_status()

    if celery_app is None:
        queue_ok = False
        queue_mode = "disabled"
    else:
        try:
            # Fast broker-level check without dispatching tasks.
            with celery_app.connection_for_read() as conn:
                conn.ensure_connection(max_retries=1)
            queue_ok = True
            queue_mode = "enabled"
        except Exception:
            queue_ok = False
            queue_mode = "enabled"

    ocr_gate_ok = ocr_status["ready"] or (not settings.ocr_required_for_readiness)
    overall = db_ok and cache_ok and (queue_ok or queue_mode == "disabled") and ocr_gate_ok
    return {
        "status": "ready" if overall else "degraded",
        "dependencies": {
            "database": db_ok,
            "cache": cache_ok,
            "queue": queue_ok,
            "queue_mode": queue_mode,
            "ocr": ocr_status["ready"],
            "ocr_required_for_readiness": settings.ocr_required_for_readiness,
        },
        "ocr": ocr_status,
    }


@app.get("/health/ocr", tags=["System"])
async def ocr_health_check():
    return get_ocr_runtime_status()
