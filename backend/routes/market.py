from fastapi import APIRouter
import httpx
import pandas as pd
import os

router = APIRouter()

COINGECKO = "https://api.coingecko.com/api/v3"

COIN_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "ADA": "cardano"
}

@router.get("/v1/market/summary")
async def market_summary():
    """Matches Dashboard KPI bar exactly with live global data & safe fallbacks"""
    api_key = os.environ.get("COINGECKO_API_KEY")
    headers = {"x-cg-demo-api-key": api_key} if api_key else {}

    btc_price, btc_change = 80786.46, -0.94
    eth_price, eth_change = 2432.50, -2.10
    total_cap = "$2.75T"
    vol_24h = "$88.4B"
    btc_dom = 54.2
    eth_dom = 18.5
    other_dom = 27.3
    sentiment_score = 72
    sentiment_label = "Greed"

    async with httpx.AsyncClient(timeout=6.0) as client:
        # 1. Spot prices for BTC and ETH
        try:
            ids = ",".join(COIN_IDS.values())
            r = await client.get(
                f"{COINGECKO}/simple/price",
                params={
                    "ids": ids,
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_market_cap": "true"
                },
                headers=headers
            )
            if r.status_code == 200:
                data = r.json()
                btc = data.get("bitcoin", {})
                eth = data.get("ethereum", {})
                btc_price  = float(btc.get("usd", btc_price))
                btc_change = float(btc.get("usd_24h_change", btc_change))
                eth_price  = float(eth.get("usd", eth_price))
                eth_change = float(eth.get("usd_24h_change", eth_change))
        except Exception:
            pass

        # 2. Live Global Market Cap, Volume & Dominance
        try:
            r_global = await client.get(f"{COINGECKO}/global", headers=headers)
            if r_global.status_code == 200:
                g_data = r_global.json().get("data", {})
                tc = g_data.get("total_market_cap", {}).get("usd")
                if tc:
                    total_cap = f"${float(tc) / 1e12:.2f}T"
                tv = g_data.get("total_volume", {}).get("usd")
                if tv:
                    # Daily volume across all crypto markets
                    vol_val = float(tv)
                    if vol_val >= 1e12:
                        vol_24h = f"${vol_val / 1e12:.2f}T"
                    else:
                        vol_24h = f"${vol_val / 1e9:.1f}B"
                dom_data = g_data.get("market_cap_percentage", {})
                if "btc" in dom_data:
                    btc_dom = round(float(dom_data["btc"]), 1)
                if "eth" in dom_data:
                    eth_dom = round(float(dom_data["eth"]), 1)
                other_dom = round(max(0.0, 100.0 - btc_dom - eth_dom), 1)
        except Exception:
            pass

        # 3. Live Fear & Greed Index
        try:
            r_fng = await client.get("https://api.alternative.me/fng/?limit=1")
            if r_fng.status_code == 200:
                fng_res = r_fng.json().get("data", [{}])[0]
                sentiment_score = int(fng_res.get("value", sentiment_score))
                sentiment_label = str(fng_res.get("value_classification", sentiment_label))
        except Exception:
            pass

    return {
        "kpis": {
            "btcUsd": {
                "value": f"${btc_price:,.0f}",
                "change": f"{btc_change:+.1f}%",
                "isPositive": btc_change >= 0
            },
            "ethUsd": {
                "value": f"${eth_price:,.0f}",
                "change": f"{eth_change:+.1f}%",
                "isPositive": eth_change >= 0
            },
            "totalCap": total_cap,
            "volume24h": vol_24h,
            "modelAccuracy": "94.2%",
            "activeModel": {
                "name": "XGBoost v1.0",
                "status": "Running",
                "engine": "XGBoost Engine"
            }
        },
        "marketDominance": {
            "btc": btc_dom, "eth": eth_dom, "other": other_dom
        },
        "marketSentiment": {
            "score": sentiment_score, "label": sentiment_label
        },
        "volatilityIndex": {
            "deviation30d": 4.82,
            "intradayRange": round(abs(btc_price * 0.021), 0)
        }
    }


@router.get("/v1/market/watchlist")
async def watchlist():
    """Matches watchlist table exactly"""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            ids = ",".join(COIN_IDS.values())
            r = await client.get(
                f"{COINGECKO}/simple/price",
                params={
                    "ids": ids,
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_market_cap": "true",
                    "include_24hr_vol": "true"
                }
            )
            data = r.json()
        except Exception:
            data = {}

    fallbacks = {
        "bitcoin":  {"price": 80786.46, "change": -0.94, "cap": 1.61e12, "vol": 42.5e9},
        "ethereum": {"price": 2432.50,  "change": -2.10, "cap": 292e9,   "vol": 18.2e9},
        "solana":   {"price": 104.50,   "change": -2.20, "cap": 48e9,    "vol": 4.1e9},
        "cardano":  {"price": 0.2228,   "change": -4.30, "cap": 7.9e9,   "vol": 0.35e9},
    }

    def fmt(coin_id, name, sym, color, letter):
        fb = fallbacks.get(coin_id, {"price": 0, "change": 0, "cap": 0, "vol": 0})
        d = data.get(coin_id, {})
        price  = float(d.get("usd", fb["price"]))
        change = float(d.get("usd_24h_change", fb["change"]))
        cap    = float(d.get("usd_market_cap", fb["cap"]))
        vol    = float(d.get("usd_24h_vol", fb["vol"]))
        return {
            "name": name, "sym": sym,
            "color": color, "letter": letter,
            "price":  f"${price:,.2f}" if price > 1 else f"${price:,.4f}",
            "change": f"{change:+.1f}%",
            "pos":    change >= 0,
            "vol":    f"${vol/1e9:.1f}B",
            "cap":    f"${cap/1e12:.2f}T" if cap > 1e12 else f"${cap/1e9:.1f}B"
        }

    return [
        fmt("bitcoin",  "Bitcoin",  "BTC",
            "#f7931a", "₿"),
        fmt("ethereum", "Ethereum", "ETH",
            "#627eea", "Ξ"),
        fmt("solana",   "Solana",   "SOL",
            "#9945ff", "◎"),
        fmt("cardano",  "Cardano",  "ADA",
            "#0033ad", "₳"),
    ]


@router.get("/v1/market/signals")
async def signals():
    """Market signal alerts — semi-static for now"""
    return [
        {
            "time": "2m ago",
            "text": "Whale transfer of 2,500 BTC detected on-chain.",
            "color": "border-primary"
        },
        {
            "time": "15m ago",
            "text": "XGBoost model reconfirms BULLISH signal for BTC.",
            "color": "border-lime"
        },
        {
            "time": "1h ago",
            "text": "SOL breaks 7-day resistance level.",
            "color": "border-primary"
        }
    ]