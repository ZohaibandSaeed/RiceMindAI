import uuid
from sqlalchemy import Column, String, Text, Numeric, Integer, DateTime, Boolean, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), unique=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    transaction_id = Column(String(100), unique=True, nullable=False)
    delivery_days = Column(Integer, nullable=False)
    delivery_deadline = Column(DateTime, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    terms = Column(Text, nullable=True)
    contract_pdf_url = Column(Text, nullable=True)
    seller_signed = Column(Boolean, default=True)
    buyer_signed = Column(Boolean, default=False)
    buyer_signed_at = Column(DateTime, nullable=True)
    status = Column(String(30), default='pending_buyer')
    # pending_buyer | active | completed
    created_at = Column(DateTime, default=func.now())
