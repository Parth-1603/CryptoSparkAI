import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import warnings
warnings.filterwarnings("ignore")

from prophet import Prophet
import tensorflow as tf

FEATURES = [
    "open", "high", "low", "close", "volume",
    "MA7", "MA30", "prev_close", "prev_volume",
    "price_change", "pct_change", "high_low_range", "volatility_7"
]
TARGET = "target_1d"
COINS  = ["btc", "eth", "sol", "ada"]
SEQ_LEN = 30

def load_coin(coin):
    path = os.path.join("dataset", "processed", f"{coin}_processed.csv")
    if not os.path.exists(path):
        path = f"{coin}_processed.csv"
    df = pd.read_csv(path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")
    df = df.dropna(subset=FEATURES + [TARGET])
    df = df.reset_index(drop=True)
    print(f"{coin.upper()}: {len(df):,} rows")
    return df

def time_split(df, ratio=0.80):
    idx   = int(len(df) * ratio)
    train = df.iloc[:idx]
    test  = df.iloc[idx:]
    return train, test

def evaluate(y_true, y_pred, model_name, coin):
    mae  = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)
    print(f"\n  {coin.upper()} - {model_name}")
    print(f"  MAE  : ${mae:,.2f}")
    print(f"  RMSE : ${rmse:,.2f}")
    print(f"  R2   : {r2:.4f}")
    return {
        "coin":  coin.upper(),
        "model": model_name,
        "mae":   round(mae, 2),
        "rmse":  round(rmse, 2),
        "r2":    round(r2, 4)
    }

def save_artifact(obj, coin, filename):
    folder = f"models/{coin}"
    os.makedirs(folder, exist_ok=True)
    path = f"{folder}/{filename}"
    joblib.dump(obj, path)
    print(f"  Saved -> {path}")
    return path

def make_sequences(X, seq_len):
    return np.array([
        X[i : i + seq_len]
        for i in range(len(X) - seq_len)
    ])

os.makedirs("results", exist_ok=True)

# ----------------------------------------------------
# PART 2 — PROPHET TRAINING
# ----------------------------------------------------
print("=" * 50)
print("TRAINING PROPHET - ALL 4 COINS")
print("=" * 50)

prophet_results = []

for coin in COINS:
    print(f"\n{'='*40}\nCoin: {coin.upper()}")

    df = load_coin(coin)

    prophet_df = df[["timestamp", "close"]].copy()
    prophet_df = prophet_df.rename(columns={"timestamp": "ds", "close": "y"})
    prophet_df["ds"] = pd.to_datetime(prophet_df["ds"])
    prophet_df = prophet_df.dropna()

    split    = int(len(prophet_df) * 0.80)
    train_df = prophet_df.iloc[:split]
    test_df  = prophet_df.iloc[split:]

    print(f"  Train rows : {len(train_df):,}")
    print(f"  Test  rows : {len(test_df):,}")

    model = Prophet(
        daily_seasonality=True,
        yearly_seasonality=True,
        weekly_seasonality=True,
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0
    )
    model.fit(train_df)

    future   = model.make_future_dataframe(periods=len(test_df), freq="D")
    forecast = model.predict(future)

    preds  = forecast["yhat"].iloc[split:].values
    y_true = test_df["y"].values

    n      = min(len(preds), len(y_true))
    preds  = preds[:n]
    y_true = y_true[:n]

    result = evaluate(y_true, preds, "Prophet", coin)
    prophet_results.append(result)

    save_artifact(model, coin, "prophet.joblib")

    colors = {"btc": "#f7931a", "eth": "#627eea", "sol": "#9945ff", "ada": "#0033ad"}
    plt.figure(figsize=(14, 5))
    plt.plot(y_true[-100:], label="Actual", color=colors[coin], linewidth=2)
    plt.plot(preds[-100:],  label="Prophet Predicted", color="black", linestyle="--", linewidth=1.5, alpha=0.85)
    plt.title(f"{coin.upper()} - Prophet Actual vs Predicted")
    plt.xlabel("Days")
    plt.ylabel("Price USD")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"results/prophet_{coin}.png", dpi=100, bbox_inches="tight")
    plt.close()

    print(f"  [SUCCESS] {coin.upper()} Prophet done")

prophet_df_results = pd.DataFrame(prophet_results)
prophet_df_results.to_csv("results/prophet_results.csv", index=False)
prophet_df_results.to_csv("prophet_results.csv", index=False)

print("\n[SUCCESS] Prophet training complete")
print(prophet_df_results.to_string(index=False))

# ----------------------------------------------------
# PART 3 — ENSEMBLE TRAINING
# ----------------------------------------------------
print("\n" + "=" * 50)
print("TRAINING ENSEMBLE - ALL 4 COINS")
print("=" * 50)

ensemble_results = []

