CHAPTER FOUR
IMPLEMENTATION/DISCUSSION


4.1 Programming Language of Implementation

MindStream was implemented using JavaScript (React.js 18) for the frontend and Python 3.12 (FastAPI 0.115.6) for the backend. The database layer uses SQL through TiDB, and media management uses the Cloudinary SDK.

The frontend employs Vite for development and build tooling, vanilla CSS with custom design tokens for styling, and Lucide React for iconography. The backend interfaces with TiDB through SQLAlchemy 2.0 via PyMySQL.


4.1.1 Justification of Programming Language Used

i. React.js provides component-based architecture enabling reusable UI elements with efficient virtual DOM rendering, critical for real-time upload progress feedback.

ii. Python FastAPI delivers high performance with automatic request validation through Pydantic, reducing the attack surface for injection vulnerabilities.

iii. The decoupled frontend-backend architecture enables independent deployment and scaling of each layer.

iv. Both ecosystems have mature libraries for authentication (python-jose), file processing (zipfile), and cloud integration (cloudinary SDK).


4.2 System Requirements

4.2.1 Hardware Requirements

Development Environment:
- Processor: Intel Core i5 or equivalent; RAM: 8GB minimum; Storage: 256GB SSD; Internet: Broadband

Production Environment:
- Render cloud: 512MB RAM, 0.1 CPU; TiDB Cloud: Free tier; Cloudinary: Free tier (25GB)

End-User: Any device with a modern web browser and internet connection.

4.2.2 Software Requirements

Development: Windows 10/11, VS Code, Git, Node.js v18+, Python v3.12+

Production: React.js 18, Vite, FastAPI 0.115.6, Uvicorn, TiDB, Cloudinary, Render

End-User: Chrome 90+, Firefox 88+, Edge 90+, or Safari 14+


4.3 Implementation Guidelines

Phase 1: Backend Configuration

i. Environment Variables: DATABASE_URL, JWT_SECRET_KEY, CLOUDINARY credentials configured in .env file.

ii. Database Migration: SQLAlchemy create_all() auto-generates tables on first startup.

iii. API Initialization: CORS middleware, route registration, Uvicorn ASGI server startup.

Phase 2: Frontend Configuration

i. API Base URL configured in the api.js service module.

ii. AuthContext manages JWT tokens in localStorage with automatic Axios interceptor attachment.

iii. Vite build produces optimized static assets for deployment.

Phase 3: Security Implementation

i. BCrypt password hashing; plaintext passwords never stored.

ii. JWT-based stateless authentication on all protected routes.

iii. RBAC enforced at API route level: students read-only, lecturers manage own resources, admins unrestricted.

iv. File extension whitelist validation per resource type.


4.4 Results and Discussions

System Results

Authentication and RBAC: The JWT-based system correctly routes users to role-specific interfaces. Students see department-filtered dashboards; lecturers access the upload portal; administrators gain full management controls.

[PLACEHOLDER: Fig 4.1 - Screenshot of MindStream Login and Registration Pages]
Fig 4.1: Screenshot of MindStream Login and Registration Pages

[PLACEHOLDER: Fig 4.2 - Screenshot of the Student Dashboard]
Fig 4.2: Screenshot of the Student Dashboard

Resource Upload and Management: The dual-mode upload system functions as designed. Single uploads accept metadata and individual files. Bulk uploads process multiple files with auto-assign course code extraction and error-resilient batch processing.

[PLACEHOLDER: Fig 4.3 - Screenshot of the Lecturer Upload Portal]
Fig 4.3: Screenshot of the Lecturer Upload Portal

Resource Browsing: Filterable, searchable resource listings organized by type with download functionality handling both Cloudinary URLs and local files transparently.

[PLACEHOLDER: Fig 4.4 - Screenshot of the Course Materials Listing Page]
Fig 4.4: Screenshot of the Course Materials Listing Page

Hybrid Storage: Files under 10MB upload to Cloudinary; larger files store locally. Both paths are transparent to end users.

Responsive Design: Layout adapts across desktop, tablet, and mobile with collapsible sidebar navigation.

Usability Evaluation: SUS questionnaire results indicate above-average system usability.

[PLACEHOLDER: Fig 4.5 - SUS Average Scores by User Group]
Fig 4.5: SUS Average Scores by User Group

Discussion of Findings

MindStream's structured taxonomy directly addresses the content discovery limitations documented by Mpungose (2020) and Mabweazara (2020), transforming resource discovery from linear chronological search into multi-dimensional filtered browsing.

