"""Pydantic Schemas for Authentication and User Authorization."""

from pydantic import BaseModel, Field
from typing import Optional


class LoginRequest(BaseModel):
    email_or_username: str = Field(..., description="User email or operator ID / username")
    password: str = Field(..., min_length=1, description="Password or numeric security PIN")
    role: Optional[str] = Field(None, description="Optional role claim requested")


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool = True

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400  # 24 hours in seconds
    user: UserResponse
