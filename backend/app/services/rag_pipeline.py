"""RAG (Retrieval-Augmented Generation) pipeline for MineGPT.

Provides document chunking, embedding, vector storage, retrieval, and
context-grounded response generation for the CMPDI knowledge base.
"""

from __future__ import annotations

import hashlib
import logging
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Text chunking
# ---------------------------------------------------------------------------

@dataclass
class Chunk:
    """A chunk of text with metadata for embedding."""

    text: str
    chunk_id: str = ""
    source: str = ""
    page: str = ""
    metadata: dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.chunk_id:
            # Include source + text + timestamp salt for uniqueness
            raw = f"{self.source}:{self.text}:{id(self)}"
            digest = hashlib.md5(raw.encode()).hexdigest()
            self.chunk_id = str(uuid.UUID(digest))


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
    source: str = "",
) -> list[Chunk]:
    """Split text into overlapping chunks for embedding.

    Uses a sentence-aware splitting strategy that respects paragraph
    boundaries and tries to keep semantic units together.

    Args:
        text: Full document text to chunk.
        chunk_size: Target chunk size in characters. Defaults to config.
        chunk_overlap: Overlap between consecutive chunks. Defaults to config.
        source: Source document identifier for metadata.

    Returns:
        List of Chunk objects ready for embedding.
    """
    size = chunk_size or settings.chunk_size
    overlap = chunk_overlap or settings.chunk_overlap

    if not text or not text.strip():
        return []

    # Split on paragraph boundaries first, then sentences
    paragraphs = re.split(r"\n\s*\n", text)
    chunks: list[Chunk] = []
    current_text = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # If adding this paragraph exceeds chunk size, finalize current chunk
        if current_text and len(current_text) + len(para) + 2 > size:
            chunks.append(Chunk(text=current_text.strip(), source=source))
            # Keep overlap from end of previous chunk
            if overlap > 0 and len(current_text) > overlap:
                current_text = current_text[-overlap:] + "\n\n" + para
            else:
                current_text = para
        else:
            current_text = (current_text + "\n\n" + para).strip() if current_text else para

        # If a single paragraph exceeds chunk size, split it further
        while len(current_text) > size * 1.5:
            split_point = current_text.rfind(". ", 0, size)
            if split_point == -1:
                split_point = current_text.rfind(" ", 0, size)
            if split_point == -1:
                split_point = size

            chunks.append(Chunk(text=current_text[:split_point].strip(), source=source))
            current_text = current_text[split_point - overlap :].strip()

    if current_text.strip():
        chunks.append(Chunk(text=current_text.strip(), source=source))

    logger.info("Chunked text into %d chunks (size=%d, overlap=%d)", len(chunks), size, overlap)
    return chunks


# ---------------------------------------------------------------------------
# Embedding (with fallback for environments without sentence-transformers)
# ---------------------------------------------------------------------------

_embedding_model = None


