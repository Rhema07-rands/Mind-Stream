from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ============================================================
# AUTH SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # student, lecturer, admin
    matric_number: Optional[str] = None
    department_id: Optional[int] = None
    level: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ============================================================
# USER SCHEMAS
# ============================================================

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    matric_number: Optional[str] = None
    role: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    level: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    level: Optional[int] = None
    is_active: Optional[bool] = None

class PasswordChangeRequest(BaseModel):
    password: str


# ============================================================
# DEPARTMENT SCHEMAS
# ============================================================

class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True


class DepartmentCreateRequest(BaseModel):
    name: str
    code: str


# ============================================================
# COURSE SCHEMAS
# ============================================================

class CourseResponse(BaseModel):
    id: int
    code: str
    title: str
    department_id: int
    department_name: Optional[str] = None
    level: int
    semester: str
    lecturer_id: Optional[int] = None
    lecturer_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class CourseCreateRequest(BaseModel):
    code: str
    title: str
    department_id: int
    level: int
    semester: str = "First"
    lecturer_id: Optional[int] = None


class CourseUpdateRequest(BaseModel):
    title: Optional[str] = None
    level: Optional[int] = None
    semester: Optional[str] = None
    lecturer_id: Optional[int] = None
    is_active: Optional[bool] = None


# ============================================================
# RESOURCE SCHEMAS
# ============================================================

class ResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    resource_type: str
    file_name: str
    file_extension: str
    file_size: int
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None
    views: int = 0
    course_id: int
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    department_id: int
    department_name: Optional[str] = None
    level: int
    academic_session: str
    semester: str
    exam_type: Optional[str] = None
    uploaded_by: int
    uploader_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ResourceUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


# ============================================================
# Q&A SCHEMAS
# ============================================================

class QuestionCreateRequest(BaseModel):
    title: str
    body: str


class QuestionResponse(BaseModel):
    id: int
    title: str
    body: str
    course_id: int
    course_code: Optional[str] = None
    asked_by: int
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    is_active: bool
    created_at: datetime
    answers: Optional[List["AnswerResponse"]] = []

    class Config:
        from_attributes = True


class AnswerCreateRequest(BaseModel):
    body: str


class AnswerResponse(BaseModel):
    id: int
    body: str
    question_id: int
    answered_by: int
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ModerateRequest(BaseModel):
    is_active: bool


# ============================================================
# GENERIC
# ============================================================

class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    pages: int


# Rebuild forward refs
TokenResponse.model_rebuild()
QuestionResponse.model_rebuild()
