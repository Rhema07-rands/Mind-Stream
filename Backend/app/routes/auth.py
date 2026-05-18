from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    UserResponse, UserUpdateRequest, MessageResponse,
)
from app.auth import (
    hash_password, verify_password, create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    # Check matric number uniqueness for students
    if data.role == "student" and data.matric_number:
        existing_matric = db.query(User).filter(User.matric_number == data.matric_number).first()
        if existing_matric:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This matric number is already registered",
            )

    # Validate student fields
    if data.role == "student":
        if not data.matric_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Matric number is required for students",
            )
        if not data.department_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department is required for students",
            )
        if not data.level:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Level is required for students",
            )

    # Validate lecturer fields
    if data.role == "lecturer" and not data.department_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department is required for lecturers",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        matric_number=data.matric_number if data.role == "student" else None,
        department_id=data.department_id,
        level=data.level if data.role == "student" else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _user_to_response(user)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login and receive a JWT access token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact admin.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=_user_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return _user_to_response(current_user)


@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.level is not None and current_user.role == "student":
        current_user.level = data.level
    db.commit()
    db.refresh(current_user)
    return _user_to_response(current_user)


def _user_to_response(user: User) -> UserResponse:
    """Convert a User ORM object to a UserResponse schema."""
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        matric_number=user.matric_number,
        role=user.role,
        department_id=user.department_id,
        department_name=user.department.name if user.department else None,
        department_code=user.department.code if user.department else None,
        level=user.level,
        is_active=user.is_active,
        created_at=user.created_at,
    )
