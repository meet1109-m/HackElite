"""Security and Authentication Service for SmartBinX.

Provides industry-standard bcrypt password hashing and PyJWT token generation/verification.
"""

import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from app.config import settings

# Secret key and cryptographic constants
SECRET_KEY = getattr(settings, "SECRET_KEY", "smartbinx-secure-jwt-secret-key-ahmedabad-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt with 12 rounds of salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT access token containing subject and user claims."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": "smartbinx-auth-service"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a signed JWT access token. Returns None if invalid or expired."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import User

MUNICIPAL_API_KEY = getattr(settings, "MUNICIPAL_API_KEY", "smartbinx-ahmedabad-municipal-key-2026")


def get_current_active_user(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Validate Bearer JWT token or X-API-Key for protected operations.
    
    Raises 401 Unauthorized if token is missing, invalid, or expired.
    Raises 403 Forbidden if user account is disabled.
    """
    # 1. Check Bearer JWT Token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user = db.query(User).filter(User.id == payload["sub"]).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User account associated with token was not found.",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Operator account is inactive. Access revoked."
                )
            return user

    # 2. Check Municipal Service API Key (for automated worker / IoT / test client)
    if x_api_key and x_api_key in [MUNICIPAL_API_KEY, SECRET_KEY]:
        admin_user = db.query(User).filter(User.role == "Admin").first()
        if not admin_user:
            admin_user = User(
                id="system-worker-uuid",
                email="system@smartbinx.gov.in",
                username="system_worker",
                hashed_password="",
                full_name="AMC Municipal System Worker",
                role="Admin",
                is_active=1
            )
        return admin_user

    # 3. Deny unauthenticated request
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please provide a valid Bearer JWT token or X-API-Key.",
        headers={"WWW-Authenticate": "Bearer"}
    )


def require_role(*allowed_roles: str):
    """Dependency factory ensuring current user possesses at least one of the allowed roles."""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != "Admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: role '{current_user.role}' is not authorized for this operation. Required: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

