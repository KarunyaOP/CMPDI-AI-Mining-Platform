"""Document processor and OCR extraction service.

Handles PDF, DOCX, and text file parsing with structured extraction
of mining/geological domain data from uploaded reports.
"""

from __future__ import annotations

import hashlib
import logging
import re
import time
import uuid
from datetime import UTC, datetime
from pathlib import Path

from app.models.schemas import (
    CoreLabMetrics,
    DocumentStatus,
    ExtractionResult,
    RiskLevel,
    StratigraphyLayer,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Text extraction helpers
# ---------------------------------------------------------------------------

_ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".csv", ".xlsx", ".xls"}


def _generate_document_id(filename: str, content: bytes) -> str:
    """Generate a deterministic document ID from filename + content hash."""
    digest = hashlib.sha256(f"{filename}:{len(content)}".encode()).hexdigest()[:12]
    return f"DOC-{digest.upper()}"


def extract_text_from_pdf(file_path: Path) -> tuple[str, int]:
    """Extract text from a PDF file using PyPDF2.

    Returns:
        Tuple of (extracted_text, page_count).
    """
    from PyPDF2 import PdfReader

    reader = PdfReader(str(file_path))
    pages: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages), len(reader.pages)


def extract_text_from_docx(file_path: Path) -> tuple[str, int]:
    """Extract text from a DOCX file using python-docx.

    Returns:
        Tuple of (extracted_text, page_count). Page count is approximate.
    """
    from docx import Document

    doc = Document(str(file_path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    # Approximate page count from paragraph density
    page_count = max(1, len(paragraphs) // 30)
    return "\n\n".join(paragraphs), page_count


def extract_text_from_plain(file_path: Path) -> tuple[str, int]:
    """Extract text from a plain text file."""
    text = file_path.read_text(encoding="utf-8", errors="replace")
    line_count = text.count("\n") + 1
    page_count = max(1, line_count // 50)
    return text, page_count


def extract_text(file_path: Path) -> tuple[str, int]:
    """Route to the correct extractor based on file extension.

    Raises:
        ValueError: If the file extension is not supported.
    """
    suffix = file_path.suffix.lower()
    if suffix not in _ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {suffix}")

    if suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    elif suffix in {".docx", ".doc"}:
        return extract_text_from_docx(file_path)
    else:
        return extract_text_from_plain(file_path)


# ---------------------------------------------------------------------------
# Geological domain extraction patterns
# ---------------------------------------------------------------------------

# Regex patterns for mining/geological data extraction
_FOS_PATTERN = re.compile(
    r"(?:factor\s+of\s+safety|FOS)[^0-9]*?(\d+\.\d+)", re.IGNORECASE
)
_GCV_PATTERN = re.compile(
    r"(?:GCV|gross\s+calorific\s+value|calorific)[^0-9,]*?([\d,]+(?:\.\d+)?)\s*kcal", re.IGNORECASE
)
_ASH_PATTERN = re.compile(
    r"(?:ash\s+content|ash)[^0-9]*?(\d+(?:\.\d+)?)\s*%", re.IGNORECASE
)
_SEAM_PATTERN = re.compile(
    r"(?:seam|coal\s+seam)\s+([IVX\d\-]+(?:/[IVX\d\-]+)*)", re.IGNORECASE
)
_DEPTH_PATTERN = re.compile(
    r"depth[^0-9]*?(\d+(?:\.\d+)?)\s*m", re.IGNORECASE
)
_RISK_KEYWORDS = {
    RiskLevel.CRITICAL: ["critical", "immediate danger", "catastrophic", "collapse imminent"],
    RiskLevel.HIGH: ["high risk", "critical slope", "urgent", "below threshold", "hazard"],
    RiskLevel.MEDIUM: ["medium risk", "moderate", "monitoring required", "elevated"],
    RiskLevel.LOW: ["low risk", "stable", "compliant", "optimal", "within limits"],
}


def _extract_fos(text: str) -> str | None:
    """Extract Factor of Safety value from text."""
    match = _FOS_PATTERN.search(text)
    if match:
        val = float(match.group(1))
        return str(val)
    return None


def _extract_gcv(text: str) -> str | None:
    """Extract Gross Calorific Value from text."""
    match = _GCV_PATTERN.search(text)
    if match:
        return f"{match.group(1)} kcal/kg"
    return None


def _extract_ash(text: str) -> str | None:
    """Extract ash content percentage from text."""
    match = _ASH_PATTERN.search(text)
    if match:
        return f"{match.group(1)}%"
    return None


def _extract_seam(text: str) -> str:
    """Extract target seam identifier from text."""
    match = _SEAM_PATTERN.search(text)
    if match:
        return f"Seam {match.group(1)}"
    return ""


def _classify_risk(text: str) -> RiskLevel:
    """Classify risk level based on keyword matching in text."""
    lower_text = text.lower()
    for level, keywords in _RISK_KEYWORDS.items():
        for kw in keywords:
            if kw in lower_text:
                return level
    return RiskLevel.MEDIUM  # Default to medium if no clear signal


def _extract_key_findings(text: str) -> list[str]:
    """Extract key findings from numbered/bulleted lists in the document."""
    findings: list[str] = []
    # Match numbered items (1. or 1) or bullet points
    pattern = re.compile(
        r"(?:^|\n)\s*(?:\d+[.)]\s*|[-*]\s*)(.{20,200}?)(?:\n|$)", re.MULTILINE
    )
    for match in pattern.finditer(text):
        finding = match.group(1).strip()
        if finding and len(finding) > 20:
            findings.append(finding)
    return findings[:10]  # Cap at 10 findings


def _extract_executive_summary(text: str) -> str:
    """Extract executive summary from the document text."""
    # Try to find explicit executive summary section
    summary_pattern = re.compile(
        r"(?:executive\s+summary|abstract|overview)[:\s]*\n?(.{100,800}?)(?:\n\n|\Z)",
        re.IGNORECASE | re.DOTALL,
    )
    match = summary_pattern.search(text)
    if match:
        return match.group(1).strip()

    # Fallback: use first substantial paragraph
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 100]
    if paragraphs:
        return paragraphs[0][:800]
    return "No executive summary could be extracted from this document."


def _extract_keywords(text: str) -> list[str]:
    """Extract domain-relevant keywords from the text."""
    keyword_patterns = [
        r"\b(?:slope\s+stability|factor\s+of\s+safety|FOS)\b",
        r"\b(?:borehole|bore\s+hole|drill\s+hole|BH-[A-Z]+\-\d+)\b",
        r"\b(?:coal\s+seam|seam\s+[IVX\d]+)\b",
        r"\b(?:DGMS|CMPDI|CIL|BCCL|ECL|NCL|SECL|WCL|MCL)\b",
        r"\b(?:gcv|calorific|ash\s+content|moisture)\b",
        r"\b(?:longwall|opencast|underground|OC[Pp]|UG)\b",
        r"\b(?:methane|degasification|ventilation)\b",
        r"\b(?:geotechnical|litholog|stratigraph)\b",
    ]
    found: list[str] = []
    for pat_str in keyword_patterns:
        matches = re.findall(pat_str, text, re.IGNORECASE)
        for m in matches:
            cleaned = m.strip().upper()
            if cleaned not in found:
                found.append(cleaned)
    return found[:15]


def _extract_stratigraphy(text: str) -> list[StratigraphyLayer]:
    """Attempt to extract stratigraphy table data from text."""
    layers: list[StratigraphyLayer] = []
    # Look for depth patterns with lithology descriptions
    strat_pattern = re.compile(
        r"(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*m?\s*[:\|]?\s*(.{10,80})",
        re.MULTILINE,
    )
    for i, match in enumerate(strat_pattern.finditer(text)):
        depth_from = float(match.group(1))
        depth_to = float(match.group(2))
        lithology = match.group(3).strip()
        layers.append(
            StratigraphyLayer(
                layer=f"Layer {i + 1}",
                depth_from=depth_from,
                depth_to=depth_to,
                lithology=lithology,
                rmr=50,  # Default RMR; would need domain-specific parsing
                color="#94a3b8",
            )
        )
    return layers[:20]  # Cap at 20 layers


# ---------------------------------------------------------------------------
# Main extraction pipeline
# ---------------------------------------------------------------------------


def process_document(file_path: Path, filename: str) -> ExtractionResult:
    """Process a document and extract geological/mining data.

    This is the main extraction pipeline that:
    1. Extracts raw text from the file
    2. Parses domain-specific geological data
    3. Returns a structured ExtractionResult

    Args:
        file_path: Path to the uploaded document.
        filename: Original filename of the upload.

    Returns:
        ExtractionResult with all extracted data.

    Raises:
        ValueError: If the file type is unsupported.
        IOError: If the file cannot be read.
    """
    start_time = time.time()
    doc_id = _generate_document_id(filename, file_path.read_bytes())

    try:
        raw_text, page_count = extract_text(file_path)
    except Exception as exc:
        logger.error("Text extraction failed for %s: %s", filename, exc)
        return ExtractionResult(
            document_id=doc_id,
            filename=filename,
            status=DocumentStatus.FAILED,
            raw_text_preview=f"Extraction error: {exc}",
        )

    text_length = len(raw_text)

    # Extract domain-specific data
    fos = _extract_fos(raw_text)
    gcv = _extract_gcv(raw_text)
    ash = _extract_ash(raw_text)
    seam = _extract_seam(raw_text)
    risk = _classify_risk(raw_text)
    findings = _extract_key_findings(raw_text)
    summary = _extract_executive_summary(raw_text)
    keywords = _extract_keywords(raw_text)
    stratigraphy = _extract_stratigraphy(raw_text)

    processing_time = (time.time() - start_time) * 1000

    result = ExtractionResult(
        document_id=doc_id,
        filename=filename,
        status=DocumentStatus.COMPLETED,
        page_count=page_count,
        text_length=text_length,
        seam_target=seam,
        factor_of_safety=fos,
        ash_content=ash,
        gcv=gcv,
        risk_level=risk,
        executive_summary=summary,
        key_findings=findings,
        stratigraphy=stratigraphy,
        core_lab_metrics=CoreLabMetrics(
            ash_content=ash or "N/A",
            gcv=gcv or "N/A",
        ),
        keywords=keywords,
        raw_text_preview=raw_text[:500],
        processing_time_ms=round(processing_time, 2),
        created_at=datetime.now(UTC),
    )

    logger.info(
        "Document processed: %s (%d pages, %d chars) in %.1fms",
        filename, page_count, text_length, processing_time,
    )
    return result
