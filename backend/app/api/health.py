"""Health check and system status API endpoints."""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter

from app.core.config import settings
from app.models.schemas import HealthCheck, KnowledgeBaseStats

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthCheck)
async def health_check() -> HealthCheck:
    """System health check endpoint.

    Returns the current status of the CMPDI AI Mining Platform backend,
    including RAG pipeline readiness and knowledge base statistics.
    """
    rag_ready = False
    collections_count = 0
    documents_indexed = 0

    try:
        import chromadb

        client = chromadb.PersistentClient(path=str(settings.chroma_persist_dir))
        collections = client.list_collections()
        collections_count = len(collections)
        for col in collections:
            if col.name == settings.collection_name:
                documents_indexed = col.count()
                rag_ready = True
                break
    except Exception:
        # ChromaDB not available or not initialized — still healthy
        rag_ready = False

    return HealthCheck(
        status="healthy",
        version=settings.app_version,
        rag_ready=rag_ready,
        collections_count=collections_count,
        documents_indexed=documents_indexed,
    )


@router.get("/stats", response_model=KnowledgeBaseStats)
async def knowledge_base_stats() -> KnowledgeBaseStats:
    """Knowledge base statistics endpoint."""
    total_chunks = 0
    total_documents = 0

    try:
        import chromadb

        client = chromadb.PersistentClient(path=str(settings.chroma_persist_dir))
        try:
            collection = client.get_collection(settings.collection_name)
            total_chunks = collection.count()
            # Count unique sources
            all_meta = collection.get(include=["metadatas"])
            sources = set()
            if all_meta and all_meta["metadatas"]:
                for meta in all_meta["metadatas"]:
                    sources.add(meta.get("source", "unknown"))
            total_documents = len(sources)
        except Exception:
            pass
    except Exception:
        pass

    return KnowledgeBaseStats(
        collection_name=settings.collection_name,
        total_chunks=total_chunks,
        total_documents=total_documents,
        embedding_model=settings.embedding_model,
        last_updated=datetime.now(UTC),
    )
