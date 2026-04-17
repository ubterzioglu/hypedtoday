# HypedToday — Completion Status

> Generated: 2026-04-17
> Progress: **213/222 steps (96%)** — 9 remaining (Track 18 integration tests only)

---

## What Was Built

HypedToday is a LinkedIn post support platform where users submit LinkedIn posts and others claim tasks (like, comment, repost) to support them. Approved completions earn points toward a leaderboard.

---

## Deployed Infrastructure

### Supabase Project
- **Ref:** `fajmxbnaffkdwvruqain`
- **URL:** `https://fajmxbnaffkdwvruqain.supabase.co`
- **Auth providers:** Google OAuth (GitHub excluded by design)

### Migrations Applied (remote)
| Migration | Content |
|---|---|
| `20260414` | Emergency lockdown — all permissive write policies dropped |
| `20260415090000` | Profiles table, role model (user/admin), auto-create trigger, RLS |
| `20260415091000` | Full domain model: linkedin_posts, post_tasks, task_claims, post_owner_reviews, score_events, admin_actions, system_settings, request_limit_logs, admin_flags |
| `20260415092000` | Public views: public_posts, public_leaderboard, owner_pending_reviews, public_post_tasks, user_score_summary, admin_claims_overview |
| `20260415093000` | Security hardening: additional RLS policies and indexes |

### Edge Functions (all ACTIVE)
| Function | Purpose |
|---|---|
| `create-post` | LinkedIn URL validation, request-limit check, post + task creation |
| `claim-task` | Claim a task, prevent duplicates, max-active-claim check |
| `complete-claim` | Mark claim done, accepts supporter note/comment/repost text |
| `review-claim` | Owner approve/reject + score event + combo bonus detection |
| `request-limits` | Returns user's remaining daily/weekly/active capacity |
| `admin-dashboard` | Admin statistics endpoint |
| `admin-actions` | All admin mutations with audit logging |
| `submit-feedback` | Feedback submission with duplicate guard and rate limiting |
| `submit-report` | Flag a post or claim for admin review |

### System Settings (live in DB)
| Key | Value |
|---|---|
| points_like | 10 |
| points_comment | 15 |
| points_repost | 10 |
| points_combo_all_three | 50 |
| daily_post_limit | 2 |
| weekly_post_limit | 7 |
| active_post_limit | 3 |

---

## Frontend Pages

| Route | Page | Auth |
|---|---|---|
| `/` | Home (DashboardStats, FeaturedCarousel, TopProjects) | Public |
| `/showroom` | LinkedIn Post Feed | Public |
| `/leaderboard` | Top Supporters (score-based) | Public |
| `/add-project` | Request LinkedIn Support | Required |
| `/my-claims` | Supporter Dashboard | Required |
| `/my-reviews` | Owner Pending Reviews | Required |
| `/project/:id/comments` | Approved comments for a post | Public |
| `/how-it-works` | Static info page | Public |
| `/contact` | Contact + Feedback form | Public |
| `/login` | Google OAuth login | — |
| `/admin` | Admin Dashboard (5 tabs + 3 new) | Admin only |

### Admin Dashboard Tabs
- Dashboard (stats cards)
- Users (ban, limit override)
- Posts (pause, archive, hide, delete)
- Claims (override approve/reject)
- Scores (leaderboard history)
- Flags (suspicious pattern review)
- Audit (full admin action log with pagination)
- Settings (system config editor)

---

## Security

### Headers (vercel.json + nginx.conf)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` (includes `wss://*.supabase.co` for realtime)
- `Strict-Transport-Security` (HSTS with preload)

### RLS Verification (confirmed via smoke tests)
- Direct INSERT to `linkedin_posts`: **blocked** (400)
- Direct INSERT to `votes`: **blocked** (400)
- Anon SELECT on `task_claims`: **RLS active** (empty, no data leak)
- Anon SELECT on `score_events`: **RLS active** (empty)
- All Edge Functions without auth: **401**
- XSS scan (`dangerouslySetInnerHTML`): **none found**

---

## Tests

**Location:** `src/tests/`, `src/test/setup.ts`
**Framework:** Vitest 3.2.4, 26 tests, all passing

| Test File | Coverage |
|---|---|
| `request-limits.test.ts` | 6 tests — daily/weekly/active limit logic, request-ban, cooldown |
| `combo-detection.test.ts` | 6 tests — combo eligibility, multi-post combos, user isolation |
| `dto-sanitization.test.ts` | 9 tests — PublicPost DTO, comment DTO, private field exclusion |
| `security-regression.test.ts` | 5 tests — no hardcoded passwords/tokens, no service_role in client |

---

## Remaining Work (9 steps)

All remaining steps are **Track 18 integration tests** (steps 213-221). These require Deno test runtime or a dedicated test environment with real Supabase sessions:

| Step | Test |
|---|---|
| 213 | Edge Function tests for auth-required endpoints |
| 214 | Edge Function tests for owner-only approval |
| 215 | Edge Function tests for admin-only actions |
| 216 | Tests for blocked direct writes under RLS |
| 217 | Tests for duplicate/invalid claim flows |
| 218 | Tests for request-ban and cooldown behavior |
| 219 | Frontend integration tests for auth gating |
| 220 | Frontend integration tests for owner review flow |
| 221 | Frontend integration tests for admin access control |

**Approach:** Use Supabase's `createClient` with a test service-role key in a separate `vitest.integration.config.ts` that runs against the live project. Steps 216-218 can be covered by Deno tests in `supabase/functions/_tests/`.

---

## Manual Steps Required

These cannot be automated and must be done manually:

1. **OAuth secrets** — Supabase Dashboard → Authentication → Providers → Google: add client ID + secret
2. **Set admin role** — SQL editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. **Verify auto-profile trigger** — Sign in once with Google to confirm a `profiles` row is created automatically

---

## Architecture Summary

```
Browser
  └── React (Vite) + Supabase JS client (auth/session only)
        ├── Public reads → Supabase REST API → public_* views (RLS-enforced)
        └── Mutations → Edge Functions (JWT verified) → Supabase DB (service_role)

Admin
  └── Same frontend → /admin route (requireAdmin guard)
        └── admin-dashboard + admin-actions Edge Functions

Auth
  └── Supabase Auth → Google OAuth → profiles table (auto-created via trigger)
        └── JWT role claim → Edge Functions verify role for admin actions
```

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/api.ts` | All Edge Function calls with auto auth headers |
| `src/lib/auth.tsx` | AuthProvider, useAuth hook, session restore |
| `src/lib/supabase.ts` | Supabase client (auth + public reads only) |
| `src/types/index.ts` | All domain TypeScript types |
| `src/types/dto.ts` | Public/private DTO interfaces |
| `supabase/functions/_shared/` | Shared Edge Function helpers |
| `vercel.json` | Deployment config + security headers |
| `nginx.conf` | Docker/nginx config + security headers |
| `PROGRESS.md` | Step-by-step implementation tracker |
