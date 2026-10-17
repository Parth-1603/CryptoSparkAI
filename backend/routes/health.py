from fastapi import APIRouter
import os
import httpx
import pandas as pd
from backend.model_loader import loaded, model_status, COINS
from backend.utils.coingecko import ping_coingecko_service, get_coingecko_api_key

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

    # 2. Check CoinGecko API with Demo API Key authentication
    ping_ok = await ping_coingecko_service()
    coingecko_status = "HEALTHY" if ping_ok else "UNREACHABLE_FALLBACK_ACTIVE"
    has_cg_key = bool(get_coingecko_api_key())

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
            "coinGeckoPlan": "Demo API Key (100 calls/min, 10,000/month)" if has_cg_key else "Public Tier",
            "groqLLM": groq_status
        },
        "supportedCoins": COINS,
        "faultToleranceEngine": "ACTIVE"
    }
