Project Requirements Document (PRD): hyped.today
1. Project Overview
Project Name: hyped.today
Tagline: Support to promote. Promote to support.
Core Philosophy: "Give to Get". The platform encourages reciprocal support. Users gain visibility and reputation by supporting others.
Target Audience: General public, specifically targeting Turkish startup/project founders and testers.
Key Differentiator: Organic WhatsApp community support for Turkish projects.
2. Technical Context & Architecture
Base Repository: Existing backend from vclove.online.
Task: Refactor and expand the existing codebase.
Architecture Requirement: Modular structure. The codebase must be clean, maintainable, and scalable for a team of 3-4 developers.
Frontend: Web-first approach (Mobile responsiveness is secondary but required later).
Database: Expand existing schemas. Implement new tables/collections for Reputation, Tester Requests, and Social Links.
3. Data Models (Schema Extensions)
The agent must inspect the existing vclove.online models and add/modify the following:

3.1. User Model
Fields:
reputation_score (Integer): Default 0. Increases with activity.
time_bank_hours (Float): Accumulated time spent testing others' projects.
social_links: Array of social media URLs.
bio: Short description.
is_email_verified: Boolean.
3.2. Project Model
Fields:
owner_id: Reference to User.
title, description, url, thumbnail_url.
tags: Array of strings (Free input).
status: Enum [Pending, Approved, Rejected]. Default: Pending.
completeness_score: Integer (Calculated based on filled fields).
social_media_posts: Array of objects { platform, url, click_count }.
tester_request: Embedded document or reference (See 3.3).
created_at, updated_at.
3.3. TesterRequest Model
Fields:
project_id: Reference to Project.
description: String (e.g., "Need 5 iOS users for beta testing").
requirements: String.
estimated_time_needed: Float (Hours expected from testers).
status: Enum [Open, Closed].
applicants: Array of User IDs.
3.4. Interaction Models
Comment: user_id, project_id, content, timestamp.
ReputationLog: user_id, action_type (e.g., 'project_shared', 'link_clicked', 'test_completed'), points_changed.
4. Feature Specifications
4.1. Authentication & Onboarding
Method: Classic Email/Password.
Mail Verification: Implement a simplified verification flow.
Suggestion: Use a "Magic Link" (Passwordless) OR a simple "Click to Verify" button in the email to reduce friction.
User Profile: Dashboard showing "My Projects", "Supported Projects", and "Tester History".
4.2. Project Submission (Gamified)
Logic: "Minimum info, maximum benefit."
Dynamic Scoring:
The system calculates a completeness_score upon submission.
Example: Title (10pts), Description (20pts), Image (20pts), Video Link (20pts), Social Links (10pts).
Reward: Users with higher completeness scores receive an initial boost in reputation_score and visibility.
Tags: Free text input (Admin can moderate/reorganize later).
4.3. The "Support Loop" (Core Feature)
Social Media Sharing:
Users can add links to their tweets/LinkedIn posts about their project.
Click Tracking: Each link must be wrapped in a redirect endpoint (e.g., hyped.today/r/{id}) to count clicks.
Reward: When a user clicks a shared link, the project owner gains Reputation Points.
Reciprocity: Users who share/support others' links actively are highlighted on the platform.
4.4. Tester Marketplace (Job Board)
Flow:
Project owner creates a "Tester Request" (detailed job post).
Users apply to test.
Owner selects testers.
Time Banking: Upon completion, the owner confirms the hours spent. The Tester earns time_bank_hours and reputation_score.
4.5. Listing & Discovery (Home Page)
Default Sort: "Newest" first.
Visibility Algorithm: Projects from users with high reputation_score should have visual indicators (e.g., "Trusted Founder" badge) or slight ranking boosts.
Admin Moderation: Newly submitted projects must be approved by an Admin before appearing on the public feed.
4.6. Comments
Simple implementation.
Users can comment on Project Detail pages.
Basic spam protection (rate limiting).
5. UI/UX Requirements
5.1. Layout
Complete Redesign: The layout must be distinct from vclove.online.
Professional Look: The design must imply significant effort and quality ("Uğraşılmış gibi durmalı").
Project Detail Page:
Hero section with Project Image/Video.
Description & Tags.
"Social Feed" section (showing the shared links).
"Tester Request" section (if active).
Comment Section.
5.2. Error Handling
Create a custom, user-friendly 404 Page.
Toast notifications for success/error states (e.g., "Project submitted for approval").
6. Admin Panel
Queue: List of projects with status: 'Pending'.
Actions: Approve, Reject (with optional reason), Delete.
User Management: View users, ban users.
7. Analytics & SEO
SEO:
Dynamic Meta Tags for Project Pages (OpenGraph, Twitter Cards).
Sitemap generation.
Analytics: Integrate Google Analytics 4 (GA4) or similar script.
8. Developer Notes
Security Rules: Use the provided security rules from the user (to be injected later).
Modularity: Separate business logic from UI components. Use a clear folder structure (e.g., modules/projects, modules/users, modules/reputation).
Prompt for the Agent
"Analyze the existing vclove.online codebase structure. Based on the requirements in this PRD document, generate the necessary migration files, data models, and API endpoints for hyped.today. Refactor the frontend layout to match the professional and gamified aesthetic described. Implement the Reputation and Time Banking logic. Ensure the code is modular and well-commented."