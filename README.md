# InternHub — Smart Internship Management System

**Author:** Doan Nhat Binh  
**Assignment:** Topic selection and software analysis using a top-down approach, followed by selecting the most important features for UI/UX and database design.

## Software Overview

InternHub is a centralized platform designed to help students find suitable internships, track application progress, and maintain transparent communication with companies and academic supervisors throughout the internship.

### Problem Statement

Students often struggle to find internships that match their skills and lack a centralized platform for tracking application status and maintaining clear communication with companies and supervisors. InternHub is designed to address these challenges in one platform.

### Analysis Scope (Top-down Approach)

The software is analyzed using a three-layer model and consists of six main modules:

1. Internship Discovery & Matching
2. Internship Application Management
3. Internship Progress Management
4. Internship Evaluation
5. User & Internship Organization
6. Internship Monitoring & Reporting

The **three core modules** selected for UI/UX and database design are:

- **Internship Discovery & Matching** — search, filter, and receive internship recommendations based on skill compatibility (Match Score), with AI-assisted recommendation explanations.
- **Internship Application Management** — submit applications and track their processing status in real time.
- **Internship Progress Management** — manage assigned tasks and weekly progress reports between students and supervisors.

### The Three Supporting Modules

- **Internship Evaluation** — standardizes internship evaluation through self-assessment, learning outcomes, supervisor ratings, final score calculation, and completion decisions. This module supports academic assessment, credit calculation, and internship certification.
- **User & Internship Organization** — manages identities, profiles, and permissions across the system. It includes student profiles, skills and preferences, company profiles, internship postings, and Student, Supervisor, and Admin roles. This module provides the foundation for the discovery, application, and progress modules.
- **Internship Monitoring & Reporting** — provides an overview for universities, administrators, and companies through progress dashboards, application statistics, deadline reminders, status notifications, internship statistics, and consolidated performance reports.

### AI Usage

- **Match Score:** calculated using a weighted formula without AI to ensure transparency and explainability.
- **Recommendation Explanation:** uses an LLM to explain match results in natural language.
- **Search:** the proposed architecture is hybrid search (keyword + semantic embedding). The current UI/UX prototype uses keyword search, while semantic search is planned as an extension.

### Tools

- **Mindmap:** XMind
- **UI/UX prototype:** Figma
- **Database design:** DBdiagram

### Quick Start

To run the UI/UX prototype locally:

```bash
cd InternHub
npm install
npm run dev
```

To view and interact with the UI/UX prototype without downloading the code, visit the [Figma prototype](https://www.figma.com/make/G0R3nUP0L3fwgNQLG8RidV/Continue-InternHub-Development?t=8YxBoaR5xPYa230r-20&fullscreen=1).

- [Top-down approach](./Topdown_approach.png) — Top-down analysis exported from XMind.
- [Feature Spec](./spec.md)
- [Core Features – Use Case Diagram](./use_case.png)
- [Full Features – Use Case Diagram](./use_case_full.png)
- [Database design](./database_design.png) — Database design for the three core modules.
- [InternHub](./InternHub/) — Source code and instructions for running the UI/UX prototype.
