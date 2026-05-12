import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    clerk_id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    pass

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
