"""Pydantic models for API request/response schemas.

Defines the data contracts for MineGPT chat, document upload,
and OCR extraction endpoints.
"""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class RiskLevel(str, Enum):
    """Mine risk severity classification."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class DocumentStatus(str, Enum):
    """Processing status of an uploaded document."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ---------------------------------------------------------------------------
# Chat Models
# ---------------------------------------------------------------------------

class Source(BaseModel):
    """A cited source from the knowledge base."""

    id: str = Field(..., description="Source document identifier")
    name: str = Field(..., description="Source document or section name")
    page: str = Field(default="", description="Page or section reference")
    confidence: float = Field(default=0.0, ge=0.0, le=100.0, description="Confidence percentage")


class ChatMessage(BaseModel):
    """A single chat message in the conversation."""

    id: str
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    sources: list[Source] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))


class ChatRequest(BaseModel):
    """Request payload for MineGPT chat query."""

    query: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="User query about mining/geological data",
        examples=["What is the Factor of Safety at Joyrampur Block IV?"],
    )
    conversation_id: str | None = Field(
        default=None, description="Optional conversation thread ID"
    )
    context_window: int = Field(
        default=5, ge=1, le=20, description="Number of previous messages for context"
    )


class ChatResponse(BaseModel):
    """Response payload from MineGPT chat."""

    answer: str = Field(..., description="Generated response from MineGPT")
    sources: list[Source] = Field(default_factory=list, description="Cited knowledge base sources")
    conversation_id: str = Field(..., description="Conversation thread ID")
    confidence: float = Field(default=0.0, ge=0.0, le=100.0, description="Response confidence score")
    grounded: bool = Field(default=False, description="Whether response is grounded in retrieved context")


# ---------------------------------------------------------------------------
# Document / Upload Models
# ---------------------------------------------------------------------------

class StratigraphyLayer(BaseModel):
    """A single lithological layer from the extracted stratigraphy."""

    layer: str
    depth_from: float = Field(ge=0)
    depth_to: float = Field(ge=0)
    lithology: str
    rmr: int = Field(ge=0, le=100)
    color: str = "#94a3b8"


class CoreLabMetrics(BaseModel):
    """Extracted coal core laboratory analysis metrics."""

    ash_content: str = "N/A"
    moisture: str = "N/A"
    volatile_matter: str = "N/A"
    fixed_carbon: str = "N/A"
    gcv: str = "N/A"
    coking_index: str = "N/A"


class ExtractionResult(BaseModel):
    """Full OCR/extraction result from a processed document."""

    document_id: str
    filename: str
    title: str = ""
    subsidiary: str = ""
    category: str = ""
    status: DocumentStatus = DocumentStatus.PENDING
    page_count: int = 0
    text_length: int = 0

    # Extracted geological metrics
    seam_target: str = ""
    factor_of_safety: str | None = None
    ash_content: str | None = None
    gcv: str | None = None
    risk_level: RiskLevel | None = None

    # Structured extraction
    executive_summary: str = ""
    key_findings: list[str] = Field(default_factory=list)
    stratigraphy: list[StratigraphyLayer] = Field(default_factory=list)
    core_lab_metrics: CoreLabMetrics = Field(default_factory=CoreLabMetrics)

    # Metadata
    keywords: list[str] = Field(default_factory=list)
    raw_text_preview: str = ""
    processing_time_ms: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


class UploadResponse(BaseModel):
    """Response after document upload and processing initiation."""

    document_id: str
    filename: str
    status: DocumentStatus
    message: str
    extraction: ExtractionResult | None = None


# ---------------------------------------------------------------------------
# Health / System Models
# ---------------------------------------------------------------------------

class HealthCheck(BaseModel):
    """System health check response."""

    status: str = "healthy"
    version: str
    rag_ready: bool = False
    collections_count: int = 0
    documents_indexed: int = 0


class KnowledgeBaseStats(BaseModel):
    """Statistics about the indexed knowledge base."""

    collection_name: str
    total_chunks: int
    total_documents: int
    embedding_model: str
    last_updated: datetime | None = None
