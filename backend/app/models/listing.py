import uuid
from sqlalchemy import Column, String, Text, Numeric, DateTime, func, ForeignKey, ARRAY, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    rice_type = Column(String(100), nullable=False)
    suggested_price = Column(Numeric(10, 2), nullable=False)
    ai_validated_price = Column(Numeric(10, 2), nullable=True)
    final_price = Column(Numeric(10, 2), nullable=False)
    stock_kg = Column(Numeric(10, 2), nullable=False)
    images = Column(ARRAY(Text), nullable=False)
    ai_quality_score = Column(Numeric(3, 2), nullable=True)
    ai_quality_notes = Column(Text, nullable=True)
    ai_detected_type = Column(String(100), nullable=True)
    ai_price_verdict = Column(String(30), nullable=True)
    ai_price_message = Column(Text, nullable=True)
    status = Column(String(30), default='pending_approval')
    # pending_approval | approved | rejected | sold_out
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
