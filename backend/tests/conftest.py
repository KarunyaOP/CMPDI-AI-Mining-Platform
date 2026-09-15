"""Pytest configuration and shared fixtures for CMPDI backend tests."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

# Ensure the backend app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(autouse=True)
def _reset_settings() -> None:
    """Reset settings to test-friendly defaults before each test."""
    from app.core.config import Settings, settings

    # Override settings for testing
    settings.chroma_persist_dir = Path("/tmp/cmpdi_test_chroma")
    settings.upload_dir = Path("/tmp/cmpdi_test_uploads")
    settings.debug = True
    yield


@pytest.fixture
def sample_pdf_content() -> bytes:
    """Create a minimal valid PDF for testing."""
    # Minimal PDF with text content
    pdf_bytes = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]"
        b"/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
        b"4 0 obj\n"
        b"<</Length 178>>stream\n"
        b"BT\n"
        b"/F1 12 Tf\n"
        b"100 700 Td\n"
        b"(CMPDI Geotechnical Report - Joyrampur Block IV) Tj\n"
        b"0 -20 Td\n"
        b"(Factor of Safety: 1.18 on South-West Bench) Tj\n"
        b"0 -20 Td\n"
        b"(Seam IX/X at depth 72m, GCV 6840 kcal/kg, Ash 18.2%) Tj\n"
        b"0 -20 Td\n"
        b"(High risk slope instability detected) Tj\n"
        b"ET\n"
        b"endstream\n"
        b"endobj\n"
        b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
        b"xref\n0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000266 00000 n \n"
        b"0000000496 00000 n \n"
        b"trailer<</Size 6/Root 1 0 R>>\n"
        b"startxref\n573\n%%EOF"
    )
    return pdf_bytes


@pytest.fixture
def sample_text_content() -> str:
    """Sample geological text for testing extraction."""
    return (
        "CMPDI Geotechnical Slope Stability Report\n\n"
        "Executive Summary:\n"
        "Detailed analysis of Joyrampur Block-IV Open Cast Project reveals critical "
        "slope instability conditions. The Factor of Safety (FOS) has dropped to 1.18 "
        "on the South-West highwall bench, which is below the DGMS statutory minimum "
        "threshold of 1.30.\n\n"
        "Key Findings:\n"
        "1. Factor of Safety reduced to 1.18 in Bench 4B due to excessive pore water pressure.\n"
        "2. Slickensided clay gouge layer identified along Seam IX floor contact.\n"
        "3. Micro-seismic sensor detected 14 acoustic emissions in 72 hours.\n"
        "4. Recommended installation of 8 sub-horizontal drain holes.\n\n"
        "Coal Seam Analysis:\n"
        "Target Seam IX/X encountered at 72m depth. GCV measured at 6,840 kcal/kg "
        "with ash content of 18.2%. Coal classified as Prime Coking Grade Steel-I.\n\n"
        "Stratigraphy:\n"
        "0 - 14m: Weathered Sandstone & Clay (RMR 38)\n"
        "14 - 68m: Hard Compact Sandstone (RMR 74)\n"
        "68 - 72m: Weak Slickensided Shale (RMR 32)\n"
        "72 - 79.5m: Bituminous Coal Seam IX (RMR 65)\n"
        "79.5 - 135m: Massive Sandstone Bed (RMR 80)\n"
        "135 - 141.2m: High Volatile Coal Seam X (RMR 61)\n\n"
        "DGMS Compliance:\n"
        "Standard: DGMS (Tech) S&T Circular No. 04\n"
        "Status: Corrective Action Plan Mandated within 15 Days\n"
        "High risk classification assigned to this sector."
    )


@pytest.fixture
def sample_docx_content() -> bytes:
    """Create a minimal valid DOCX file for testing."""
    from docx import Document

    doc = Document()
    doc.add_heading("CMPDI Borehole Lithology Report", 0)
    doc.add_paragraph(
        "Borehole BH-JH-104 drilled on 2024-02-18 reached depth of 380m. "
        "Seam XIV encountered at top with GCV 6850 kcal/kg and ash content 18.4%. "
        "Factor of Safety calculated at 1.42 for this sector."
    )
    doc.add_paragraph(
        "RMR Rating: 68 (Class II - Good Roof). "
        "This is a medium risk location requiring standard monitoring."
    )

    import io

    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()
