## Feature Analysis

### 1. Top-Down Overview

The software is analyzed using a three-layer tree model:
- **Layer 1**: Major functional modules (6 modules)
- **Layer 2**: Feature groups within each module
- **Layer 3**: Specific features that can be implemented as a single screen/flow

Of the 6 Layer 1 modules, 3 are considered to **directly address the users' (students') core pain points** and were selected for in-depth analysis, UI/UX design, and database design:

| Module | Pain point addressed | Primary users |
|---|---|---|
| Internship Discovery & Matching | "I don't know which internship is suitable for me, and manually filtering takes too much time" | Students |
| Internship Application Management | "I submitted an application, but I don't know what stage it is at" | Students, Companies |
| Internship Progress Management | "Lecturers/companies cannot see what students are doing during their internships" | Students, Supervisors |

The remaining 3 modules (Evaluation, Organization, and Monitoring & Reporting) are necessary for a complete system but belong to the **infrastructure/administration** category rather than the core features.

---

### 2. Detailed Analysis of the 3 Core Features

#### 2.1. Internship Discovery & Matching

**Objective**: Help students find suitable internships faster and more accurately than manually filtering through a long list.

| Sub-feature | Description | Required? |
|---|---|---|
| Search & Filter | Search by keyword and filter by industry/location/duration | Mandatory — the baseline UX of every job board |
| Internship Details | View the job description, required skills, and company information | Mandatory — students need sufficient information to make a decision |
| Match Score | Calculate the percentage match between a student's skills and the job requirements | Core — this is the product's differentiating "smart" factor |
| Recommendation Explanation | Explain in natural language why the student is or is not a match | Core — increases trust in the Match Score, with AI assistance |

**Processing logic**:
- Match Score = a weighted-overlap formula between `StudentSkill` and `InternshipSkill` → does not use AI, ensuring transparency and explainability.
- Recommendation Explanation = an LLM generates an explanation from structured inputs (matched skills, missing skills, and position name).
- Search = a hybrid architecture (keyword + semantic embedding) — the demo version uses keywords; semantic search is planned as an extension.

**Main input/output**:
- Input: `StudentProfile.skills`, `Internship.required_skills`, query text
- Output: A list of internships ranked by relevance/match score, accompanied by explanations

---

#### 2.2. Internship Application Management

**Objective**: Eliminate the situation where an application is "submitted and then disappears" by giving students and companies a transparent, real-time view of the status.

| Sub-feature | Description | Required? |
|---|---|---|
| Application Form | Application form (cover note, availability) | Mandatory |
| CV/Document Upload | Attach a CV and certificates | Mandatory |
| Application Status | Current status (Submitted → Reviewing → Interview → Accepted/Rejected) | Core — directly addresses the pain point of not knowing what stage the application is at |
| Status History | History of status changes over time | Important — creates transparency and prevents disputes about who changed the status and when |

**Processing logic**:
- A simple state machine is sufficient; AI is not needed — process reliability is more important than being "smart."
- Every status change → add one row to `ApplicationStatusHistory` (audit trail).

**Main input/output**:
- Input: `StudentProfile`, `Internship`, CV file, notes
- Output: An `Application` record with the current `status` and complete history

---

#### 2.3. Internship Progress Management

**Objective**: Create a channel for real-time internship progress tracking between students and supervisors, instead of evaluating progress only once at the end of the term.

| Sub-feature | Description | Required? |
|---|---|---|
| Task Assignment | Supervisor assigns tasks to students | Mandatory |
| Task Progress | Task status (To Do/In Progress/Done) | Mandatory — lets both parties see progress visually |
| Weekly Report | Students submit weekly reports | Core — the primary data source for monitoring |
| Supervisor Feedback | Supervisor responds to each report | Core — creates a two-way feedback loop |

**Processing logic**:
- Task status: updated manually; AI is not used (to avoid AI incorrectly estimating the status of real work).
- Weekly Report: AI assists with summarization (TL;DR) for supervisors managing multiple students at once — a supporting feature that does not replace the original report content.

**Main input/output**:
- Input: `Task` (assignee, due date), `WeeklyReport` (content, week number)
- Output: A Kanban view for tasks and a timeline view for reports + feedback

---

### 3. Analysis of the 3 Remaining Modules

#### 3.1. Internship Evaluation

**Objective**: Standardize the internship evaluation process as a basis for assigning grades and recognizing academic credits.

| Sub-feature | Description | Required? |
|---|---|---|
| Self Assessment | Students evaluate their own internship experience | Necessary for academic purposes, but not core UX |
| Learning Outcome | Record the skills/knowledge gained after the internship | Useful for university reports |
| Performance Rating | Supervisor rates the student's performance | Necessary if official grading is required |
| Overall Score | Compile the final score at the end of the term | Necessary if academic credits are awarded |
| Completion Decision | Decide whether the internship is passed or failed | Necessary for academic purposes |

---

#### 3.2. User & Internship Organization

**Objective**: Manage identities, profiles, and permissions across the entire system.

| Sub-feature | Description | Required? |
|---|---|---|
| Student Profile | Student's personal and educational information | Mandatory — foundational, implicitly required for the 3 core modules to operate |
| Skills & Preferences | List of skills and career interests | Mandatory — the input for Match Score in the Discovery module |
| Company Profile | Company information | Mandatory — the foundation for Internship Posting |
| Internship Posting | Companies publish internship openings | Mandatory — the data source for Search & Filter |
| Student Role | Permissions for student accounts | System-level requirement |
| Supervisor/Admin Role | Permissions for supervisor/admin accounts | System-level requirement |

---

#### 3.3. Internship Monitoring & Reporting

**Objective**: Provide an overview (dashboard and statistics) for administrative roles — universities and system administrators.

| Sub-feature | Description | Required? |
|---|---|---|
| Progress Overview | Dashboard summarizing the internship progress of all students | Useful for administrators, not students |
| Application Overview | Statistics on the total number of applications and acceptance rate | Useful for companies/administrators when making decisions |
| Deadline Reminder | Reminders for application and report deadlines | High UX value; easy to implement with simple notifications |
| Status Notification | Notifications when an application/task status changes | High UX value; increases engagement |
| Internship Statistics | Statistics by industry and term | Only needed when sufficient historical data is available |
| Performance Reports | Consolidated performance reports | Intended for administrators/universities |

---
