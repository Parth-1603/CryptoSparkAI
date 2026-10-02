from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import pandas as pd
import os

router = APIRouter()

# Absolute path based on this file's own location, so it works no matter
# which folder you launch uvicorn from.
DATA_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "dataset", "processed"
)

VALID_SYMBOLS = {"btc", "eth", "sol", "ada"}

@router.get("/historical/{symbol}")
def get_historical(
    symbol: str,
    period: Optional[str] = Query("1M",
        description="1W, 1M, 6M, 1Y, ALL")
):
    coin = symbol.lower()
    if coin not in VALID_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Unknown symbol: {symbol}")

    # Previously this always read btc_processed.csv no matter what symbol
    # was requested, and pointed at dataset/ instead of dataset/processed/.
    path = os.path.join(DATA_DIR, f"{coin}_processed.csv")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"No data file for {symbol}")

    df = pd.read_csv(path, parse_dates=["timestamp"])
    df = df.sort_values("timestamp")

    last_date = df["timestamp"].max()

    period_map = {
        "1W":  7,
        "1M":  30,
        "6M":  180,
        "1Y":  365,
        "ALL": 99999
    }
    days = period_map.get(period, 30)
    cutoff = last_date - pd.Timedelta(days=days)
    df = df[df["timestamp"] >= cutoff]

    result = df[["timestamp","open","high","low","close","volume"]] \
               .tail(500)   # cap for API performance

    return {
        "symbol": symbol.upper(),
        "period": period,
        "count":  len(result),
        "data":   result.to_dict(orient="records")
    }