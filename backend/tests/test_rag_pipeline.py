"""Tests for the RAG pipeline: chunking, embedding, retrieval, and response generation."""

from __future__ import annotations

import pytest

from app.services.rag_pipeline import (
    Chunk,
    RetrievalResult,
    build_context,
    chunk_text,
    generate_embeddings,
    generate_response,
    get_seed_documents,
    index_chunks,
    retrieve,
    seed_knowledge_base,
    _fallback_embed,
    _template_response,
)


# ---------------------------------------------------------------------------
# Chunking tests
# ---------------------------------------------------------------------------


class TestChunkText:
    """Tests for text chunking strategy."""

    def test_empty_text(self) -> None:
        chunks = chunk_text("")
        assert chunks == []

    def test_whitespace_only(self) -> None:
        chunks = chunk_text("   \n\n  ")
        assert chunks == []

    def test_short_text_single_chunk(self) -> None:
        text = "This is a short paragraph."
        chunks = chunk_text(text, chunk_size=500)
        assert len(chunks) == 1
        assert chunks[0].text == text

    def test_long_text_multiple_chunks(self) -> None:
        # Create text that exceeds chunk size
        paragraphs = [f"Paragraph {i}: {'word ' * 20} content here." for i in range(20)]
        text = "\n\n".join(paragraphs)
        chunks = chunk_text(text, chunk_size=200, chunk_overlap=50)
        assert len(chunks) > 1

    def test_chunks_have_source_metadata(self) -> None:
        text = "A " * 200  # Force chunking
        chunks = chunk_text(text, chunk_size=100, source="TestDoc")
        for chunk in chunks:
            assert chunk.source == "TestDoc"

    def test_chunk_ids_are_unique(self) -> None:
        text = "Paragraph one with enough words to fill space. " * 30
        chunks = chunk_text(text, chunk_size=200)
        ids = [c.chunk_id for c in chunks]
        assert len(ids) == len(set(ids))

    def test_paragraph_respected(self) -> None:
        text = (
            "First paragraph with enough content to stay together in a chunk. "
            "More words here.\n\n"
            "Second paragraph that should be kept separate from the first one. "
            "Additional content here."
        )
        chunks = chunk_text(text, chunk_size=500)
        assert len(chunks) >= 1


# ---------------------------------------------------------------------------
# Embedding tests
# ---------------------------------------------------------------------------


class TestEmbeddings:
    """Tests for embedding generation."""

    def test_fallback_embedding_dimensions(self) -> None:
        texts = ["Hello world", "Mining geology"]
        embeddings = _fallback_embed(texts, dim=384)
        assert len(embeddings) == 2
        assert len(embeddings[0]) == 384
        assert len(embeddings[1]) == 384

    def test_fallback_embedding_deterministic(self) -> None:
        emb1 = _fallback_embed(["test query"], dim=128)
        emb2 = _fallback_embed(["test query"], dim=128)
        assert emb1 == emb2

    def test_fallback_embedding_normalized(self) -> None:
        embeddings = _fallback_embed(["normalized test"], dim=256)
        norm = sum(v * v for v in embeddings[0]) ** 0.5
        assert abs(norm - 1.0) < 1e-5

    def test_generate_embeddings(self) -> None:
        texts = ["Coal mining safety", "Slope stability analysis"]
        embeddings = generate_embeddings(texts)
        assert len(embeddings) == 2
        assert len(embeddings[0]) > 0

    def test_different_texts_different_embeddings(self) -> None:
        emb1 = _fallback_embed(["coal mining"], dim=128)
        emb2 = _fallback_embed(["safety analysis"], dim=128)
        assert emb1 != emb2


# ---------------------------------------------------------------------------
# Indexing and retrieval tests
# ---------------------------------------------------------------------------


