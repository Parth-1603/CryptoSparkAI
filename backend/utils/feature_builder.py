import os
import pandas as pd
import numpy as np

FEATURES = [
    "open","high","low","close","volume",
    "MA7","MA30","prev_close","prev_volume",
    "price_change","pct_change","high_low_range","volatility_7"
]

def get_latest_features(coin: str, data_dir: str) -> dict:
    """
    Load processed CSV and return the last row's features.
    This is what the backend uses to run predictions.
    """
    # os.path.join instead of an f-string slash, so this also works
    # correctly on Windows paths passed in from predict.py.
    path = os.path.join(data_dir, f"{coin.lower()}_processed.csv")
    df = pd.read_csv(path)
    df = df.sort_values("timestamp").dropna()
    last = df.iloc[-1]
    return {f: float(last[f]) for f in FEATURES}