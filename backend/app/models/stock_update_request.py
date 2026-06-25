import uuid
from sqlalchemy import Column, String, Numeric, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class StockUpdateRequest(Base):
    __tablename__ = "stock_update_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    current_stock_kg = Column(Numeric(10, 2), nullable=False)
    requested_stock_kg = Column(Numeric(10, 2), nullable=False)
    status = Column(String(30), default='pending') # pending | approved | rejected
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
