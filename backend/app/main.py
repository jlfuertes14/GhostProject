"""
AI Flood Infrastructure Planning Platform — Backend API

FastAPI application serving ML predictions and analytics
for DPWH flood control infrastructure projects.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import projects, analytics, predict, retrain
from app.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DuckDB on startup
    init_db()
    yield

app = FastAPI(
    title="AI Flood Infrastructure Planning Platform",
    description=(
        "Predictive analytics API for Philippine flood control infrastructure "
        "using historical DPWH project data (2018–2025)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

import os

# ---------------------------------------------------------------------------
# CORS — allow the Vercel-hosted frontend to call this API
# ---------------------------------------------------------------------------
# Parse ALLOWED_ORIGINS from environment, or use defaults
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,https://ghost-project-one-dun.vercel.app")
allow_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register route modules
# ---------------------------------------------------------------------------
app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(predict.router, prefix="/api", tags=["Predictions"])
app.include_router(retrain.router, prefix="/api", tags=["Retrain"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def health_check():
    """Root health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Flood Infrastructure Planning Platform API",
        "version": "1.0.0",
    }