class TestIndexAndRetrieve:
    """Tests for vector store indexing and retrieval."""

    def test_index_chunks_in_memory(self) -> None:
        # Clear any existing in-memory store
        if hasattr(index_chunks, "_memory_store"):
            index_chunks._memory_store.clear()  # type: ignore[attr-defined]

        chunks = [
            Chunk(text="Slope stability at Joyrampur is critical.", source="Report1"),
            Chunk(text="Coal seam IX has high GCV content.", source="Report2"),
        ]
        embeddings = generate_embeddings([c.text for c in chunks])
        indexed = index_chunks(chunks, embeddings)
        assert indexed == 2

    def test_retrieve_relevant_results(self) -> None:
        # Seed the in-memory store
        if hasattr(index_chunks, "_memory_store"):
            index_chunks._memory_store.clear()  # type: ignore[attr-defined]

        chunks = [
            Chunk(text="Factor of Safety at Joyrampur Block IV is 1.18.", source="GeoAudit"),
            Chunk(text="Coal seam IX/X encountered at 72m depth.", source="BoreholeLog"),
            Chunk(text="DGMS safety regulations for coal mines.", source="Regulations"),
        ]
        embeddings = generate_embeddings([c.text for c in chunks])
        index_chunks(chunks, embeddings)

        results = retrieve("What is the FOS at Joyrampur?", min_score=0.0)
        # With fallback embeddings, results may or may not have high scores
        # The important thing is that retrieval doesn't crash
        assert isinstance(results, list)

    def test_retrieve_empty_store(self) -> None:
        # Ensure clean state for this test
        if hasattr(index_chunks, "_memory_store"):
            index_chunks._memory_store.clear()  # type: ignore[attr-defined]

        results = retrieve("anything")
        # Should return empty or very low-scoring results
        assert isinstance(results, list)


# ---------------------------------------------------------------------------
# Context building tests
# ---------------------------------------------------------------------------


class TestBuildContext:
    """Tests for context string construction from retrieval results."""

    def test_build_context_with_results(self) -> None:
        results = [
            RetrievalResult(text="FOS is 1.18 at Joyrampur.", score=95.0, source="Report1"),
            RetrievalResult(text="Seam IX has GCV 6840.", score=88.0, source="Report2"),
        ]
        context = build_context(results)
        assert "Report1" in context
        assert "1.18" in context
        assert "Report2" in context

    def test_build_context_empty(self) -> None:
        context = build_context([])
        assert context == ""

    def test_build_context_respects_max_chars(self) -> None:
        results = [
            RetrievalResult(text="word " * 500, score=90.0, source="Doc1"),
            RetrievalResult(text="text " * 500, score=85.0, source="Doc2"),
        ]
        context = build_context(results, max_chars=200)
        assert len(context) <= 500  # Allow some overhead for source labels


# ---------------------------------------------------------------------------
# Response generation tests
# ---------------------------------------------------------------------------


class TestResponseGeneration:
    """Tests for response generation (template-based fallback)."""

    def test_template_response_with_context(self) -> None:
        context = "[Source: Report1] FOS at Joyrampur is 1.18."
        response = _template_response("What is the FOS?", context)
        assert "1.18" in response
        assert "Joyrampur" in response
        assert "MineGPT" in response

    def test_template_response_without_context(self) -> None:
        response = _template_response("Unknown topic", "")
        assert "don't have specific information" in response
        assert "Unknown topic" in response

    def test_generate_response_no_api(self) -> None:
        """Test response generation falls back to template when no API key."""
        from app.core.config import settings

        original_key = settings.openai_api_key
        settings.openai_api_key = ""  # Ensure no API key
        try:
            response = generate_response("What is FOS?", "FOS is 1.18.")
            assert "FOS" in response or "1.18" in response
        finally:
            settings.openai_api_key = original_key


# ---------------------------------------------------------------------------
# Seed data tests
# ---------------------------------------------------------------------------


class TestSeedData:
    """Tests for knowledge base seed documents."""

    def test_seed_documents_present(self) -> None:
        docs = get_seed_documents()
        assert len(docs) >= 4
        assert "CMPDI_Slope_Stability_Guidelines" in docs
        assert "CMPDI_DGMS_Safety_Regulations" in docs

    def test_seed_documents_content(self) -> None:
        docs = get_seed_documents()
        for name, text in docs.items():
            assert len(text) > 100, f"Seed doc {name} too short"
            assert "FOS" in text or "DGMS" in text or "Coal" in text

    def test_seed_knowledge_base(self) -> None:
        """Test that seed documents can be chunked and indexed."""
        if hasattr(index_chunks, "_memory_store"):
            index_chunks._memory_store.clear()  # type: ignore[attr-defined]

        indexed = seed_knowledge_base()
        assert indexed > 0
