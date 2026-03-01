import os
import time
from typing import Optional, Dict, Any
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

# JWT constants
JWT_SECRET = os.getenv("JWT_SECRET", "medgraph-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 7 * 24 * 3600  # 7 days

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies that a plain text password matches the hashed password."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash of the provided password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a JWT access token encoding the provided payload."""
    to_encode = data.copy()
    now = int(time.time())
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
        exp_stamp = int(expire.timestamp())
    else:
        exp_stamp = now + JWT_EXPIRE_SECONDS
        
    to_encode.update({"iat": now, "exp": exp_stamp})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes a JWT and verifies its signature and expiration."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
