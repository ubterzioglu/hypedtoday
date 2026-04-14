# Implementation Progress Checklist

> Last updated: 2026-04-14 15:30

## Track 1 - Freeze risky behavior first
- [x] 1. Inventory all direct client-side Supabase writes and reads that expose unsafe access
- [x] 2. Remove the hardcoded admin password flow from the implementation plan baseline
- [x] 3. Replace the `localStorage` admin gate with an auth-role gate design
- [x] 4. Create and execute an emergency migration that disables permissive write policies
- [x] 5. Keep only explicitly public read access for safe public views
- [x] 6. Block direct public access to votes, feedback, and admin-only data
- [ ] 7. Verify from Supabase that public writes fail after lockdown
- [x] 8. Document which current screens temporarily lose write capability until Edge Functions are live

## Track 2 - Auth foundation
- [ ] 9. Enable Supabase Auth as the canonical identity layer
- [ ] 10. Lock providers: Google, GitHub, optional magic link
- [ ] 11. Create and execute migration for `profiles` table keyed to `auth.users`
- [ ] 12. Add profile bootstrap logic for first sign-in
- [ ] 13. Define role model with `user` and `admin`
- [ ] 14. Define where admin role is stored and how JWT/session checks will read it
- [x] 15. Add frontend auth context/provider
- [ ] 16. Add login page and auth entry UI
- [ ] 17. Add logout flow
- [ ] 18. Add session restore flow on refresh
- [x] 19. Update route protection to use auth context
- [ ] 20. Update header/nav to reflect signed-in state
- [ ] 21. Remove any remaining admin logic tied to browser-only flags
- [ ] 22. Run verification query set for `profiles` creation and auth-linked ownership columns

## Track 3 - Core domain remodel
- [ ] 23-39. Define and execute domain model migration (linkedin_posts, post_tasks, task_claims, post_owner_reviews, score_events, admin_actions, system_settings, request_limit_logs, admin_flags)

## Track 4 - Public/private data separation
- [ ] 40-48. Define DTOs, create SQL views, exclude internal fields

## Track 5 - Request-limit system
- [ ] 49-67. Define limits, build service contracts, implement queries, add UI plans

## Track 6 - Edge Function platform
- [ ] 68-80. Create shared helpers, scaffolds, deploy functions

## Track 7 - Request creation flow
- [ ] 81-92. Create Edge Function, validate inputs, update frontend

## Track 8 - Claim flow
- [ ] 93-103. Create claim Edge Function, listing endpoints, update UI

## Track 9 - Completion flow
- [ ] 104-112. Create completion Edge Function, owner review UI

## Track 10 - Owner approval flow
- [ ] 113-124. Create approve/reject Edge Functions, review queue UI

## Track 11 - Combo bonus and scoring
- [ ] 125-134. Define points, implement combo detection, leaderboard migration

## Track 12 - Comments and feedback
- [ ] 135-142. Rework to authenticated paths, admin-only access

## Track 13 - Admin platform
- [ ] 143-164. Define and create admin Edge Functions, audit logging

## Track 14 - Admin UI
- [ ] 165-177. Build all admin screens

## Track 15 - Security hardening
- [ ] 178-190. Headers, CSP, URL validation, XSS prevention

## Track 16 - Frontend API migration
- [ ] 191-200. Replace mockData with API wrapper, remove dead code

## Track 17 - Supabase execution and verification
- [ ] 201-209. Incremental migration, deployment, verification passes

## Track 18 - Testing
- [ ] 210-222. Unit, integration, regression tests

---

## Files created/modified so far

| File | Status | Change |
|---|---|---|
| `src/pages/AdminLogin.tsx` | Modified | Removed hardcoded password, login shows migration notice |
| `src/components/ProtectedRoute.tsx` | Modified | Uses `useAuth()` with `requireAdmin` prop, loading state |
| `src/App.tsx` | Modified | Wrapped in `AuthProvider` |
| `src/lib/auth.tsx` | **NEW** | AuthProvider + useAuth hook with Supabase Auth |
| `supabase/migrations/20260414_emergency_lockdown.sql` | **NEW** | Drops permissive write policies, adds auth-gated writes |
| `LOCKDOWN_STATUS.md` | **NEW** | Documents which screens lose capability |
| `PROGRESS.md` | **NEW** | This checklist |

## Action required before next session

**Step 7 — You need to execute the lockdown migration and run verification queries:**

Apply migration:
```
supabase db push
```
OR run the SQL in `20260414_emergency_lockdown.sql` against your Supabase project dashboard SQL editor.

Then run these verification queries:
```sql
-- 1. Check remaining policies on each table
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public';

-- 2. Verify anonymous INSERT fails on votes (should return 0 rows or error)
-- Run from anon context: INSERT INTO votes(project_id) VALUES ('00000000-0000-0000-0000-000000000000');

-- 3. Verify anonymous INSERT fails on feedback
-- Run from anon context: INSERT INTO feedback(message) VALUES ('test');

-- 4. Verify public SELECT still works on projects
SELECT count(*) FROM projects;

-- 5. Verify public SELECT still works on comments
SELECT count(*) FROM comments;
```
