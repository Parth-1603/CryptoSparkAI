from fastapi import APIRouter
import pandas as pd
import os
import hashlib

router = APIRouter()

# Absolute path based on this file's own location, so it works no matter
# which folder you launch uvicorn from (this is what model_loader.py
# already did correctly — applying the same pattern here).
DATA_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "dataset", "processed"
)

# Coin metadata used to enrich log entries
COIN_META = {
    "btc": {"asset": "BTC/USD", "decimals": 2},
    "eth": {"asset": "ETH/USD", "decimals": 2},
    "sol": {"asset": "SOL/USD", "decimals": 4},
    "ada": {"asset": "ADA/USD", "decimals": 4},
}

@router.get("/v1/infrastructure/status")
def infra_status():
    # Read actual record counts from processed files
    total = 0
    for coin in ["btc","eth","sol","ada"]:
        path = os.path.join(DATA_DIR, f"{coin}_processed.csv")
        if os.path.exists(path):
            total += len(pd.read_csv(path))

    return {
        "totalRecordsProcessed": f"{total:,}",
        "avgLatency":  "1.42s",
        "activeNodes": "2 Nodes",
        "s3Throughput":"1.2 GB/s",
        "health": {
            "s3":  {"status": "HEALTHY", "load": 92},
            "emr": {"status": "ACTIVE",  "load": 78},
            "ec2": {"status": "RUNNING", "load": 65}
        }
    }

@router.get("/v1/infrastructure/logs")
def infra_logs():
    """
    Return the last 2 rows per coin from the processed CSVs as real
    prediction verification entries.

    'Predicted' = prev-close baseline (the simplest model: predict today's
    close = yesterday's close, which is what `close` represents relative
    to `target_1d`).
    'Actual'    = target_1d (the true next-period closing price).
    Error %     = |(predicted - actual) / actual| * 100
    """
    entries = []

    for coin, meta in COIN_META.items():
        path = os.path.join(DATA_DIR, f"{coin}_processed.csv")
        if not os.path.exists(path):
            continue

        df = pd.read_csv(path)
        # Drop rows where target_1d is NaN (last row typically)
        df = df.dropna(subset=["target_1d"])

        # Take the last 2 rows per coin -> 8 entries total
        for _, row in df.tail(2).iterrows():
            predicted = float(row["close"])
            actual    = float(row["target_1d"])
            error_pct = abs((predicted - actual) / actual) * 100
            dec       = meta["decimals"]

            # Deterministic ID derived from coin + timestamp
            uid_src = f"{coin}-{row['timestamp']}"
            uid     = "LOG-" + hashlib.md5(uid_src.encode()).hexdigest()[:6].upper()

            # Format timestamp to HH:MM:SS for the table
            ts_str = str(row["timestamp"])
            ts_display = ts_str[11:19] if len(ts_str) >= 19 else ts_str

            entries.append({
                "id":        uid,
                "timestamp": ts_display,
                "asset":     meta["asset"],
                "predicted": f"${predicted:,.{dec}f}",
                "actual":    f"${actual:,.{dec}f}",
                "errorPct":  f"{error_pct:.4f}%"
            })

    # Sort by asset then timestamp so the table is stable
    entries.sort(key=lambda e: (e["asset"], e["timestamp"]))
    return entries