import os
import sys

# Ensure the parent directory is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.department import Department
from app.models.user import User
from app.models.course import Course
from app.auth import hash_password
from app.config import settings

def seed_database():
    print("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Seed Departments
        print("Seeding departments...")
        for dept_data in settings.BIU_DEPARTMENTS:
            existing = db.query(Department).filter(Department.code == dept_data["code"]).first()
            if not existing:
                dept = Department(name=dept_data["name"], code=dept_data["code"])
                db.add(dept)
        db.commit()
        
        # Seed Admin User
        print("Seeding admin user...")
        admin_email = "admin@biu.edu.ng"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            admin_user = User(
                email=admin_email,
                password_hash=hash_password("admin123"),
                full_name="System Administrator",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"Created default admin: {admin_email} / admin123")
        else:
            print("Admin user already exists.")
            
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
