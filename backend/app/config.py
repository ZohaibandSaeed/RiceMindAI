import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/dbname")
    CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY", "sk_test_123")
    CLERK_JWKS_URL: str = os.getenv("CLERK_JWKS_URL", "https://your-domain.clerk.accounts.dev/.well-known/jwks.json")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_random_secret")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Optional or with defaults
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ADMIN_URL: str = os.getenv("ADMIN_URL", "http://localhost:5174")

    # ImageKit
    IMAGEKIT_PUBLIC_KEY: str = os.getenv("IMAGEKIT_PUBLIC_KEY", "")
    IMAGEKIT_PRIVATE_KEY: str = os.getenv("IMAGEKIT_PRIVATE_KEY", "")
    IMAGEKIT_URL_ENDPOINT: str = os.getenv("IMAGEKIT_URL_ENDPOINT", "")

    # Groq AI
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
    CHAT_GROQ_API: str = os.getenv("CHAT_GROQ_API", "")

    class Config:
        env_file = ".env"

settings = Settings()