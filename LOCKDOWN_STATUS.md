# Temporary Capability Loss After Emergency Lockdown

> Applied with migration: `20260414_emergency_lockdown.sql`

## Screens that lose write capability

| Screen | File | Feature | Status | Restoration |
|---|---|---|---|---|
| Admin Login | `AdminLogin.tsx` | Login via password | **DISABLED** | Track 2 (Supabase Auth) |
| Admin Dashboard | `AdminDashboard.tsx` | All admin CRUD | **BLOCKED** (no auth) | Track 2 + Track 13 |
| Admin Dashboard - Projects tab | `AdminDashboard.tsx` | Edit/Delete projects | **BLOCKED** (no auth) | Track 13 |
| Admin Dashboard - Feedback tab | `AdminDashboard.tsx` | View/Delete feedback | **BLOCKED** (no auth + no RLS) | Track 13 |
| Contact Page | `Contact.tsx` | Submit feedback form | **BLOCKED** (feedback INSERT locked) | Track 12 (Edge Function) |
| Add Project | `AddProject.tsx` | Submit new project | **Requires auth** | Track 7 (Edge Function) |
| Project Comments | `ProjectComments.tsx` | Post new comment | **Requires auth** | Track 12 (Edge Function) |

## Screens that remain functional

| Screen | File | Feature | Notes |
|---|---|---|---|
| Home | `Index.tsx` | Browse featured | Read-only, works |
| Showroom | `Showroom.tsx` | Browse projects | Public SELECT still active on `projects` |
| Project Comments (read) | `ProjectComments.tsx` | View comments | Public SELECT still active on `comments` |
| Leaderboard | `Leaderboard.tsx` | View rankings | `project_stats` view still readable |
| How It Works | `HowItWorks.tsx` | Static content | No DB dependency |
| Contact (info) | `Contact.tsx` | Social links display | Static content works |

## Tables with zero public access

- **votes** — All policies dropped. Leaderboard view (`project_stats`) still reads existing data but new votes cannot be inserted by anyone until Edge Functions are deployed with service_role key.
- **feedback** — All policies dropped. No read or write from client.

## What needs to happen to restore each capability

1. **Auth (Track 2)** — Enables login, unlocks authenticated write policies
2. **Edge Functions (Track 6-7)** — Enables project creation, feedback submission
3. **Claim/Comment Edge Functions (Track 8, 12)** — Enables comment posting through API
4. **Admin Edge Functions (Track 13)** — Enables admin dashboard with proper role checks
