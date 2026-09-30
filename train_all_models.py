import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
import xgboost as xgb
import joblib
import os
import warnings
warnings.filterwarnings("ignore")

# =============================================
# FEATURES — same 13 features for all models
# =============================================
FEATURES = [
    "open",
    "high",
    "low",
    "close",
    "volume",
    "MA7",
    "MA30",
    "prev_close",
    "prev_volume",
    "price_change",
    "pct_change",
    "high_low_range",
    "volatility_7"
]

TARGET = "target_1d"  # predict next day's close price
COINS = ["btc", "eth", "sol", "ada"]

all_results = []

print("[SUCCESS] Setup complete")
print(f"Features  : {len(FEATURES)}")
print(f"Target    : {TARGET}")
print(f"Coins     : {COINS}")

def load_coin(coin):
    """
    Load processed CSV for a coin.
    Sort by time, drop nulls, reset index.
    """
    path = os.path.join("dataset", "processed", f"{coin}_processed.csv")
    if not os.path.exists(path):
        path = f"{coin}_processed.csv"
    df = pd.read_csv(path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")
    df = df.dropna(subset=FEATURES + [TARGET])
    df = df.reset_index(drop=True)
    print(f"{coin.upper()}: {len(df):,} rows loaded")
    return df

def time_split(df, ratio=0.80):
    split_idx = int(len(df) * ratio)
    train = df.iloc[:split_idx]
    test  = df.iloc[split_idx:]
    print(f"  Train: {len(train):,} rows ({train['timestamp'].min().date()} -> {train['timestamp'].max().date()})")
    print(f"  Test : {len(test):,} rows ({test['timestamp'].min().date()} -> {test['timestamp'].max().date()})")
    return train, test

def evaluate(y_true, y_pred, model_name, coin):
    mae  = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)

    print(f"\n  === {coin.upper()} - {model_name} ===")
    print(f"  MAE  : ${mae:,.2f}")
    print(f"  RMSE : ${rmse:,.2f}")
    print(f"  R2   : {r2:.4f}")

    if r2 > 0.90:
        print("  [FIT] Excellent fit")
    elif r2 > 0.75:
        print("  [FIT] Good fit")
    else:
        print("  [FIT] Moderate fit - acceptable for crypto")

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
    print(f"  [SAVED] -> {path}")
    return path

# 1. XGBoost Training
print("=" * 50)
print("TRAINING XGBOOST - ALL 4 COINS")
print("=" * 50)

xgb_results = []
for coin in COINS:
    print(f"\n{'='*40}")
    print(f"Coin: {coin.upper()}")

    df = load_coin(coin)
    train, test = time_split(df)

    X_train = train[FEATURES]
    y_train = train[TARGET]
    X_test  = test[FEATURES]
    y_test  = test[TARGET]

    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )

    model.fit(
        X_train_scaled,
        y_train,
        eval_set=[(X_test_scaled, y_test)],
        verbose=False
    )

    preds = model.predict(X_test_scaled)
    result = evaluate(y_test, preds, "XGBoost", coin)
    xgb_results.append(result)
    all_results.append(result)

    save_artifact(model, coin, "xgboost.joblib")
    save_artifact(scaler, coin, "scaler_xgboost.joblib")

    fi = pd.DataFrame({
        "feature": FEATURES,
        "importance": model.feature_importances_
    }).sort_values("importance", ascending=False)
    fi.to_csv(f"models/{coin}/feature_importance.csv", index=False)
    print(f"  [SAVED] -> models/{coin}/feature_importance.csv")

    print(f"\n  Top 3 features for {coin.upper()}:")
    for _, row in fi.head(3).iterrows():
        print(f"    {row['feature']}: {row['importance']:.4f}")

# Plotting XGBoost Predictions
fig, axes = plt.subplots(2, 2, figsize=(18, 12))
fig.suptitle("XGBoost - Actual vs Predicted Price", fontsize=16, fontweight="bold")
fig.patch.set_facecolor("#0a0a1a")

colors = {
    "btc": "#f7931a",
    "eth": "#627eea",
    "sol": "#9945ff",
    "ada": "#0033ad"
}

for i, coin in enumerate(COINS):
    df = load_coin(coin)
    _, test = time_split(df)

    model  = joblib.load(f"models/{coin}/xgboost.joblib")
    scaler = joblib.load(f"models/{coin}/scaler_xgboost.joblib")

    X_te  = scaler.transform(test[FEATURES])
    preds = model.predict(X_te)
    actual= test[TARGET].values

    n  = min(100, len(preds))
    ax = axes[i//2][i%2]
    ax.set_facecolor("#1a1a2e")

    ax.plot(actual[-n:], label="Actual", color=colors[coin], linewidth=2)
    ax.plot(preds[-n:],  label="Predicted", color="white", linestyle="--", linewidth=1.5, alpha=0.85)

    ax.set_title(f"{coin.upper()} - XGBoost", fontsize=13, fontweight="bold", color="white")
    ax.set_xlabel("Days", color="gray")
    ax.set_ylabel("Price (USD)", color="gray")
    ax.legend(facecolor="#1a1a2e", labelcolor="white")
    ax.tick_params(colors="gray")

os.makedirs("results", exist_ok=True)
plt.tight_layout()
plt.savefig("results/xgboost_actual_vs_predicted.png", dpi=150, bbox_inches="tight")
plt.close()
print("\n[SAVED]: results/xgboost_actual_vs_predicted.png")

# 2. Random Forest Training
print("\n" + "=" * 50)
print("TRAINING RANDOM FOREST - ALL 4 COINS")
print("=" * 50)

for coin in COINS:
    print(f"\n{'='*40}\nCoin: {coin.upper()}")
    df = load_coin(coin)
    train, test = time_split(df)

    X_train = train[FEATURES]
    y_train = train[TARGET]
    X_test  = test[FEATURES]
    y_test  = test[TARGET]

    scaler = MinMaxScaler()
    X_tr_s = scaler.fit_transform(X_train)
    X_te_s = scaler.transform(X_test)

    rf = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
    rf.fit(X_tr_s, y_train)

    preds = rf.predict(X_te_s)
    res = evaluate(y_test, preds, "RandomForest", coin)
    all_results.append(res)

    save_artifact(rf, coin, "random_forest.joblib")
    save_artifact(scaler, coin, "scaler_random_forest.joblib")

# 3. Linear Regression Training
print("\n" + "=" * 50)
print("TRAINING LINEAR REGRESSION - ALL 4 COINS")
print("=" * 50)

for coin in COINS:
    print(f"\n{'='*40}\nCoin: {coin.upper()}")
    df = load_coin(coin)
    train, test = time_split(df)

    X_train = train[FEATURES]
    y_train = train[TARGET]
    X_test  = test[FEATURES]
    y_test  = test[TARGET]

    scaler = MinMaxScaler()
    X_tr_s = scaler.fit_transform(X_train)
    X_te_s = scaler.transform(X_test)

    lr = LinearRegression()
    lr.fit(X_tr_s, y_train)

    preds = lr.predict(X_te_s)
    res = evaluate(y_test, preds, "LinearRegression", coin)
    all_results.append(res)

    save_artifact(lr, coin, "linear_regression.joblib")
    save_artifact(scaler, coin, "scaler_linear_regression.joblib")

# Save Summary Table
res_df = pd.DataFrame(all_results)
res_df.to_csv("results/all_models_summary.csv", index=False)
print("\n" + "=" * 50)
print("ALL MODELS TRAINING COMPLETE")
print("=" * 50)
print("\nSummary Table:")
print(res_df.to_string(index=False))