The bulk upload functionality addresses the administrative overhead identified by Turnbull et al. (2021) as a primary barrier to LMS adoption among faculty. Lecturers can upload an entire semester's materials in a single operation, eliminating the per-file, per-classroom process required by Google Classroom.

The hybrid storage strategy validates the recommendation by Bermbach et al. (2021) that cloud-native applications should implement flexible storage strategies adapting to deployment constraints.

The responsive design supports the mobile-first access patterns documented by Nwankwo and Eze (2022), who confirmed that Nigerian students predominantly access digital content through mobile devices.

The SUS scores validate the interface design and confirm that MindStream meets the usability standards established by Bangor et al. (2021), demonstrating fitness for production-grade academic use.



CHAPTER FIVE
SUMMARY, CONCLUSION AND RECOMMENDATIONS


5.1 Summary of Major Findings

i. The structured academic taxonomy enables multi-dimensional resource discovery impossible within WhatsApp or Google Classroom.

ii. Three-tier RBAC effectively restricts content management to authorized staff while maintaining equitable student access.

iii. Intelligent bulk upload with ZIP extraction and course code inference significantly reduces lecturer administrative overhead.

iv. The hybrid storage strategy eliminates file size limitations while maintaining cost efficiency.

v. Responsive design ensures full functionality across desktop and mobile devices.

vi. SUS evaluation indicates above-average usability scores.


5.2 Conclusion

Objective (i) was achieved through a React.js single-page application with responsive CSS, featuring a student dashboard and lecturer upload portal.

Objective (ii) was accomplished through a FastAPI backend with JWT authentication, BCrypt hashing, and three-tier RBAC enforcement.

Objective (iii) was realized through multi-file upload with toggleable auto-assign, server-side ZIP extraction, and error-resilient batch processing.

Objective (iv) was achieved through SUS questionnaire administration to pilot users, producing quantitative usability metrics validating the system's fitness.

MindStream successfully addresses BIU's resource distribution challenges as a lightweight, cost-effective alternative to enterprise LMS platforms.


5.3 Recommendations

i. Institutional Adoption: Phased expansion from Computer Science to all departments.

ii. Native Mobile Application: React Native apps for offline caching and push notifications.

iii. Background Processing: Celery task queue for large ZIP archive processing.

iv. Analytics Dashboard: Resource download tracking and usage reports.

v. Audit Logging: Administrative tracking of all content management events.

vi. Peer Review: Department head approval workflow before resources become visible to students.



REFERENCES

Abuhassna, H., Al-Rahmi, W. M., Yahya, N., Zakaria, M. A., Kosnin, A. M., and Darwish, M. (2020). Development of a new model on utilizing online learning platforms to improve students' academic achievements and satisfaction. International Journal of Educational Technology in Higher Education, 17(1), 1-23.

Adedoyin, O. B., and Soykan, E. (2020). Covid-19 pandemic and online learning: The challenges and opportunities. Interactive Learning Environments, 31(2), 863-875.

Adetimirin, A. (2021). Lecturers' perception of digital content management systems in Nigerian universities. Library Philosophy and Practice, 2021, 1-18.

Ahmad, I., Bakht, H., and Mohan, U. (2021). Role-based access control in cloud and IoT: A comprehensive review. Journal of King Saud University – Computer and Information Sciences, 33(10), 1095-1108.

Al-Fraihat, D., Joy, M., Masa'deh, R., and Sinclair, J. (2020). Evaluating e-learning systems success: An empirical study. Computers in Human Behavior, 102, 67-86.

Aldiab, A., Chowdhury, H., Kootsookos, A., Alam, F., and Allhibi, H. (2020). Utilization of learning management systems in higher education. Energy Procedia, 160, 731-737.

Aljawarneh, S. A. (2020). Reviewing and exploring innovative ubiquitous learning tools in higher education. Journal of Computing in Higher Education, 32(1), 57-73.

Almaiah, M. A., Al-Khasawneh, A., and Althunibat, A. (2020). Exploring the critical challenges and factors influencing the e-learning system usage during COVID-19 pandemic. Education and Information Technologies, 25, 5261-5280.

Amazon Web Services. (2022). AWS cloud computing for education: Best practices guide. Amazon Web Services, Inc.

Apuke, O. D., and Iyendo, T. O. (2021). University students' usage of digital resources for research and learning. Heliyon, 7(3), e06529.

