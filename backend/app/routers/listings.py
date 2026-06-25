import uuid
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.models.listing import Listing
from app.models.user import User
from app.models.wallet import Wallet
from app.models.wallet_transaction import WalletTransaction
from app.models.stock_update_request import StockUpdateRequest
from app.services.ai_service import analyze_rice_listing

router = APIRouter(prefix="/api/listings", tags=["listings"])

RICE_TYPES = ["Basmati", "Jasmine", "Brown", "Sella", "Super Kernel", "Broken", "Other"]

# ── Schemas ────────────────────────────────────────────────────────────────
class CreateListingRequest(BaseModel):
    name: str
    description: str
    rice_type: str
    suggested_price: float
    stock_kg: float
    images: List[str]  # ImageKit URLs, first one used for AI
    override_price: bool = False  # seller override if AI warns

class ListingResponse(BaseModel):
    id: uuid.UUID
    seller_id: uuid.UUID
    name: str
    description: str
    rice_type: str
    suggested_price: float
    ai_validated_price: Optional[float]
    final_price: float
    stock_kg: float
    images: List[str]
    ai_quality_score: Optional[float]
    ai_quality_notes: Optional[str]
    ai_detected_type: Optional[str]
    ai_price_verdict: Optional[str]
    ai_price_message: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ── Routes ─────────────────────────────────────────────────────────────────

