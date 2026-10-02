from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from groq import Groq

# Load the .env file BEFORE initializing the client
load_dotenv()

router = APIRouter()

def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)

SYSTEM_PROMPT = """You are CryptoSpark AI Assistant — an intelligent 
analytics chatbot embedded in CryptoSpark AI, a final-year engineering 
capstone project that predicts cryptocurrency prices using Big Data and ML.

The system:
- Processes 5M+ Bitcoin records using Apache Spark on AWS EMR
- Trains 4 models: XGBoost, LSTM, Prophet, Ensemble
- Predicts prices for BTC, ETH, SOL, ADA
- Forecast periods: 1H, 1D, 1W
- XGBoost is the best-performing model
- Backend: FastAPI on AWS EC2 Free Tier
- Frontend: React + Tailwind CSS dashboard
- Live prices: CoinGecko API
- Dataset: Kaggle Bitcoin Historical Data

Rules:
- Keep answers under 120 words unless asked for detail
- Never give financial advice
- Explain ML concepts simply
- Use bullet points for lists"""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []

@router.post("/v1/chat")
async def chat(req: ChatRequest):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in (req.history or [])[-8:]:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": req.message
    })

    try:
        client = get_groq_client()
        if not client:
            return {
                "text": "CryptoSpark AI Assistant is ready! To enable dynamic AI responses, please set GROQ_API_KEY in backend/.env. In the meantime, you can explore predictions, model metrics, and market data on the dashboard.",
                "chips": ["What is XGBoost?", "View metrics", "Run prediction"]
            }

        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=250,
            temperature=0.7
        )
        reply = resp.choices[0].message.content

        # Generate context-aware chips
        chips = []
        if "model" in req.message.lower():
            chips = ["What is XGBoost?", "View metrics",
                     "Compare models"]
        elif "price" in req.message.lower():
            chips = ["Run prediction", "View dashboard",
                     "Feature importance"]
        else:
            chips = ["How accurate?", "What is RMSE?",
                     "Explain pipeline"]

        return {"text": reply, "chips": chips}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))