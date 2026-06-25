import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    clerk_id: Optional[str] = None
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str # 'buyer' | 'seller' | 'admin' | 'pending'
    phone: Optional[str] = None
    address: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserSetupProfile(BaseModel):
    role: str
    username: str
    full_name: str
    phone: str
    address: str

class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    profile_complete: bool
    created_at: datetime

    class Config:
        from_attributes = True

TokenResponse.update_forward_refs()

