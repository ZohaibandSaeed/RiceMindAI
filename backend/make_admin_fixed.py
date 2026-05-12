import asyncio
from app.database import async_session_maker
from app.models.user import User
from app.models.wallet import Wallet
from sqlalchemy import update, select
import uuid

async def main():
    async with async_session_maker() as session:
        # Check current clerk id that is failing
        clerk_id = 'user_3BrWJyK3pGTvjDJxPUhsrtgKIwV'
        
        # Check if the conflicting old User "Zohaib" is holding the username
        res = await session.execute(select(User).where(User.username == 'Zohaib'))
        old_user = res.scalars().first()
        
        if old_user and old_user.clerk_id != clerk_id:
            old_user.username = f"Zohaib_old_{uuid.uuid4().hex[:6]}"
            await session.flush()
            print("Renamed old Zohaib username to prevent conflict.")
            
        # Check if the duplicate user is another clerk id
        clerk2 = 'user_3BrV5eAfAV4qbEOkVnrTXNo1Wtv'
        res2 = await session.execute(select(User).where(User.clerk_id == clerk2))
        if user2 := res2.scalars().first():
            user2.role = 'admin'
            print("Gave second conflicting account admin.")

        # Ensure the active clerk ID is created as an Admin
        res_current = await session.execute(select(User).where(User.clerk_id == clerk_id))
        current_user = res_current.scalars().first()
        
        if not current_user:
            new_user = User(
                clerk_id=clerk_id,
                email='zohaib45215330@gmail.com',  # guessed from previous logs
                username='Zohaib_Admin',
                full_name='Zohaib Saeed',
                role='admin',
                profile_complete=True
            )
            session.add(new_user)
            await session.flush()
            wallet = Wallet(user_id=new_user.id, balance=500000.00, currency="PKR")
            session.add(wallet)
            await session.commit()
            print("Created missing Active Clerk account natively and granted Admin.")
        else:
            current_user.role = 'admin'
            await session.commit()
            print("Active clerk account existed, upgraded to Admin.")

if __name__ == "__main__":
    asyncio.run(main())
