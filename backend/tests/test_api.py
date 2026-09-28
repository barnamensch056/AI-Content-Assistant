from unittest.mock import MagicMock, patch
from app.schemas import AISummaryTags
from app.llm_service import (
    LLMTimeoutError,
    LLMMalformedResponseError,
    _normalize_and_validate_tags,
    _parse_ai_json_response,
)


def test_health_check(client):
    """Test that the health endpoint responds with 200 OK."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "ai-content-assistant"}


def test_validation_rejects_empty_and_whitespace(client):
    """Test non-AI input validation rejects empty or whitespace-only text."""
    # Empty string
    res1 = client.post("/api/entries", json={"text": ""})
    assert res1.status_code == 422

    # Whitespace only
    res2 = client.post("/api/entries", json={"text": "     \n\t   "})
    assert res2.status_code == 422


def test_validation_rejects_too_short_text(client):
    """Test validation rejects text below 5 characters."""
    res = client.post("/api/entries", json={"text": "Hi"})
    assert res.status_code == 422


@patch("app.routes.get_llm_client")
def test_create_and_retrieve_entry_success(mock_get_llm, client):
    """Test full flow: submitting text, AI parsing, saving to SQLite, and retrieving."""
    mock_client = MagicMock()
    mock_client.generate.return_value = AISummaryTags(
        summary="FastAPI is a modern, high-performance web framework for Python.",
        tags=["fastapi", "python", "backend"],
    )
    mock_get_llm.return_value = mock_client

    sample_text = "FastAPI is a modern, high-performance web framework for building APIs with Python."
    create_res = client.post("/api/entries", json={"text": sample_text})
    assert create_res.status_code == 201

    data = create_res.json()
    assert data["id"] is not None
    assert data["original_text"] == sample_text
    assert data["summary"] == "FastAPI is a modern, high-performance web framework for Python."
    assert data["tags"] == ["fastapi", "python", "backend"]
    assert "created_at" in data

    # Verify listing entries returns the created entry
    list_res = client.get("/api/entries")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) == 1
    assert items[0]["id"] == data["id"]
    assert items[0]["tags"] == ["fastapi", "python", "backend"]

    # Verify getting detail by ID returns full data
    detail_res = client.get(f"/api/entries/{data['id']}")
    assert detail_res.status_code == 200
    assert detail_res.json()["original_text"] == sample_text


def test_get_nonexistent_entry_returns_404(client):
    """Test that requesting an unknown entry ID returns HTTP 404."""
    res = client.get("/api/entries/99999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


@patch("app.routes.get_llm_client")
def test_ai_timeout_returns_504(mock_get_llm, client):
    """Test graceful handling of AI timeout errors (HTTP 504)."""
    mock_client = MagicMock()
    mock_client.generate.side_effect = LLMTimeoutError("Request exceeded timeout limit")
    mock_get_llm.return_value = mock_client

    res = client.post("/api/entries", json={"text": "Some text that triggers timeout."})
    assert res.status_code == 504
    assert "timed out" in res.json()["detail"].lower()


@patch("app.routes.get_llm_client")
def test_ai_malformed_json_returns_502(mock_get_llm, client):
    """Test graceful handling of malformed or invalid AI output (HTTP 502)."""
    mock_client = MagicMock()
    mock_client.generate.side_effect = LLMMalformedResponseError("Unparseable output")
    mock_get_llm.return_value = mock_client

    res = client.post("/api/entries", json={"text": "Some text that triggers bad JSON."})
    assert res.status_code == 502
    assert "unparseable or invalid" in res.json()["detail"].lower()


# Non-AI logic unit tests for parsing and validation
def test_normalize_and_validate_tags():
    """Unit test tag normalization: lowercase, strip '#', trim, slice down if > 3."""
    # Exact 3 with whitespace and hash symbols
    tags = [" #Python ", "FastAPI", "#machine-learning"]
    normalized = _normalize_and_validate_tags(tags)
    assert normalized == ["python", "fastapi", "machine-learning"]

    # Slice down from 4 to 3
    tags_four = ["tag1", "tag2", "tag3", "tag4"]
    assert _normalize_and_validate_tags(tags_four) == ["tag1", "tag2", "tag3"]


def test_parse_ai_json_with_code_fences():
    """Test that markdown code fences (```json ... ```) are cleanly stripped."""
    raw = '```json\n{"summary": "Test summary", "tags": ["a", "b", "c"]}\n```'
    result = _parse_ai_json_response(raw)
    assert result.summary == "Test summary"
    assert result.tags == ["a", "b", "c"]
