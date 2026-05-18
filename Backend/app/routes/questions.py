from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.question import Question
from app.models.answer import Answer
from app.models.course import Course
from app.models.user import User
from app.schemas import (
    QuestionCreateRequest, QuestionResponse,
    AnswerCreateRequest, AnswerResponse,
    ModerateRequest, MessageResponse,
)
from app.auth import get_current_user, require_role, require_department_access

router = APIRouter(prefix="/api", tags=["Q&A Forum"])


@router.get("/courses/{course_id}/questions", response_model=list[QuestionResponse])
def list_questions(
    course_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all questions for a course. Students restricted to their department."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Department access check
    if current_user.role == "student":
        require_department_access(current_user, course.department_id)
    elif current_user.role == "lecturer" and course.lecturer_id != current_user.id:
        if current_user.department_id != course.department_id:
            raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(Question).filter(Question.course_id == course_id)
    if current_user.role != "admin":
        query = query.filter(Question.is_active == True)

    questions = query.order_by(Question.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return [_question_to_response(q) for q in questions]


@router.post("/courses/{course_id}/questions", response_model=QuestionResponse, status_code=201)
def ask_question(
    course_id: int,
    data: QuestionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ask a question in a course Q&A. Students only in their department."""
    if current_user.role not in ("student", "admin"):
        raise HTTPException(status_code=403, detail="Only students can ask questions")

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if current_user.role == "student":
        require_department_access(current_user, course.department_id)

    question = Question(
        title=data.title,
        body=data.body,
        course_id=course_id,
        asked_by=current_user.id,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return _question_to_response(question)


@router.post("/questions/{question_id}/answers", response_model=AnswerResponse, status_code=201)
def answer_question(
    question_id: int,
    data: AnswerCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Answer a question. Lecturers (assigned) and students (same dept) can answer."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    course = question.course
    if current_user.role == "student":
        require_department_access(current_user, course.department_id)
    elif current_user.role == "lecturer":
        if course.lecturer_id != current_user.id and current_user.department_id != course.department_id:
            raise HTTPException(status_code=403, detail="Access denied")

    answer = Answer(
        body=data.body,
        question_id=question_id,
        answered_by=current_user.id,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return _answer_to_response(answer)


@router.put("/questions/{question_id}/moderate", response_model=MessageResponse)
def moderate_question(
    question_id: int,
    data: ModerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Moderate a question (admin only). Toggle active/inactive."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.is_active = data.is_active
    db.commit()
    return MessageResponse(message=f"Question {'activated' if data.is_active else 'deactivated'}")


@router.put("/answers/{answer_id}/moderate", response_model=MessageResponse)
def moderate_answer(
    answer_id: int,
    data: ModerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Moderate an answer (admin only)."""
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    answer.is_active = data.is_active
    db.commit()
    return MessageResponse(message=f"Answer {'activated' if data.is_active else 'deactivated'}")


@router.delete("/questions/{question_id}", response_model=MessageResponse)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question.is_active = False
    db.commit()
    return MessageResponse(message="Question deactivated")


@router.delete("/answers/{answer_id}", response_model=MessageResponse)
def delete_answer(
    answer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    answer.is_active = False
    db.commit()
    return MessageResponse(message="Answer deactivated")


def _question_to_response(q: Question) -> QuestionResponse:
    return QuestionResponse(
        id=q.id, title=q.title, body=q.body,
        course_id=q.course_id,
        course_code=q.course.code if q.course else None,
        asked_by=q.asked_by,
        author_name=q.author.full_name if q.author else None,
        author_role=q.author.role if q.author else None,
        is_active=q.is_active, created_at=q.created_at,
        answers=[_answer_to_response(a) for a in q.answers if a.is_active],
    )


def _answer_to_response(a: Answer) -> AnswerResponse:
    return AnswerResponse(
        id=a.id, body=a.body, question_id=a.question_id,
        answered_by=a.answered_by,
        author_name=a.author.full_name if a.author else None,
        author_role=a.author.role if a.author else None,
        is_active=a.is_active, created_at=a.created_at,
    )
