from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.department import Department
from app.models.user import User
from app.schemas import DepartmentResponse, DepartmentCreateRequest, MessageResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/departments", tags=["Departments"])


@router.get("", response_model=list[DepartmentResponse])
def list_departments(
    db: Session = Depends(get_db),
):
    """List all departments. Public endpoint for registration."""
    departments = db.query(Department).order_by(Department.name).all()
    return departments


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single department by ID."""
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    data: DepartmentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Create a new department (admin only)."""
    existing = db.query(Department).filter(
        (Department.name == data.name) | (Department.code == data.code)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this name or code already exists",
        )
    dept = Department(name=data.name, code=data.code)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    data: DepartmentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Update a department (admin only)."""
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    dept.name = data.name
    dept.code = data.code
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/{department_id}", response_model=MessageResponse)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Delete a department (admin only)."""
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return MessageResponse(message="Department deleted successfully")
