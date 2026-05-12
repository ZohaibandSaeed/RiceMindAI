import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_id = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(20), nullable=False) # 'buyer' | 'seller' | 'admin'
    phone = Column(String(30), nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
