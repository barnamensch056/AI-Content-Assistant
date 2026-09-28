import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ContentEntry
from app.schemas import TextSubmission, EntryResponse, EntryListItem
from app.llm_service import (
    get_llm_client,
    LLMTimeoutError,
    LLMMalformedResponseError,
    LLMAPIError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/entries", tags=["Content Entries"])


@router.post(
    "",
    response_model=EntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Analyze text, generate summary + 3 tags, and store entry",
)
def create_entry(
    submission: TextSubmission,
    db: Session = Depends(get_db),
):
    """
    1. Validates text submission.
    2. Sends text to LLM service.
    3. Handles failure cases (timeout, malformed output, API failure).
    4. Persists original text, summary, and 3 tags in SQLite.
    5. Returns the persisted entry.
    """
    try:
        client = get_llm_client()
        ai_result = client.generate(submission.text)
    except LLMTimeoutError as err:
        logger.warning(f"AI timeout: {err}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI service timed out while processing your request. Please try again.",
        )
    except LLMMalformedResponseError as err:
        logger.error(f"AI output malformed: {err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI model returned an unparseable or invalid response: {str(err)}",
        )
    except LLMAPIError as err:
        logger.error(f"AI API error: {err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI provider communication error: {str(err)}",
        )
    except Exception as err:
        logger.exception(f"Unexpected error during entry processing: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred while processing the text.",
        )

    # Persist in SQLite
    new_entry = ContentEntry(
        original_text=submission.text,
        summary=ai_result.summary,
        tags=ai_result.tags,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    logger.info(f"Successfully created entry ID={new_entry.id} with tags={new_entry.tags}")
    return new_entry


@router.get(
    "",
    response_model=List[EntryListItem],
    summary="List all saved entries (most recent first)",
)
def list_entries(db: Session = Depends(get_db)):
    """Fetches all saved entries for the frontend list view."""
    entries = db.query(ContentEntry).order_by(ContentEntry.created_at.desc()).all()
    return entries


@router.get(
    "/{entry_id}",
    response_model=EntryResponse,
    summary="Get full entry details by ID",
)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    """Fetches a single entry including full original text for the detail view."""
    entry = db.query(ContentEntry).filter(ContentEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entry with ID {entry_id} not found.",
        )
    return entry
