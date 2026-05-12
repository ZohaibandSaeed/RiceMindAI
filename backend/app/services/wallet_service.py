import uuid
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction, Escrow
from app.models.order import Order

async def hold_funds_in_escrow(buyer_id: uuid.UUID, seller_id: uuid.UUID, order_id: uuid.UUID, amount: float, db: AsyncSession):
    # Retrieve buyer wallet
    wallet_q = await db.execute(select(Wallet).where(Wallet.user_id == buyer_id))
    buyer_wallet = wallet_q.scalars().first()
    
    if not buyer_wallet:
        raise HTTPException(status_code=404, detail="Buyer wallet not found")
        
    amount_f = float(amount)
    
    if float(buyer_wallet.balance) < amount_f:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance to accept this contract")

    # Deduct balance
    buyer_wallet.balance = float(buyer_wallet.balance) - amount_f
    buyer_wallet.updated_at = datetime.utcnow()

    # Create debit transaction for buyer
    debit_tx = WalletTransaction(
        wallet_id=buyer_wallet.id,
        user_id=buyer_id,
        type="debit",
        amount=amount,
        reference_id=order_id,
        description="Payment deducted for contract acceptance"
    )
    db.add(debit_tx)

    # Create Escrow record
    escrow_hold = WalletTransaction(
        wallet_id=buyer_wallet.id,
        user_id=buyer_id,
        type="escrow_hold",
        amount=amount,
        reference_id=order_id,
        description=f"Funds held in escrow for order {order_id}"
    )
    db.add(escrow_hold)
    
    escrow = Escrow(
        order_id=order_id,
        buyer_id=buyer_id,
        seller_id=seller_id,
        amount=amount,
        status="held"
    )
    db.add(escrow)


async def release_escrow_funds(order_id: uuid.UUID, db: AsyncSession):
    # Find Escrow record
    escrow_q = await db.execute(select(Escrow).where(Escrow.order_id == order_id))
    escrow = escrow_q.scalars().first()
    
    if not escrow or escrow.status != "held":
        raise HTTPException(status_code=400, detail="Escrow funds not found or not in held state")

    seller_id = escrow.seller_id
    amount = escrow.amount

    # Get Seller wallet
    wallet_q = await db.execute(select(Wallet).where(Wallet.user_id == seller_id))
    seller_wallet = wallet_q.scalars().first()

    if not seller_wallet:
        raise HTTPException(status_code=404, detail="Seller wallet not found")

    # Update Escrow
    escrow.status = "released"
    escrow.released_at = datetime.utcnow()

    # Add balance to seller
    seller_wallet.balance = float(seller_wallet.balance) + float(amount)
    seller_wallet.updated_at = datetime.utcnow()

    # Record release transaction (for transparency)
    escrow_release_tx = WalletTransaction(
        wallet_id=seller_wallet.id,
        user_id=seller_id,
        type="escrow_release",
        amount=amount,
        reference_id=order_id,
        description=f"Escrow released for order {order_id}"
    )
    db.add(escrow_release_tx)

    # Record credit transaction to seller wallet
    credit_tx = WalletTransaction(
        wallet_id=seller_wallet.id,
        user_id=seller_id,
        type="credit",
        amount=amount,
        reference_id=order_id,
        description=f"Payment credited from buyer for order {order_id}"
    )
    db.add(credit_tx)
