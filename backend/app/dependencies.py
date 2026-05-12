from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import jwt
import httpx
import ssl
import certifi

from app.database import get_db
from app.config import settings
from app.models.user import User

# Fetch JWKS using httpx (bypasses macOS SSL issue)
async def fetch_jwks():
    async with httpx.AsyncClient() as client:
        response = await client.get(settings.CLERK_JWKS_URL)
        return response.json()

async def get_current_user(authorization: str = Header(None), db: AsyncSession = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid token",
        )
    
    token = authorization.split(" ")[1]
    
    try:
        # Get JWKS keys from Clerk using httpx (no SSL issue)
        jwks_data = await fetch_jwks()
        
        # Get the kid from token header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        # Find matching key
        public_key = None
        for key_data in jwks_data.get("keys", []):
            if key_data.get("kid") == kid:
                from jwt.algorithms import RSAAlgorithm
                public_key = RSAAlgorithm.from_jwk(key_data)
                break
        
        if not public_key:
            raise HTTPException(status_code=401, detail="No matching key found")
        
        # Decode and verify token
        data = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        clerk_id = data.get("sub")
        if not clerk_id:
            raise HTTPException(status_code=401, detail="Token missing subject")
        
        result = await db.execute(select(User).where(User.clerk_id == clerk_id))
        user = result.scalars().first()
        
        if not user:
            return {"clerk_id": clerk_id, "email": data.get("email", "")}
            
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"AUTH ERROR: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )
