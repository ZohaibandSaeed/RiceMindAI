from typing import Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.user import UserResponse, UserSetupProfile, UserRegister, UserLogin, TokenResponse
from app.dependencies import get_current_user
from app.services.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register_user(register_data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    email_check = await db.execute(select(User).where(User.email == register_data.email))
    if email_check.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Check if username exists
    username_check = await db.execute(select(User).where(User.username == register_data.username))
    if username_check.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken"
        )
    
    # Hash password
    pwd_hash = hash_password(register_data.password)
    
    # Create user
    # If they supply all profile info, we can mark profile_complete=True and create wallet
    is_profile_complete = False
    if register_data.role in ["buyer", "seller", "admin"] and register_data.full_name and register_data.phone and register_data.address:
        is_profile_complete = True
        
    new_user = User(
        email=register_data.email,
        username=register_data.username,
        full_name=register_data.full_name,
        role=register_data.role,
        phone=register_data.phone,
        address=register_data.address,
        password_hash=pwd_hash,
        profile_complete=is_profile_complete
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create wallet if profile completed (and not admin)
    if is_profile_complete and register_data.role != "admin":
        new_wallet = Wallet(user_id=new_user.id, balance=0.00, currency="PKR")
        db.add(new_wallet)
        await db.commit()
        await db.refresh(new_user)
        
    token = create_access_token(new_user.id)
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # Check by email or username
    query = select(User).where(
        (User.email == login_data.username_or_email) | 
        (User.username == login_data.username_or_email)
    )
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
        
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.put("/complete-profile", response_model=UserResponse)
async def complete_profile(
    profile_data: UserSetupProfile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not isinstance(current_user, User):
        raise HTTPException(status_code=404, detail="User not found in DB.")

    # Update info
    current_user.role = profile_data.role
    current_user.username = profile_data.username
    current_user.full_name = profile_data.full_name
    current_user.phone = profile_data.phone
    current_user.address = profile_data.address
    current_user.profile_complete = True
    
    # Create wallet for user if they don't already have one
    wallet_check = await db.execute(select(Wallet).where(Wallet.user_id == current_user.id))
    if not wallet_check.scalars().first() and current_user.role != "admin":
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
