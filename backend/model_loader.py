import joblib
import os
import gc
import warnings

warnings.filterwarnings("ignore")

# Resolve models directory with flexible fallback
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
if not os.path.exists(MODELS_DIR):
    MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")

COINS = ["btc", "eth", "sol", "ada"]
MODEL_NAMES = ["xgboost", "random_forest", "linear_regression", "lstm", "prophet", "ensemble"]

# Loaded models & scalers registry — shared across all requests
loaded = {coin: {} for coin in COINS}

# Health / availability registry per component
model_status = {
    coin: {
        "xgboost": "UNAVAILABLE",
        "random_forest": "UNAVAILABLE",
        "linear_regression": "UNAVAILABLE",
        "lstm": "UNAVAILABLE",
        "prophet": "UNAVAILABLE",
        "ensemble": "UNAVAILABLE"
    }
    for coin in COINS
}

def load_all():
    """
    Gracefully load models with fallback strategies to survive memory limits (EC2 Free Tier / OOM).
    If heavy deep learning models fail or run out of memory, loads lightweight tree/linear models first.
    """
    global loaded, model_status
    print(f"Loading models from: {MODELS_DIR} ...")

    # Pass 1: Load lightweight models first (XGBoost, Random Forest, Linear Regression)
    for coin in COINS:
        coin_dir = os.path.join(MODELS_DIR, coin)
        if not os.path.exists(coin_dir):
            continue

        # 1. XGBoost
        try:
            xgb_path = os.path.join(coin_dir, "xgboost.joblib")
            scaler_xgb_path = os.path.join(coin_dir, "scaler_xgboost.joblib")
            if os.path.exists(xgb_path) and os.path.exists(scaler_xgb_path):
                loaded[coin]["xgboost"] = joblib.load(xgb_path)
                loaded[coin]["scaler_xgboost"] = joblib.load(scaler_xgb_path)
                model_status[coin]["xgboost"] = "HEALTHY"
        except Exception as e:
            print(f"  [WARN] Failed to load XGBoost for {coin.upper()}: {e}")
            model_status[coin]["xgboost"] = "FAILED"

        # 2. Random Forest
        try:
            rf_path = os.path.join(coin_dir, "random_forest.joblib")
            scaler_rf_path = os.path.join(coin_dir, "scaler_random_forest.joblib")
            if os.path.exists(rf_path) and os.path.exists(scaler_rf_path):
                loaded[coin]["random_forest"] = joblib.load(rf_path)
                loaded[coin]["scaler_random_forest"] = joblib.load(scaler_rf_path)
                model_status[coin]["random_forest"] = "HEALTHY"
        except Exception as e:
            print(f"  [WARN] Failed to load Random Forest for {coin.upper()}: {e}")
            model_status[coin]["random_forest"] = "FAILED"

        # 3. Linear Regression
        try:
            lr_path = os.path.join(coin_dir, "linear_regression.joblib")
            scaler_lr_path = os.path.join(coin_dir, "scaler_linear_regression.joblib")
            if os.path.exists(lr_path) and os.path.exists(scaler_lr_path):
                loaded[coin]["linear_regression"] = joblib.load(lr_path)
                loaded[coin]["scaler_linear_regression"] = joblib.load(scaler_lr_path)
                model_status[coin]["linear_regression"] = "HEALTHY"
        except Exception as e:
            print(f"  [WARN] Failed to load Linear Regression for {coin.upper()}: {e}")
            model_status[coin]["linear_regression"] = "FAILED"

    # Pass 2: Load Prophet models
    for coin in COINS:
        coin_dir = os.path.join(MODELS_DIR, coin)
        try:
            prophet_path = os.path.join(coin_dir, "prophet.joblib")
            if os.path.exists(prophet_path):
                loaded[coin]["prophet"] = joblib.load(prophet_path)
                model_status[coin]["prophet"] = "HEALTHY"
        except Exception as e:
            print(f"  [WARN] Failed to load Prophet for {coin.upper()}: {e}")
            model_status[coin]["prophet"] = "FAILED"

    # Pass 3: Load LSTM models (Heavier memory footprint)
    for coin in COINS:
        coin_dir = os.path.join(MODELS_DIR, coin)
        try:
            import tensorflow as tf
            lstm_path = os.path.join(coin_dir, "lstm.keras")
            if not os.path.exists(lstm_path):
                lstm_path = os.path.join(coin_dir, "lstm.h5")

            scaler_x_path = os.path.join(coin_dir, "scaler_lstm_X.joblib")
            if not os.path.exists(scaler_x_path):
                scaler_x_path = os.path.join(coin_dir, "scaler_X_lstm.joblib")

            if os.path.exists(lstm_path) and os.path.exists(scaler_x_path):
                loaded[coin]["lstm"] = tf.keras.models.load_model(lstm_path, compile=False)
                loaded[coin]["scaler_lstm_X"] = joblib.load(scaler_x_path)
                model_status[coin]["lstm"] = "HEALTHY"
        except MemoryError:
            print(f"  [OOM FALLBACK] Out of memory loading LSTM for {coin.upper()} — falling back to lightweight models.")
            model_status[coin]["lstm"] = "UNAVAILABLE_OOM"
            gc.collect()
        except Exception as e:
            print(f"  [WARN] Failed to load LSTM for {coin.upper()}: {e}")
            model_status[coin]["lstm"] = "FAILED"

    # Pass 4: Ensemble Configurations
    for coin in COINS:
        coin_dir = os.path.join(MODELS_DIR, coin)
        try:
            ens_path = os.path.join(coin_dir, "ensemble_config.joblib")
            if os.path.exists(ens_path):
                loaded[coin]["ensemble"] = joblib.load(ens_path)
                model_status[coin]["ensemble"] = "HEALTHY"
            elif model_status[coin]["xgboost"] == "HEALTHY":
                # Dynamic fallback ensemble config
                loaded[coin]["ensemble"] = {
                    "weights": {"xgboost": 0.6, "lstm": 0.3, "prophet": 0.1},
                    "coin": coin,
                    "seq_len": 30
                }
                model_status[coin]["ensemble"] = "DEGRADED"
        except Exception as e:
            print(f"  [WARN] Failed to load Ensemble for {coin.upper()}: {e}")
            model_status[coin]["ensemble"] = "FAILED"

    print(f"Models loading complete. Summary: { {c: [k for k, v in model_status[c].items() if v == 'HEALTHY'] for c in COINS} }")
    return loaded