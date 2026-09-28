from datetime import datetime
from sqlalchemy import Column, Integer, Text, JSON, DateTime
from app.database import Base


class ContentEntry(Base):
    """
    Database model representing a saved text entry with its AI-generated
    summary and exactly three tags.
    """
    __tablename__ = "content_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    original_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    tags = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<ContentEntry id={self.id} tags={self.tags}>"
