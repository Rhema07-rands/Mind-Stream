from app.database import SessionLocal
from app.models.course import Course
from app.models.resource import Resource
import re

def fix_levels():
    db = SessionLocal()
    try:
        courses = db.query(Course).all()
        for course in courses:
            match = re.search(r'\d', course.code)
            extracted_level = int(match.group()) * 100 if match else 100
            if course.level != extracted_level:
                print(f"Updating course {course.code} level from {course.level} to {extracted_level}")
                course.level = extracted_level
        
        resources = db.query(Resource).all()
        for resource in resources:
            if resource.course:
                if resource.level != resource.course.level:
                    print(f"Updating resource '{resource.title}' level from {resource.level} to {resource.course.level}")
                    resource.level = resource.course.level

        db.commit()
        print("Done updating levels.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_levels()
