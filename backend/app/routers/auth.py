from typing import Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.user import UserResponse, UserSetupProfile
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/sync", response_model=UserResponse)
async def sync_user(
    clerk_data: dict, # Data from frontend clerk session
    user_or_clerk_info: Union[User, dict] = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # If it's a User model, user already exists
    if isinstance(user_or_clerk_info, User):
        return user_or_clerk_info
    
    # It's a missing user info dict
    clerk_id = user_or_clerk_info["clerk_id"]
    email = clerk_data.get("email") or user_or_clerk_info.get("email", "")
    
    # Fallbacks for initial creation
    username = clerk_data.get("username", f"user_{clerk_id[-6:]}")
    full_name = clerk_data.get("full_name")
    
    new_user = User(
        clerk_id=clerk_id,
        email=email,
        username=username,
        full_name=full_name,
        role="pending",
        profile_complete=False
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.put("/complete-profile", response_model=UserResponse)
async def complete_profile(
    profile_data: UserSetupProfile,
    current_user: Union[User, dict] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User):
        raise HTTPException(status_code=404, detail="User not found in DB. Call sync first.")

    # Update info
    current_user.role = profile_data.role
    current_user.username = profile_data.username
    current_user.full_name = profile_data.full_name
    current_user.phone = profile_data.phone
    current_user.address = profile_data.address
    current_user.profile_complete = True
    
    # Create wallet for user
    new_wallet = Wallet(user_id=current_user.id, balance=0.00, currency="PKR")
    db.add(new_wallet)
    
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    if not isinstance(current_user, User):
        raise HTTPException(status_code=404, detail="User not found")
    return current_user
