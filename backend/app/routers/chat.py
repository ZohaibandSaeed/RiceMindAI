import os
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from groq import Groq

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.listing import Listing
from app.models.order import Order
from app.config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    
@router.post("")
async def chat_with_bot(request: ChatRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # 1. Fetch available listings (approved) with seller details
    listings_result = await db.execute(
        select(Listing, User.username, User.full_name)
        .join(User, User.id == Listing.seller_id)
        .where(Listing.status == 'approved')
    )
    listings_data = listings_result.all()
    
    # 2. Fetch current user's orders
    orders_result = await db.execute(select(Order).where(Order.buyer_id == current_user.id))
    orders = orders_result.scalars().all()
    
    # Format data for prompt context
    listings_context = "Available Rice Listings:\n"
    if not listings_data:
        listings_context += "No listings currently available.\n"
    else:
        for l, username, full_name in listings_data:
            seller_name = full_name or username
            listings_context += f"- Crop Name: {l.name} | Listing ID: {l.id} | Type: {l.rice_type} | Price: {l.final_price} PKR/kg | Stock: {l.stock_kg} kg | Seller: {seller_name} (@{username}) | Order Link: /buyer/listing/{l.id}\n"
            
    orders_context = f"User ({current_user.full_name or current_user.username}) Orders:\n"
    if not orders:
        orders_context += "No previous orders found.\n"
    else:
        for o in orders:
            orders_context += f"- Order ID: {o.id} | Quantity: {o.quantity_kg} kg | Total: {o.total_amount} PKR | Status: {o.status}\n"
            
    system_prompt = f"""You are a helpful assistant for the RiceMindAI marketplace.
Your answers MUST be short, concise, and to the point. Do not write introductory or concluding essays.

If the user asks about rice stock, availability, or who has what stock:
1. Provide the name of the seller who has the stock.
2. Provide the available stock quantity.
3. Provide a direct link to the stock so they can place an order using the exact format: [Order <Crop Name> Here](/buyer/listing/<Listing ID>).

Context Data:
{listings_context}

{orders_context}

Strict Rule: Use ONLY the provided data. Do not make up any fictitious orders or listings.
"""

    groq_api_key = os.getenv("CHAT_GROQ_API")
    if not groq_api_key:
        groq_api_key = getattr(settings, "CHAT_GROQ_API", None) 
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API Key (CHAT_GROQ_API) not configured on the server.")

    client = Groq(api_key=groq_api_key)
    model_name = os.getenv("GROQ_MODEL") or getattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile")
    if model_name == "openai/gpt-oss-120b":
        model_name = "llama-3.3-70b-versatile"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.message}
    ]
    
    def generate_response():
        try:
            completion = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.7,
                max_completion_tokens=512,
                top_p=1,
                stream=True,
                stop=None
            )
            
            for chunk in completion:
                content = chunk.choices[0].delta.content or ""
                if content:
                    yield content
        except Exception as e:
            yield f"Error contacting AI service: {str(e)}"
            
    return StreamingResponse(generate_response(), media_type="text/event-stream")
