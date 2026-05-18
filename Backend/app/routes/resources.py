import os
import uuid
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.resource import Resource
from app.models.course import Course
from app.models.user import User
from app.schemas import ResourceResponse, ResourceUpdateRequest, MessageResponse
from app.auth import get_current_user, require_role, require_department_access
from app.config import settings

router = APIRouter(prefix="/api/resources", tags=["Resources"])


@router.get("/stats")
def resource_stats(
    department_id: Optional[int] = Query(None),
    level: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return counts of resources by type, filtered by department and level."""
    from sqlalchemy import func

    dept_id = current_user.department_id if current_user.role in ["student", "lecturer"] else department_id
    user_level = current_user.level if current_user.role == "student" else level

    base = db.query(Resource.resource_type, func.count(Resource.id))
    if dept_id:
        base = base.filter(Resource.department_id == dept_id)
    if user_level:
        base = base.filter(Resource.level == user_level)
    base = base.filter(Resource.is_active == True)

    rows = base.group_by(Resource.resource_type).all()
    counts = {rtype: cnt for rtype, cnt in rows}

    return {
        "documents": counts.get("document", 0),
        "past_questions": counts.get("past_question", 0),
        "videos": counts.get("video", 0),
        "audios": counts.get("audio", 0),
    }


@router.get("", response_model=list[ResourceResponse])
def list_resources(
    resource_type: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    level: Optional[int] = Query(None),
    course_id: Optional[int] = Query(None),
    academic_session: Optional[str] = Query(None),
    semester: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List resources with filtering."""
    query = db.query(Resource)

    if current_user.role == "student":
        query = query.filter(Resource.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(Resource.department_id == department_id)

    if resource_type:
        query = query.filter(Resource.resource_type == resource_type)
    if level:
        query = query.filter(Resource.level == level)
    if course_id:
        query = query.filter(Resource.course_id == course_id)
    if academic_session:
        query = query.filter(Resource.academic_session == academic_session)
    if semester:
        query = query.filter(Resource.semester == semester)
    if exam_type:
        query = query.filter(Resource.exam_type == exam_type)
    if search:
        query = query.filter(Resource.title.ilike(f"%{search}%"))

    if current_user.role != "admin":
        query = query.filter(Resource.is_active == True)

    resources = query.order_by(Resource.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return [_resource_to_response(r) for r in resources]


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if current_user.role == "student":
        require_department_access(current_user, resource.department_id)
    return _resource_to_response(resource)


@router.get("/{resource_id}/download")
def download_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if current_user.role == "student":
        require_department_access(current_user, resource.department_id)
        
    if resource.file_path.startswith("http"):
        return RedirectResponse(url=resource.file_path)

    if not os.path.exists(resource.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(path=resource.file_path, filename=resource.file_name, media_type="application/octet-stream")


@router.post("", status_code=201)
def upload_resource(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(""),
    resource_type: str = Form(...),
    course_code: str = Form(...),
    academic_session: str = Form(...),
    semester: str = Form(...),
    exam_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import zipfile
    import io

    if current_user.role == "student":
        raise HTTPException(status_code=403, detail="Students cannot upload resources")

    valid_types = ["document", "video", "audio", "past_question"]
    if resource_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid resource type. Must be one of: {', '.join(valid_types)}")

    if resource_type == "past_question" and not exam_type:
        raise HTTPException(status_code=400, detail="Exam type is required for past questions")

    # Clean the course code
    course_code = course_code.strip().upper().replace(" ", "")[:20]

    course = db.query(Course).filter(Course.code == course_code).first()
    if not course:
        import re
        match = re.search(r'\d', course_code)
        extracted_level = int(match.group()) * 100 if match else 100

        # Create course dynamically
        course = Course(
            code=course_code,
            title=f"{course_code} Course",
            department_id=current_user.department_id,
            level=extracted_level,
            semester=semester,
            lecturer_id=current_user.id,
            is_active=True
        )
        db.add(course)
        db.commit()
        db.refresh(course)
    elif current_user.role == "lecturer" and course.lecturer_id and course.lecturer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This course is assigned to another lecturer")
    elif current_user.role == "lecturer" and not course.lecturer_id:
        course.lecturer_id = current_user.id
        db.commit()

    file_ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    
    # Infer extension from content type if missing
    if not file_ext and file.content_type:
        mime_map = {
            "application/pdf": "pdf",
            "application/msword": "doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
            "application/vnd.ms-powerpoint": "ppt",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
            "application/zip": "zip",
            "application/x-zip-compressed": "zip",
            "text/html": "html",
            "video/mp4": "mp4",
            "audio/mpeg": "mp3",
            "audio/wav": "wav"
        }
        file_ext = mime_map.get(file.content_type, "")

    allowed = settings.ALLOWED_EXTENSIONS.get(resource_type, set())
    if file_ext not in allowed:
        ext_display = f".{file_ext}" if file_ext else "with no extension (and unknown MIME type)"
        raise HTTPException(status_code=400, detail=f"File {ext_display} not allowed for {resource_type}")

    content = file.file.read()
    file_size = len(content)

    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    # ----- ZIP extraction logic -----
    if file_ext == "zip":
        try:
            zip_buffer = io.BytesIO(content)
            zf = zipfile.ZipFile(zip_buffer)
        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Uploaded file is not a valid ZIP archive")

        # Derive a clean group title from the ZIP filename itself
        import re
        zip_base = os.path.splitext(file.filename)[0]
        # Extract course-like prefix (e.g. "CSC 421" from "CSC 421-20260518T022604Z-3-001")
        prefix_match = re.match(r'^([A-Za-z]+\s*\d{3})', zip_base)
        zip_title = prefix_match.group(1).strip() if prefix_match else zip_base.split('-')[0].strip()

        # Determine which inner extensions are valid (exclude zip itself to avoid recursion)
        inner_allowed = allowed - {"zip"}
        created_resources = []
        skipped = []

        for idx, entry_name in enumerate(zf.namelist()):
            # Skip directories and hidden/system files
            if entry_name.endswith("/") or entry_name.startswith("__MACOSX") or entry_name.startswith("."):
                continue

            inner_ext = entry_name.rsplit(".", 1)[-1].lower() if "." in entry_name else ""
            if inner_ext not in inner_allowed:
                skipped.append(entry_name)
                continue

            inner_content = zf.read(entry_name)
            inner_size = len(inner_content)
            base_name = os.path.basename(entry_name)
            # Title: use ZIP name + file index for multiple files, or just ZIP name for single
            inner_title = zip_title

            try:
                # Cloudinary free tier limit is typically 10MB for documents. Fallback to local storage for larger files.
                if settings.CLOUDINARY_CLOUD_NAME and inner_size <= 10 * 1024 * 1024:
                    inner_buffer = io.BytesIO(inner_content)
                    upload_result = cloudinary.uploader.upload(
                        inner_buffer,
                        resource_type="auto",
                        folder=f"biu_elibrary/{resource_type}"
                    )
                    inner_file_path = upload_result['secure_url']
                else:
                    upload_dir = os.path.join(settings.UPLOAD_DIR, resource_type)
                    os.makedirs(upload_dir, exist_ok=True)
                    unique_filename = f"{uuid.uuid4().hex}_{base_name}"
                    inner_file_path = os.path.join(upload_dir, unique_filename)
                    with open(inner_file_path, "wb") as f:
                        f.write(inner_content)

                resource = Resource(
                    title=inner_title, description=description, resource_type=resource_type,
                    file_path=inner_file_path, file_name=base_name, file_extension=inner_ext,
                    file_size=inner_size, course_id=course.id, department_id=course.department_id,
                    level=course.level, academic_session=academic_session, semester=semester,
                    exam_type=exam_type if resource_type == "past_question" else None,
                    uploaded_by=current_user.id,
                )
                db.add(resource)
                created_resources.append(resource)
            except Exception as e:
                skipped.append(f"{entry_name} (upload error: {str(e)[:80]})")
                continue

        if not created_resources:
            raise HTTPException(status_code=400, detail=f"ZIP contained no valid files. Allowed types: {', '.join(inner_allowed)}")

        db.commit()
        for r in created_resources:
            db.refresh(r)

        return {
            "message": f"Successfully extracted and uploaded {len(created_resources)} file(s) from ZIP.",
            "uploaded_count": len(created_resources),
            "skipped_count": len(skipped),
            "resources": [_resource_to_response(r).model_dump() for r in created_resources],
        }

    # ----- Single file upload (non-ZIP) -----
    upload_dir = os.path.join(settings.UPLOAD_DIR, resource_type)
    os.makedirs(upload_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Cloudinary free tier limits images/documents to 10MB. Fallback to local storage for large files.
    if settings.CLOUDINARY_CLOUD_NAME and file_size <= 10 * 1024 * 1024:
        file.file.seek(0)
        try:
            upload_result = cloudinary.uploader.upload(
                file.file,
                resource_type="auto",
                folder=f"biu_elibrary/{resource_type}"
            )
            file_path = upload_result['secure_url']
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cloudinary upload failed: {str(e)}")
    else:
        with open(file_path, "wb") as f:
            f.write(content)

    resource = Resource(
        title=title, description=description, resource_type=resource_type,
        file_path=file_path, file_name=file.filename, file_extension=file_ext,
        file_size=file_size, course_id=course.id, department_id=course.department_id,
        level=course.level, academic_session=academic_session, semester=semester,
        exam_type=exam_type if resource_type == "past_question" else None,
        uploaded_by=current_user.id,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return _resource_to_response(resource)


@router.patch("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    body: ResourceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Allow lecturers to edit their own uploads, admins can edit any."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if current_user.role == "student":
        raise HTTPException(status_code=403, detail="Students cannot edit resources")
    if current_user.role == "lecturer" and resource.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own uploads")

    if body.title is not None:
        resource.title = body.title
    if body.description is not None:
        resource.description = body.description
    db.commit()
    db.refresh(resource)
    return _resource_to_response(resource)


@router.delete("/{resource_id}", response_model=MessageResponse)
def delete_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Allow lecturers to delete their own uploads, admins can delete any."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if current_user.role == "student":
        raise HTTPException(status_code=403, detail="Students cannot delete resources")
    if current_user.role == "lecturer" and resource.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own uploads")
    resource.is_active = False
    db.commit()
    return MessageResponse(message="Resource deleted successfully")


def _resource_to_response(resource: Resource) -> ResourceResponse:
    return ResourceResponse(
        id=resource.id, title=resource.title, description=resource.description,
        resource_type=resource.resource_type, file_name=resource.file_name,
        file_extension=resource.file_extension, file_size=resource.file_size,
        course_id=resource.course_id,
        course_code=resource.course.code if resource.course else None,
        course_title=resource.course.title if resource.course else None,
        department_id=resource.department_id,
        department_name=resource.department.name if resource.department else None,
        level=resource.level, academic_session=resource.academic_session,
        semester=resource.semester, exam_type=resource.exam_type,
        uploaded_by=resource.uploaded_by,
        uploader_name=resource.uploader.full_name if resource.uploader else None,
        is_active=resource.is_active, created_at=resource.created_at,
    )