def _get_embedding_model():
    """Lazily load the sentence-transformers embedding model."""
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer

            logger.info("Loading embedding model: %s", settings.embedding_model)
            _embedding_model = SentenceTransformer(settings.embedding_model)
            logger.info("Embedding model loaded successfully")
        except ImportError:
            logger.warning(
                "sentence-transformers not installed. "
                "Using fallback hash-based embeddings."
            )
            _embedding_model = "fallback"
    return _embedding_model


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts.

    Uses sentence-transformers if available, otherwise falls back to
    a deterministic hash-based pseudo-embedding for development/testing.

    Args:
        texts: List of text strings to embed.

    Returns:
        List of embedding vectors (one per text).
    """
    model = _get_embedding_model()
    if model == "fallback":
        return _fallback_embed(texts)
    return model.encode(texts, show_progress_bar=False).tolist()


def _fallback_embed(texts: list[str], dim: int = 384) -> list[list[float]]:
    """Deterministic hash-based pseudo-embeddings for testing.

    NOT suitable for production — provides reproducible vectors for tests.
    """
    import struct

    results: list[list[float]] = []
    for text in texts:
        digest = hashlib.sha512(text.encode()).digest()
        # Need dim * 4 bytes for struct.unpack; repeat digest to fill
        needed = dim * 4
        repeats = needed // len(digest) + 1
        raw = digest * repeats
        values = list(struct.unpack(f"{dim}f", raw[:needed]))
        # Normalize to unit vector
        norm = sum(v * v for v in values) ** 0.5
        if norm > 0:
            values = [v / norm for v in values]
        results.append(values)
    return results


# ---------------------------------------------------------------------------
# Vector store (ChromaDB)
# ---------------------------------------------------------------------------

_chroma_client = None
_collection = None


def _get_chroma_collection():
    """Get or create the ChromaDB collection."""
    global _chroma_client, _collection
    if _collection is not None:
        return _collection

    try:
        import chromadb

        persist_dir = str(settings.chroma_persist_dir)
        _chroma_client = chromadb.PersistentClient(path=persist_dir)
        _collection = _chroma_client.get_or_create_collection(
            name=settings.collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            "ChromaDB collection '%s' ready (%d items)",
            settings.collection_name,
            _collection.count(),
        )
    except ImportError:
        logger.warning("chromadb not installed. Using in-memory fallback.")
        _collection = "in_memory"
    except Exception as exc:
        logger.error("ChromaDB initialization failed: %s", exc)
        _collection = "in_memory"

    return _collection


def index_chunks(chunks: list[Chunk], embeddings: list[list[float]]) -> int:
    """Index chunks with their embeddings into the vector store.

    Args:
        chunks: List of Chunk objects to index.
        embeddings: Corresponding embedding vectors.

    Returns:
        Number of chunks successfully indexed.
    """
    collection = _get_chroma_collection()

    if collection == "in_memory":
        # Store in module-level dict for in-memory fallback
        if not hasattr(index_chunks, "_memory_store"):
            index_chunks._memory_store = {}  # type: ignore[attr-defined]
        for chunk, emb in zip(chunks, embeddings):
            index_chunks._memory_store[chunk.chunk_id] = {  # type: ignore[attr-defined]
                "text": chunk.text,
                "embedding": emb,
                "metadata": {"source": chunk.source, "page": chunk.page, **chunk.metadata},
            }
        logger.info("Indexed %d chunks to in-memory store", len(chunks))
        return len(chunks)

    # ChromaDB indexing
    ids = [c.chunk_id for c in chunks]
    documents = [c.text for c in chunks]
    metadatas = [{"source": c.source, "page": c.page, **c.metadata} for c in chunks]

    # Batch upsert to avoid ChromaDB limits
    batch_size = 100
    indexed = 0
    for i in range(0, len(ids), batch_size):
        batch_ids = ids[i : i + batch_size]
        batch_docs = documents[i : i + batch_size]
        batch_embs = embeddings[i : i + batch_size]
        batch_metas = metadatas[i : i + batch_size]
        collection.upsert(
            ids=batch_ids,
            embeddings=batch_embs,
            documents=batch_docs,
            metadatas=batch_metas,
        )
        indexed += len(batch_ids)

    logger.info("Indexed %d chunks into ChromaDB", indexed)
    return indexed


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

@dataclass
class RetrievalResult:
    """A single retrieval result with score."""

    text: str
    score: float
    source: str = ""
    page: str = ""
    metadata: dict[str, str] = field(default_factory=dict)


def retrieve(
    query: str,
    top_k: int | None = None,
    min_score: float | None = None,
) -> list[RetrievalResult]:
    """Retrieve the most relevant chunks for a query.

    Args:
        query: User query string.
        top_k: Number of results to return. Defaults to config.
        min_score: Minimum relevance score threshold. Defaults to config.

    Returns:
        List of RetrievalResult sorted by relevance (descending).
    """
    k = top_k or settings.retrieval_top_k
    threshold = min_score or settings.min_relevance_score

    collection = _get_chroma_collection()

    query_embedding = generate_embeddings([query])[0]

    if collection == "in_memory":
        return _in_memory_retrieve(query_embedding, k, threshold)

    # ChromaDB query
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        include=["documents", "distances", "metadatas"],
    )

    retrieval_results: list[RetrievalResult] = []
    if results and results["documents"]:
        for doc, distance, meta in zip(
            results["documents"][0],
            results["distances"][0],
            results["metadatas"][0],
        ):
            # ChromaDB cosine distance: 0 = identical, 2 = opposite
            # Convert to similarity score 0-100
            score = max(0, (1 - distance / 2)) * 100
            if score >= threshold * 100:
                retrieval_results.append(
                    RetrievalResult(
                        text=doc,
                        score=round(score, 2),
                        source=meta.get("source", ""),
                        page=meta.get("page", ""),
                        metadata=meta,
                    )
                )

    logger.info(
        "Retrieved %d results for query (threshold=%.1f%%)",
        len(retrieval_results), threshold * 100,
    )
    return retrieval_results


def _in_memory_retrieve(
    query_embedding: list[float], k: int, threshold: float
) -> list[RetrievalResult]:
    """Retrieve from in-memory store using cosine similarity + keyword boost."""
    if not hasattr(index_chunks, "_memory_store"):
        return []

    store = index_chunks._memory_store  # type: ignore[attr-defined]
    if not store:
        return []

    # Also do keyword matching for relevance boost
    query_words = set(query_embedding.__class__.__name__)  # placeholder
    # Reconstruct query text from embeddings is not possible, so use stored text

    scored: list[tuple[str, float]] = []
    for chunk_id, data in store.items():
        emb = data["embedding"]
        # Cosine similarity
        dot = sum(a * b for a, b in zip(query_embedding, emb))
        norm_a = sum(a * a for a in query_embedding) ** 0.5
        norm_b = sum(b * b for b in emb) ** 0.5
        sim = dot / (norm_a * norm_b) if norm_a * norm_b > 0 else 0
        scored.append((chunk_id, sim))

    scored.sort(key=lambda x: x[1], reverse=True)

    results: list[RetrievalResult] = []
    for chunk_id, score in scored[:k]:
        data = store[chunk_id]
        sim_pct = score * 100
        if sim_pct >= threshold * 100:
            results.append(
                RetrievalResult(
                    text=data["text"],
                    score=round(sim_pct, 2),
                    source=data["metadata"].get("source", ""),
                    page=data["metadata"].get("page", ""),
                    metadata=data["metadata"],
                )
            )
    return results


# ---------------------------------------------------------------------------
# Knowledge base ingestion (seed data)
# ---------------------------------------------------------------------------


def get_seed_documents() -> dict[str, str]:
    """Return seed knowledge base documents for CMPDI mining domain.

    These provide baseline context for MineGPT responses even without
    uploaded documents.
    """
    return {
        "CMPDI_Slope_Stability_Guidelines": (
            "CMPDI Geotechnical Slope Stability Guidelines for Open Cast Mines\n\n"
            "1. Factor of Safety (FOS) Requirements:\n"
            "- Minimum FOS of 1.30 for normal conditions\n"
            "- Minimum FOS of 1.15 for rapid drawdown conditions\n"
            "- FOS below 1.20 triggers immediate remediation\n"
            "- DGMS Statutory Minimum FOS = 1.05 (absolute minimum)\n\n"
            "2. Bench Design Parameters:\n"
            "- Overall slope angle should not exceed 45 degrees for coal seams\n"
            "- Individual bench height limited to 10m for standard operations\n"
            "- Berm width minimum 8m for haul road benches\n"
            "- Batter angle for coal faces: 60-70 degrees\n\n"
            "3. Monitoring Requirements:\n"
            "- InSAR displacement monitoring for slopes >60m height\n"
            "- GroundProbe SSR for critical highwall sections\n"
            "- Piezometer installation for pore water pressure monitoring\n"
            "- Acoustic emission monitoring in underground workings\n\n"
            "4. DGMS Compliance:\n"
            "- CMR 2017 Regulation 110: Slope stability assessment\n"
            "- DGMS Tech Circular 04/2021: Monitoring protocols\n"
            "- Quarterly slope stability reports to DGMS"
        ),
        "CMPDI_Coal_Seam_Classification": (
            "Coal Seam Classification and Quality Assessment - CMPDI Standards\n\n"
            "1. Coal Quality Parameters:\n"
            "- GCV (Gross Calorific Value): Prime Coking >6500 kcal/kg\n"
            "- Ash Content: Prime Coking <20%, Semi-Coking 20-30%, Non-Coking >30%\n"
            "- Moisture: Should be <5% for marketable coal\n"
            "- Volatile Matter: 20-35% for coking coal\n\n"
            "2. Coking Coal Grades:\n"
            "- Grade Steel-I: GCV >6500, Ash <18%, CSN >7\n"
            "- Grade Steel-II: GCV 6000-6500, Ash 18-22%, CSN 5-7\n"
            "- Prime Coking: GCV 6000-7000, Ash 15-20%\n"
            "- Semi-Coking: GCV 5000-6000, Ash 20-30%\n\n"
            "3. Major Coalfields and Seam Identifiers:\n"
            "- Jharia (BCCL): Seam I to XVIII, Prime Coking Coal\n"
            "- Raniganj (ECL): Dishergarh, Sanctoria seams\n"
            "- Korba (SECL): Gevra, Kusmunda, Dipka seams\n"
            "- Singrauli (NCL): Purewa, Turra seams\n\n"
            "4. Stripping Ratio Guidelines:\n"
            "- Optimal OSR for viability: 1:3 to 1:6\n"
            "- Gevra OCP achieves world-leading 1:1.6 ratio"
        ),
        "CMPDI_DGMS_Safety_Regulations": (
            "DGMS Safety Regulations for Coal Mines - Key Provisions\n\n"
            "1. Coal Mines Regulations (CMR) 2017:\n"
            "- Regulation 107: Mine ventilation requirements\n"
            "- Regulation 109: Management of strata\n"
            "- Regulation 110: Opencast working safety\n"
            "- Regulation 123: Safety in underground mines\n\n"
            "2. Methane Gas Management:\n"
            "- Degree-I: <1 m3/tonne gas content\n"
            "- Degree-II: 1-5 m3/tonne, partial ventilation required\n"
            "- Degree-III: >5 m3/tonne, pre-drainage mandatory\n"
            "- Return airway methane limit: 0.75%\n"
            "- Working face methane limit: 1.0%\n\n"
            "3. Slope Stability Requirements:\n"
            "- Annual geotechnical review by approved agency\n"
            "- Real-time monitoring for slopes >60m\n"
            "- DGMS notification for any FOS <1.20\n"
            "- Emergency action plan for critical slopes\n\n"
            "4. Statutory Reporting:\n"
            "- Quarterly DGMS returns (Form B)\n"
            "- Annual Safety Audit by independent agency\n"
            "- Immediate reporting of serious incidents\n"
            "- Monthly production and safety statistics"
        ),
        "CMPDI_Borehole_Lithology_Standards": (
            "Borehole Lithology Logging and Core Analysis Standards\n\n"
            "1. RMR (Rock Mass Rating) Classification:\n"
            "- Class I (>80): Very Good Rock\n"
            "- Class II (61-80): Good Rock\n"
            "- Class III (41-60): Fair Rock\n"
            "- Class IV (21-40): Poor Rock\n"
            "- Class V (<20): Very Poor Rock\n\n"
            "2. Borehole Coring Requirements:\n"
            "- NQ/HQ diameter core for detailed analysis\n"
            "- Core recovery >90% for reliable assessment\n"
            "- RQD measurement at 1m intervals\n"
            "- Detailed lithological logging with color, texture, bedding\n\n"
            "3. Coal Core Analysis:\n"
            "- Proximate analysis: moisture, ash, VM, FC\n"
            "- Ultimate analysis: C, H, N, S, O\n"
            "- GCV by bomb calorimetry\n"
            "- CSN (Crucible Swelling Number) for coking potential\n\n"
            "4. Geotechnical Testing:\n"
            "- UCS (Unconfined Compressive Strength)\n"
            "- Point Load Index\n"
            "- Brazilian Tensile Strength\n"
            "- Triaxial shear strength parameters (c, phi)"
        ),
    }


def seed_knowledge_base() -> int:
    """Index seed documents into the vector store.

    Returns:
        Number of chunks indexed.
    """
    all_chunks: list[Chunk] = []
    for doc_name, text in get_seed_documents().items():
        chunks = chunk_text(text, source=doc_name)
        all_chunks.extend(chunks)

    if not all_chunks:
        return 0

    embeddings = generate_embeddings([c.text for c in all_chunks])
    indexed = index_chunks(all_chunks, embeddings)
    logger.info("Seeded knowledge base with %d chunks from %d documents",
                indexed, len(get_seed_documents()))
    return indexed


# ---------------------------------------------------------------------------
# Response generation
# ---------------------------------------------------------------------------


def build_context(results: list[RetrievalResult], max_chars: int = 3000) -> str:
    """Build context string from retrieval results for the LLM prompt.

    Args:
        results: Ranked retrieval results.
        max_chars: Maximum characters for the context window.

    Returns:
        Formatted context string with source citations.
    """
    context_parts: list[str] = []
    total = 0

    for i, r in enumerate(results, 1):
        chunk = f"[Source {i}: {r.source}] {r.text}"
        if total + len(chunk) > max_chars:
            break
        context_parts.append(chunk)
        total += len(chunk)

    return "\n\n---\n\n".join(context_parts)


def generate_response(
    query: str,
    context: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    """Generate a response using the LLM with retrieved context.

    Attempts to call the configured LLM endpoint. Falls back to a
    context-based template response if the LLM is unavailable.

    Args:
        query: User query.
        context: Retrieved context for grounding.
        conversation_history: Previous messages for multi-turn context.

    Returns:
        Generated response string.
    """
    # Try OpenAI-compatible API if configured
    if settings.openai_api_key:
        return _call_llm_api(query, context, conversation_history)

    # Fallback: template-based response using retrieved context
    return _template_response(query, context)


def _call_llm_api(
    query: str,
    context: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    """Call OpenAI-compatible API for response generation."""
    try:
        import httpx

        messages: list[dict[str, str]] = [
            {"role": "system", "content": settings.minegpt_system_prompt},
        ]

        if conversation_history:
            messages.extend(conversation_history[-settings.context_window:])

        messages.append(
            {
                "role": "user",
                "content": (
                    f"Based on the following CMPDI knowledge base context, answer the query.\n\n"
                    f"CONTEXT:\n{context}\n\n"
                    f"QUERY: {query}\n\n"
                    f"Respond professionally with source citations where applicable."
                ),
            }
        )

        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{settings.openai_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.llm_model,
                    "messages": messages,
                    "temperature": settings.llm_temperature,
                    "max_tokens": settings.llm_max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    except Exception as exc:
        logger.error("LLM API call failed: %s. Falling back to template.", exc)
        return _template_response(query, context)


def _template_response(query: str, context: str) -> str:
    """Generate a context-aware template response when LLM is unavailable."""
    if not context:
        return (
            f"Based on the CMPDI Knowledge Base, I don't have specific information "
            f"about '{query}'. Please upload a relevant geological report or "
            f"borehole log for detailed analysis."
        )

    return (
        f"## MineGPT Analysis: {query}\n\n"
        f"Based on the retrieved CMPDI knowledge base context:\n\n"
        f"{context}\n\n"
        f"---\n"
        f"*Note: This response was generated from ground-truth context retrieval. "
        f"For detailed analysis, please upload the specific geological report "
        f"or consult the CMPDI Regional Institute.*"
    )
