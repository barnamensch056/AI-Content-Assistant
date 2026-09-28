import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.database import init_db
from app.routes import router as entries_router

# Configure basic application logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ai_content_assistant")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hook: initialize database schema on application start."""
    logger.info("Initializing SQLite database tables...")
    init_db()
    logger.info("Database initialized successfully.")
    yield


app = FastAPI(
    title="Small AI Content Assistant API",
    description="Backend API that accepts text, generates a summary and 3 tags via an LLM, and persists results to SQLite.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration for modern frontend frameworks (React, Vite, Vue, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(entries_router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "ai-content-assistant"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
