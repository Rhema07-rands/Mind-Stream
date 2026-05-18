import os
import sys
import sqlite3
import random
from datetime import datetime, timedelta, timezone

# Ensure the parent directory is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models.department import Department
from app.models.course import Course
from app.models.resource import Resource
from app.models.user import User

from sqlalchemy import text

def add_columns_safely():
    print("Checking and updating schema...")
    try:
        with engine.connect() as conn:
            # For MySQL/TiDB, ignore errors if column already exists
            try:
                conn.execute(text("ALTER TABLE resources ADD COLUMN thumbnail_url VARCHAR(1000)"))
            except Exception:
                pass
                
            try:
                conn.execute(text("ALTER TABLE resources ADD COLUMN duration VARCHAR(20)"))
            except Exception:
                pass
                
            try:
                conn.execute(text("ALTER TABLE resources ADD COLUMN views INTEGER DEFAULT 0"))
            except Exception:
                pass
            conn.commit()
    except Exception as e:
        print(f"Schema update error: {e}")

def seed_mock_data():
    db = SessionLocal()
    try:
        # 1. Get Admin User
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            print("Admin user not found. Run seed.py first.")
            return

        # 2. Get Department
        csc_dept = db.query(Department).filter(Department.code == "CSC").first()
        if not csc_dept:
            print("CSC Department not found. Run seed.py first.")
            return

        # 3. Create Mock Courses
        courses_data = [
            {"code": "CSC101", "title": "Introduction to Computer Science", "level": 100},
            {"code": "CSC201", "title": "Data Structures and Algorithms", "level": 200},
            {"code": "SEN301", "title": "Software Engineering Principles", "level": 300},
        ]
        
        courses = []
        for c_data in courses_data:
            course = db.query(Course).filter(Course.code == c_data["code"]).first()
            if not course:
                course = Course(
                    code=c_data["code"],
                    title=c_data["title"],
                    department_id=csc_dept.id,
                    level=c_data["level"],
                    semester="First",
                    is_active=True
                )
                db.add(course)
                db.commit()
                db.refresh(course)
            courses.append(course)

        # 4. Generate Mock Resources
        # Videos
        video_titles = [
            ("Advanced Algorithm Masterclass | Full Guide", "2:14:05", "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=640&q=80"),
            ("Understanding Big O Notation in 10 Minutes", "10:24", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80"),
            ("Data Structures: Trees and Graphs", "45:12", "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80"),
            ("React Frontend Architecture - Full Course", "4:32:11", "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&q=80"),
            ("System Design for Beginners", "58:40", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80"),
        ]
        
        for i, (title, dur, thumb) in enumerate(video_titles):
            course = random.choice(courses)
            existing = db.query(Resource).filter(Resource.title == title).first()
            if not existing:
                res = Resource(
                    title=title,
                    description=f"In-depth lecture covering the core concepts of {title}.",
                    resource_type="video",
                    file_path=f"uploads/video/vid_{i}.mp4",
                    file_name=f"{title.replace(' ', '_')}.mp4",
                    file_extension="MP4",
                    file_size=random.randint(15000000, 500000000),
                    course_id=course.id,
                    department_id=csc_dept.id,
                    level=course.level,
                    academic_session="2024/2025",
                    semester=course.semester,
                    uploaded_by=admin.id,
                    thumbnail_url=thumb,
                    duration=dur,
                    views=random.randint(1500, 950000),
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
                )
                db.add(res)

        # Documents (Course Materials)
        doc_titles = ["Lecture 1 Slides", "Midterm Study Guide", "Chapter 4 Reading", "Assignment 1 Rubric", "Complete Course Notes"]
        for i, title in enumerate(doc_titles):
            course = random.choice(courses)
            if not db.query(Resource).filter(Resource.title == title).first():
                res = Resource(
                    title=title,
                    description="Essential reading material.",
                    resource_type="document",
                    file_path=f"uploads/document/doc_{i}.pdf",
                    file_name=f"{title.replace(' ', '_')}.pdf",
                    file_extension="PDF",
                    file_size=random.randint(500000, 5000000),
                    course_id=course.id,
                    department_id=csc_dept.id,
                    level=course.level,
                    academic_session="2024/2025",
                    semester=course.semester,
                    uploaded_by=admin.id,
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 15))
                )
                db.add(res)

        # Past Questions
        pq_titles = ["2023 Final Exam", "2022 Midterm Questions", "2021 CA Test 1", "2020 Make-up Exam", "2019 Practice Questions"]
        for i, title in enumerate(pq_titles):
            course = random.choice(courses)
            if not db.query(Resource).filter(Resource.title == title).first():
                res = Resource(
                    title=title,
                    description="Past examination questions.",
                    resource_type="past_question",
                    file_path=f"uploads/past_question/pq_{i}.pdf",
                    file_name=f"{title.replace(' ', '_')}.pdf",
                    file_extension="PDF",
                    file_size=random.randint(200000, 1500000),
                    course_id=course.id,
                    department_id=csc_dept.id,
                    level=course.level,
                    academic_session="2024/2025",
                    semester=course.semester,
                    exam_type=random.choice(["Exam", "Test", "Quiz"]),
                    uploaded_by=admin.id,
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(100, 500))
                )
                db.add(res)

        # Audios
        audio_titles = ["Lecture Recording - Week 1", "Podcast: Tech Industry Trends", "Audio Summary Chapter 2", "Interview with Guest Lecturer", "Revision Audio Session"]
        for i, title in enumerate(audio_titles):
            course = random.choice(courses)
            if not db.query(Resource).filter(Resource.title == title).first():
                res = Resource(
                    title=title,
                    description="Audio recording for offline listening.",
                    resource_type="audio",
                    file_path=f"uploads/audio/aud_{i}.mp3",
                    file_name=f"{title.replace(' ', '_')}.mp3",
                    file_extension="MP3",
                    file_size=random.randint(1000000, 15000000),
                    course_id=course.id,
                    department_id=csc_dept.id,
                    level=course.level,
                    academic_session="2024/2025",
                    semester=course.semester,
                    uploaded_by=admin.id,
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20))
                )
                db.add(res)

        db.commit()
        print("Mock data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding mock data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_columns_safely()
    seed_mock_data()
