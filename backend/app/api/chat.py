"""MineGPT chat API endpoint.

Handles conversational queries against the CMPDI knowledge base with
RAG-grounded context retrieval and response generation.
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
    Source,
)
from app.services.rag_pipeline import (
    build_context,
    generate_response,
    retrieve,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["MineGPT Chat"])

# In-memory conversation store (production would use Redis/DB)
_conversations: dict[str, list[ChatMessage]] = {}


@router.post("/", response_model=ChatResponse)
async def chat_query(request: ChatRequest) -> ChatResponse:
    """Process a MineGPT chat query with RAG grounding.

    1. Retrieves relevant context from the CMPDI knowledge base
    2. Generates a grounded response using the LLM
    3. Returns the response with cited sources

    Args:
        request: Chat query with optional conversation context.

    Returns:
        ChatResponse with answer, sources, and confidence.
    """
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Resolve or create conversation
    conv_id = request.conversation_id or str(uuid.uuid4())
    history = _conversations.get(conv_id, [])

    # Retrieve relevant context
    retrieval_results = retrieve(query)

    # Build context for LLM
    context = build_context(retrieval_results)

    # Build conversation history for multi-turn
    conv_history = [{"role": m.role, "content": m.content} for m in history[-request.context_window:]]

    # Generate response
    try:
        answer = generate_response(query, context, conv_history)
    except Exception as exc:
        logger.error("Response generation failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate response. Please try again.",
        )

    # Build sources from retrieval
    sources = [
        Source(
            id=r.source or "UNKNOWN",
            name=r.source or "CMPDI Knowledge Base",
            page=r.page or "",
            confidence=round(r.score, 1),
        )
        for r in retrieval_results[:5]
    ]

    # Determine grounding confidence
    avg_score = sum(r.score for r in retrieval_results[:5]) / max(len(retrieval_results[:5]), 1)
    grounded = avg_score > 40.0 and len(retrieval_results) > 0

    # Build response
    response = ChatResponse(
        answer=answer,
        sources=sources,
        conversation_id=conv_id,
        confidence=round(avg_score, 1),
        grounded=grounded,
    )

    # Store messages in conversation
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        role="user",
        content=query,
        timestamp=datetime.now(UTC),
    )
    assistant_msg = ChatMessage(
        id=str(uuid.uuid4()),
        role="assistant",
        content=answer,
        sources=sources,
        timestamp=datetime.now(UTC),
    )

    if conv_id not in _conversations:
        _conversations[conv_id] = []
    _conversations[conv_id].append(user_msg)
    _conversations[conv_id].append(assistant_msg)

    return response


@router.get("/conversations/{conversation_id}", response_model=list[ChatMessage])
async def get_conversation(conversation_id: str) -> list[ChatMessage]:
    """Retrieve conversation history for a given conversation ID."""
    messages = _conversations.get(conversation_id, [])
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return messages


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str) -> dict[str, str]:
    """Delete a conversation and its history."""
    if conversation_id in _conversations:
        del _conversations[conversation_id]
    return {"message": "Conversation deleted", "conversation_id": conversation_id}
