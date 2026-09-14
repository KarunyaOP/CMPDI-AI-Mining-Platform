"""Application configuration with environment-based settings.

Central configuration for CMPDI AI Mining Platform backend services.
All settings are loaded from environment variables with sensible defaults.
"""

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "CMPDI AI Mining Platform"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # File Upload
    upload_dir: Path = Path("uploads")
    max_upload_size_mb: int = 100
    allowed_extensions: set[str] = {".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt", ".csv"}

    # RAG / Vector Store
    chroma_persist_dir: Path = Path("chroma_data")
    collection_name: str = "cmpdi_knowledge_base"
    embedding_model: str = "all-MiniLM-L6-v2"
    chunk_size: int = 800
    chunk_overlap: int = 100

    # Retrieval
    retrieval_top_k: int = 10
    rerank_top_n: int = 5
    min_relevance_score: float = 0.35

    # LLM (OpenAI-compatible)
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.3
    llm_max_tokens: int = 2048

    # System prompt for MineGPT
    minegpt_system_prompt: str = (
        "You are MineGPT, the specialized AI Geological & Mining Assistant for "
        "CMPDI (Central Mine Planning and Design Institute) and Coal India Limited subsidiaries. "
        "You assist with geotechnical analysis, borehole report summarization, "
        "Factor of Safety (FOS) calculations, coal seam stratigraphy, "
        "DGMS statutory audits, and mining safety compliance. "
        "Always cite your sources and respond with professional geological precision. "
        "If you are unsure, state that you don't have sufficient data rather than guessing."
    )

    model_config = {"env_prefix": "CMPDI_", "env_file": ".env", "extra": "ignore"}

    @property
    def max_upload_size_bytes(self) -> int:
        """Maximum upload file size in bytes."""
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings()
