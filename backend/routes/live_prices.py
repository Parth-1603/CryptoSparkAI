from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

COINGECKO_BASE = "https://api.coingecko.com/api/v3"

COIN_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "BNB": "binancecoin",
    "ADA": "cardano",
    "DOT": "polkadot"
}

@router.get("/live-prices")
async def get_live_prices():
    ids = ",".join(COIN_IDS.values())
    url = (
        f"{COINGECKO_BASE}/simple/price"
        f"?ids={ids}"
        f"&vs_currencies=usd"
        f"&include_24hr_change=true"
        f"&include_market_cap=true"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            raw = response.json()
        except Exception:
            # Fallback: return last known prices from your dataset
            raise HTTPException(
                status_code=503,
                detail="CoinGecko unavailable. Try again shortly."
            )

    result = {}
    for symbol, coin_id in COIN_IDS.items():
        if coin_id in raw:
            result[symbol] = {
                "price":      raw[coin_id].get("usd", 0),
                "change_24h": raw[coin_id].get("usd_24h_change", 0),
                "market_cap": raw[coin_id].get("usd_market_cap", 0)
            }
    return result


@router.get("/live-prices/{symbol}")
async def get_single_price(symbol: str):
    symbol = symbol.upper()
    if symbol not in COIN_IDS:
        raise HTTPException(
            status_code=404,
            detail=f"Symbol {symbol} not supported"
        )
    coin_id = COIN_IDS[symbol]
    url = (
        f"{COINGECKO_BASE}/simple/price"
        f"?ids={coin_id}"
        f"&vs_currencies=usd"
        f"&include_24hr_change=true"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        data = response.json()

    return {
        "symbol": symbol,
        "price":      data[coin_id].get("usd", 0),
        "change_24h": data[coin_id].get("usd_24h_change", 0)
    }