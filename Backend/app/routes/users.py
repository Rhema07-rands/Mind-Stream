from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.resource import Resource
from app.schemas import UserResponse, MessageResponse, PasswordChangeRequest
from app.auth import get_current_user, require_role, hash_password
from sqlalchemy import text

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=list[UserResponse])
def list_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """List all users (Admin only)"""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
        
    users = query.order_by(User.created_at.desc()).all()
    from app.routes.auth import _user_to_response
    return [_user_to_response(u) for u in users]

@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Delete a user account and their associated resources (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    # Delete related resources entirely
    db.query(Resource).filter(Resource.uploaded_by == user.id).delete()
    
    # We already made answered_by and asked_by nullable with SET NULL, 
    # but to be extremely thorough we can let the DB handle it through foreign keys.
    # We previously updated the DB constraints for this.
    
    db.delete(user)
    db.commit()
    return MessageResponse(message="User account deleted successfully")

@router.put("/{user_id}/password", response_model=MessageResponse)
def change_user_password(
    user_id: int,
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Change a user's password (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = hash_password(data.password)
    db.commit()
    return MessageResponse(message="User password updated successfully")
