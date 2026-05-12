import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.models.order import Order
from app.models.listing import Listing
from app.models.user import User
from app.services.wallet_service import release_escrow_funds

router = APIRouter(prefix="/api/orders", tags=["orders"])

class PlaceOrderRequest(BaseModel):
    listing_id: uuid.UUID
    quantity_kg: float

@router.post("")
async def place_order(
    data: PlaceOrderRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can place orders")

    result = await db.execute(select(Listing).where(Listing.id == data.listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "approved":
        raise HTTPException(status_code=400, detail="Listing is not available")
    if listing.stock_kg < data.quantity_kg:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    total = float(listing.final_price) * data.quantity_kg

    order = Order(
        buyer_id=current_user.id,
        seller_id=listing.seller_id,
        listing_id=listing.id,
        quantity_kg=data.quantity_kg,
        unit_price=listing.final_price,
        total_amount=total,
        status="placed"
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return {"message": "Order placed successfully", "order_id": str(order.id)}


@router.get("/buyer")
async def get_buyer_orders(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Buyers only")

    result = await db.execute(
        select(Order).where(Order.buyer_id == current_user.id).order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return [_format_order(o) for o in orders]


@router.get("/seller")
async def get_seller_orders(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Sellers only")

    result = await db.execute(
        select(Order).where(Order.seller_id == current_user.id).order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return [_format_order(o) for o in orders]


@router.put("/{order_id}/approve")
async def approve_order(
    order_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order = await _get_seller_order(order_id, current_user, db)
    if order.status != "placed":
        raise HTTPException(status_code=400, detail="Order is not in placed status")
    order.status = "seller_approved"
    order.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Order approved"}


@router.put("/{order_id}/reject")
async def reject_order(
    order_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order = await _get_seller_order(order_id, current_user, db)
    if order.status not in ["placed", "seller_approved"]:
        raise HTTPException(status_code=400, detail="Cannot cancel this order")
    order.status = "cancelled"
    order.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Order rejected"}


@router.put("/{order_id}/ship")
async def ship_order(
    order_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    order = await _get_seller_order(order_id, current_user, db)
    if order.status != "payment_held":
        raise HTTPException(status_code=400, detail="Payment must be held before shipping")
    order.status = "shipped"
    order.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Order marked as shipped"}


@router.put("/{order_id}/deliver")
async def confirm_delivery(
    order_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Buyers only")

    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.buyer_id == current_user.id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "shipped":
        raise HTTPException(status_code=400, detail="Order must be shipped first")

    # Release Escrow Funds to Seller
    await release_escrow_funds(order_id, db)

    order.status = "completed"
    order.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Delivery confirmed. Order completed."}


async def _get_seller_order(order_id, current_user, db):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Sellers only")
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.seller_id == current_user.id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def _format_order(o: Order) -> dict:
    return {
        "id": str(o.id),
        "buyer_id": str(o.buyer_id),
        "seller_id": str(o.seller_id),
        "listing_id": str(o.listing_id),
        "quantity_kg": float(o.quantity_kg),
        "unit_price": float(o.unit_price),
        "total_amount": float(o.total_amount),
        "status": o.status,
        "created_at": o.created_at.isoformat(),
        "updated_at": o.updated_at.isoformat() if o.updated_at else None,
    }
