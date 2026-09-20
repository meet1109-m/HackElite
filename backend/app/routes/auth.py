"""Authentication and Session Management API Routes.

Provides endpoints for operator authentication, bcrypt password validation,
JWT token issuance, and current authenticated user retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.entities import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.services.security import (
    verify_password,
    create_access_token,
    decode_access_token,
    hash_password,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication & Security"])

# Canonical seed users for SmartBinX municipal operations
CANONICAL_USERS = [
    {
        "email": "amc-admin@ahmedabadcity.gov.in",
        "username": "amc_admin",
        "passwords": ["8821", "smart2026"],
        "full_name": "AMC Municipal Administrator",
        "role": "AMC Operations"
    },
    {
        "email": "dispatch-lead@ahmedabadfleet.org",
        "username": "dispatch_lead",
        "passwords": ["4402", "smart2026"],
        "full_name": "Ahmedabad Fleet Operations Lead",
        "role": "Fleet Dispatch"
    },
    {
        "email": "sustainability@amc-recovery.in",
        "username": "sustainability_manager",
        "passwords": ["9115", "smart2026"],
        "full_name": "Circularity & Landfill ESG Manager",
        "role": "Sustainability"
    },
    {
        "email": "user@ahmedabadcity.gov.in",
        "username": "amc_operator",
        "passwords": ["smart2026"],
        "full_name": "Municipal Field Operator",
        "role": "AMC Operations"
    },
    {
        "email": "admin@smartbinx.com",
        "username": "admin",
        "passwords": ["smart2026"],
        "full_name": "SmartBinX System Admin",
        "role": "Admin"
    },
    {
        "email": "new-citizen@ahmedabad.in",
        "username": "new_citizen",
        "passwords": ["greenAhmedabad2026", "smart2026"],
        "full_name": "Ahmedabad Citizen Volunteer",
        "role": "AMC Citizen Volunteer"
    },
    {
        "email": "google.user@ahmedabadcity.gov.in",
        "username": "google_operator",
        "passwords": ["googleAuth88", "smart2026"],
        "full_name": "Google Verified Municipal Operator",
        "role": "AMC Google Verified"
    },
    {
        "email": "msft.user@ahmedabadcity.gov.in",
        "username": "msft_operator",
        "passwords": ["msftAuth99", "smart2026"],
        "full_name": "Microsoft Verified Municipal Operator",
        "role": "AMC Microsoft Verified"
    }
]


def ensure_canonical_users(db: Session):
    """Ensure standard municipal operator accounts exist in the database with hashed passwords."""
    for u_def in CANONICAL_USERS:
        existing = db.query(User).filter(
            (User.email == u_def["email"]) | (User.username == u_def["username"])
        ).first()
        if not existing:
            primary_password = u_def["passwords"][0]
            new_user = User(
                email=u_def["email"],
                username=u_def["username"],
                hashed_password=hash_password(primary_password),
                full_name=u_def["full_name"],
                role=u_def["role"],
                is_active=1
            )
            db.add(new_user)
    db.commit()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate operator credentials against SQLite users table with bcrypt and return a signed JWT."""
    # Ensure canonical users exist on first run
    ensure_canonical_users(db)

    identifier = payload.email_or_username.strip().lower()
    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.username.ilike(identifier))
    ).first()

    if not user:
        # Check canonical users list in case of alternate password/PIN
        for u_def in CANONICAL_USERS:
            if u_def["email"].lower() == identifier or u_def["username"].lower() == identifier:
                if payload.password in u_def["passwords"]:
                    # Create or update user
                    user = User(
                        email=u_def["email"],
                        username=u_def["username"],
                        hashed_password=hash_password(payload.password),
                        full_name=u_def["full_name"],
                        role=u_def["role"],
                        is_active=1
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                    break

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/operator ID or PIN credentials."
        )

    # Verify password against bcrypt hash
    password_valid = verify_password(payload.password, user.hashed_password)

    # Check alternate valid PIN for canonical accounts if primary hash didn't match
    if not password_valid:
        for u_def in CANONICAL_USERS:
            if user.email.lower() == u_def["email"].lower():
                if payload.password in u_def["passwords"]:
                    # Update stored hash to new password
                    user.hashed_password = hash_password(payload.password)
                    db.commit()
                    password_valid = True
                    break

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/operator ID or PIN credentials."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operator account is inactive. Please contact your AMC supervisor."
        )

    # Create signed JWT token
    token_claims = {
        "sub": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "full_name": user.full_name
    }
    token = create_access_token(token_claims)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=86400,
        user=UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            role=user.role,
            is_active=bool(user.is_active)
        )
    )


@router.get("/me", response_model=UserResponse)
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Retrieve profile of the currently authenticated operator from JWT Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Bearer authorization token."
        )

    token = authorization.split("Bearer ")[1].strip()
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, tampered, or expired session token."
        )

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user record not found in system."
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        is_active=bool(user.is_active)
    )
