from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.services.imagekit_service import get_imagekit_auth_params

router = APIRouter(prefix="/api/imagekit", tags=["imagekit"])

@router.get("/auth")
async def imagekit_auth(current_user=Depends(get_current_user)):
    """Get signed auth params for ImageKit frontend upload"""
    return get_imagekit_auth_params()
