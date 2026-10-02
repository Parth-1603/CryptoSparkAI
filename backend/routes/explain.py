from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

router = APIRouter()

def get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception:
        return None

class ExplainRequest(BaseModel):
    asset: str
    period: str
    algorithm: str
    predictedPrice: float
    currentPrice: Optional[float] = None
    signal: str
    confidence: Optional[float] = 90.0
    pnlEstimate: Optional[float] = None
    features: Optional[Dict[str, Any]] = None
    topFeatures: Optional[List[Dict[str, Any]]] = None

def generate_deterministic_fallback_explanation(req: ExplainRequest) -> str:
    """
    Template-based fallback explanation when Groq API is unavailable or rate-limited.
    Ensures zero downtime and never crashes.
    """
    curr = req.currentPrice or req.predictedPrice
    pct = ((req.predictedPrice - curr) / curr) * 100 if curr else 0.0
    sig = req.signal.upper()
    
    # Feature influence summary
    top_feat_str = "previous close and 7-day volatility"
    if req.topFeatures and len(req.topFeatures) > 0:
        top_names = [f.get("name", "momentum") for f in req.topFeatures[:2]]
        top_feat_str = " & ".join(top_names)

    # MA trend context
    trend_desc = "bullish momentum above moving averages" if pct >= 0 else "bearish consolidation below short-term averages"
    risk_desc = "moderate market risk with steady volume" if abs(pct) < 3 else "elevated volatility indicating wider price swings"
    
    explanation = (
        f"CryptoSpark AI forecasts {req.asset} to reach ${req.predictedPrice:,.2f} ({pct:+.2f}%) over the {req.period} timeframe. "
        f"The prediction was primarily influenced by {top_feat_str}. "
        f"Moving averages reflect {trend_desc}, while 7-day volatility points to {risk_desc}. "
        f"Based on favorable risk-reward alignment, the quantitative signal indicates an {sig} posture. "
        f"Summary: Expect { 'upward price strength' if pct >= 0 else 'short-term market pullback' } with {req.confidence}% confidence."
    )
    return explanation

@router.post("/v1/explain")
async def explain_prediction(req: ExplainRequest):
    """
    Generate natural language AI explainability for a model's price prediction.
    """
    client = get_groq_client()
    
    # If Groq client is not available, return high-quality deterministic fallback immediately
    if not client:
        return {
            "explanation": generate_deterministic_fallback_explanation(req),
            "source": "RULE_ENGINE_FALLBACK",
            "model": "CryptoSpark Rule Engine"
        }

    curr_p = req.currentPrice or req.predictedPrice
    pct_change = ((req.predictedPrice - curr_p) / curr_p) * 100 if curr_p else 0.0

    # Build structured prompt for Groq Llama 3
    features_desc = ""
    if req.topFeatures:
        features_desc = ", ".join([f"{f.get('name')}: {f.get('weight', 0)}%" for f in req.topFeatures])
    elif req.features:
        features_desc = f"MA7: {req.features.get('MA7', 'N/A')}, MA30: {req.features.get('MA30', 'N/A')}, Volatility: {req.features.get('volatility_7', 'N/A')}"

    prompt = f"""You are the AI Explainability Engine for CryptoSpark AI.
Explain why the following cryptocurrency prediction was made:

- Asset: {req.asset}
- Algorithm Used: {req.algorithm}
- Forecast Horizon: {req.period}
- Current Baseline Price: ${curr_p:,.2f}
- Predicted Target Price: ${req.predictedPrice:,.2f} (Expected change: {pct_change:+.2f}%)
- Calculated Quantitative Signal: {req.signal} (Confidence: {req.confidence}%)
- Key Influential Features: {features_desc or 'Previous Close, Moving Averages (MA7/MA30), 7-Day Volatility'}

Instructions:
1. State the exact predicted price (${req.predictedPrice:,.2f}).
2. Mention the primary features that influenced the model (e.g., Moving Averages, Volatility, Prev Close).
3. Explain what the Moving Averages (MA7 vs MA30) indicate about price trend.
4. Explain what Volatility indicates about risk.
5. Clarify why the signal is {req.signal}.
6. End with a 1-sentence plain English summary for non-technical users.
7. CRITICAL RULES: Keep under 140 words. NEVER use the words 'buy' or 'sell' — always use 'accumulate' or 'reduce'. Do not give formal financial advice."""

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a professional quantitative financial AI explainability engine."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=220,
            temperature=0.6
        )
        explanation_text = response.choices[0].message.content.strip()
        return {
            "explanation": explanation_text,
            "source": "GROQ_LLAMA3",
            "model": "llama3-8b-8192"
        }
    except Exception as e:
        print(f"[GROQ EXPLAIN FALLBACK]: {e}")
        # Graceful fallback without failing the HTTP request
        return {
            "explanation": generate_deterministic_fallback_explanation(req),
            "source": "GROQ_ERROR_FALLBACK",
            "model": "CryptoSpark Rule Engine (Groq Fallback)"
        }
