from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, listings, imagekit, wallet, orders, contracts, admin, chat

app = FastAPI(title="RiceMindAI Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(imagekit.router)
app.include_router(wallet.router)
app.include_router(orders.router)
app.include_router(contracts.router)
app.include_router(admin.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "RiceMindAI API is running"}

# Health check endpoint for UptimeRobot
@app.get("/health")
def health():
    return {"status": "ok"}
