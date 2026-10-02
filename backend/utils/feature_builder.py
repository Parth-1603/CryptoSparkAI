import os
import pandas as pd
import numpy as np

FEATURES = [
    "open","high","low","close","volume",
    "MA7","MA30","prev_close","prev_volume",
    "price_change","pct_change","high_low_range","volatility_7"
]

FEATURE_COLS = [
    "norm_open", "norm_high", "norm_low", "norm_ma7", "norm_ma30",
    "norm_prev_close", "pct_change", "norm_hl_range", "norm_volatility"
]

def get_latest_features(coin: str, data_dir: str) -> dict:
    """
    Load processed CSV and return the last row's raw & normalized features.
    """
    path = os.path.join(data_dir, f"{coin.lower()}_processed.csv")
    df = pd.read_csv(path)
    df = df.sort_values("timestamp").dropna().reset_index(drop=True)
    
    last = df.iloc[-1]
    close = float(last["close"])
    
    res = {f: float(last[f]) for f in FEATURES if f in last}
    res["close"] = close
    res["norm_open"] = float(last["open"]) / close
    res["norm_high"] = float(last["high"]) / close
    res["norm_low"] = float(last["low"]) / close
    res["norm_ma7"] = float(last["MA7"]) / close
    res["norm_ma30"] = float(last["MA30"]) / close
    res["norm_prev_close"] = float(last["prev_close"]) / close
    res["pct_change"] = float(last["pct_change"])
    res["norm_hl_range"] = float(last["high_low_range"]) / close
    res["norm_volatility"] = float(last["volatility_7"]) / close
    return res

def get_sequence_features(coin: str, data_dir: str, seq_len: int = 30) -> np.ndarray:
    """
    Load sequence matrix of normalized features for LSTM inference.
    """
    path = os.path.join(data_dir, f"{coin.lower()}_processed.csv")
    df = pd.read_csv(path)
    df = df.sort_values("timestamp").dropna().reset_index(drop=True)
    
    df["norm_open"] = df["open"] / df["close"]
    df["norm_high"] = df["high"] / df["close"]
    df["norm_low"] = df["low"] / df["close"]
    df["norm_ma7"] = df["MA7"] / df["close"]
    df["norm_ma30"] = df["MA30"] / df["close"]
    df["norm_prev_close"] = df["prev_close"] / df["close"]
    df["norm_hl_range"] = df["high_low_range"] / df["close"]
    df["norm_volatility"] = df["volatility_7"] / df["close"]
    
    seq_df = df[FEATURE_COLS].iloc[-seq_len:]
    return seq_df.values