import pytest
import os
import numpy as np
from backend.utils.feature_builder import get_latest_features, get_sequence_features, FEATURE_COLS, FEATURES
from backend.model_loader import loaded, model_status
from backend.routes.predict import COMPARISON_METRICS, predict, PredictRequest

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "processed")

def test_feature_builder_schema():
    """Verify feature extractor generates all required normalized and raw features."""
    for coin in ["btc", "eth", "sol", "ada"]:
        feats = get_latest_features(coin, DATA_DIR)
        for col in FEATURE_COLS:
            assert col in feats, f"Missing normalized feature {col} for {coin}"
            assert isinstance(feats[col], (int, float))
        for col in FEATURES:
            assert col in feats, f"Missing raw feature {col} for {coin}"

def test_sequence_features_dimensions():
    """Verify sequence matrix matches LSTM expectations (30 rows, 9 normalized features)."""
    for coin in ["btc", "eth", "sol", "ada"]:
        seq = get_sequence_features(coin, DATA_DIR, seq_len=30)
        assert seq.shape == (30, len(FEATURE_COLS))

def test_model_registry_loaded():
    """Verify model loader populated all 4 cryptocurrency models."""
    for coin in ["btc", "eth", "sol", "ada"]:
        assert coin in loaded
        assert "xgboost" in loaded[coin]
        assert "scaler_xgboost" in loaded[coin]

def test_comparison_metrics_completeness():
    """Verify empirical comparison metrics are loaded for all 24 coin-model combinations."""
    coins = ["ADA", "BTC", "ETH", "SOL"]
    models = ["XGBoost", "LSTM", "Prophet", "Ensemble", "RandomForest", "LinearRegression"]
    for c in coins:
        for m in models:
            key = (c, m)
            assert key in COMPARISON_METRICS, f"Missing metric pair: {key}"
            assert "r2" in COMPARISON_METRICS[key]
            assert "rmse" in COMPARISON_METRICS[key]
            assert "mae" in COMPARISON_METRICS[key]

from unittest.mock import patch

@pytest.mark.asyncio
async def test_predict_determinism():
    """Verify prediction output is 100% deterministic with zero random jitter."""
    req = PredictRequest(asset="Bitcoin (BTC)", period="1D", algorithm="XGBoost (Gradient Boosting)")

    # 1. Healthy mode determinism
    with patch("backend.routes.predict.fetch_live_price_safe", return_value=(81500.0, True)):
        res1 = await predict(req)
        res2 = await predict(req)

        assert res1["confidence"] == res2["confidence"] == 99.3
        assert res1["bounds"]["r2Score"] == res2["bounds"]["r2Score"] == "0.9932"
        assert res1["price"] == res2["price"]
        assert res1["bounds"]["lower"] == res2["bounds"]["lower"]
        assert res1["bounds"]["upper"] == res2["bounds"]["upper"]

    # 2. Degraded mode determinism
    with patch("backend.routes.predict.fetch_live_price_safe", return_value=(81500.0, False)):
        res_deg1 = await predict(req)
        res_deg2 = await predict(req)

        assert res_deg1["confidence"] == res_deg2["confidence"] == 91.4
        assert res_deg1["bounds"]["r2Score"] == res_deg2["bounds"]["r2Score"] == "0.9932"
        assert res_deg1["price"] == res_deg2["price"]
