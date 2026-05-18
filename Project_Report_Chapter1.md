DEVELOPMENT OF A WEB-BASED ACADEMIC E-LIBRARY AND RESOURCE MANAGEMENT SYSTEM FOR BENSON IDAHOSA UNIVERSITY



BY



DEREK-AYEMERE RHEMA OSEGODUWA
SCN/CSC/220880



DEPARTMENT OF COMPUTER SCIENCE, FACULTY OF COMPUTING,
BENSON IDAHOSA UNIVERSITY, BENIN CITY, EDO STATE, NIGERIA



JUNE, 2026



---



DEVELOPMENT OF A WEB-BASED ACADEMIC E-LIBRARY AND RESOURCE MANAGEMENT SYSTEM FOR BENSON IDAHOSA UNIVERSITY



BY



DEREK-AYEMERE RHEMA OSEGODUWA
SCN/CSC/220880



A PROJECT WORK

PRESENTED TO THE DEPARTMENT OF COMPUTER SCIENCE, FACULTY OF COMPUTING, IN PARTIAL FULFILMENT OF THE REQUIREMENTS FOR THE AWARD OF BACHELOR DEGREE OF SCIENCE (B.Sc.) IN COMPUTER SCIENCE OF BENSON IDAHOSA UNIVERSITY, BENIN CITY, EDO STATE, NIGERIA



JUNE, 2026



---



DECLARATION

I, Derek-Ayemere Rhema Osegoduwa, hereby declare that this project work was carried out by me under the supervision of Mr. Melvin Omoraro, in the Department of Computer Science, Benson Idahosa University. This work is original and has not been submitted elsewhere for the award of a degree. All sources of information used have been duly acknowledged by means of references.



DEREK-AYEMERE RHEMA OSEGODUWA	DATE (STUDENT)



---



CERTIFICATION

This is to certify that Derek-Ayemere Rhema Osegoduwa matriculation number SCN/CSC/220880 carried out this project work. In partial fulfilment of the award of Bachelor Degree (BSC) in computer science of Benson Idahosa University, Benin City, Edo State, Nigeria.



DEREK-AYEMERE RHEMA OSEGODUWA	DATE (STUDENT)


_________________________
MR. MELVIN OMORARO	DATE
(PROJECT SUPERVISOR)



---



APPROVAL

This project work titled "Development of a Web-Based Academic E-Library and Resource Management System for Benson Idahosa University" by Derek-Ayemere Rhema Osegoduwa with Mat No: SCN/CSC/220880 has been examined and approved as meeting the requirements for the award of Bachelor of Science (B.Sc.) in Computer Science.



Internal Examiner	Date

External Examiner	Date

Head of Department	Date



---



DEDICATION

This work is dedicated to Almighty God, whose infinite wisdom and grace has been my constant guide throughout this journey. His love, protection and blessings is the only reason for the completion of this project and my academic pursuit.



---



ACKNOWLEDGMENTS

I wish to express my profound gratitude to the Almighty GOD for bestowing upon me the gift of life, wisdom, and grace, which enabled me to successfully complete this project report.

I am deeply grateful to my supervisor, Mr. Melvin Omoraro for his leadership and guidance.

I extend my sincere appreciation to the Head of Department, Dr Sunday Agu and my dedicated lecturers Prof K.O Obahiagbon, Mrs Iriagbonse A. Inyang, Mrs. Cynthia Orie, and Mr. Oyeyemi, for their invaluable contributions to my academic journey.

My heartfelt thanks goes to my father Mr Mukoro and my siblings for their unwavering love, care and support throughout this journey.

I also sincerely appreciate all friends and colleagues who contributed their time, support, and encouragement toward the successful completion of this work.



---



ABSTRACT

The fragmented distribution of academic course materials across informal channels such as WhatsApp groups and physical flash drives presents significant barriers to equitable learning at Benson Idahosa University. This project presents the design and development of MindStream, a web-based academic e-library and resource management system that provides a centralized, department-specific digital repository for course materials, past examination questions, video lectures, and audio resources. The system was developed using the Agile Software Development Life Cycle (SDLC) methodology, employing React.js with Vite for the frontend presentation layer, Python FastAPI for the backend application logic, TiDB (a distributed MySQL-compatible database) for persistent data storage, and Cloudinary for scalable cloud-based media asset management. MindStream implements role-based access control (RBAC) distinguishing between student, lecturer, and administrator privileges, alongside intelligent bulk upload processing with automated ZIP archive extraction and course code inference from filenames. The system was evaluated using the System Usability Scale (SUS) questionnaire administered to a pilot group of students and lecturers within the Department of Computer Science. Results indicate that MindStream significantly reduces the time required for students to locate relevant academic resources while providing lecturers with an efficient, self-service content management portal.



