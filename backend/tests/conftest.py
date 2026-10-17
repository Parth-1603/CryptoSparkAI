import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.model_loader import load_all

@pytest.fixture(scope="session", autouse=True)
def init_models():
    """Load models once for test session."""
    load_all()

@pytest.fixture(scope="session")
def client():
    """Create a FastAPI test client."""
    with TestClient(app) as test_client:
        yield test_client
