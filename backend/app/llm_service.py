import json
import logging
from typing import List, Tuple
import httpx
from app.config import (
    LLM_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_BASE_URL,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    LLM_TIMEOUT_SECONDS,
)
from app.schemas import AISummaryTags

logger = logging.getLogger(__name__)


# Custom Exception Classes for AI Failure Handling
class LLMServiceError(Exception):
    """Base exception for LLM operations."""
    pass


class LLMTimeoutError(LLMServiceError):
    """Raised when the LLM service exceeds configured timeout."""
    pass


class LLMMalformedResponseError(LLMServiceError):
    """Raised when the LLM response cannot be parsed or does not follow expected schema."""
    pass


class LLMAPIError(LLMServiceError):
    """Raised when an API error, authentication issue, or connection failure occurs."""
    pass


SYSTEM_PROMPT = """You are an expert AI content assistant.
Analyze the user's provided text and generate:
1. A concise summary (1-3 sentences) capturing the core ideas.
2. Exactly THREE relevant, specific tags (1-2 words each, lowercase, without '#' symbols).

You MUST respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "Your concise summary here",
  "tags": ["tag1", "tag2", "tag3"]
}
Do not include markdown code blocks, backticks, explanations, or any other text outside the JSON object.
"""


def _normalize_and_validate_tags(tags: list) -> List[str]:
    """Ensures tags are cleaned, valid strings and exactly 3 in count."""
    if not isinstance(tags, list):
        raise LLMMalformedResponseError(f"Expected 'tags' to be a list, got {type(tags).__name__}.")

    cleaned = [str(t).strip().lstrip("#").lower() for t in tags if str(t).strip()]

    # If LLM returned more than 3, take the top 3
    if len(cleaned) > 3:
        cleaned = cleaned[:3]

    if len(cleaned) != 3:
        raise LLMMalformedResponseError(
            f"Expected exactly 3 relevant tags, but LLM provided {len(cleaned)} tags: {cleaned}"
        )

    return cleaned


def _parse_ai_json_response(raw_text: str) -> AISummaryTags:
    """Parses raw LLM text into validated AISummaryTags schema."""
    cleaned_content = raw_text.strip()

    # Strip markdown code fence markers if model accidentally included them
    if cleaned_content.startswith("```"):
        lines = cleaned_content.splitlines()
        # Drop opening ```json or ``` and closing ```
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned_content = "\n".join(lines).strip()

    try:
        data = json.loads(cleaned_content)
    except json.JSONDecodeError as exc:
        logger.error(f"Failed to decode LLM JSON: {cleaned_content}")
        raise LLMMalformedResponseError(f"Invalid JSON returned by LLM: {str(exc)}") from exc

    if not isinstance(data, dict):
        raise LLMMalformedResponseError(f"Expected JSON object, got {type(data).__name__}.")

    summary = data.get("summary")
    if not summary or not isinstance(summary, str) or not summary.strip():
        raise LLMMalformedResponseError("LLM response is missing a valid 'summary' string.")

    raw_tags = data.get("tags")
    tags = _normalize_and_validate_tags(raw_tags)

    return AISummaryTags(summary=summary.strip(), tags=tags)


class BaseLLMClient:
    def generate(self, text: str) -> AISummaryTags:
        raise NotImplementedError


class OpenAILLMClient(BaseLLMClient):
    def __init__(self):
        if not OPENAI_API_KEY:
            raise LLMAPIError("OPENAI_API_KEY environment variable is not configured.")
        try:
            from openai import OpenAI
            client_kwargs = {"api_key": OPENAI_API_KEY, "timeout": LLM_TIMEOUT_SECONDS}
            if OPENAI_BASE_URL:
                client_kwargs["base_url"] = OPENAI_BASE_URL.rstrip("/")
            self._client = OpenAI(**client_kwargs)
        except ImportError as exc:
            raise LLMAPIError("OpenAI python package is not installed.") from exc

    def generate(self, text: str) -> AISummaryTags:
        try:
            from openai import APITimeoutError, APIConnectionError, APIStatusError

            create_kwargs = {
                "model": OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"TEXT TO ANALYZE:\n{text}"},
                ],
                "temperature": 0.2,
            }

            try:
                response = self._client.chat.completions.create(
                    **create_kwargs,
                    response_format={"type": "json_object"},
                )
            except APIStatusError as exc:
                # If provider doesn't support response_format / structured-outputs, retry without it
                if "structured" in str(exc).lower() or "response_format" in str(exc).lower() or exc.status_code == 400:
                    logger.warning("Provider rejected response_format, retrying without structured-outputs flag...")
                    response = self._client.chat.completions.create(**create_kwargs)
                else:
                    raise

            raw_content = response.choices[0].message.content or ""
            return _parse_ai_json_response(raw_content)

        except APITimeoutError as exc:
            logger.error("OpenAI request timed out")
            raise LLMTimeoutError("The AI service timed out while processing your text.") from exc
        except (APIConnectionError, APIStatusError) as exc:
            logger.error(f"OpenAI API error: {exc}")
            raise LLMAPIError(f"OpenAI service communication error: {str(exc)}") from exc
        except Exception as exc:
            if isinstance(exc, (LLMTimeoutError, LLMMalformedResponseError, LLMAPIError)):
                raise
            logger.error(f"Unexpected error in OpenAI client: {exc}")
            raise LLMAPIError(f"Unexpected error during AI call: {str(exc)}") from exc


class OllamaLLMClient(BaseLLMClient):
    """Local LLM client using Ollama REST API."""
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL.rstrip("/")
        self.model = OLLAMA_MODEL

    def generate(self, text: str) -> AISummaryTags:
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"TEXT TO ANALYZE:\n{text}"},
            ],
            "format": "json",
            "stream": False,
            "options": {"temperature": 0.2},
        }

        try:
            with httpx.Client(timeout=LLM_TIMEOUT_SECONDS) as client:
                response = client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                raw_content = data.get("message", {}).get("content", "")
                return _parse_ai_json_response(raw_content)

        except httpx.TimeoutException as exc:
            logger.error("Ollama request timed out")
            raise LLMTimeoutError("The local AI model timed out while processing text.") from exc
        except httpx.HTTPStatusError as exc:
            logger.error(f"Ollama HTTP error {exc.response.status_code}")
            raise LLMAPIError(f"Ollama returned HTTP error {exc.response.status_code}: {exc.response.text}") from exc
        except httpx.RequestError as exc:
            logger.error(f"Ollama connection error: {exc}")
            raise LLMAPIError(f"Unable to connect to Ollama at {self.base_url}. Ensure Ollama is running.") from exc


def get_llm_client() -> BaseLLMClient:
    """Factory returning the active LLM client based on configuration."""
    provider = LLM_PROVIDER.lower()
    if provider == "ollama":
        return OllamaLLMClient()
    return OpenAILLMClient()
