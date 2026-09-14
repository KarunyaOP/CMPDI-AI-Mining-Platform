"""Tests for document processor and OCR extraction service."""

from __future__ import annotations

import tempfile
from pathlib import Path

import pytest

from app.services.document_processor import (
    _classify_risk,
    _extract_ash,
    _extract_executive_summary,
    _extract_fos,
    _extract_gcv,
    _extract_key_findings,
    _extract_keywords,
    _extract_seam,
    _extract_stratigraphy,
    _generate_document_id,
    extract_text_from_plain,
    process_document,
)


class TestDocumentIdGeneration:
    """Tests for deterministic document ID generation."""

    def test_deterministic_id(self) -> None:
        id1 = _generate_document_id("test.pdf", b"content")
        id2 = _generate_document_id("test.pdf", b"content")
        assert id1 == id2

    def test_different_files_different_ids(self) -> None:
        id1 = _generate_document_id("a.pdf", b"content1")
        id2 = _generate_document_id("b.pdf", b"content2")
        assert id1 != id2

    def test_id_format(self) -> None:
        doc_id = _generate_document_id("test.pdf", b"data")
        assert doc_id.startswith("DOC-")
        assert len(doc_id) == 16  # DOC- + 12 hex chars


class TestRegexExtraction:
    """Tests for individual regex extraction functions."""

    def test_extract_fos_found(self) -> None:
        text = "Factor of Safety is calculated at 1.18 for the South-West bench."
        assert _extract_fos(text) == "1.18"

    def test_extract_fos_not_found(self) -> None:
        assert _extract_fos("No safety factor mentioned.") is None

    def test_extract_fos_various_formats(self) -> None:
        assert _extract_fos("FOS: 1.42") == "1.42"
        assert _extract_fos("Factor of Safety = 1.85") == "1.85"

    def test_extract_gcv_found(self) -> None:
        text = "GCV measured at 6,840 kcal/kg for prime coking coal."
        assert _extract_gcv(text) == "6,840 kcal/kg"

    def test_extract_gcv_not_found(self) -> None:
        assert _extract_gcv("No calorific data.") is None

    def test_extract_ash_found(self) -> None:
        text = "Ash content is 18.2% in Seam IX."
        assert _extract_ash(text) == "18.2%"

    def test_extract_ash_not_found(self) -> None:
        assert _extract_ash("No ash data.") is None

    def test_extract_seam_found(self) -> None:
        text = "Target Seam IX/X encountered at 72m depth."
        assert _extract_seam(text) == "Seam IX/X"

    def test_extract_seam_not_found(self) -> None:
        assert _extract_seam("No seam mentioned.") == ""

    def test_extract_seam_roman_numerals(self) -> None:
        text = "Coal Seam XIV found at 300m."
        assert _extract_seam(text) == "Seam XIV"


class TestRiskClassification:
    """Tests for risk level classification."""

    def test_high_risk(self) -> None:
        assert _classify_risk("High risk slope instability detected.") == "High"

    def test_medium_risk(self) -> None:
        assert _classify_risk("Medium risk area requiring monitoring.") == "Medium"

    def test_low_risk(self) -> None:
        assert _classify_risk("Low risk, stable conditions.") == "Low"

    def test_critical_risk(self) -> None:
        assert _classify_risk("Critical: immediate danger of collapse.") == "Critical"

    def test_default_medium(self) -> None:
        assert _classify_risk("Some random text about geology.") == "Medium"


class TestKeyFindingsExtraction:
    """Tests for key findings extraction from document text."""

    def test_numbered_findings(self) -> None:
        text = (
            "Key findings:\n"
            "1. Factor of Safety reduced to 1.18 in Bench 4B.\n"
            "2. Slickensided clay gouge layer identified.\n"
            "3. Micro-seismic sensor detected emissions.\n"
        )
        findings = _extract_key_findings(text)
        assert len(findings) >= 2
        assert any("1.18" in f for f in findings)

    def test_empty_findings(self) -> None:
        findings = _extract_key_findings("No structured data here.")
        assert isinstance(findings, list)


