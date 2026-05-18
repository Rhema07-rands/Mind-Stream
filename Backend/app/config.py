import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "biu-elibrary-default-secret")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "biu-jwt-default-secret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./biu_elibrary.db")

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "100"))

    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET")

    ALLOWED_EXTENSIONS: dict = {
        "document": {"pdf", "doc", "docx", "ppt", "pptx", "zip", "html", "htm", "mhtml"},
        "video": {"mp4", "webm"},
        "audio": {"mp3", "wav"},
        "past_question": {"pdf", "doc", "docx", "ppt", "pptx", "zip", "html", "htm", "mhtml"},
    }

    ALL_ALLOWED_EXTENSIONS: set = set()
    for exts in ALLOWED_EXTENSIONS.values():
        ALL_ALLOWED_EXTENSIONS |= exts

    LEVELS: list = [100, 200, 300, 400, 500]
    SEMESTERS: list = ["First", "Second"]
    EXAM_TYPES: list = ["Exam", "Test", "Quiz", "Assignment"]
    ROLES: list = ["student", "lecturer", "admin"]

    # BIU Departments - hardcoded for now
    BIU_DEPARTMENTS: list = [
        {"name": "Computer Science", "code": "CSC"},
        {"name": "Information Technology", "code": "IFT"},
        {"name": "Cyber Security", "code": "CYB"},
        {"name": "Software Engineering", "code": "SEN"},
        {"name": "Accounting", "code": "ACC"},
        {"name": "Business Administration", "code": "BUA"},
        {"name": "Economics", "code": "ECO"},
        {"name": "Banking and Finance", "code": "BFN"},
        {"name": "Mass Communication", "code": "MAC"},
        {"name": "English and Literary Studies", "code": "ELS"},
        {"name": "Political Science", "code": "POL"},
        {"name": "International Relations", "code": "IRL"},
        {"name": "Law", "code": "LAW"},
        {"name": "Medicine and Surgery", "code": "MED"},
        {"name": "Nursing Science", "code": "NUR"},
        {"name": "Medical Laboratory Science", "code": "MLS"},
        {"name": "Biochemistry", "code": "BCH"},
        {"name": "Microbiology", "code": "MCB"},
        {"name": "Biology", "code": "BIO"},
        {"name": "Physics", "code": "PHY"},
        {"name": "Mathematics", "code": "MAT"},
        {"name": "Chemistry", "code": "CHM"},
        {"name": "Architecture", "code": "ARC"},
        {"name": "Electrical and Electronics Engineering", "code": "EEE"},
        {"name": "Mechanical Engineering", "code": "MEE"},
        {"name": "Civil Engineering", "code": "CVE"},
        {"name": "Education", "code": "EDU"},
    ]


settings = Settings()
