"""Document upload and OCR extraction API endpoint.

Handles file uploads, text extraction, domain-specific data parsing,
and knowledge base indexing for the CMPDI platform.
"""

from __future__ import annotations

import logging
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.models.schemas import (
    DocumentStatus,
    ExtractionResult,
    UploadResponse,
)
from app.services.document_processor import process_document
from app.services.rag_pipeline import chunk_text, generate_embeddings, index_chunks, Chunk

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/upload", tags=["Document Upload"])

# In-memory document registry
_documents: dict[str, ExtractionResult] = {}


def _ensure_upload_dir() -> Path:
    """Create the upload directory if it doesn't exist."""
    upload_dir = settings.upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


@router.post("/", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)) -> UploadResponse:
    """Upload and process a mining/geological document.

    Pipeline:
    1. Validate file type and size
    2. Save to upload directory
    3. Extract text (OCR for PDFs)
    4. Parse geological domain data
    5. Index into knowledge base
    6. Return extraction results

    Args:
        file: Uploaded file (PDF, DOCX, TXT, XLSX).

    Returns:
        UploadResponse with extraction results.

    Raises:
        HTTPException: For invalid files or processing errors.
    """
    # Validate filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Validate extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type: {suffix}. "
                f"Allowed: {', '.join(sorted(settings.allowed_extensions))}"
            ),
        )

    # Read file content and check size
    content = await file.read()
    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Save file to upload directory
    upload_dir = _ensure_upload_dir()
    doc_id = f"DOC-{uuid.uuid4().hex[:12].upper()}"
    save_path = upload_dir / f"{doc_id}_{file.filename}"

    try:
        save_path.write_bytes(content)
    except IOError as exc:
        logger.error("Failed to save upload: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to save uploaded file")

    # Process document
    try:
        extraction = process_document(save_path, file.filename)
        extraction.document_id = doc_id
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error("Document processing failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {exc}",
        )

    # Index into knowledge base
    if extraction.status == DocumentStatus.COMPLETED and extraction.raw_text_preview:
        try:
            # Read full text again for indexing
            from app.services.document_processor import extract_text

            full_text, _ = extract_text(save_path)
            chunks = chunk_text(full_text, source=file.filename)
            if chunks:
                embeddings = generate_embeddings([c.text for c in chunks])
                indexed = index_chunks(chunks, embeddings)
                logger.info("Indexed %d chunks from %s", indexed, file.filename)
        except Exception as exc:
            logger.warning("Knowledge base indexing failed (non-fatal): %s", exc)

    # Store in registry
    _documents[doc_id] = extraction

    return UploadResponse(
        document_id=doc_id,
        filename=file.filename,
        status=extraction.status,
        message=f"Document processed successfully. Extracted {extraction.text_length} characters from {extraction.page_count} pages.",
        extraction=extraction,
    )


@router.get("/documents", response_model=list[ExtractionResult])
async def list_documents() -> list[ExtractionResult]:
    """List all processed documents."""
    return list(_documents.values())


@router.get("/documents/{document_id}", response_model=ExtractionResult)
async def get_document(document_id: str) -> ExtractionResult:
    """Get extraction result for a specific document."""
    doc = _documents.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    return doc


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str) -> dict[str, str]:
    """Delete a document and its extraction data."""
    if document_id not in _documents:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

    del _documents[document_id]

    # Clean up file from disk
    upload_dir = settings.upload_dir
    for f in upload_dir.glob(f"{document_id}_*"):
        try:
            f.unlink()
        except IOError:
            pass

    return {"message": "Document deleted", "document_id": document_id}