class TestExecutiveSummaryExtraction:
    """Tests for executive summary extraction."""

    def test_explicit_summary(self) -> None:
        text = (
            "Executive Summary:\n"
            "This report details the geotechnical analysis of Joyrampur Block IV. "
            "The Factor of Safety has been assessed at 1.18. Immediate remediation "
            "is required to flatten the bench angle from 48 to 38 degrees.\n\n"
            "Introduction section follows..."
        )
        summary = _extract_executive_summary(text)
        assert "Joyrampur" in summary
        assert "1.18" in summary

    def test_fallback_to_first_paragraph(self) -> None:
        text = (
            "This is a long enough paragraph that describes geological conditions "
            "in detail with more than one hundred characters to ensure it gets picked "
            "up as the executive summary fallback when no explicit section exists.\n\n"
            "Short."
        )
        summary = _extract_executive_summary(text)
        assert len(summary) > 50


class TestKeywordExtraction:
    """Tests for domain keyword extraction."""

    def test_mining_keywords_found(self) -> None:
        text = (
            "Slope stability analysis of Jharia coalfield BCCL operations. "
            "DGMS regulations require FOS monitoring for opencast mines."
        )
        keywords = _extract_keywords(text)
        assert any("SLOPE STABILITY" in k for k in keywords)
        assert any("DGMS" in k for k in keywords)

    def test_empty_keywords(self) -> None:
        keywords = _extract_keywords("Hello world.")
        assert isinstance(keywords, list)


class TestTextExtraction:
    """Tests for plain text extraction."""

    def test_extract_from_txt(self, tmp_path: Path) -> None:
        txt_file = tmp_path / "test.txt"
        txt_file.write_text("Hello geological world.\nLine 2.")
        text, pages = extract_text_from_plain(txt_file)
        assert "Hello geological world" in text
        assert pages >= 1

    def test_extract_empty_file(self, tmp_path: Path) -> None:
        txt_file = tmp_path / "empty.txt"
        txt_file.write_text("")
        text, pages = extract_text_from_plain(txt_file)
        assert text == ""
        assert pages >= 1


class TestStratigraphyExtraction:
    """Tests for stratigraphy layer extraction."""

    def test_extract_stratigraphy(self) -> None:
        text = (
            "Depth Profile:\n"
            "0 - 14m: Weathered Sandstone\n"
            "14 - 68m: Hard Compact Sandstone\n"
            "72 - 79.5m: Bituminous Coal Seam IX\n"
        )
        layers = _extract_stratigraphy(text)
        assert len(layers) >= 1
        assert layers[0].depth_from == 0.0


class TestProcessDocument:
    """Tests for the full document processing pipeline."""

    def test_process_text_file(self, tmp_path: Path) -> None:
        txt_file = tmp_path / "report.txt"
        txt_file.write_text(
            "CMPDI Report\n\n"
            "Factor of Safety: 1.18\n"
            "GCV: 6,840 kcal/kg\n"
            "Ash Content: 18.2%\n"
            "Seam IX/X at 72m depth\n"
            "High risk area requiring immediate attention.\n\n"
            "Key Findings:\n"
            "1. FOS below DGMS threshold of 1.30\n"
            "2. Slickensided clay layer at coal floor\n"
        )
        result = process_document(txt_file, "report.txt")
        assert result.status.value == "completed"
        assert result.factor_of_safety == "1.18"
        assert result.gcv == "6,840 kcal/kg"
        assert result.ash_content == "18.2%"
        assert result.seam_target == "Seam IX/X"
        assert result.risk_level is not None
        assert result.processing_time_ms > 0

    def test_process_empty_file(self, tmp_path: Path) -> None:
        txt_file = tmp_path / "empty.txt"
        txt_file.write_text("")
        result = process_document(txt_file, "empty.txt")
        assert result.status.value == "completed"
        assert result.text_length == 0

    def test_process_with_findings(self, tmp_path: Path) -> None:
        txt_file = tmp_path / "findings.txt"
        txt_file.write_text(
            "Report\n\n"
            "Key Findings:\n"
            "1. Detailed finding about slope instability at location A.\n"
            "2. Another finding about coal seam quality at location B.\n"
            "3. Third finding about water table levels across the region.\n"
        )
        result = process_document(txt_file, "findings.txt")
        assert len(result.key_findings) >= 2

    def test_generate_deterministic_ids(self, tmp_path: Path) -> None:
        txt_file = tmp_path / "test.txt"
        txt_file.write_text("Some content")
        r1 = process_document(txt_file, "test.txt")
        r2 = process_document(txt_file, "test.txt")
        assert r1.document_id == r2.document_id