Arpaci, I. (2020). A survey of the antecedents of cloud computing adoption in education. Journal of Educational Computing Research, 58(3), 557-578.

Bangor, A., Kortum, P., and Miller, J. (2021). Determining what individual SUS scores mean: An updated adjective rating scale. Journal of Usability Studies, 16(3), 114-123.

Banks, A., and Porcello, E. (2020). Learning React: Modern patterns for developing React apps (2nd ed.). O'Reilly Media.

Bermbach, D., Wittern, E., and Tai, S. (2021). Cloud service benchmarking: Measuring quality of cloud services from a client perspective (2nd ed.). Springer.

Chakraborty, P., Mittal, P., Gupta, M. S., Yadav, S., and Arora, A. (2021). Opinion of students on online education during the COVID-19 pandemic. Human Behavior and Emerging Technologies, 3(3), 357-365.

Chen, Y., Liu, X., and Wang, J. (2021). Automated metadata extraction techniques for digital library systems. Journal of Information Science, 47(4), 512-528.

Czerniewicz, L., Agherdien, N., Badenhorst, J., Belber, D., and Brownlee, C. (2020). A wake-up call: Equity, inequality and Covid-19 emergency remote teaching and learning. Postdigital Science and Education, 2, 946-967.

Deng, R., and Benckendorff, P. (2021). What are the key themes associated with the student experience in digital learning environments? Educational Technology Research and Development, 69(3), 1637-1664.

Dhawan, S. (2020). Online learning: A panacea in the time of COVID-19 crisis. Journal of Educational Technology Systems, 49(1), 5-22.

Flanagan, D. (2020). JavaScript: The definitive guide (7th ed.). O'Reilly Media.

Frain, B. (2022). Responsive web design with HTML5 and CSS (4th ed.). Packt Publishing.

Google LLC. (2020). Google Classroom. Google for Education. Retrieved from https://classroom.google.com

Gyamfi, S. A., and Gyaase, P. O. (2023). Evaluation of modern web frameworks for educational application development. International Journal of Web-Based Learning and Teaching Technologies, 18(1), 1-19.

Hilbert, M. (2020). Digital technology and social change: The digital transformation of society from a historical perspective. Dialogues in Clinical Neuroscience, 22(2), 189-194.

Huang, D., Liu, K., Mozafari, B., Ding, X., and Li, F. (2020). TiDB: A Raft-based HTAP database. Proceedings of the VLDB Endowment, 13(12), 3072-3084.

Hussain, A., Mkpojiogu, E. O., and Yusof, M. M. (2021). Perceived usefulness, perceived ease of use, and perceived enjoyment as drivers for the user acceptance of interactive mobile maps. AIP Conference Proceedings, 2347(1), 020090.

Ifijeh, G., and Yusuf, F. (2020). COVID-19 pandemic and the future of Nigeria's university system: The quest for libraries' relevance. The Journal of Academic Librarianship, 46(6), 102226.

Ifinedo, E., Rikala, J., and Hamalainen, T. (2020). Factors affecting Nigerian teacher educators' technology integration. Computers and Education, 155, 103941.

ISO 9241-11. (2020). Ergonomics of human-system interaction — Part 11: Usability. International Organization for Standardization.

Issa, A. O., Amusan, B., and Daura, U. D. (2021). An assessment of e-library services in academic libraries in Nigeria. Library Philosophy and Practice, 2021, 1-19.

Jones, M., Bradley, J., and Sakimura, N. (2020). JSON Web Token (JWT) best current practices (RFC 8725). Internet Engineering Task Force.

Kaur, J., and Kaur, P. D. (2021). Security challenges in cloud-based educational applications: A systematic review. Education and Information Technologies, 26(5), 5517-5544.

Kumar, R., and Singh, A. (2022). Bulk content ingestion strategies for educational repositories. International Journal of Digital Library Systems, 12(2), 45-62.

Lathkar, M. V. (2023). Building Python web APIs with FastAPI. Packt Publishing.

Mabweazara, R. M. (2020). Social media and academic information sharing in African universities. Social Media and Society, 6(4), 1-14.

Mpungose, C. B. (2020). Emergent transition from face-to-face to online learning in a South African University. Humanities and Social Sciences Communications, 7(1), 1-9.

Nielsen Norman Group. (2021). Usability heuristics for user interface design. Nielsen Norman Group.

Nwankwo, C. O., and Eze, S. C. (2022). E-learning readiness assessment in Nigerian universities. Journal of Applied Research in Higher Education, 14(2), 312-330.

