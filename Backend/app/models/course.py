from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)  # e.g. CSC201
    title = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    level = Column(Integer, nullable=False)  # 100-500
    semester = Column(String(10), nullable=False, default="First")  # First or Second
    lecturer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    department = relationship("Department", back_populates="courses")
    lecturer = relationship("User", back_populates="courses_teaching")
    resources = relationship("Resource", back_populates="course")
    questions = relationship("Question", back_populates="course")

    def __repr__(self):
        return f"<Course {self.code} - {self.title}>"
