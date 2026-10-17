import pytest

def test_root_endpoint(client):
    """Test API root status endpoint."""
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert data["faultTolerance"] == "ACTIVE"

def test_pipeline_health_endpoint(client):
    """Test pipeline health telemetry endpoint."""
    resp = client.get("/api/v1/pipeline/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "models" in data
    for coin in ["btc", "eth", "sol", "ada"]:
        assert coin in data["models"]

def test_models_metrics_endpoint(client):
    """Test real model comparison metrics endpoint."""
    resp = client.get("/api/v1/models/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "models" in data
    assert len(data["models"]) >= 4
    first = data["models"][0]
    for key in ["name", "category", "accuracy", "rmse", "mae"]:
        assert key in first

def test_historical_btc_endpoint(client):
    """Test historical OHLCV data endpoint for BTC."""
    resp = client.get("/api/historical/btc?period=1M")
    assert resp.status_code == 200
    data = resp.json()
    assert data["symbol"].lower() == "btc"
    assert data["period"] == "1M"
    assert data["count"] > 0
    assert len(data["data"]) == data["count"]
    sample = data["data"][0]
    for k in ["timestamp", "open", "high", "low", "close", "volume"]:
        assert k in sample

@pytest.mark.parametrize("symbol", ["btc", "eth", "sol", "ada"])
def test_historical_all_coins(client, symbol):
    """Verify historical data router serves all 4 core crypto assets."""
    resp = client.get(f"/api/historical/{symbol}?period=1W")
    assert resp.status_code == 200
    data = resp.json()
    assert data["symbol"].lower() == symbol.lower()
    assert len(data["data"]) > 0

def test_infrastructure_logs_endpoint(client):
    """Verify infrastructure audit logs read true dataset rows with deterministic IDs."""
    resp = client.get("/api/v1/infrastructure/logs")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 8  # Exactly 2 entries per 4 coins
    for log in data:
        assert log["id"].startswith("LOG-")
        assert len(log["id"]) == 10
        assert log["actual"].startswith("$")
        assert log["predicted"].startswith("$")
        assert "errorPct" in log
        assert "asset" in log

def test_predict_btc_xgboost(client):
    """Verify Bitcoin XGBoost prediction yields empirical R² and deterministic confidence."""
    payload = {
        "asset": "Bitcoin (BTC)",
        "period": "1D",
        "algorithm": "XGBoost (Gradient Boosting)"
    }
    resp = client.post("/api/v1/predict", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["pipelineHealth"] in ["HEALTHY", "DEGRADED"]
    assert res["algorithmUsed"] == "xgboost"
    assert res["bounds"]["r2Score"] == "0.9932"
    assert res["confidence"] in [99.3, 91.4]
    assert res["price"] > 0
    assert len(res["topFeatures"]) > 0
    assert len(res["logs"]) > 0

def test_predict_sol_xgboost(client):
    """Verify Solana XGBoost prediction yields calibrated lower empirical R²."""
    payload = {
        "asset": "Solana (SOL)",
        "period": "1D",
        "algorithm": "XGBoost (Gradient Boosting)"
    }
    resp = client.post("/api/v1/predict", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["pipelineHealth"] in ["HEALTHY", "DEGRADED"]
    assert res["algorithmUsed"] == "xgboost"
    assert res["bounds"]["r2Score"] == "0.6459"
    assert res["confidence"] in [64.6, 59.4]

def test_predict_eth_lstm(client):
    """Verify Ethereum LSTM inference executes properly."""
    payload = {
        "asset": "Ethereum (ETH)",
        "period": "1D",
        "algorithm": "LSTM (Recurrent Neural Network)"
    }
    resp = client.post("/api/v1/predict", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["pipelineHealth"] in ["HEALTHY", "DEGRADED"]
    assert res["algorithmUsed"] == "lstm"
    assert res["bounds"]["r2Score"] == "0.9880"
    assert res["confidence"] in [98.8, 90.9]

def test_predict_ada_ensemble(client):
    """Verify Cardano Hybrid Ensemble executes consensus prediction."""
    payload = {
        "asset": "Cardano (ADA)",
        "period": "1D",
        "algorithm": "Ensemble (Hybrid V3)"
    }
    resp = client.post("/api/v1/predict", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["pipelineHealth"] in ["HEALTHY", "DEGRADED"]
    assert res["algorithmUsed"] == "ensemble"
    assert res["bounds"]["r2Score"] == "0.9781"
    assert res["confidence"] in [97.8, 90.0]

def test_predict_invalid_asset(client):
    """Verify 400 rejection on unsupported assets."""
    payload = {
        "asset": "Dogecoin (DOGE)",
        "period": "1D",
        "algorithm": "XGBoost (Gradient Boosting)"
    }
    resp = client.post("/api/v1/predict", json=payload)
    assert resp.status_code == 400

def test_chat_endpoint_valid_query(client):
    """Verify chatbot endpoint responds with valid text and chip suggestions."""
    payload = {
        "message": "How accurate?",
        "history": []
    }
    resp = client.post("/api/v1/chat", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert "text" in res
    assert len(res["text"]) > 10
    assert "chips" in res
    assert isinstance(res["chips"], list)

def test_chat_endpoint_history_and_fallback(client):
    """Verify chatbot handles conversation history and never raises 500."""
    payload = {
        "message": "What models are supported?",
        "history": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi! How can I help?"}
        ]
    }
    resp = client.post("/api/v1/chat", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert "text" in res
    assert len(res["chips"]) > 0