---



TABLE OF CONTENTS

Cover Page	i
Title Page	ii
Declaration	iii
Certification	iv
Approval	v
Dedication	vi
Acknowledgments	vii
Abstract	viii
Table of Contents	ix
List of Figures	xi
List of Tables	xii

CHAPTER ONE: INTRODUCTION
1.1 Background to the Study	1
1.2 Statement of the Problem	3
1.3 Aim and Objectives of the Study	4
1.4 Scope of the Study	5
1.5 Significance of the Study	6
1.6 Limitations of the Study	7
1.7 Definition of Terms	8

CHAPTER TWO: LITERATURE REVIEW
2.1 Introduction	9
2.2 Related Works	13
2.3 Summary of Related Works	25

CHAPTER THREE: METHODOLOGY
3.1 Adopted Methodology	30
3.2 Analysis of the Existing System	31
3.2.1 Limitations or Drawbacks of the Existing System	33
3.3 Analysis of the Proposed System	34
3.3.1 Preliminary Design	35
3.3.2 Proposed System Justification	37
3.3.3 Benefits of the Proposed System	38
3.4 System Design	39
3.4.1 Proposed System Modelling (UML)	40
3.5 Database Design	44
3.6 Input/Output Specification	47
3.7 Cost Analysis	49

CHAPTER FOUR: IMPLEMENTATION/DISCUSSION
4.1 Programming Language of Implementation	50
4.1.1 Justification of Programming Language Used	51
4.2 System Requirements	52
4.3 Implementation Guidelines	53
4.4 Results and Discussions	55

CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS
5.1 Summary of Major Findings	60
5.2 Conclusion	61
5.3 Recommendations	62

REFERENCES	63

APPENDICES
Appendix A: Source Codes	67
Appendix B: Sample Outputs	70
Appendix C: System Usability Scale (SUS) Questionnaire	73



---



LIST OF FIGURES

Fig	Page
Fig 3.1: Architectural Model of the Existing System (Google Classroom)	32
Fig 3.2: High-Level Architectural Model of the Proposed System (MindStream)	36
Fig 3.3: Use Case Diagram of the Proposed System	40
Fig 3.4: Activity Diagram for Uploading a Resource	41
Fig 3.5: Entity Relationship Diagram	42
Fig 3.6: Sequence Diagram for Bulk Upload Processing	43
Fig 3.7: Data Flow Diagram (Level 0 Context Diagram)	43
Fig 3.8: Data Flow Diagram (Level 1)	44
Fig 4.1: Screenshot of MindStream Login and Registration Pages	55
Fig 4.2: Screenshot of the Student Dashboard	56
Fig 4.3: Screenshot of the Lecturer Upload Portal	57
Fig 4.4: Screenshot of the Course Materials Listing Page	57
Fig 4.5: SUS Average Scores by User Group	58

LIST OF TABLES

Table 2.1: Summary of Related Works on E-Learning and Digital Library Systems	25
Table 3.1: Database Schema and Table Descriptions	45
Table 3.2: Summary of Estimated Software Setup Costs	49



---



CHAPTER ONE
INTRODUCTION


1.1 Background to the Study

The global education sector has undergone a profound transformation driven by the rapid adoption of Information and Communication Technology (ICT) within academic institutions. Traditional models of knowledge dissemination, which relied upon physical textbooks and face-to-face library interactions, are being progressively supplanted by digital learning platforms and electronic resource repositories (Aljawarneh, 2020). Cloud computing, high-speed internet connectivity, and modern web frameworks have created unprecedented opportunities for universities to centralize and distribute academic content at scale (Aldiab et al., 2020).

The evolution from static document repositories to dynamic, interactive learning management ecosystems represents a paradigm shift in higher education. Modern e-library systems encompass not merely digitized texts, but also multimedia resources including video lectures, audio recordings, and collaborative discussion forums (Ifijeh and Yusuf, 2020). Learning Management Systems such as Moodle, Blackboard, and Google Classroom have achieved widespread adoption in Western universities, but their deployment in developing nations remains constrained by infrastructure costs, bandwidth limitations, and administrative complexity (Turnbull et al., 2021).

In the Nigerian higher education context, the adoption of digital library systems has been markedly slower. Issa et al. (2021) documented that fewer than 40% of Nigerian universities had implemented any form of institutionally managed digital learning platform, with the majority relying on informal distribution channels. The primary mechanism for sharing lecture notes, past examination questions, and supplementary materials remains WhatsApp group chats (Mabweazara, 2020). This reliance introduces critical deficiencies: absence of structured content taxonomy, file size restrictions, information overload in long chat histories, and no access control mechanism (Mpungose, 2020).

