import uuid
import random
import string
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.dependencies import get_current_user
from app.models.contract import Contract
from app.models.order import Order
from app.models.user import User
from app.schemas.contract import ContractCreateRequest, ContractResponse, SignContractRequest
from app.services.wallet_service import hold_funds_in_escrow

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

def generate_transaction_id():
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"RMA-{date_str}-{random_str}"

@router.post("/order/{order_id}", response_model=ContractResponse)
async def create_contract(
    order_id: uuid.UUID,
    data: ContractCreateRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can create contracts")

    # Fetch order to ensure it belongs to the seller and is in correct status
    order_q = await db.execute(select(Order).where(Order.id == order_id, Order.seller_id == current_user.id))
    order = order_q.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "seller_approved":
        raise HTTPException(status_code=400, detail="Contract cannot be created for this order status")

    # Check if a contract already exists for this order
    existing_q = await db.execute(select(Contract).where(Contract.order_id == order_id))
    existing = existing_q.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Contract already exists for this order")

    seller_phone_digits = ''.join(filter(str.isdigit, data.seller_phone))
    if len(seller_phone_digits) != 11:
        raise HTTPException(status_code=400, detail="Seller phone number must be exactly 11 digits")

    delivery_deadline = datetime.utcnow() + timedelta(days=data.delivery_days)
    transaction_id = generate_transaction_id()

    contract = Contract(
        order_id=order.id,
        seller_id=order.seller_id,
        buyer_id=order.buyer_id,
        transaction_id=transaction_id,
        delivery_days=data.delivery_days,
        delivery_deadline=delivery_deadline,
        total_amount=order.total_amount,
        terms=data.terms,
        seller_phone=seller_phone_digits,
        seller_signed=True,
        buyer_signed=False,
        status="pending_buyer"
    )

    order.status = "contract_sent"
    order.updated_at = datetime.utcnow()

    db.add(contract)
    await db.commit()
    await db.refresh(contract)

    return contract

@router.get("/order/{order_id}", response_model=ContractResponse)
async def get_contract_by_order(
    order_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User):
        raise HTTPException(status_code=401, detail="Unauthorized")

    contract_q = await db.execute(select(Contract).where(Contract.order_id == order_id))
    contract = contract_q.scalars().first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Verify ownership
    if current_user.id not in [contract.buyer_id, contract.seller_id] and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to view this contract")

    return contract

@router.put("/{contract_id}/sign")
async def sign_contract(
    contract_id: uuid.UUID,
    data: SignContractRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can sign contracts")

    buyer_phone_digits = ''.join(filter(str.isdigit, data.buyer_phone))
    if len(buyer_phone_digits) != 11:
        raise HTTPException(status_code=400, detail="Buyer phone number must be exactly 11 digits")

    contract_q = await db.execute(select(Contract).where(Contract.id == contract_id, Contract.buyer_id == current_user.id))
    contract = contract_q.scalars().first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.status != "pending_buyer":
        raise HTTPException(status_code=400, detail="Contract is not pending buyer signature")

    order_q = await db.execute(select(Order).where(Order.id == contract.order_id))
    order = order_q.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # This will throw a 400 error if wallet balance is insufficient
    await hold_funds_in_escrow(current_user.id, contract.seller_id, order.id, contract.total_amount, db)

    # If hold is successful, update resources
    contract.buyer_signed = True
    contract.buyer_signed_at = datetime.utcnow()
    contract.buyer_phone = buyer_phone_digits
    contract.status = "active"

    order.status = "payment_held"
    order.updated_at = datetime.utcnow()

    await db.commit()
    return {"message": "Contract signed successfully. Funds are held in escrow."}
