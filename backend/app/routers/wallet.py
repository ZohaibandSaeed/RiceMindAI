import uuid
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction
from app.models.user import User

router = APIRouter(prefix="/api/wallet", tags=["wallet"])

class WalletResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    balance: float
    currency: str

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: uuid.UUID
    type: str
    amount: float
    description: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


@router.get("/me", response_model=WalletResponse)
async def get_my_wallet(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User):
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
    wallet = result.scalars().first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


@router.get("/transactions")
async def get_my_transactions(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User):
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(WalletTransaction)
        .where(WalletTransaction.user_id == current_user.id)
        .order_by(WalletTransaction.created_at.desc())
    )
    transactions = result.scalars().all()
    return [
        {
            "id": str(t.id),
            "type": t.type,
            "amount": float(t.amount),
            "description": t.description,
            "created_at": t.created_at.isoformat()
        }
        for t in transactions
    ]

class AddFundsRequest(BaseModel):
    amount: float

@router.post("/add-demo-funds")
async def add_demo_funds(
    data: AddFundsRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User):
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
    wallet = result.scalars().first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    amount = data.amount
    wallet.balance = float(wallet.balance) + amount
    
    credit_tx = WalletTransaction(
        wallet_id=wallet.id,
        user_id=current_user.id,
        type="credit",
        amount=amount,
        description="Demo funds added manually"
    )
    db.add(credit_tx)
    await db.commit()
    
    return {"message": f"Successfully added {amount} to your wallet."}
