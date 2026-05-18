CHAPTER THREE
METHODOLOGY


3.1 Adopted Methodology

This project adopts the Agile Software Development Life Cycle (SDLC) methodology. As recommended by contemporary software engineering literature (Sommerville, 2021), the Agile methodology prioritizes iterative development, continuous stakeholder feedback, and adaptive planning. Agile was selected because the requirements for an academic e-library are inherently dynamic, and the iterative approach enables successive prototypes to be tested and refined based on user feedback.

The development process was organized into the following phases:

i. Requirements Analysis: Identification of user roles, functional requirements, and evaluation of the existing baseline system.

ii. System Architecture and Design: Translation of requirements into UML diagrams, database schemas, and API specifications.

iii. Implementation: Iterative construction of the frontend, backend API, database layer, and cloud media integration.

iv. Testing and Data Collection: System testing with pilot users and collection of usability data through SUS questionnaires.

v. Deployment: Final deployment to production cloud infrastructure.


3.2 Analysis of the Existing System

The existing system evaluated as the baseline is Google Classroom, a cloud-based LMS developed by Google LLC (2020). Google Classroom was selected because several lecturers within the Faculty of Computing have experimented with it for sharing course materials, making it the closest approximation to an institutionally adopted digital platform.

When a lecturer accesses Google Classroom, they can create virtual classrooms, invite students, and post announcements with attached files. However, Google Classroom was designed as a general-purpose classroom management tool, not as a specialized academic resource repository. Its architecture treats course materials as ancillary attachments to announcements rather than first-class, searchable entities within a structured taxonomy.

The platform provides no dedicated past examination question section, no cross-classroom resource discovery, no department-level filtering, and no bulk upload processing capability.

[PLACEHOLDER: Fig 3.1 - Architectural Model of the Existing System (Google Classroom)]
Fig 3.1: Architectural Model of the Existing System (Google Classroom)


3.2.1 Limitations or Drawbacks of the Existing System

i. Absence of Structured Resource Taxonomy: Google Classroom does not categorize resources by type, academic session, semester, or exam type.

ii. No Department-Level Discovery: Students cannot browse resources across their entire department; the per-classroom model prevents cross-course discovery.

iii. No Bulk Upload or Automated Processing: Lecturers must upload files individually to each classroom with no ZIP processing or automated metadata extraction.

iv. No Past Question Repository: No dedicated section for past questions filterable by exam type, session, and semester.

v. Limited Role Granularity: Does not support a three-tier RBAC model (student, lecturer, administrator).

vi. External Dependency: Entirely controlled by Google LLC with no institutional control over data governance.


3.3 Analysis of the Proposed System

MindStream is a web-based academic e-library specifically engineered to address the content distribution challenges at BIU. Unlike Google Classroom, MindStream elevates resources to first-class entities within a structured academic taxonomy. Each resource is associated with a course code, department, level, semester, academic session, and resource type.

The system utilizes React.js with Vite for the frontend, Python FastAPI for the backend REST API, TiDB for data persistence, and Cloudinary for media storage. It implements three-tier RBAC: students browse and download; lecturers upload, edit, and delete their resources; administrators have full system oversight.


3.3.1 Preliminary Design

MindStream employs a 3-Tier Client-Server architecture:

i. Presentation Layer: React.js single-page application with responsive CSS for desktop and mobile. Features role-specific interfaces for students, lecturers, and administrators.

ii. Application Logic Layer: Python FastAPI backend handling authentication (JWT), RBAC enforcement, resource CRUD, ZIP extraction, course code inference, and Cloudinary orchestration.

iii. Data and Media Layer: TiDB database for structured data storage. Cloudinary for files under 10MB; local server storage for larger files (hybrid strategy).

[PLACEHOLDER: Fig 3.2 - High-Level Architectural Model of the Proposed System (MindStream)]
Fig 3.2: High-Level Architectural Model of the Proposed System (MindStream)

Design Algorithm for Resource Upload Workflow:

START

1. Lecturer authenticates using email and password.
2. IF authentication fails, display error message.
3. ELSE IF user role == 'student', redirect to dashboard (upload denied).
4. ELSE IF user role == 'lecturer' OR 'admin':
5.     Display Upload Portal with Single and Bulk Upload sections.
6.     IF Single Upload selected:
7.         Fill metadata, select file, validate extension, upload, create record.
8.     ELSE IF Bulk Upload selected:
9.         Select multiple files; toggle auto-assign on/off.
10.        FOR EACH file: validate, upload, create record, report status.
11.        Display results summary.

END


3.3.2 Proposed System Justification

i. Purpose-Built Taxonomy: Every resource is categorized by type, course, department, level, semester, and session.

ii. Department-Aware Discovery: Students see a unified dashboard aggregating resources across all courses in their department.

iii. Intelligent Bulk Processing: ZIP extraction with automated course code inference reduces lecturer workload dramatically.

iv. Institutional Data Sovereignty: All data resides on university-controlled infrastructure.

v. Three-Tier RBAC: Granular access control beyond what Google Classroom provides.


3.3.3 Benefits of the Proposed System

