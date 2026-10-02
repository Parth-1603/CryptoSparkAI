import joblib
import os
import tensorflow as tf

MODELS_DIR = os.path.join(
    os.path.dirname(__file__), "..", "ml", "models"
)

COINS = ["btc", "eth", "sol", "ada"]
MODEL_NAMES = ["xgboost", "lstm", "prophet", "ensemble"]

# Loaded at startup — shared across all requests
loaded = {}

def load_all():
    for coin in COINS:
        loaded[coin] = {}
        coin_dir = os.path.join(MODELS_DIR, coin)

        # XGBoost
        loaded[coin]["xgboost"] = joblib.load(
            f"{coin_dir}/xgboost.joblib")
        loaded[coin]["scaler_xgboost"] = joblib.load(
            f"{coin_dir}/scaler_xgboost.joblib")

        # LSTM
        loaded[coin]["lstm"] = tf.keras.models.load_model(
            f"{coin_dir}/lstm.keras")
        loaded[coin]["scaler_lstm_X"] = joblib.load(
            f"{coin_dir}/scaler_lstm_X.joblib")
        loaded[coin]["scaler_lstm_y"] = joblib.load(
            f"{coin_dir}/scaler_lstm_y.joblib")

        # Prophet
        loaded[coin]["prophet"] = joblib.load(
            f"{coin_dir}/prophet.joblib")

        # Ensemble config
        loaded[coin]["ensemble"] = joblib.load(
            f"{coin_dir}/ensemble_config.joblib")

    print("All models loaded successfully.")
    return loaded