@router.post("", response_model=ListingResponse)
async def create_listing(
    data: CreateListingRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can create listings")

    if len(data.images) < 3 or len(data.images) > 5:
        raise HTTPException(status_code=400, detail="Upload between 3 to 5 images")

    if data.rice_type not in RICE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid rice type. Choose from {RICE_TYPES}")

    # Call AI with ONLY the first image
    ai_result = await analyze_rice_listing(
        image_url=data.images[0],
        rice_type=data.rice_type,
        seller_price=data.suggested_price
    )

    # Determine final price
    final_price = data.suggested_price

    # If AI gives a validated price, calculate midpoint
    ai_validated_price = None
    if ai_result.get("suggested_min_price") and ai_result.get("suggested_max_price"):
        ai_validated_price = (ai_result["suggested_min_price"] + ai_result["suggested_max_price"]) / 2

    listing = Listing(
        seller_id=current_user.id,
        name=data.name,
        description=data.description,
        rice_type=data.rice_type,
        suggested_price=data.suggested_price,
        ai_validated_price=ai_validated_price,
        final_price=final_price,
        stock_kg=data.stock_kg,
        images=data.images,
        ai_quality_score=ai_result.get("quality_score"),
        ai_quality_notes=ai_result.get("quality_notes"),
        ai_detected_type=ai_result.get("detected_type"),
        ai_price_verdict=ai_result.get("price_verdict"),
        ai_price_message=ai_result.get("price_message"),
        status="pending_approval"
    )

    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    return listing


@router.get("/mine", response_model=List[ListingResponse])
async def get_my_listings(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can view their listings")

    result = await db.execute(
        select(Listing).where(Listing.seller_id == current_user.id).order_by(Listing.created_at.desc())
    )
    return result.scalars().all()


@router.get("", response_model=List[ListingResponse])
async def get_listings(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """All approved listings for buyers to browse"""
    result = await db.execute(
        select(Listing).where(Listing.status == "approved").order_by(Listing.created_at.desc())
    )
    return result.scalars().all()


from app.routers.admin import require_admin

@router.get("/pending", response_model=List[ListingResponse])
async def get_pending_listings(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin only: Get all pending listings waiting for approval"""
    result = await db.execute(
        select(Listing)
        .where(Listing.status.in_(["pending_approval", "pending"]))
        .order_by(Listing.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: uuid.UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can delete listings")

    result = await db.execute(
        select(Listing).where(Listing.id == listing_id, Listing.seller_id == current_user.id)
    )
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status not in ["pending_approval", "rejected"]:
        raise HTTPException(status_code=400, detail="Only pending/rejected listings can be deleted")

    await db.delete(listing)
    await db.commit()
    return {"message": "Listing deleted"}


@router.post("/{listing_id}/approve")
async def approve_listing(
    listing_id: uuid.UUID,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin only: Approve a pending listing — makes it live on marketplace"""
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status not in ["pending_approval", "pending"]:
        raise HTTPException(status_code=400, detail="Listing is not in pending approval status")

    listing.status = "approved"
    listing.approved_by = admin_user.id
    listing.approved_at = datetime.utcnow()
    await db.commit()
    return {"message": "Listing approved successfully. Now live on marketplace."}


@router.post("/{listing_id}/reject")
async def reject_listing(
    listing_id: uuid.UUID,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin only: Reject a pending listing"""
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status not in ["pending_approval", "pending"]:
        raise HTTPException(status_code=400, detail="Only pending listings can be rejected")

    listing.status = "rejected"
    await db.commit()
    return {"message": "Listing rejected."}


class StockRequestPayload(BaseModel):
    requested_stock_kg: float

@router.post("/{listing_id}/stock-request")
async def request_stock_update(
    listing_id: uuid.UUID,
    data: StockRequestPayload,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Only sellers can request stock updates")

    result = await db.execute(select(Listing).where(Listing.id == listing_id, Listing.seller_id == current_user.id))
    listing = result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or you are not the owner")

    # Check for existing pending request
    pending_check = await db.execute(
        select(StockUpdateRequest).where(
            StockUpdateRequest.listing_id == listing_id,
            StockUpdateRequest.status == "pending"
        )
    )
    if pending_check.scalars().first():
        raise HTTPException(status_code=400, detail="A pending stock update request already exists for this listing")

    req = StockUpdateRequest(
        listing_id=listing_id,
        seller_id=current_user.id,
        current_stock_kg=listing.stock_kg,
        requested_stock_kg=data.requested_stock_kg,
        status="pending"
    )
    db.add(req)
    await db.commit()
    return {"message": "Stock update request submitted to admin for approval"}


@router.get("/stock-requests/mine")
async def get_my_stock_requests(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User) or current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Sellers only")

    # Join with listings to get the listing name
    result = await db.execute(
        select(StockUpdateRequest, Listing.name)
        .join(Listing, Listing.id == StockUpdateRequest.listing_id)
        .where(StockUpdateRequest.seller_id == current_user.id)
        .order_by(StockUpdateRequest.created_at.desc())
    )
    
    requests = []
    for req, listing_name in result.all():
        requests.append({
            "id": str(req.id),
            "listing_id": str(req.listing_id),
            "listing_name": listing_name,
            "current_stock_kg": float(req.current_stock_kg),
            "requested_stock_kg": float(req.requested_stock_kg),
            "status": req.status,
            "created_at": req.created_at.isoformat()
        })
    return requests


@router.get("/stock-requests/pending")
async def get_pending_stock_requests(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Join with listings and users to get listing name/image and seller username
    result = await db.execute(
        select(StockUpdateRequest, Listing, User.username)
        .join(Listing, Listing.id == StockUpdateRequest.listing_id)
        .join(User, User.id == StockUpdateRequest.seller_id)
        .where(StockUpdateRequest.status == "pending")
        .order_by(StockUpdateRequest.created_at.desc())
    )

    requests = []
    for req, listing, username in result.all():
        requests.append({
            "id": str(req.id),
            "listing_id": str(req.listing_id),
            "listing_name": listing.name,
            "listing_image": listing.images[0] if listing.images else None,
            "seller_username": username,
            "current_stock_kg": float(req.current_stock_kg),
            "requested_stock_kg": float(req.requested_stock_kg),
            "status": req.status,
            "created_at": req.created_at.isoformat()
        })
    return requests


@router.post("/stock-requests/{request_id}/approve")
async def approve_stock_request(
    request_id: uuid.UUID,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(StockUpdateRequest).where(StockUpdateRequest.id == request_id))
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Stock request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is already processed")

    listing_result = await db.execute(select(Listing).where(Listing.id == req.listing_id))
    listing = listing_result.scalars().first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Update listing stock
    listing.stock_kg = req.requested_stock_kg
    if listing.status == "sold_out" and req.requested_stock_kg > 0:
        listing.status = "approved"

    req.status = "approved"
    await db.commit()
    return {"message": "Stock request approved successfully"}


@router.post("/stock-requests/{request_id}/reject")
async def reject_stock_request(
    request_id: uuid.UUID,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(StockUpdateRequest).where(StockUpdateRequest.id == request_id))
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Stock request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is already processed")

    req.status = "rejected"
    await db.commit()
    return {"message": "Stock request rejected"}
