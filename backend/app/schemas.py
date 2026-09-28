from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field, field_validator


class TextSubmission(BaseModel):
    """Payload sent by the frontend when submitting text for analysis."""
    text: str = Field(
        ...,
        min_length=5,
        max_length=50000,
        description="The raw text block (e.g. note, article draft, transcript) to analyze."
    )

    @field_validator("text")
    @classmethod
    def validate_non_whitespace(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("Input text cannot be empty or solely whitespace.")
        return trimmed


class AISummaryTags(BaseModel):
    """Structured AI output guaranteeing a summary and exactly 3 tags."""
    summary: str = Field(..., min_length=1, description="Concise summary of the text.")
    tags: List[str] = Field(..., description="Exactly three relevant tags.")

    @field_validator("tags")
    @classmethod
    def validate_exact_three_tags(cls, tags: List[str]) -> List[str]:
        cleaned_tags = [t.strip().lstrip("#").lower() for t in tags if isinstance(t, str) and t.strip()]
        if len(cleaned_tags) != 3:
            raise ValueError(f"Expected exactly 3 tags, but got {len(cleaned_tags)}.")
        return cleaned_tags


class EntryListItem(BaseModel):
    """Lightweight schema for the entry list view."""
    id: int
    summary: str
    tags: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EntryResponse(BaseModel):
    """Full detail view schema including the original text."""
    id: int
    original_text: str
    summary: str
    tags: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
