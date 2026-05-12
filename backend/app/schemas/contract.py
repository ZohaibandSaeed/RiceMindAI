import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ContractCreateRequest(BaseModel):
    delivery_days: int
    terms: Optional[str] = None

class ContractResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    seller_id: uuid.UUID
    buyer_id: uuid.UUID
    transaction_id: str
    delivery_days: int
    delivery_deadline: datetime
    total_amount: float
    terms: Optional[str]
    seller_signed: bool
    buyer_signed: bool
    buyer_signed_at: Optional[datetime]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
