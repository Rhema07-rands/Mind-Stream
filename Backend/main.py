import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import engine, Base
from app.config import settings

# Import all routers
from app.routes.auth import router as auth_router
from app.routes.departments import router as departments_router
from app.routes.courses import router as courses_router
from app.routes.resources import router as resources_router
from app.routes.questions import router as questions_router
import cloudinary

if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )

# Create database tables
Base.metadata.create_all(bind=engine)

# Create upload directories
for resource_type in settings.ALLOWED_EXTENSIONS.keys():
    os.makedirs(os.path.join(settings.UPLOAD_DIR, resource_type), exist_ok=True)

app = FastAPI(
    title="BIU E-Library API",
    description="Backend API for Benson Idahosa University E-Library System",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(departments_router)
app.include_router(courses_router)
app.include_router(resources_router)
app.include_router(questions_router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "BIU E-Library API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
