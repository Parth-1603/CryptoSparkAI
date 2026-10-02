import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
import xgboost as xgb
from prophet import Prophet
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import os
import shutil
import warnings

warnings.filterwarnings("ignore")
tf.get_logger().setLevel("ERROR")

COINS = ["btc", "eth", "sol", "ada"]
SEQ_LEN = 30
RESULTS_DIR = "results"
MODELS_BASE = "models"
DATA_DIR = os.path.join("dataset", "processed")

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(MODELS_BASE, exist_ok=True)

FEATURE_COLS = [
    "norm_open", "norm_high", "norm_low", "norm_ma7", "norm_ma30",
    "norm_prev_close", "pct_change", "norm_hl_range", "norm_volatility"
]

def prepare_coin_data(coin):
    path = os.path.join(DATA_DIR, f"{coin}_processed.csv")
    df = pd.read_csv(path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp").dropna().reset_index(drop=True)
    
    # Target: 1-day fractional price return
    df["target_return"] = (df["target_1d"] - df["close"]) / df["close"]
    
    # Normalized relative features (stationary)
    df["norm_open"] = df["open"] / df["close"]
    df["norm_high"] = df["high"] / df["close"]
    df["norm_low"] = df["low"] / df["close"]
    df["norm_ma7"] = df["MA7"] / df["close"]
    df["norm_ma30"] = df["MA30"] / df["close"]
    df["norm_prev_close"] = df["prev_close"] / df["close"]
    df["norm_hl_range"] = df["high_low_range"] / df["close"]
    df["norm_volatility"] = df["volatility_7"] / df["close"]
    
    split = int(len(df) * 0.8)
    train = df.iloc[:split].copy().reset_index(drop=True)
    test = df.iloc[split:].copy().reset_index(drop=True)
    return df, train, test

def evaluate(actual, pred, model_name, coin):
    mae = mean_absolute_error(actual, pred)
    rmse = np.sqrt(mean_squared_error(actual, pred))
    r2 = r2_score(actual, pred)
    print(f"  {coin.upper()} - {model_name:18s} | MAE: ${mae:>10,.2f} | RMSE: ${rmse:>10,.2f} | R2: {r2:>7.4f}")
    return {
        "coin": coin.upper(),
        "model": model_name,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4)
    }

def save_artifact(obj, coin, filename):
    folder = os.path.join(MODELS_BASE, coin)
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, filename)
    joblib.dump(obj, path)
    return path

all_comparison_results = []
test_predictions_store = {}

print("=" * 70)
print("1. TRAINING XGBOOST, RANDOM FOREST, LINEAR REGRESSION")
print("=" * 70)

for coin in COINS:
    print(f"\nProcessing {coin.upper()}...")
    df, train, test = prepare_coin_data(coin)
    test_predictions_store[coin] = {}
    
    scaler = StandardScaler()
    X_train = scaler.fit_transform(train[FEATURE_COLS])
    X_test = scaler.transform(test[FEATURE_COLS])
    y_train = train["target_return"].values
    y_test = test["target_return"].values
    
    actual_prices = test["target_1d"].values
    test_closes = test["close"].values
    test_dates = test["timestamp"].values
    
    # XGBoost
    xgb_model = xgb.XGBRegressor(
        n_estimators=300,
        learning_rate=0.03,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)
    xgb_pred_returns = xgb_model.predict(X_test)
    xgb_pred_prices = test_closes * (1 + xgb_pred_returns)
    res_xgb = evaluate(actual_prices, xgb_pred_prices, "XGBoost", coin)
    all_comparison_results.append(res_xgb)
    test_predictions_store[coin]["XGBoost"] = (actual_prices, xgb_pred_prices, test_dates)
    
    save_artifact(xgb_model, coin, "xgboost.joblib")
    save_artifact(scaler, coin, "scaler_xgboost.joblib")
    
    fi = pd.DataFrame({
        "feature": FEATURE_COLS,
        "importance": xgb_model.feature_importances_
    }).sort_values("importance", ascending=False)
    fi.to_csv(f"models/{coin}/feature_importance.csv", index=False)
    
    # Random Forest
    rf_model = RandomForestRegressor(n_estimators=150, max_depth=8, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    rf_pred_returns = rf_model.predict(X_test)
    rf_pred_prices = test_closes * (1 + rf_pred_returns)
    res_rf = evaluate(actual_prices, rf_pred_prices, "RandomForest", coin)
    all_comparison_results.append(res_rf)
    test_predictions_store[coin]["RandomForest"] = (actual_prices, rf_pred_prices, test_dates)
    save_artifact(rf_model, coin, "random_forest.joblib")
    save_artifact(scaler, coin, "scaler_random_forest.joblib")
    
    # Linear Regression
    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)
    lr_pred_returns = lr_model.predict(X_test)
    lr_pred_prices = test_closes * (1 + lr_pred_returns)
    res_lr = evaluate(actual_prices, lr_pred_prices, "LinearRegression", coin)
    all_comparison_results.append(res_lr)
    test_predictions_store[coin]["LinearRegression"] = (actual_prices, lr_pred_prices, test_dates)
    save_artifact(lr_model, coin, "linear_regression.joblib")
    save_artifact(scaler, coin, "scaler_linear_regression.joblib")

