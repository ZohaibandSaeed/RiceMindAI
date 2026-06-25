import time
import hmac
import hashlib
import secrets
from app.config import settings

def get_imagekit_auth_params() -> dict:
    """
    Generate ImageKit authentication parameters manually.
    New imagekitio SDK v5+ doesn't support public/private key init the old way.
    We generate the signature ourselves for direct frontend uploads.
    """
    token = secrets.token_hex(16)
    expire = int(time.time()) + 1800  # 30 minutes from now (must be less than 1 hour)

    # HMAC-SHA1 signature
    signature = hmac.new(
        settings.IMAGEKIT_PRIVATE_KEY.encode(),
        f"{token}{expire}".encode(),
        hashlib.sha1
    ).hexdigest()

    return {
        "token": token,
        "expire": str(expire),
        "signature": signature,
        "publicKey": settings.IMAGEKIT_PUBLIC_KEY,
        "urlEndpoint": settings.IMAGEKIT_URL_ENDPOINT
    }
