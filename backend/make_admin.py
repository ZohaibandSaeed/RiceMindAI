import asyncio
from app.database import async_session_maker
from app.models.user import User
from sqlalchemy import update

async def main():
    async with async_session_maker() as session:
        # Update Zohaib's role to admin
        await session.execute(
            update(User)
            .where(User.email == 'zohaib45215330@gmail.com')
            .values(role='admin')
        )
        
        # Or update explicitly by clerk_id from logs
        await session.execute(
            update(User)
            .where(User.clerk_id == 'user_3BrWJyK3pGTvjDJxPUhsrtgKIwV')
            .values(role='admin')
        )
        await session.commit()
        print("Successfully updated user to admin.")

if __name__ == "__main__":
    asyncio.run(main())
