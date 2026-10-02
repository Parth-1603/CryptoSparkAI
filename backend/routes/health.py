from fastapi import APIRouter
import os
import httpx
import pandas as pd
from backend.model_loader import loaded, model_status, COINS

router = APIRouter()

DATA_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "dataset", "processed"
)

@router.get("/v1/pipeline/health")
async def pipeline_health():
    """
    Comprehensive health check for Big Data & ML pipeline components.
    """
    # 1. Check datasets
    dataset_status = {}
    for coin in COINS:
        p = os.path.join(DATA_DIR, f"{coin}_processed.csv")
        if os.path.exists(p):
            try:
                df = pd.read_csv(p)
                dataset_status[coin] = {
                    "status": "HEALTHY",
                    "rows": len(df),
                    "lastDate": str(df["timestamp"].iloc[-1]) if "timestamp" in df else "N/A"
                }
            except Exception as e:
                dataset_status[coin] = {"status": "DEGRADED", "error": str(e)}
        else:
            dataset_status[coin] = {"status": "MISSING"}

    # 2. Check CoinGecko API
    coingecko_status = "UNKNOWN"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get("https://api.coingecko.com/api/v3/ping")
            coingecko_status = "HEALTHY" if res.status_code == 200 else "DEGRADED"
    except Exception:
        coingecko_status = "UNREACHABLE_FALLBACK_ACTIVE"

    # 3. Check Groq API
    groq_status = "CONFIGURED" if os.environ.get("GROQ_API_KEY") else "FALLBACK_MODE"

    # Calculate overall pipeline health status
    all_healthy = all(
        all(status == "HEALTHY" for status in model_status[c].values())
        for c in COINS
    ) and (coingecko_status == "HEALTHY")

    overall = "HEALTHY" if all_healthy else "DEGRADED"

    return {
        "status": overall,
        "models": model_status,
        "datasets": dataset_status,
        "services": {
            "coinGecko": coingecko_status,
            "groqLLM": groq_status
        },
        "supportedCoins": COINS,
        "faultToleranceEngine": "ACTIVE"
    }
