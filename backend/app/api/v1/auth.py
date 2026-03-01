"""
Auth Router - handles Google OAuth callback, JWT issuance with roles,
new-user onboarding, and admin user management.
"""
from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

import jwt
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.infrastructure.db.database import get_mongo_db

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "medgraph-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 7 * 24 * 3600  # 7 days

UserRole = Literal["admin", "doctor", "patient", "caretaker"]

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _issue_jwt(user_doc: dict) -> str:
    """Create a signed JWT containing user identity + role."""
    now = int(time.time())
    payload = {
        "sub": str(user_doc["google_id"]),
        "email": user_doc["email"],
        "name": user_doc.get("name", ""),
        "picture": user_doc.get("picture", ""),
        "role": user_doc.get("role", "patient"),
        "tenant_id": user_doc.get("tenant_id", "clinic-default"),
        "iat": now,
        "exp": now + JWT_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
) -> dict:
    """FastAPI dependency – decodes the JWT and returns the payload."""
    # Try Authorization header first
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        return _decode_jwt(token)
    # Then try cookie
    cookie_token = request.cookies.get("medgraph_token")
    if cookie_token:
        return _decode_jwt(cookie_token)
    raise HTTPException(status_code=401, detail="Not authenticated")


def require_role(*allowed: UserRole):
    """FastAPI dependency factory – enforces role-based access."""
    def _check(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(allowed)}",
            )
        return user
    return _check


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class GoogleCallbackPayload(BaseModel):
    google_id: str
    email: str
    name: str
    picture: Optional[str] = ""


class UpdateRolePayload(BaseModel):
    role: UserRole


class CompleteOnboardingPayload(BaseModel):
    role: UserRole
    tenant_id: Optional[str] = "clinic-default"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/google-callback")
async def google_callback(payload: GoogleCallbackPayload):
    """
    Called by the Auth server after Google OAuth success.
    Creates or retrieves the user in MongoDB, then issues a JWT with their role.
    """
    db = get_mongo_db()

    # --- Local/dev fallback (no Mongo) ---
    if db is None:
        fake_user = {
            "google_id": payload.google_id,
            "email": payload.email,
            "name": payload.name,
            "picture": payload.picture,
            "role": "doctor",
            "tenant_id": "clinic-default",
        }
        token = _issue_jwt(fake_user)
        return {"token": token, "is_new": False, "role": "doctor"}

    users_col = db["users"]
    existing = users_col.find_one({"google_id": payload.google_id})

    if existing:
        # Returning user — update profile fields but keep their role
        users_col.update_one(
            {"google_id": payload.google_id},
            {"$set": {
                "name": payload.name,
                "picture": payload.picture,
                "last_login": datetime.now(timezone.utc),
            }},
        )
        user_doc = users_col.find_one({"google_id": payload.google_id})
        token = _issue_jwt(user_doc)
        return {"token": token, "is_new": False, "role": user_doc.get("role", "patient")}
    else:
        # New user — create with no role yet (onboarding required)
        new_user: Dict[str, Any] = {
            "google_id": payload.google_id,
            "email": payload.email,
            "name": payload.name,
            "picture": payload.picture,
            "role": None,  # Will be set during onboarding
            "tenant_id": "clinic-default",
            "created_at": datetime.now(timezone.utc),
            "last_login": datetime.now(timezone.utc),
        }
        users_col.insert_one(new_user)
        # Issue a temporary token with role=null so frontend can redirect to /onboarding
        temp_token = _issue_jwt({**new_user, "role": "__pending__"})
        return {"token": temp_token, "is_new": True, "role": "__pending__"}


@router.post("/onboarding/complete")
async def complete_onboarding(
    payload: CompleteOnboardingPayload,
    user: dict = Depends(get_current_user),
):
    """
    New users call this after choosing their role on the onboarding page.
    Persists the role and returns a fresh JWT.
    """
    db = get_mongo_db()
    if db is None:
        # Dev mode — just re-issue with chosen role
        updated_user = {**user, "role": payload.role, "tenant_id": payload.tenant_id}
        token = _issue_jwt(updated_user)
        return {"token": token, "role": payload.role}

    result = db["users"].find_one_and_update(
        {"google_id": user["sub"]},
        {"$set": {"role": payload.role, "tenant_id": payload.tenant_id}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    token = _issue_jwt(result)
    return {"token": token, "role": payload.role}


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Returns the current authenticated user's profile from their JWT."""
    return {
        "user_id": user.get("sub"),
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "role": user.get("role"),
        "tenant_id": user.get("tenant_id"),
    }


# ---------------------------------------------------------------------------
# Admin-only endpoints
# ---------------------------------------------------------------------------

@router.get("/users", dependencies=[Depends(require_role("admin"))])
async def list_users(skip: int = 0, limit: int = 50):
    """Admin: list all users."""
    db = get_mongo_db()
    if db is None:
        return {"users": [], "total": 0}

    total = db["users"].count_documents({})
    users = list(
        db["users"].find({}, {"_id": 0, "google_id": 1, "email": 1, "name": 1, "role": 1, "tenant_id": 1, "created_at": 1})
        .skip(skip)
        .limit(limit)
    )
    return {"users": users, "total": total}


@router.patch("/users/{google_id}/role", dependencies=[Depends(require_role("admin"))])
async def update_user_role(google_id: str, payload: UpdateRolePayload):
    """Admin: change any user's role."""
    db = get_mongo_db()
    if db is None:
        return {"success": True, "role": payload.role}

    result = db["users"].find_one_and_update(
        {"google_id": google_id},
        {"$set": {"role": payload.role}},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "email": result["email"], "new_role": result["role"]}


@router.delete("/users/{google_id}", dependencies=[Depends(require_role("admin"))])
async def delete_user(google_id: str):
    """Admin: remove a user account."""
    db = get_mongo_db()
    if db is None:
        return {"success": True}

    result = db["users"].delete_one({"google_id": google_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}