for coin in COINS:
    print(f"\n{'='*40}\nCoin: {coin.upper()}")

    df = load_coin(coin)
    train, test = time_split(df)

    # 1. XGBoost predictions
    xgb_model  = joblib.load(f"models/{coin}/xgboost.joblib")
    xgb_scaler = joblib.load(f"models/{coin}/scaler_xgboost.joblib")
    X_xgb      = xgb_scaler.transform(test[FEATURES])
    p_xgb      = xgb_model.predict(X_xgb)
    print(f"  XGBoost predictions: {len(p_xgb)}")

    # 2. LSTM predictions
    lstm_model_path = f"models/{coin}/lstm.h5"
    if not os.path.exists(lstm_model_path):
        lstm_model_path = f"models/{coin}/lstm.keras"
    lstm_model    = tf.keras.models.load_model(lstm_model_path)
    scaler_lstm_X = joblib.load(f"models/{coin}/scaler_lstm_X.joblib")
    scaler_lstm_y = joblib.load(f"models/{coin}/scaler_lstm_y.joblib")

    X_lstm_s   = scaler_lstm_X.transform(test[FEATURES])
    X_lstm_seq = make_sequences(X_lstm_s, SEQ_LEN)
    p_lstm_s   = lstm_model.predict(X_lstm_seq, verbose=0).flatten()
    p_lstm     = scaler_lstm_y.inverse_transform(p_lstm_s.reshape(-1, 1)).flatten()
    print(f"  LSTM predictions   : {len(p_lstm)}")

    # 3. Prophet predictions
    prophet_model = joblib.load(f"models/{coin}/prophet.joblib")
    prophet_df = df[["timestamp", "close"]].copy()
    prophet_df = prophet_df.rename(columns={"timestamp": "ds", "close": "y"})
    prophet_df["ds"] = pd.to_datetime(prophet_df["ds"])
    split_idx  = int(len(prophet_df) * 0.80)

    future    = prophet_model.make_future_dataframe(periods=len(test), freq="D")
    forecast  = prophet_model.predict(future)
    p_prophet = forecast["yhat"].iloc[split_idx:].values
    print(f"  Prophet predictions: {len(p_prophet)}")

    # Align lengths
    n         = min(len(p_xgb), len(p_lstm), len(p_prophet))
    p_xgb     = p_xgb[:n]
    p_lstm    = p_lstm[:n]
    p_prophet = p_prophet[:n]
    y_true    = test[TARGET].values[:n]

    weights = {"xgboost": 0.50, "lstm": 0.30, "prophet": 0.20}
    p_ensemble = (
        weights["xgboost"] * p_xgb +
        weights["lstm"]    * p_lstm +
        weights["prophet"] * p_prophet
    )

    result = evaluate(y_true, p_ensemble, "Ensemble", coin)
    ensemble_results.append(result)

    config = {"weights": weights, "coin": coin, "seq_len": SEQ_LEN}
    save_artifact(config, coin, "ensemble_config.joblib")

    colors = {"btc": "#f7931a", "eth": "#627eea", "sol": "#9945ff", "ada": "#0033ad"}
    n_plot = min(100, n)

    plt.figure(figsize=(14, 5))
    plt.plot(y_true[-n_plot:], label="Actual", color=colors[coin], linewidth=2)
    plt.plot(p_ensemble[-n_plot:], label="Ensemble", color="black", linestyle="--", linewidth=1.5, alpha=0.85)
    plt.title(f"{coin.upper()} - Ensemble Actual vs Predicted")
    plt.xlabel("Days")
    plt.ylabel("Price USD")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"results/ensemble_{coin}.png", dpi=100, bbox_inches="tight")
    plt.close()

    print(f"  [SUCCESS] {coin.upper()} Ensemble done")

ensemble_df = pd.DataFrame(ensemble_results)
ensemble_df.to_csv("results/ensemble_results.csv", index=False)
ensemble_df.to_csv("ensemble_results.csv", index=False)

print("\n[SUCCESS] Ensemble training complete")
print(ensemble_df.to_string(index=False))

# ----------------------------------------------------
# PART 4 — FINAL COMPARISON TABLE
# ----------------------------------------------------
print("\n" + "=" * 50)
print("FINAL MODEL COMPARISON - ALL MODELS ALL COINS")
print("=" * 50)

# Check summary files
summary_file = "results/all_models_summary.csv"
if os.path.exists(summary_file):
    r_all_base = pd.read_csv(summary_file)
else:
    r_all_base = pd.DataFrame()

r_prop = pd.read_csv("results/prophet_results.csv")
r_ens  = pd.read_csv("results/ensemble_results.csv")

final = pd.concat([r_all_base, r_prop, r_ens], ignore_index=True)
final = final.sort_values(["coin", "r2"], ascending=[True, False]).reset_index(drop=True)

print("\nFull comparison table:")
print(final.to_string(index=False))

final.to_csv("all_models_comparison.csv", index=False)
final.to_csv("results/all_models_comparison.csv", index=False)

print("\n[SUCCESS] Saved: all_models_comparison.csv")

print("\n=== BEST MODEL PER COIN (by R2) ===")
best = final.loc[final.groupby("coin")["r2"].idxmax()]
print(best[["coin", "model", "mae", "rmse", "r2"]].to_string(index=False))
