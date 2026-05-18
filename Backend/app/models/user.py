from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    matric_number = Column(String(50), unique=True, nullable=True)  # Only for students
    role = Column(String(20), nullable=False, default="student")  # student, lecturer, admin
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    level = Column(Integer, nullable=True)  # 100-500, only for students
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    department = relationship("Department", back_populates="users")
    courses_teaching = relationship("Course", back_populates="lecturer")
    uploaded_resources = relationship("Resource", back_populates="uploader")
    questions = relationship("Question", back_populates="author")
    answers = relationship("Answer", back_populates="author")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
