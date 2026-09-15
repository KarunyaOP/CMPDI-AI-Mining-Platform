"""CMPDI AI Mining Platform - FastAPI Application.

Main application factory with middleware, exception handlers,
and route registration for the MineGPT backend.
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (startup/shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown events."""
    # Startup
    logger.info("Starting CMPDI AI Mining Platform v%s", settings.app_version)
    logger.info("Upload directory: %s", settings.upload_dir.resolve())
    logger.info("ChromaDB persist dir: %s", settings.chroma_persist_dir.resolve())

    # Seed knowledge base on startup
    try:
        from app.services.rag_pipeline import seed_knowledge_base
        indexed = seed_knowledge_base()
        logger.info("Knowledge base seeded with %d chunks", indexed)
    except Exception as exc:
        logger.warning("Knowledge base seeding failed (non-fatal): %s", exc)

    yield

    # Shutdown
    logger.info("Shutting down CMPDI AI Mining Platform")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance.
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Backend API for CMPDI AI Mining Platform. Provides MineGPT "
            "RAG-powered chat, document OCR extraction, and knowledge base "
            "management for Coal India Limited geological operations."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request timing middleware
    @app.middleware("http")
    async def timing_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
        start = time.time()
        response = await call_next(request)
        elapsed = (time.time() - start) * 1000
        response.headers["X-Process-Time-Ms"] = f"{elapsed:.1f}"
        return response

    # Exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code,
                "path": str(request.url.path),
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled exception: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": str(exc) if settings.debug else "An unexpected error occurred",
                "status_code": 500,
            },
        )

    # Register API routers
    from app.api.chat import router as chat_router
    from app.api.upload import router as upload_router
    from app.api.health import router as health_router

    app.include_router(health_router)
    app.include_router(chat_router)
    app.include_router(upload_router)

    # Root endpoint
    @app.get("/")
    async def root() -> dict[str, str]:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "status": "running",
        }

    return app


# Module-level app instance for uvicorn
app = create_app()
