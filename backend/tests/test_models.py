"""Tests for Pydantic models and schema validation."""

from __future__ import annotations

from datetime import datetime

import pytest

from app.models.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    CoreLabMetrics,
    DocumentStatus,
    ExtractionResult,
    HealthCheck,
    KnowledgeBaseStats,
    RiskLevel,
    Source,
    StratigraphyLayer,
    UploadResponse,
)


class TestSource:
    """Tests for the Source model."""

    def test_source_creation(self) -> None:
        source = Source(id="REP-001", name="Test Report", page="pp. 10-15", confidence=95.5)
        assert source.id == "REP-001"
        assert source.confidence == 95.5

    def test_source_defaults(self) -> None:
        source = Source(id="X", name="Y")
        assert source.page == ""
        assert source.confidence == 0.0

    def test_source_confidence_bounds(self) -> None:
        with pytest.raises(Exception):
            Source(id="X", name="Y", confidence=101.0)
        with pytest.raises(Exception):
            Source(id="X", name="Y", confidence=-1.0)


class TestChatRequest:
    """Tests for ChatRequest validation."""

    def test_valid_request(self) -> None:
        req = ChatRequest(query="What is the FOS at Joyrampur?")
        assert req.query == "What is the FOS at Joyrampur?"
        assert req.conversation_id is None
        assert req.context_window == 5

    def test_empty_query_rejected(self) -> None:
        with pytest.raises(Exception):
            ChatRequest(query="")

    def test_long_query_rejected(self) -> None:
        with pytest.raises(Exception):
            ChatRequest(query="x" * 5000)

    def test_custom_context_window(self) -> None:
        req = ChatRequest(query="test", context_window=10)
        assert req.context_window == 10

    def test_context_window_bounds(self) -> None:
        with pytest.raises(Exception):
            ChatRequest(query="test", context_window=0)
        with pytest.raises(Exception):
            ChatRequest(query="test", context_window=25)


class TestChatResponse:
    """Tests for ChatResponse model."""

    def test_response_creation(self) -> None:
        resp = ChatResponse(
            answer="FOS is 1.18",
            sources=[Source(id="R1", name="Report")],
            conversation_id="conv-123",
            confidence=92.3,
            grounded=True,
        )
        assert resp.grounded is True
        assert len(resp.sources) == 1


class TestChatMessage:
    """Tests for ChatMessage model."""

    def test_valid_roles(self) -> None:
        for role in ["user", "assistant", "system"]:
            msg = ChatMessage(id="1", role=role, content="Hello")
            assert msg.role == role

    def test_invalid_role(self) -> None:
        with pytest.raises(Exception):
            ChatMessage(id="1", role="invalid", content="Hello")


class TestDocumentStatus:
    """Tests for DocumentStatus enum."""

    def test_all_statuses(self) -> None:
        assert DocumentStatus.PENDING == "pending"
        assert DocumentStatus.PROCESSING == "processing"
        assert DocumentStatus.COMPLETED == "completed"
        assert DocumentStatus.FAILED == "failed"


class TestRiskLevel:
    """Tests for RiskLevel enum."""

    def test_risk_levels(self) -> None:
        assert RiskLevel.LOW == "Low"
        assert RiskLevel.MEDIUM == "Medium"
        assert RiskLevel.HIGH == "High"
        assert RiskLevel.CRITICAL == "Critical"


class TestExtractionResult:
    """Tests for ExtractionResult model."""

    def test_default_values(self) -> None:
        result = ExtractionResult(document_id="DOC-001", filename="test.pdf")
        assert result.status == DocumentStatus.PENDING
        assert result.page_count == 0
        assert result.key_findings == []
        assert result.keywords == []

    def test_with_metrics(self) -> None:
        result = ExtractionResult(
            document_id="DOC-002",
            filename="report.pdf",
            factor_of_safety="1.18",
            gcv="6840 kcal/kg",
            ash_content="18.2%",
            risk_level=RiskLevel.HIGH,
        )
        assert result.factor_of_safety == "1.18"
        assert result.risk_level == RiskLevel.HIGH


class TestStratigraphyLayer:
    """Tests for StratigraphyLayer model."""

    def test_layer_creation(self) -> None:
        layer = StratigraphyLayer(
            layer="Seam IX",
            depth_from=72.0,
            depth_to=79.5,
            lithology="Bituminous Coal",
            rmr=65,
            color="#1e293b",
        )
        assert layer.depth_from == 72.0
        assert layer.rmr == 65

    def test_invalid_rmr(self) -> None:
        with pytest.raises(Exception):
            StratigraphyLayer(
                layer="X", depth_from=0, depth_to=10,
                lithology="Rock", rmr=150,
            )


class TestCoreLabMetrics:
    """Tests for CoreLabMetrics model."""

    def test_defaults(self) -> None:
        metrics = CoreLabMetrics()
        assert metrics.ash_content == "N/A"
        assert metrics.gcv == "N/A"

    def test_custom_values(self) -> None:
        metrics = CoreLabMetrics(
            ash_content="18.2%", gcv="6,840 kcal/kg", moisture="1.4%"
        )
        assert metrics.ash_content == "18.2%"


class TestHealthCheck:
    """Tests for HealthCheck model."""

    def test_health_defaults(self) -> None:
        health = HealthCheck(version="1.0.0")
        assert health.status == "healthy"
        assert health.rag_ready is False

    def test_health_custom(self) -> None:
        health = HealthCheck(version="1.0.0", rag_ready=True, documents_indexed=42)
        assert health.documents_indexed == 42


class TestKnowledgeBaseStats:
    """Tests for KnowledgeBaseStats model."""

    def test_stats_creation(self) -> None:
        stats = KnowledgeBaseStats(
            collection_name="test",
            total_chunks=100,
            total_documents=5,
            embedding_model="all-MiniLM-L6-v2",
        )
        assert stats.total_chunks == 100
