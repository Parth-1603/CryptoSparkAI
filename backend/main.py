from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from backend.model_loader import load_all
from backend.routes.market         import router as market_router
from backend.routes.predict        import router as predict_router
from backend.routes.metrics        import router as metrics_router
from backend.routes.infrastructure import router as infra_router
from backend.routes.chatbot        import router as chat_router
from backend.routes.explain        import router as explain_router
from backend.routes.health         import router as health_router

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
app.include_router(explain_router, prefix="/api", tags=["Explainability"])
app.include_router(health_router,  prefix="/api", tags=["Pipeline Health"])

@app.get("/")
def root():
    return {"status": "CryptoSpark AI is running", "faultTolerance": "ACTIVE"}