print("\n" + "=" * 70)
print("2. TRAINING LSTM NEURAL NETWORKS")
print("=" * 70)

for coin in COINS:
    print(f"\nTraining LSTM for {coin.upper()}...")
    df, train, test = prepare_coin_data(coin)
    
    scaler_lstm_X = StandardScaler()
    X_train_s = scaler_lstm_X.fit_transform(train[FEATURE_COLS])
    X_test_s = scaler_lstm_X.transform(test[FEATURE_COLS])
    
    y_train = train["target_return"].values
    y_test = test["target_return"].values
    
    Xs_tr, ys_tr = [], []
    for i in range(len(X_train_s) - SEQ_LEN):
        Xs_tr.append(X_train_s[i : i + SEQ_LEN])
        ys_tr.append(y_train[i + SEQ_LEN])
    Xs_tr, ys_tr = np.array(Xs_tr), np.array(ys_tr)
    
    Xs_te, ys_te = [], []
    for i in range(len(X_test_s) - SEQ_LEN):
        Xs_te.append(X_test_s[i : i + SEQ_LEN])
        ys_te.append(y_test[i + SEQ_LEN])
    Xs_te, ys_te = np.array(Xs_te), np.array(ys_te)
    
    lstm_model = Sequential([
        Input(shape=(SEQ_LEN, len(FEATURE_COLS))),
        LSTM(64, return_sequences=True),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1)
    ])
    lstm_model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss="mse")
    early_stop = EarlyStopping(monitor="loss", patience=5, restore_best_weights=True)
    lstm_model.fit(Xs_tr, ys_tr, epochs=20, batch_size=32, callbacks=[early_stop], verbose=0)
    
    pred_lstm_returns = lstm_model.predict(Xs_te, verbose=0).flatten()
    actual_lstm_prices = test["target_1d"].values[SEQ_LEN:]
    test_lstm_closes = test["close"].values[SEQ_LEN:]
    test_lstm_dates = test["timestamp"].values[SEQ_LEN:]
    pred_lstm_prices = test_lstm_closes * (1 + pred_lstm_returns)
    
    res_lstm = evaluate(actual_lstm_prices, pred_lstm_prices, "LSTM", coin)
    all_comparison_results.append(res_lstm)
    test_predictions_store[coin]["LSTM"] = (actual_lstm_prices, pred_lstm_prices, test_lstm_dates)
    
    folder = os.path.join(MODELS_BASE, coin)
    lstm_model.save(f"{folder}/lstm.keras")
    lstm_model.save(f"{folder}/lstm.h5")
    save_artifact(scaler_lstm_X, coin, "scaler_lstm_X.joblib")
    save_artifact(scaler_lstm_X, coin, "scaler_X_lstm.joblib")

print("\n" + "=" * 70)
print("3. TRAINING PROPHET & ENSEMBLE")
print("=" * 70)

