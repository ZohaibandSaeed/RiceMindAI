import asyncio
from app.database import async_session_maker
from app.models.user import User
from app.models.wallet import Wallet
from app.services.auth_utils import hash_password
from sqlalchemy import select

async def main():
    email = "zohaib45215330@gmail.com"
    username = "Zohaib"
    password = "AdminPassword123" # Secure password
    full_name = "Zohaib Saeed"
    
    async with async_session_maker() as session:
        # Check if already exists
        res = await session.execute(select(User).where(User.username == username))
        existing_user = res.scalars().first()
        
        pwd_hash = hash_password(password)
        
        if existing_user:
            existing_user.password_hash = pwd_hash
            existing_user.role = "admin"
            existing_user.profile_complete = True
            print(f"Updated existing user '{username}' to Admin and set password.")
        else:
            new_user = User(
                email=email,
                username=username,
                full_name=full_name,
                role="admin",
                password_hash=pwd_hash,
                profile_complete=True
            )
            session.add(new_user)
            await session.flush()
            
            # Create a mock admin wallet
            wallet = Wallet(user_id=new_user.id, balance=500000.00, currency="PKR")
            session.add(wallet)
            print(f"Created Admin user '{username}' and created wallet with 500,000 PKR balance.")
            
        await session.commit()

if __name__ == "__main__":
    asyncio.run(main())
