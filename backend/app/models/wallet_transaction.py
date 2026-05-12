import uuid
from sqlalchemy import Column, String, Text, Numeric, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(String(30), nullable=False)
    # credit | debit | escrow_hold | escrow_release
    amount = Column(Numeric(10, 2), nullable=False)
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # order_id or contract_id
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())


class Escrow(Base):
    __tablename__ = "escrow"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), unique=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default='held')
    # held | released | refunded
    held_at = Column(DateTime, default=func.now())
    released_at = Column(DateTime, nullable=True)