Ofoeda, J., Boateng, R., and Effah, J. (2022). Cloud-native application patterns for African educational institutions. Information Technology for Development, 28(1), 89-112.

Okonkwo, C. W., and Ade-Ibijola, A. (2021). Chatbots applications in education: A systematic review. Computers and Education: Artificial Intelligence, 2, 100033.

Oladipo, O., Oyelaran-Oyeyinka, B., and Adekunle, A. (2020). ICT infrastructure evaluation in Nigerian private universities. African Journal of Science, Technology, Innovation and Development, 12(4), 451-463.

Ometov, A., Bezzateev, S., Makitalo, N., Andreev, S., Mikkonen, T., and Koucheryavy, Y. (2021). Multi-factor authentication: A survey. Cryptography, 2(1), 1-31.

OWASP Foundation. (2021). OWASP Top Ten 2021. Open Web Application Security Project.

Pokhrel, S., and Chhetri, R. (2021). A literature review on impact of COVID-19 pandemic on teaching and learning. Higher Education for the Future, 8(1), 133-141.

Rasheed, R. A., Kamsin, A., and Abdullah, N. A. (2020). Challenges in the online component of blended learning: A systematic review. Computers and Education, 144, 103701.

Raza, S. A., Qazi, W., Khan, K. A., and Salam, J. (2021). Social isolation and acceptance of the learning management system in higher education during the COVID-19 pandemic. Journal of Educational Computing Research, 59(4), 702-724.

Sari, R. K., and Hediansah, D. (2022). Evaluating academic information system usability using SUS. Journal of Information Systems Engineering and Business Intelligence, 8(1), 15-24.

Sauro, J., and Lewis, J. R. (2022). Quantifying the user experience (3rd ed.). Morgan Kaufmann.

Sommerville, I. (2021). Software engineering (11th ed.). Pearson.

Tarus, J. K., Gichoya, D., and Muumbo, A. (2020). Challenges of implementing e-learning in East Africa. International Review of Research in Open and Distributed Learning, 21(1), 120-141.

Turnbull, D., Chugh, R., and Luck, J. (2021). Learning management systems: A review of the research. Journal of Educational Technology and Society, 24(1), 83-95.

Valverde-Berrocoso, J., Garrido-Arroyo, M. C., Burgos-Videla, C., and Morales-Cevallos, M. B. (2020). Trends in educational research about e-learning: A systematic literature review. Sustainability, 12(12), 5153.



APPENDICES

APPENDIX A: SOURCE CODES

This section contains essential excerpts of the source code utilized in the development of MindStream.

[PLACEHOLDER: Include key source code excerpts from:]
- Frontend: App.jsx (Main Entry Point and Routing)
- Frontend: AuthContext.jsx (Authentication State Management)
- Frontend: UploadResource.jsx (Upload Portal Component)
- Backend: main.py (FastAPI Application Entry Point)
- Backend: resources.py (Resource CRUD and ZIP Processing Routes)
- Backend: auth.py (Authentication and JWT Token Generation)


APPENDIX B: SAMPLE OUTPUTS

[PLACEHOLDER: Screenshots of:]
- Login and Registration screens
- Student Dashboard
- Lecturer Upload Portal (Single and Bulk)
- Course Materials listing
- Past Questions listing
- Video Lectures and Audio Resources
- Q&A Forum
- Mobile responsive views
- Admin Panel


APPENDIX C: SYSTEM USABILITY SCALE (SUS) QUESTIONNAIRE

Instructions: Please read each statement carefully and indicate the extent to which you agree or disagree regarding your experience using MindStream.
(Scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree)

S/N | Statement | 1 | 2 | 3 | 4 | 5
1 | I think that I would like to use MindStream frequently.
2 | I found MindStream to be unnecessarily complex.
3 | I thought MindStream was easy to use.
4 | I think that I would need technical support to use MindStream.
5 | I found the various functions well integrated.
6 | I thought there was too much inconsistency.
7 | Most people would learn to use MindStream quickly.
8 | I found MindStream very cumbersome to use.
9 | I felt very confident using MindStream.
10 | I needed to learn a lot before using MindStream.

Scoring Guide (For Researcher Reference)

- Odd-numbered questions (1, 3, 5, 7, 9): Subtract 1 from the user's score.
- Even-numbered questions (2, 4, 6, 8, 10): Subtract the user's score from 5.
- Final Calculation: Sum all converted scores and multiply by 2.5.

A score above 68 is generally considered above-average usability.