for coin in COINS:
    print(f"\nTraining Prophet & Ensemble for {coin.upper()}...")
    df, train, test = prepare_coin_data(coin)
    
    prophet_df = df[["timestamp", "close"]].rename(columns={"timestamp": "ds", "close": "y"})
    split = int(len(prophet_df) * 0.8)
    p_train = prophet_df.iloc[:split]
    p_test = prophet_df.iloc[split:]
    
    p_model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=True,
        changepoint_prior_scale=0.1
    )
    p_model.fit(p_train)
    save_artifact(p_model, coin, "prophet.joblib")
    
    future = p_model.make_future_dataframe(periods=len(p_test), freq="D")
    forecast = p_model.predict(future)
    p_pred_raw = forecast["yhat"].iloc[split:].values[:len(p_test)]
    actual_prices = p_test["y"].values
    
    p_pred_prices_step = test["close"].values * (1 + ((p_pred_raw - p_train["y"].iloc[-1]) / max(1, p_train["y"].iloc[-1])) * 0.05)
    res_prophet = evaluate(actual_prices, p_pred_prices_step, "Prophet", coin)
    all_comparison_results.append(res_prophet)
    test_predictions_store[coin]["Prophet"] = (actual_prices, p_pred_prices_step, test["timestamp"].values)
    
    # Ensemble
    act_xgb, p_xgb, _ = test_predictions_store[coin]["XGBoost"]
    act_lstm, p_lstm, _ = test_predictions_store[coin]["LSTM"]
    _, p_prop, _ = test_predictions_store[coin]["Prophet"]
    
    min_len = min(len(p_lstm), len(p_xgb[SEQ_LEN:]), len(p_prop[SEQ_LEN:]))
    e_xgb = p_xgb[SEQ_LEN:][:min_len]
    e_lstm = p_lstm[:min_len]
    e_prop = p_prop[SEQ_LEN:][:min_len]
    e_actual = act_lstm[:min_len]
    e_dates = test["timestamp"].values[SEQ_LEN:][:min_len]
    
    weights = {"xgboost": 0.55, "lstm": 0.35, "prophet": 0.10}
    p_ensemble = weights["xgboost"] * e_xgb + weights["lstm"] * e_lstm + weights["prophet"] * e_prop
    
    res_ensemble = evaluate(e_actual, p_ensemble, "Ensemble", coin)
    all_comparison_results.append(res_ensemble)
    test_predictions_store[coin]["Ensemble"] = (e_actual, p_ensemble, e_dates)
    
    config = {"weights": weights, "coin": coin, "seq_len": SEQ_LEN, "features": FEATURE_COLS}
    save_artifact(config, coin, "ensemble_config.joblib")

print("\n" + "=" * 70)
print("4. GENERATING VISUALIZATION CHARTS")
print("=" * 70)

coin_palette = {"btc": "#F7931A", "eth": "#627EEA", "sol": "#14F195", "ada": "#0033AD"}

# XGBoost Plot
fig, axes = plt.subplots(2, 2, figsize=(18, 12))
fig.patch.set_facecolor("#0B0F19")
fig.suptitle("XGBoost: Actual vs. Predicted Cryptocurrency Prices (Test Set)", fontsize=18, fontweight="bold", color="white", y=0.98)

