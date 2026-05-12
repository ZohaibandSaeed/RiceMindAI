from groq import Groq
from app.config import settings
import json

client = Groq(api_key=settings.GROQ_API_KEY)

async def analyze_rice_listing(image_url: str, rice_type: str, seller_price: float) -> dict:
    """
    Analyzes ONLY the first image for quality + price.
    image_url: single ImageKit URL (first image only)
    rice_type: seller selected type
    seller_price: price per kg in PKR
    """
    prompt = f"""You are a professional rice quality analyst and market expert in Pakistan.

Analyze this rice listing:
- Rice Type (seller declares): {rice_type}
- Seller's Price: PKR {seller_price} per KG
- Image URL: {image_url}

Based on your knowledge of Pakistani rice market, provide your analysis.

Respond ONLY with valid JSON in this exact format (no extra text):
{{
  "quality_score": 0.85,
  "quality_notes": "Describe grain uniformity, color, cleanliness, and visible quality",
  "detected_type": "Basmati",
  "suggested_min_price": 200,
  "suggested_max_price": 280,
  "price_verdict": "price_ok",
  "price_message": "Short message about the price verdict"
}}

Rules:
- quality_score: float between 0.0 and 1.0
- price_verdict must be exactly one of: price_ok, price_too_high, price_too_low
- Use realistic Pakistani market prices (PKR)
- If rice type seems mismatched, still provide analysis based on declared type
"""

    try:
        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_completion_tokens=512,
            top_p=1,
            stream=False
        )

        ai_response = completion.choices[0].message.content.strip()

        # Clean up response if wrapped in markdown code blocks
        if ai_response.startswith("```"):
            ai_response = ai_response.split("```")[1]
            if ai_response.startswith("json"):
                ai_response = ai_response[4:]

        result = json.loads(ai_response)
        return result

    except json.JSONDecodeError:
        return _fallback_response()
    except Exception as e:
        print(f"Groq AI Error: {str(e)}")
        return _fallback_response()


def _fallback_response():
    return {
        "quality_score": None,
        "quality_notes": "AI analysis unavailable. Listing will be reviewed manually.",
        "detected_type": None,
        "suggested_min_price": None,
        "suggested_max_price": None,
        "price_verdict": None,
        "price_message": "AI analysis unavailable. Listing will be reviewed manually."
    }
