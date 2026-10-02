from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

# Load .env BEFORE any backend.routes imports — routes/chatbot.py reads
# GROQ_API_KEY the moment it's imported, so the key must already be in
# the environment by then. Path(__file__).parent makes this work no
# matter which folder you run uvicorn from.
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from backend.model_loader import load_all
from backend.routes.market         import router as market_router
from backend.routes.predict        import router as predict_router
from backend.routes.metrics        import router as metrics_router
from backend.routes.infrastructure import router as infra_router
from backend.routes.chatbot        import router as chat_router

# Load all models before first request
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all()
    yield

app = FastAPI(
    title="CryptoSpark AI API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market_router,  prefix="/api", tags=["Market"])
app.include_router(predict_router, prefix="/api", tags=["Predict"])
app.include_router(metrics_router, prefix="/api", tags=["Metrics"])
app.include_router(infra_router,   prefix="/api", tags=["Infrastructure"])
app.include_router(chat_router,    prefix="/api", tags=["Chatbot"])

@app.get("/")
def root():
    return {"status": "CryptoSpark AI is running"}