from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)

    # Relationships
    users = relationship("User", back_populates="department")
    courses = relationship("Course", back_populates="department")

    def __repr__(self):
        return f"<Department {self.code} - {self.name}>"
