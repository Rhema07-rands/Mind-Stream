from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    asked_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    course = relationship("Course", back_populates="questions")
    author = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question", order_by="Answer.created_at")

    def __repr__(self):
        return f"<Question {self.title}>"
