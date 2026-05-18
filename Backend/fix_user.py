from app.database import SessionLocal
from app.models.user import User
from app.models.department import Department

def fix_user():
    db = SessionLocal()
    # Find the CSC department
    csc_dept = db.query(Department).filter(Department.code == "CSC").first()
    if not csc_dept:
        print("Computer Science department not found!")
        return

    # Find the user
    user = db.query(User).filter(User.email == "nosakhareclinton123@gmail.com").first()
    if not user:
        print("User not found!")
        return

    user.role = "lecturer"
    user.department_id = csc_dept.id
    db.commit()
    print(f"Successfully updated user {user.email} to lecturer in {csc_dept.name}")
    db.close()

if __name__ == "__main__":
    fix_user()
