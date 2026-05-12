import asyncio
from app.database import async_session_maker
from app.models.user import User
from sqlalchemy import update

async def main():
    async with async_session_maker() as session:
        await session.execute(update(User).values(role='admin'))
        await session.commit()
        print("Upgraded all existing accounts to Admin.")

if __name__ == "__main__":
    asyncio.run(main())