for i, coin in enumerate(COINS):
    ax = axes[i // 2, i % 2]
    ax.set_facecolor("#111827")
    actual, pred, dates = test_predictions_store[coin]["XGBoost"]
    n_show = min(120, len(actual))
    sub_dates = pd.to_datetime(dates[-n_show:])
    sub_act = actual[-n_show:]
    sub_pred = pred[-n_show:]
    
    ax.plot(sub_dates, sub_act, label="Actual Price", color=coin_palette[coin], linewidth=2.5)
    ax.plot(sub_dates, sub_pred, label="Predicted Price", color="#FFFFFF", linestyle="--", linewidth=1.8, alpha=0.9)
    r2_val = r2_score(actual, pred)
    mae_val = mean_absolute_error(actual, pred)
    ax.set_title(f"{coin.upper()} / USD  |  R² = {r2_val:.4f}  |  MAE = ${mae_val:,.2f}", fontsize=13, fontweight="bold", color="white", pad=10)
    ax.legend(facecolor="#1F2937", edgecolor="#374151", labelcolor="white", fontsize=10, loc="upper left")
    ax.grid(True, color="#374151", alpha=0.4, linestyle=":")
    ax.tick_params(colors="#9CA3AF")
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    for spine in ax.spines.values():
        spine.set_color("#374151")

plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(os.path.join(RESULTS_DIR, "xgboost_actual_vs_predicted.png"), dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()

# LSTM Plot
fig, axes = plt.subplots(2, 2, figsize=(18, 12))
fig.patch.set_facecolor("#0B0F19")
fig.suptitle("LSTM Neural Network: Actual vs. Predicted Cryptocurrency Prices (Test Set)", fontsize=18, fontweight="bold", color="white", y=0.98)

for i, coin in enumerate(COINS):
    ax = axes[i // 2, i % 2]
    ax.set_facecolor("#111827")
    actual, pred, dates = test_predictions_store[coin]["LSTM"]
    n_show = min(120, len(actual))
    sub_dates = pd.to_datetime(dates[-n_show:])
    sub_act = actual[-n_show:]
    sub_pred = pred[-n_show:]
    
    ax.plot(sub_dates, sub_act, label="Actual Price", color=coin_palette[coin], linewidth=2.5)
    ax.plot(sub_dates, sub_pred, label="LSTM Predicted", color="#38BDF8", linestyle="--", linewidth=1.8, alpha=0.9)
    r2_val = r2_score(actual, pred)
    mae_val = mean_absolute_error(actual, pred)
    ax.set_title(f"{coin.upper()} / USD  |  R² = {r2_val:.4f}  |  MAE = ${mae_val:,.2f}", fontsize=13, fontweight="bold", color="white", pad=10)
    ax.legend(facecolor="#1F2937", edgecolor="#374151", labelcolor="white", fontsize=10, loc="upper left")
    ax.grid(True, color="#374151", alpha=0.4, linestyle=":")
    ax.tick_params(colors="#9CA3AF")
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    for spine in ax.spines.values():
        spine.set_color("#374151")

plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(os.path.join(RESULTS_DIR, "lstm_actual_vs_predicted.png"), dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()

# Ensemble Coin Plots
for coin in COINS:
    act, p_ens, dates = test_predictions_store[coin]["Ensemble"]
    _, p_xgb, _ = test_predictions_store[coin]["XGBoost"]
    _, p_lstm, _ = test_predictions_store[coin]["LSTM"]
    n_show = min(100, len(act))
    sub_dates = pd.to_datetime(dates[-n_show:])
    sub_act = act[-n_show:]
    sub_ens = p_ens[-n_show:]
    sub_xgb = p_xgb[-n_show:]
    sub_lstm = p_lstm[-n_show:]
    
    plt.figure(figsize=(14, 6))
    fig = plt.gcf()
    fig.patch.set_facecolor("#0B0F19")
    ax = plt.gca()
    ax.set_facecolor("#111827")
    
    plt.plot(sub_dates, sub_act, label="Actual Market Price", color=coin_palette[coin], linewidth=3)
    plt.plot(sub_dates, sub_ens, label="Hybrid Ensemble V3", color="#A3E635", linestyle="-", linewidth=2.2)
    plt.plot(sub_dates, sub_xgb, label="XGBoost", color="#F43F5E", linestyle=":", linewidth=1.8, alpha=0.85)
    plt.plot(sub_dates, sub_lstm, label="LSTM", color="#38BDF8", linestyle="--", linewidth=1.8, alpha=0.85)
    
    plt.title(f"{coin.upper()} / USD Multi-Model Forecast Benchmarking (Test Set)", fontsize=14, fontweight="bold", color="white", pad=12)
    plt.xlabel("Date", color="#9CA3AF", labelpad=8)
    plt.ylabel("Price (USD)", color="#9CA3AF", labelpad=8)
    plt.legend(facecolor="#1F2937", edgecolor="#374151", labelcolor="white", fontsize=11, loc="upper left")
    plt.grid(True, color="#374151", alpha=0.35, linestyle=":")
    ax.tick_params(colors="#9CA3AF")
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
    for spine in ax.spines.values():
        spine.set_color("#374151")
        
    plt.tight_layout()
    chart_path = os.path.join(RESULTS_DIR, f"ensemble_{coin}.png")
    plt.savefig(chart_path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()

# Summary & Comparison CSVs
comparison_df = pd.DataFrame(all_comparison_results)
comparison_df = comparison_df.drop_duplicates(subset=["coin", "model"], keep="last")
comparison_df = comparison_df.sort_values(["coin", "r2"], ascending=[True, False]).reset_index(drop=True)

comparison_df.to_csv("all_models_comparison.csv", index=False)
comparison_df.to_csv(os.path.join(RESULTS_DIR, "all_models_comparison.csv"), index=False)
comparison_df.to_csv(os.path.join(MODELS_BASE, "all_models_comparison.csv"), index=False)

print("\n" + "=" * 70)
print("FINAL COMPARISON LEADERBOARD")
print("=" * 70)
print(comparison_df.to_string(index=False))

shutil.make_archive("models_all_coins", "zip", MODELS_BASE)
print("\n[SUCCESS] Saved updated models and created models_all_coins.zip!")
