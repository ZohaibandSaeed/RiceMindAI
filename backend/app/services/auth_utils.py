import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Union, Any
from app.config import settings

# JWT configuration
JWT_ALGORITHM = "HS256"
# Let's set the token expiration to 7 days
ACCESS_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(subject: Union[str, Any], expires_delta: int = ACCESS_TOKEN_EXPIRE_DAYS) -> str:
    expire = datetime.utcnow() + timedelta(days=expires_delta)
    to_encode = {
        "exp": expire,
        "sub": str(subject)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return decoded_token
    except jwt.PyJWTError:
        return {}
