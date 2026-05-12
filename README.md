# RiceMindAI

RiceMindAI is an AI-powered marketplace platform for buying and selling rice. Sellers upload rice images, the AI analyzes quality, predicts price range, and buyers can safely purchase via an escrow system. The platform also includes a chatbot to answer rice-related queries.

## Features

- **AI Quality Analysis:** Images analyzed via OpenCV/ML for quality scoring.
- **Price Prediction:** Automatic price range suggested based on quality.
- **Secure Marketplace:** Payment held in escrow until delivery confirmation.
- **User Authentication:** Handled via Clerk for secure login.
- **Chatbot Support:** Provides buyers with rice info and pricing.
- **Admin Dashboard:** Manage listings, users, and transactions.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Clerk Auth
- **Backend:** FastAPI, Python
- **AI/ML:** LangChain/LangGraph, OpenCV
- **Image Storage:** ImageKit (private/signed URLs)
- **Database:** Neon (PostgreSQL)
- **Deployment:** Vercel/Netlify for frontend, backend hosted separately

## How It Works

1. Sellers upload rice images.
2. AI analyzes quality and suggests a price range.
3. Buyers browse listings and purchase via the platform.
4. Payment is held until delivery is confirmed.
5. Chatbot provides rice information and price queries.

## Getting Started

1. Clone the repo
2. Setup `.env` files for frontend and backend
3. Install dependencies:
   - `npm install` for frontend
   - `pip install -r backend/requirements.txt` for backend
4. Run backend and frontend servers
5. Start exploring RiceMindAI!

## License

MIT License
