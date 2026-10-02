import joblib
import os
import tensorflow as tf

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
if not os.path.exists(MODELS_DIR):
    MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")

COINS = ["btc", "eth", "sol", "ada"]
MODEL_NAMES = ["xgboost", "lstm", "prophet", "ensemble"]

# Loaded at startup — shared across all requests
loaded = {}

def load_all():
    for coin in COINS:
        loaded[coin] = {}
        coin_dir = os.path.join(MODELS_DIR, coin)

        # XGBoost
        if os.path.exists(f"{coin_dir}/xgboost.joblib"):
            loaded[coin]["xgboost"] = joblib.load(f"{coin_dir}/xgboost.joblib")
        if os.path.exists(f"{coin_dir}/scaler_xgboost.joblib"):
            loaded[coin]["scaler_xgboost"] = joblib.load(f"{coin_dir}/scaler_xgboost.joblib")

        # LSTM
        lstm_path = f"{coin_dir}/lstm.keras"
        if not os.path.exists(lstm_path):
            lstm_path = f"{coin_dir}/lstm.h5"
        if os.path.exists(lstm_path):
            loaded[coin]["lstm"] = tf.keras.models.load_model(lstm_path, compile=False)

        scaler_x_path = f"{coin_dir}/scaler_lstm_X.joblib" if os.path.exists(f"{coin_dir}/scaler_lstm_X.joblib") else f"{coin_dir}/scaler_X_lstm.joblib"
        scaler_y_path = f"{coin_dir}/scaler_lstm_y.joblib" if os.path.exists(f"{coin_dir}/scaler_lstm_y.joblib") else f"{coin_dir}/scaler_y_lstm.joblib"
        if os.path.exists(scaler_x_path):
            loaded[coin]["scaler_lstm_X"] = joblib.load(scaler_x_path)
        if os.path.exists(scaler_y_path):
            loaded[coin]["scaler_lstm_y"] = joblib.load(scaler_y_path)

        # Prophet
        if os.path.exists(f"{coin_dir}/prophet.joblib"):
            loaded[coin]["prophet"] = joblib.load(f"{coin_dir}/prophet.joblib")

        # Ensemble config
        if os.path.exists(f"{coin_dir}/ensemble_config.joblib"):
            loaded[coin]["ensemble"] = joblib.load(f"{coin_dir}/ensemble_config.joblib")

    print(f"All models loaded successfully from {MODELS_DIR}.")
    return loaded