Benson Idahosa University (BIU), a private institution in Benin City, Edo State, exemplifies these challenges. The Department of Computer Science lacks a dedicated digital platform for organized distribution of course-specific resources. Lecturers currently distribute materials through WhatsApp broadcasts, USB flash drives, and email attachments. This decentralized approach creates information asymmetry where students who miss classes or lack WhatsApp group membership are excluded from critical study materials (Apuke and Iyendo, 2021).

The technological landscape of modern web development now enables the construction of sophisticated, scalable academic systems at minimal cost. React.js enables highly interactive single-page applications, Python FastAPI provides high-performance REST APIs, TiDB offers distributed MySQL-compatible databases, and Cloudinary provides cost-effective cloud media management (Lathkar, 2023). It is within this context that MindStream has been developed to address BIU's resource distribution challenges.


1.2 Statement of the Problem

The current system of academic resource distribution at BIU is characterized by severe fragmentation and inequity. Lecturers lack a standardized platform for uploading and organizing course materials, resulting in reliance on WhatsApp groups, personal email, and USB transfers. This creates information asymmetry where access to study materials becomes contingent upon social media group membership or physical class attendance.

Past examination questions are scattered across dozens of disconnected WhatsApp groups spanning multiple academic sessions. Locating a specific past question paper requires manually scrolling through months of accumulated messages. There is no version control or content validation mechanism, meaning outdated or incorrect materials circulate without oversight.

While enterprise LMS platforms such as Google Classroom theoretically address these challenges, Google Classroom lacks dedicated past question repositories, department-level resource filtering, and bulk upload capabilities. Moodle requires significant server infrastructure and institutional investment that are currently unavailable at BIU.


1.3 Aim and Objectives of the Study

The aim of this study is to develop a web-based academic e-library and resource management system (MindStream) that provides a centralized, department-specific digital repository for course materials, past questions, video lectures, and audio resources at Benson Idahosa University.

The specific objectives are:

i. To design an intuitive, responsive web interface that enables lecturers to upload, categorize, and manage academic resources while providing students with a seamless browsing and download experience.

ii. To implement a secure backend architecture with Role-Based Access Control (RBAC) that differentiates between student, lecturer, and administrator privileges.

iii. To develop an intelligent bulk upload processing system capable of accepting multiple file formats including ZIP archives, with automated course code extraction from filenames.

iv. To evaluate the usability and performance of the developed system through structured user testing using the System Usability Scale (SUS) questionnaire.


1.4 Scope of the Study

The scope encompasses the design, development, deployment, and evaluation of a web-based e-library system for BIU. The platform supports four resource categories: course materials (PDF, DOC, DOCX, PPT, PPTX, HTML), past examination questions, video lectures (MP4, WEBM), and audio resources (MP3, WAV). ZIP archive uploads with automatic server-side extraction are supported. Role-based access is implemented for students, lecturers, and administrators.

The system operates as a web application accessible through standard browsers. It does not extend to native mobile applications. The pilot evaluation is limited to the Department of Computer Science, though the architecture is extensible across all departments.


1.5 Significance of the Study

Significance to Students: MindStream ensures equitable access to learning materials regardless of a student's social connections or attendance patterns, eliminating dependency on WhatsApp groups.

Significance to Lecturers: The system provides a professional content management portal with bulk upload functionality that dramatically reduces administrative overhead.

Significance to the Institution: BIU gains an institutionally controlled digital platform that enhances its technological profile and supports accreditation requirements.

Significance to the Academic Community: This research contributes a replicable blueprint for lightweight, cost-effective e-library systems tailored for private universities in developing nations.


1.6 Limitations of the Study

i. Internet Dependency: The system requires an active internet connection for all operations.

ii. Cloud Storage Constraints: The Cloudinary free tier imposes a 10MB file size limit; larger files are stored locally on the server.

iii. Pilot Scope: User evaluation was conducted with a limited sample from the Department of Computer Science.

iv. Browser Compatibility: The application was primarily tested on Chrome and Firefox.


1.7 Definition of Terms

E-Library: A digital platform that organizes, stores, and provides access to electronic academic resources.

RBAC (Role-Based Access Control): A security mechanism that restricts system access based on predefined user roles.

API (Application Programming Interface): Protocols enabling different software applications to communicate.

FastAPI: A high-performance Python web framework for building APIs.

React.js: A JavaScript library for building dynamic user interfaces, maintained by Meta Platforms.

TiDB: A distributed, MySQL-compatible relational database with horizontal scalability.

Cloudinary: A cloud-based platform for uploading, storing, and delivering media assets.

JWT (JSON Web Token): A compact token format for secure authentication between client and server.

SUS (System Usability Scale): A ten-item questionnaire producing a usability score between 0 and 100.

ORM (Object-Relational Mapper): A technique for converting data between object-oriented programs and relational databases.
