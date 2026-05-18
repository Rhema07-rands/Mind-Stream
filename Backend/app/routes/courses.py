from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.course import Course
from app.models.user import User
from app.schemas import CourseResponse, CourseCreateRequest, CourseUpdateRequest, MessageResponse
from app.auth import get_current_user, require_role, require_department_access

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.get("", response_model=list[CourseResponse])
def list_courses(
    department_id: Optional[int] = Query(None),
    level: Optional[int] = Query(None),
    semester: Optional[str] = Query(None),
    lecturer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List courses. Students only see their department's courses."""
    query = db.query(Course)

    # Students can only see their department's courses
    if current_user.role == "student":
        query = query.filter(Course.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(Course.department_id == department_id)

    if level:
        query = query.filter(Course.level == level)
    if semester:
        query = query.filter(Course.semester == semester)
    if lecturer_id:
        query = query.filter(Course.lecturer_id == lecturer_id)

    # Only show active courses to non-admins
    if current_user.role != "admin":
        query = query.filter(Course.is_active == True)

    courses = query.order_by(Course.code).all()
    return [_course_to_response(c) for c in courses]


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single course by ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Students can only view their department's courses
    if current_user.role == "student":
        require_department_access(current_user, course.department_id)

    return _course_to_response(course)


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    data: CourseCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Create a new course (admin only)."""
    existing = db.query(Course).filter(Course.code == data.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A course with this code already exists",
        )

    course = Course(
        code=data.code,
        title=data.title,
        department_id=data.department_id,
        level=data.level,
        semester=data.semester,
        lecturer_id=data.lecturer_id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return _course_to_response(course)


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    data: CourseUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Update a course (admin only)."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if data.title is not None:
        course.title = data.title
    if data.level is not None:
        course.level = data.level
    if data.semester is not None:
        course.semester = data.semester
    if data.lecturer_id is not None:
        course.lecturer_id = data.lecturer_id
    if data.is_active is not None:
        course.is_active = data.is_active

    db.commit()
    db.refresh(course)
    return _course_to_response(course)


@router.delete("/{course_id}", response_model=MessageResponse)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Delete a course (admin only)."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return MessageResponse(message="Course deleted successfully")


def _course_to_response(course: Course) -> CourseResponse:
    return CourseResponse(
        id=course.id,
        code=course.code,
        title=course.title,
        department_id=course.department_id,
        department_name=course.department.name if course.department else None,
        level=course.level,
        semester=course.semester,
        lecturer_id=course.lecturer_id,
        lecturer_name=course.lecturer.full_name if course.lecturer else None,
        is_active=course.is_active,
    )
