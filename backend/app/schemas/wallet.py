import uuid
from decimal import Decimal
from pydantic import BaseModel
from datetime import datetime

class WalletBase(BaseModel):
    user_id: uuid.UUID
    balance: Decimal
    currency: str

class WalletResponse(WalletBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
