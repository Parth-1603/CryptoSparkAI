from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import os
import re
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

# Ensure .env is loaded from backend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

router = APIRouter()

SUPPORTED_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
]

def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception:
        return None

SYSTEM_PROMPT = """You are CryptoSpark AI Assistant — an intelligent analytics chatbot embedded in CryptoSpark AI, a final-year engineering capstone project that predicts cryptocurrency prices using Big Data and Machine Learning.

Key project specifications:
- Data Processing: 5M+ Bitcoin historical records processed using Apache Spark on AWS EMR cluster
- Machine Learning Models (6 algorithms benchmarked): XGBoost (best performer, R² ~99.3%, RMSE ~$1,126), Random Forest (R² ~98.9%), Ensemble Blend (R² ~98.1%), LSTM Neural Network (R² ~97.4%), Linear Regression (R² ~94.2%), Prophet (R² ~89.5%)
- Supported Cryptocurrencies: Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Cardano (ADA)
- Forecast Timeframes: 1 Hour (1H), 1 Day (1D), 1 Week (1W)
- Backend: FastAPI with self-healing fault tolerance and 15s in-memory market caching
- Live Market Feed: CoinGecko API with automatic CSV fallback
- Frontend: React + Tailwind CSS dashboard with dark/light mode
- AI Explainability: Natural language quantitative interpretations

Guidelines:
- Keep answers concise (under 120 words unless the user asks for deep detail)
- Never give formal financial advice; use terms like accumulate or reduce
- Explain ML & Big Data concepts clearly
- Use bullet points for structured comparisons
- If asked about accuracy or ranking, highlight XGBoost as #1 with its 99.3% precision"""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []

def generate_contextual_chips(query: str) -> List[str]:
    q = query.lower()
    if any(k in q for k in ["model", "algo", "xgboost", "lstm", "prophet", "forest"]):
        return ["How accurate?", "Compare models", "Run prediction"]
    if any(k in q for k in ["price", "market", "btc", "eth", "sol", "ada", "cost"]):
        return ["Run prediction", "View dashboard", "How accurate?"]
    if any(k in q for k in ["accurate", "accuracy", "rmse", "metric", "rank", "score"]):
        return ["What models?", "What is RMSE?", "Run prediction"]
    if any(k in q for k in ["infrastructure", "spark", "emr", "aws", "pipeline"]):
        return ["What models?", "How accurate?", "Pipeline health"]
    return ["How accurate?", "What models?", "How to start", "Infrastructure"]

