import asyncio
from app.database import async_session_maker
from app.models.user import User
from sqlalchemy import select, update

async def main():
    async with async_session_maker() as session:
        # Give admin to the actual admin Zohaib (clerk_ids handled earlier)
        # Any other user should be assigned seller or buyer so they show up.
        
        users_q = await session.execute(select(User).where(User.username != 'Zohaib_Admin'))
        users = users_q.scalars().all()
        
        for i, u in enumerate(users):
            # Alternating assignments to give some variety
            if i % 2 == 0:
                u.role = 'seller'
            else:
                u.role = 'buyer'
        
        await session.commit()
        print(f"Restored {len(users)} users back to original buyer/seller roles so they show up in the directory.")

if __name__ == "__main__":
    asyncio.run(main())
