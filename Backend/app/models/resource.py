from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(String(20), nullable=False)  # document, video, audio, past_question
    file_path = Column(String(1000), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_extension = Column(String(10), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    thumbnail_url = Column(String(1000), nullable=True)
    duration = Column(String(20), nullable=True)
    views = Column(Integer, default=0)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    level = Column(Integer, nullable=False)
    academic_session = Column(String(20), nullable=False)  # e.g. 2024/2025
    semester = Column(String(10), nullable=False)  # First or Second
    exam_type = Column(String(20), nullable=True)  # Exam, Test, Quiz, Assignment — only for past_question
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    course = relationship("Course", back_populates="resources")
    department = relationship("Department")
    uploader = relationship("User", back_populates="uploaded_resources")

    def __repr__(self):
        return f"<Resource {self.title} ({self.resource_type})>"
