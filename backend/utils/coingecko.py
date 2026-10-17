import os
import time
from pathlib import Path
from dotenv import load_dotenv
import httpx
from typing import Dict, Any, Tuple

# Automatically load backend/.env if not already loaded into os.environ
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

COINGECKO_MAP = {
    "btc": "bitcoin",
    "eth": "ethereum",
    "sol": "solana",
    "ada": "cardano"
}

# In-memory TTL cache to protect CoinGecko monthly quota (10,000 calls / 100/min)
_PRICE_CACHE: Dict[str, Any] = {
    "timestamp": 0.0,
    "data": {}
}
_CACHE_TTL = 15.0  # Cache for 15 seconds

def get_coingecko_api_key() -> str:
    """Retrieve stripped CoinGecko API key from environment."""
    return os.environ.get("COINGECKO_API_KEY", "").strip()

def get_coingecko_headers() -> Dict[str, str]:
    """Build CoinGecko authentication headers for Demo tier."""
    key = get_coingecko_api_key()
    if key:
        return {"x-cg-demo-api-key": key}
    return {}

async def fetch_coingecko_prices(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Fetch spot prices for all tracked cryptocurrencies with TTL caching.
    Uses authenticated header when COINGECKO_API_KEY is present in environment.
    """
    global _PRICE_CACHE
    now = time.time()

    if not force_refresh and (now - _PRICE_CACHE["timestamp"] < _CACHE_TTL) and _PRICE_CACHE["data"]:
        return _PRICE_CACHE["data"]

    coin_ids = ",".join(COINGECKO_MAP.values())
    headers = get_coingecko_headers()

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(
                f"{COINGECKO_BASE}/simple/price",
                params={
                    "ids": coin_ids,
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_market_cap": "true",
                    "include_24hr_vol": "true"
                },
                headers=headers
            )
            if resp.status_code == 200:
                data = resp.json()
                _PRICE_CACHE["timestamp"] = now
                _PRICE_CACHE["data"] = data
                return data
    except Exception:
        if _PRICE_CACHE["data"]:
            return _PRICE_CACHE["data"]
        return {}

    return _PRICE_CACHE.get("data", {})

async def get_live_coin_price(coin: str, fallback_price: float) -> Tuple[float, float, bool]:
    """
    Retrieve live spot price and 24h percentage change for a single coin.
    Returns: (current_price, pct_change_24h, is_live)
    """
    coin_id = COINGECKO_MAP.get(coin.lower())
    if not coin_id:
        return fallback_price, 0.0, False

    data = await fetch_coingecko_prices()
    if coin_id in data and "usd" in data[coin_id]:
        price = float(data[coin_id]["usd"])
        change = float(data[coin_id].get("usd_24h_change", 0.0))
        return price, change, True

    return fallback_price, 0.0, False

async def ping_coingecko_service() -> bool:
    """Check CoinGecko API connectivity with authentication."""
    headers = get_coingecko_headers()
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{COINGECKO_BASE}/ping", headers=headers)
            return resp.status_code == 200
    except Exception:
        return False