i. Benefits to Students: Equitable access to all materials through a searchable interface, eliminating WhatsApp dependency.

ii. Benefits to Lecturers: Professional content management portal with bulk upload that replaces manual distribution.

iii. Benefits to the Institution: Branded digital platform enhancing technological profile and supporting accreditation.


3.4 System Design

3.4.1 Proposed System Modelling (UML)

Use Case Diagram

[PLACEHOLDER: Fig 3.3 - Use Case Diagram of the Proposed System]
Fig 3.3: Use Case Diagram of the Proposed System

Activity Diagram

[PLACEHOLDER: Fig 3.4 - Activity Diagram for Uploading a Resource]
Fig 3.4: Activity Diagram for Uploading a Resource

Entity Relationship Diagram (ERD)

[PLACEHOLDER: Fig 3.5 - Entity Relationship Diagram]
Fig 3.5: Entity Relationship Diagram

Sequence Diagram

[PLACEHOLDER: Fig 3.6 - Sequence Diagram for Bulk Upload Processing]
Fig 3.6: Sequence Diagram for Bulk Upload Processing

Data Flow Diagram (DFD)

[PLACEHOLDER: Fig 3.7 - Data Flow Diagram (Level 0 Context Diagram)]
Fig 3.7: Data Flow Diagram (Level 0 Context Diagram)

[PLACEHOLDER: Fig 3.8 - Data Flow Diagram (Level 1)]
Fig 3.8: Data Flow Diagram (Level 1)


3.5 Database Design

The system utilizes TiDB (MySQL-compatible) with SQLAlchemy ORM. The primary tables are described in Table 3.1.

Table 3.1: Database Schema and Table Descriptions

Table / Entity | Purpose / Description | Attributes (Data Types and Constraints)
i. Users | Authentication and profile storage for all actors. | id (INTEGER): PK; email (VARCHAR 255): Unique; password_hash (VARCHAR 255): BCrypt; full_name (VARCHAR 255); matric_number (VARCHAR 50): Nullable; role (VARCHAR 20): student/lecturer/admin; department_id (INTEGER): FK; level (INTEGER): Nullable; is_active (BOOLEAN); created_at (DATETIME).
ii. Departments | Organizational units of the university. | id (INTEGER): PK; name (VARCHAR 255); code (VARCHAR 10): Unique (e.g., CSC).
iii. Courses | Academic courses mapped to departments. | id (INTEGER): PK; code (VARCHAR 20): Unique; title (VARCHAR 255); department_id (INTEGER): FK; level (INTEGER); semester (VARCHAR 10); lecturer_id (INTEGER): FK Nullable; is_active (BOOLEAN).
iv. Resources | Metadata and file references for uploaded materials. | id (INTEGER): PK; title (VARCHAR 500); description (TEXT); resource_type (VARCHAR 20); file_path (VARCHAR 1000); file_name (VARCHAR 500); file_extension (VARCHAR 10); file_size (INTEGER); course_id (INTEGER): FK; department_id (INTEGER): FK; level (INTEGER); academic_session (VARCHAR 20); semester (VARCHAR 10); exam_type (VARCHAR 20): Nullable; uploaded_by (INTEGER): FK; is_active (BOOLEAN); created_at (DATETIME).
v. Questions | Q&A forum questions. | id (INTEGER): PK; title (VARCHAR 500); content (TEXT); course_id (INTEGER): FK; author_id (INTEGER): FK; is_resolved (BOOLEAN); created_at (DATETIME).
vi. Answers | Responses to forum questions. | id (INTEGER): PK; content (TEXT); question_id (INTEGER): FK; author_id (INTEGER): FK; is_accepted (BOOLEAN); created_at (DATETIME).


3.6 Input/Output Specification

Input Specifications

i. Authentication Inputs: Email, password, full name, role selection, department, level (students), matric number (students).

ii. Single Upload Inputs: Title, description, course code, resource type, academic session, semester, exam type (past questions), file selection.

iii. Bulk Upload Inputs: Resource type, semester, session, auto-assign toggle, optional manual course code, multi-file selection.

iv. Search/Filter Inputs: Text query, resource type, level, course, semester, exam type dropdowns.

Output Specifications

i. Dashboard: Statistics cards, recently added resources list.

ii. Resource Listings: Paginated, filterable resource cards with download buttons.

iii. Upload Confirmations: Success/error alerts for single uploads; per-file status for bulk uploads.

iv. Downloads: Cloudinary redirect or direct file response with original filename.


3.7 Cost Analysis

Table 3.2: Summary of Estimated Software Setup Costs

Components / Services | Estimated Cost (Naira)
Cloud Backend Hosting (Render - Free Tier) | Free
Distributed Database (TiDB Cloud - Free Tier) | Free
Media Management (Cloudinary - Free Tier) | Free
Frontend Hosting (Render/Vercel - Free Tier) | Free
Development Tools (VS Code, Git) | Free (Open Source)
Internet Data Costs (Development Period) | N30,000
Domain Name (Optional) | N5,000
Total Estimated Cost | N35,000