def generate_offline_fallback(query: str) -> dict:
    q = query.lower()

    if any(k in q for k in ["accura", "rmse", "rank", "score", "perform", "best model", "winner"]):
        text = (
            "**CryptoSpark AI Model Accuracies & Ranking:**\n\n"
            "• **1. XGBoost (Rank #1 — Primary):** R² = 99.3%, RMSE = $1,126.35, MAPE = 1.2%. Exceptional at capturing non-linear interactions.\n"
            "• **2. Random Forest (Rank #2):** R² = 98.9%, RMSE = $1,340.20. Robust against overfitting with bagged trees.\n"
            "• **3. Ensemble Blend (Rank #3):** R² = 98.1%, RMSE = $1,485.50. Weighted consensus model combining multiple estimators.\n"
            "• **4. LSTM Network (Rank #4):** R² = 97.4%, RMSE = $1,820.10. Deep recurrent architecture tracking temporal sequences.\n"
            "• **5. Linear Regression (Rank #5):** R² = 94.2%, RMSE = $2,410.80. Quantitative linear baseline.\n"
            "• **6. Prophet (Rank #6):** R² = 89.5%, RMSE = $3,150.00. Additive seasonality forecasting.\n\n"
            "*Note on RMSE:* The Root Mean Squared Error is measured in **dollars ($)** because it calculates the standard deviation of residuals in the asset's original currency units."
        )
        return {"text": text, "chips": ["What models?", "Run prediction", "Infrastructure"]}

    if any(k in q for k in ["model", "algo", "xgboost", "lstm", "prophet", "random forest", "ensemble"]):
        text = (
            "CryptoSpark AI supports **6 benchmarked algorithms** in the interactive playground:\n\n"
            "• **XGBoost:** Gradient boosted trees optimized for tabular financial features.\n"
            "• **Random Forest:** High-resilience bagged decision trees.\n"
            "• **Ensemble Blend:** Weighted consensus combining top models.\n"
            "• **LSTM:** Deep learning recurrent neural network for sequence memory.\n"
            "• **Linear Regression:** Fast baseline tracking linear price trajectories.\n"
            "• **Prophet:** Facebook's additive time-series decomposition model.\n\n"
            "Select any algorithm in the Predictions tab to run real-time inference with Groq explainability."
        )
        return {"text": text, "chips": ["How accurate?", "Run prediction", "Compare models"]}

    if any(k in q for k in ["start", "how to", "guide", "tutorial", "begin", "help", "use"]):
        text = (
            "**Getting Started with CryptoSpark AI:**\n\n"
            "1. Open the **Predictions** tab in the navigation.\n"
            "2. Select a cryptocurrency asset (**BTC, ETH, SOL, ADA**).\n"
            "3. Choose a forecast period (**1H, 1D, or 1W**) and your desired ML algorithm.\n"
            "4. Click **Run Prediction Pipeline** to execute real-time inference and view the AI Explainability insight.\n"
            "5. Explore **Model Metrics** to compare benchmark scores across all 6 models."
        )
        return {"text": text, "chips": ["Run prediction", "How accurate?", "What models?"]}

    if any(k in q for k in ["infra", "spark", "emr", "aws", "pipeline", "cloud", "data"]):
        text = (
            "**CryptoSpark AI Big Data Architecture:**\n\n"
            "• **Data Pipeline:** 5M+ Kaggle historical records stored in AWS S3.\n"
            "• **Distributed Processing:** Apache Spark on AWS EMR cluster computing technical features (7-day MA, 30-day MA, volatility, momentum).\n"
            "• **Serving Layer:** FastAPI microservice with self-healing fault tolerance and 15s in-memory market caching.\n"
            "• **Real-time Ingestion:** Live CoinGecko API demo integration with automatic dataset fallback."
        )
        return {"text": text, "chips": ["How accurate?", "What models?", "View pipeline"]}

    if any(k in q for k in ["price", "market", "live", "coingecko", "cost", "current"]):
        text = (
            "Market data is retrieved in real-time through the **CoinGecko Demo API** with an in-memory 15-second TTL cache to prevent rate-limiting.\n\n"
            "If the external API reaches its rate limit or is temporarily unreachable, CryptoSpark AI's self-healing layer automatically falls back to verified historical baselines with zero interruption."
        )
        return {"text": text, "chips": ["Run prediction", "How accurate?", "Infrastructure"]}

    text = (
        "Hello! I am **CryptoSpark AI Assistant** — your analytics co-pilot for cryptocurrency price forecasting.\n\n"
        "You can ask me about:\n"
        "• **Model Accuracies & Ranking:** Benchmark scores for all 6 ML models\n"
        "• **Predictions:** How forecasts and signals (Accumulate/Reduce) are calculated\n"
        "• **Big Data Pipeline:** Apache Spark on AWS EMR and 5M+ records\n"
        "• **Live Market Data:** CoinGecko integration and self-healing caching"
    )
    return {"text": text, "chips": ["How accurate?", "What models?", "How to start", "Infrastructure"]}

@router.post("/v1/chat")
async def chat(req: ChatRequest):
    chips = generate_contextual_chips(req.message)
    client = get_groq_client()

    if not client:
        fallback = generate_offline_fallback(req.message)
        return {"text": fallback["text"], "chips": fallback.get("chips", chips)}

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for msg in (req.history or [])[-8:]:
        role = msg.role if msg.role in ["user", "assistant", "system"] else "user"
        messages.append({
            "role": role,
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": req.message
    })

    # Try each supported model sequentially
    for model_name in SUPPORTED_MODELS:
        try:
            resp = client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=250,
                temperature=0.7
            )
            reply = resp.choices[0].message.content
            if reply and reply.strip():
                return {"text": reply.strip(), "chips": chips}
        except Exception as e:
            print(f"[GROQ CHAT WARN] Model {model_name} failed: {e}")
            continue

    # Graceful offline fallback if all Groq models fail or rate limit
    fallback = generate_offline_fallback(req.message)
    return {"text": fallback["text"], "chips": fallback.get("chips", chips)}