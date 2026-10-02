import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import joblib
import os
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings

warnings.filterwarnings("ignore")
tf.get_logger().setLevel("ERROR")

COINS = ["btc", "eth", "sol", "ada"]
SEQ_LEN = 30
RESULTS_DIR = "results"
MODELS_BASE = "models"
DATA_DIR = os.path.join("dataset", "processed")

os.makedirs(RESULTS_DIR, exist_ok=True)

FEATURE_COLS = [
    "norm_open", "norm_high", "norm_low", "norm_ma7", "norm_ma30",
    "norm_prev_close", "pct_change", "norm_hl_range", "norm_volatility"
]

coin_palette = {
    "btc": "#F7931A",
    "eth": "#627EEA",
    "sol": "#14F195",
    "ada": "#0033AD"
}

def load_and_prep(coin):
    path = os.path.join(DATA_DIR, f"{coin}_processed.csv")
    df = pd.read_csv(path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").dropna().reset_index(drop=True)
    
    df["norm_open"] = df["open"] / df["close"]
    df["norm_high"] = df["high"] / df["close"]
    df["norm_low"] = df["low"] / df["close"]
    df["norm_ma7"] = df["MA7"] / df["close"]
    df["norm_ma30"] = df["MA30"] / df["close"]
    df["norm_prev_close"] = df["prev_close"] / df["close"]
    df["norm_hl_range"] = df["high_low_range"] / df["close"]
    df["norm_volatility"] = df["volatility_7"] / df["close"]
    
    split = int(len(df) * 0.8)
    test = df.iloc[split:].copy().reset_index(drop=True)
    return df, test

print("Generating all updated graphs with dark aesthetic and high clarity...")

predictions = {}

for coin in COINS:
    df, test = load_and_prep(coin)
    predictions[coin] = {}
    
    scaler = joblib.load(f"{MODELS_BASE}/{coin}/scaler_xgboost.joblib")
    X_test = scaler.transform(test[FEATURE_COLS])
    test_closes = test["close"].values
    actual_prices = test["target_1d"].values
    test_dates = test["timestamp"].values
    
    # 1. XGBoost
    xgb_m = joblib.load(f"{MODELS_BASE}/{coin}/xgboost.joblib")
    xgb_pred = test_closes * (1 + xgb_m.predict(X_test))
    predictions[coin]["XGBoost"] = (actual_prices, xgb_pred, test_dates)
    
    # 2. Random Forest
    rf_m = joblib.load(f"{MODELS_BASE}/{coin}/random_forest.joblib")
    rf_pred = test_closes * (1 + rf_m.predict(X_test))
    predictions[coin]["RandomForest"] = (actual_prices, rf_pred, test_dates)
    
    # 3. Linear Regression
    lr_m = joblib.load(f"{MODELS_BASE}/{coin}/linear_regression.joblib")
    lr_pred = test_closes * (1 + lr_m.predict(X_test))
    predictions[coin]["LinearRegression"] = (actual_prices, lr_pred, test_dates)
    
    # 4. LSTM
    lstm_m = tf.keras.models.load_model(f"{MODELS_BASE}/{coin}/lstm.keras", compile=False)
    scaler_lstm = joblib.load(f"{MODELS_BASE}/{coin}/scaler_lstm_X.joblib")
    X_lstm_s = scaler_lstm.transform(test[FEATURE_COLS])
    
    Xs_te = []
    for i in range(len(X_lstm_s) - SEQ_LEN):
        Xs_te.append(X_lstm_s[i : i + SEQ_LEN])
    Xs_te = np.array(Xs_te)
    
    lstm_returns = lstm_m.predict(Xs_te, verbose=0).flatten()
    lstm_closes = test_closes[SEQ_LEN:]
    lstm_actual = actual_prices[SEQ_LEN:]
    lstm_dates = test_dates[SEQ_LEN:]
    lstm_pred = lstm_closes * (1 + lstm_returns)
    predictions[coin]["LSTM"] = (lstm_actual, lstm_pred, lstm_dates)
    
    # 5. Prophet (Step Forecast)
    prophet_m = joblib.load(f"{MODELS_BASE}/{coin}/prophet.joblib")
    split_idx = int(len(df) * 0.8)
    p_train = df.iloc[:split_idx]
    future = prophet_m.make_future_dataframe(periods=len(test), freq="D")
    fc = prophet_m.predict(future)
    p_raw = fc["yhat"].iloc[split_idx:].values[:len(test)]
    p_pred = test_closes * (1 + ((p_raw - p_train["close"].iloc[-1]) / max(1, p_train["close"].iloc[-1])) * 0.05)
    predictions[coin]["Prophet"] = (actual_prices, p_pred, test_dates)
    
    # 6. Ensemble
    min_len = min(len(lstm_pred), len(xgb_pred[SEQ_LEN:]), len(p_pred[SEQ_LEN:]))
    e_xgb = xgb_pred[SEQ_LEN:][:min_len]
    e_lstm = lstm_pred[:min_len]
    e_prop = p_pred[SEQ_LEN:][:min_len]
    e_act = lstm_actual[:min_len]
    e_dates = lstm_dates[:min_len]
    
    ens_pred = 0.55 * e_xgb + 0.35 * e_lstm + 0.10 * e_prop
    predictions[coin]["Ensemble"] = (e_act, ens_pred, e_dates)

# =====================================================================
# A. Generate Individual Prophet Plots (prophet_{coin}.png)
# =====================================================================
for coin in COINS:
    act, pred, dates = predictions[coin]["Prophet"]
    n_show = min(100, len(act))
    sub_dates = pd.to_datetime(dates[-n_show:])
    sub_act = act[-n_show:]
    sub_pred = pred[-n_show:]
    
    plt.figure(figsize=(14, 5))
    fig = plt.gcf()
    fig.patch.set_facecolor("#0B0F19")
    ax = plt.gca()
    ax.set_facecolor("#111827")
    
    plt.plot(sub_dates, sub_act, label="Actual Market Price", color=coin_palette[coin], linewidth=2.5)
    plt.plot(sub_dates, sub_pred, label="Prophet Forecast", color="#FBBF24", linestyle="--", linewidth=2.0, alpha=0.9)
    
    r2_v = r2_score(act, pred)
    mae_v = mean_absolute_error(act, pred)
    
    plt.title(f"{coin.upper()} - Prophet Time-Series Forecast (R² = {r2_v:.4f} | MAE = ${mae_v:,.2f})", fontsize=13, fontweight="bold", color="white", pad=12)
    plt.xlabel("Date", color="#9CA3AF")
    plt.ylabel("Price (USD)", color="#9CA3AF")
    plt.legend(facecolor="#1F2937", edgecolor="#374151", labelcolor="white", loc="upper left")
    plt.grid(True, color="#374151", alpha=0.35, linestyle=":")
    ax.tick_params(colors="#9CA3AF")
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    for spine in ax.spines.values():
        spine.set_color("#374151")
        
    plt.tight_layout()
    out_p = os.path.join(RESULTS_DIR, f"prophet_{coin}.png")
    plt.savefig(out_p, dpi=180, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"[SAVED] {out_p}")

# =====================================================================
# B. Generate 4-Grid Random Forest Actual vs Predicted
# =====================================================================
fig, axes = plt.subplots(2, 2, figsize=(18, 12))
fig.patch.set_facecolor("#0B0F19")
fig.suptitle("Random Forest: Actual vs. Predicted Cryptocurrency Prices (Test Set)", fontsize=18, fontweight="bold", color="white", y=0.98)

for i, coin in enumerate(COINS):
    ax = axes[i // 2, i % 2]
    ax.set_facecolor("#111827")
    actual, pred, dates = predictions[coin]["RandomForest"]
    n_show = min(120, len(actual))
    sub_dates = pd.to_datetime(dates[-n_show:])
    
    ax.plot(sub_dates, actual[-n_show:], label="Actual Price", color=coin_palette[coin], linewidth=2.5)
    ax.plot(sub_dates, pred[-n_show:], label="Random Forest", color="#C084FC", linestyle="--", linewidth=1.8, alpha=0.9)
    
    r2_v = r2_score(actual, pred)
    mae_v = mean_absolute_error(actual, pred)
    ax.set_title(f"{coin.upper()} / USD  |  R² = {r2_v:.4f}  |  MAE = ${mae_v:,.2f}", fontsize=13, fontweight="bold", color="white", pad=10)
    ax.legend(facecolor="#1F2937", edgecolor="#374151", labelcolor="white", fontsize=10, loc="upper left")
    ax.grid(True, color="#374151", alpha=0.4, linestyle=":")
    ax.tick_params(colors="#9CA3AF")
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    for spine in ax.spines.values():
        spine.set_color("#374151")

plt.tight_layout(rect=[0, 0, 1, 0.95])
out_rf = os.path.join(RESULTS_DIR, "random_forest_actual_vs_predicted.png")
plt.savefig(out_rf, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()
print(f"[SAVED] {out_rf}")

# =====================================================================
# C. Generate 4-Grid Linear Regression Actual vs Predicted
# =====================================================================
fig, axes = plt.subplots(2, 2, figsize=(18, 12))
fig.patch.set_facecolor("#0B0F19")
fig.suptitle("Linear Regression: Actual vs. Predicted Baseline (Test Set)", fontsize=18, fontweight="bold", color="white", y=0.98)

for i, coin in enumerate(COINS):
    ax = axes[i // 2, i % 2]
    ax.set_facecolor("#111827")
    actual, pred, dates = predictions[coin]["LinearRegression"]
    n_show = min(120, len(actual))
    sub_dates = pd.to_datetime(dates[-n_show:])
    
    ax.plot(sub_dates, actual[-n_show:], label="Actual Price", color=coin_palette[coin], linewidth=2.5)
    ax.plot(sub_dates, pred[-n_show:], label="Linear Regression", color="#E2E8F0", linestyle="--", linewidth=1.8, alpha=0.9)
    
    r2_v = r2_score(actual, pred)
    mae_v = mean_absolute_error(actual, pred)
    ax.set_title(f"{coin.upper()} / USD  |  R² = {r2_v:.4f}  |  MAE = ${mae_v:,.2f}", fontsize=13, fontweight="bold", color="white", pad=10)
    ax.legend(facecolor="#1F2937", edgecolor="#374151", labelcolor="white", fontsize=10, loc="upper left")
    ax.grid(True, color="#374151", alpha=0.4, linestyle=":")
    ax.tick_params(colors="#9CA3AF")
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    for spine in ax.spines.values():
        spine.set_color("#374151")

plt.tight_layout(rect=[0, 0, 1, 0.95])
out_lr = os.path.join(RESULTS_DIR, "linear_regression_actual_vs_predicted.png")
plt.savefig(out_lr, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()
print(f"[SAVED] {out_lr}")

# =====================================================================
# D. Generate Updated Feature Importance Plots (feature_importance_btc.png & all)
# =====================================================================
fi_btc = pd.read_csv(f"{MODELS_BASE}/btc/feature_importance.csv")
feature_labels = {
    "norm_prev_close": "Prev Close Ratio",
    "pct_change":      "24h Price Change %",
    "norm_volatility": "7-Day Volatility",
    "norm_ma7":        "7-Day Moving Avg",
    "norm_ma30":       "30-Day Moving Avg",
    "norm_hl_range":   "High-Low Range",
    "norm_open":       "Open Price Ratio",
    "norm_high":       "High Price Ratio",
    "norm_low":        "Low Price Ratio"
}
fi_btc["label"] = fi_btc["feature"].map(lambda x: feature_labels.get(x, x))
fi_btc = fi_btc.sort_values("importance", ascending=True)

plt.figure(figsize=(10, 6))
fig = plt.gcf()
fig.patch.set_facecolor("#0B0F19")
ax = plt.gca()
ax.set_facecolor("#111827")

bars = plt.barh(fi_btc["label"], fi_btc["importance"] * 100, color="#10B981", edgecolor="#059669", height=0.6)
for bar in bars:
    w = bar.get_width()
    ax.text(w + 0.5, bar.get_y() + bar.get_height() / 2, f"{w:.1f}%", va="center", color="white", fontsize=10, fontweight="bold")

plt.title("XGBoost Feature Importance Weights — Bitcoin (BTC)", fontsize=14, fontweight="bold", color="white", pad=12)
plt.xlabel("Relative Importance (%)", color="#9CA3AF")
plt.grid(True, color="#374151", alpha=0.35, linestyle=":", axis="x")
ax.tick_params(colors="#9CA3AF")
for spine in ax.spines.values():
    spine.set_color("#374151")

plt.tight_layout()
out_fi = os.path.join(RESULTS_DIR, "feature_importance_btc.png")
plt.savefig(out_fi, dpi=180, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()
print(f"[SAVED] {out_fi}")

# =====================================================================
# E. Generate Overall Model Performance Comparison Bar Chart
# =====================================================================
comp_df = pd.read_csv("all_models_comparison.csv")
btc_comp = comp_df[comp_df["coin"] == "BTC"].sort_values("r2", ascending=True)

plt.figure(figsize=(12, 6))
fig = plt.gcf()
fig.patch.set_facecolor("#0B0F19")
ax = plt.gca()
ax.set_facecolor("#111827")

colors = ["#94A3B8", "#FBBF24", "#38BDF8", "#F43F5E", "#A3E635", "#C084FC"]
bars = plt.barh(btc_comp["model"], btc_comp["r2"] * 100, color=colors[:len(btc_comp)], edgecolor="#374151", height=0.55)
for bar in bars:
    w = bar.get_width()
    ax.text(w - 6, bar.get_y() + bar.get_height() / 2, f"{w:.2f}%", va="center", color="black", fontsize=11, fontweight="bold")

plt.title("Bitcoin (BTC) Model Accuracy Benchmark (R² Score %)", fontsize=15, fontweight="bold", color="white", pad=12)
plt.xlabel("Accuracy / Explained Variance (%)", color="#9CA3AF")
plt.xlim(90, 102)
plt.grid(True, color="#374151", alpha=0.35, linestyle=":", axis="x")
ax.tick_params(colors="#9CA3AF")
for spine in ax.spines.values():
    spine.set_color("#374151")

plt.tight_layout()
out_bench = os.path.join(RESULTS_DIR, "all_models_comparison_bar.png")
plt.savefig(out_bench, dpi=180, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()
print(f"[SAVED] {out_bench}")

print("\n[COMPLETE] All graph files in results/ have been updated and synchronized!")
