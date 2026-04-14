# Security Hardening Plan - hypedtoday

## Overview

Apply the kununutr security specification to the existing project showcase/voting SPA using **Supabase Edge Functions** as the API layer and **Supabase Auth + OAuth (Google/GitHub)** for authentication. Scope: security hardening of existing features (projects, votes, comments, feedback, admin) only.

---

## Current State - Critical Issues

| Issue | File | Severity |
|-------|------|----------|
| Hardcoded admin password in client bundle | `src/pages/AdminLogin.tsx:16` | CRITICAL |
| RLS policies: "Anyone can..." on all tables | `supabase/migrations/20260222_initial_schema.sql:59-88` | CRITICAL |
| Direct Supabase read/write from client (no API layer) | `src/data/mockData.ts` (entire file) | CRITICAL |
| No user auth system | N/A | CRITICAL |
| No rate limiting | N/A | HIGH |
| No security headers (CSP, X-Frame-Options, etc.) | `nginx.conf`, `index.html` | HIGH |
| Admin auth via localStorage flag | `src/components/ProtectedRoute.tsx:9` | HIGH |
| `user_ip` stored in `votes` table, exposed via RLS | `initial_schema.sql:26` | MEDIUM |
| No ownership model (anyone can delete anything) | `mockData.ts:88-98` | HIGH |

---

## Phase 1: Critical Fixes (Day 1)

### 1.1 Remove hardcoded admin password
- **File**: `src/pages/AdminLogin.tsx`
- Move admin auth to Supabase Edge Function
- Admin login calls Edge Function that validates against a stored secret (Supabase vault or env var)
- Return a short-lived JWT/session, not a localStorage flag
- Update `ProtectedRoute.tsx` to validate session instead of reading `localStorage`

### 1.2 Emergency RLS lockdown
- **New migration**: `supabase/migrations/YYYYMMDD_rls_lockdown.sql`
- Replace all "Anyone can..." policies with restrictive ones:
  - `projects`: public SELECT only; INSERT/UPDATE/DELETE require service role or admin
  - `votes`: no public access at all (go through Edge Function)
  - `comments`: public SELECT; INSERT through Edge Function; DELETE requires ownership
  - `feedback`: INSERT through Edge Function; SELECT/DELETE require admin
- This immediately blocks direct client DB access

### 1.3 Add security headers
- **nginx.conf**: Add CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS
- **index.html**: Add CSP meta tag as fallback
- **vercel.json**: Add headers configuration for Vercel deployment

---

## Phase 2: Auth System (Day 2)

### 2.1 Supabase Auth setup
- Enable Supabase Auth with magic link (email) + OAuth (Google, GitHub)
- Create `profiles` table linking `auth.uid()` to display name
- Configure OAuth providers in Supabase dashboard

### 2.2 Auth context & components
- **New**: `src/lib/auth.tsx` - AuthContext provider using Supabase auth state listener
- **New**: `src/components/AuthButton.tsx` - Login/logout button with OAuth providers
- **New**: `src/pages/Login.tsx` - Login page with magic link + OAuth buttons
- Update `App.tsx` to wrap with AuthProvider
- Update `Header.tsx` to show auth state

### 2.3 Session handling
- Use Supabase's built-in session management
- Store session in cookie via middleware or Edge Function for SSR-friendly access
- Frontend reads session via `supabase.auth.getSession()` (not localStorage)

---

## Phase 3: API Layer - Edge Functions (Day 3-4)

### 3.1 Project structure
```
supabase/
  functions/
    auth/
      login.ts          # Admin login
      callback.ts       # OAuth callback
    projects/
      create.ts         # POST /projects (validated, rate-limited)
      delete.ts         # DELETE /projects/:id (ownership check)
      update.ts         # PATCH /projects/:id (admin only)
    votes/
      submit.ts         # POST /votes (dedup, rate-limit, auth required)
      get-by-project.ts # GET /votes?project_id= (aggregate only)
    comments/
      create.ts         # POST /comments (auth required, rate-limited)
      delete.ts         # DELETE /comments/:id (ownership check)
      list.ts           # GET /comments?project_id=
    feedback/
      submit.ts         # POST /feedback (rate-limited)
      list.ts           # GET /feedback (admin only)
      delete.ts         # DELETE /feedback/:id (admin only)
    admin/
      dashboard.ts      # GET admin data (admin role check)
    _shared/
      cors.ts           # CORS headers utility
      rate-limit.ts     # Rate limiting via Redis/Upstash or Supabase table
      auth.ts           # Auth verification helper
      dto.ts            # Public DTO transformers (strip sensitive fields)
      validation.ts     # Input validation schemas
```

### 3.2 Public DTO / Internal model separation
- Every Edge Function response strips: `user_id`, `ip_hash`, `user_ip`, `user_agent`
- Internal DB model keeps all fields; only DTO reaches the client
- Shared `sanitizeForPublic()` function in `_shared/dto.ts`

### 3.3 CORS configuration
- `_shared/cors.ts`: Allow only production domain + localhost dev
- Validate `Origin` header on all requests
- Return 403 for disallowed origins

### 3.4 Rate limiting implementation
- `_shared/rate-limit.ts`: 
  - Use Supabase table `rate_limits` (user_id, ip_hash, endpoint, window, count)
  - Windows: 1 hour / 24 hours / 7 days per endpoint
  - Return 429 with `Retry-After` header when exceeded
  - Fallback: IP-based when no auth

---

## Phase 4: Frontend Migration to API Layer (Day 5)

### 4.1 Replace direct Supabase calls
- **File**: `src/data/mockData.ts` → rename to `src/lib/api.ts`
- Replace all `supabase.from(...)` calls with `fetch('/api/...')` calls to Edge Functions
- Functions become:
  - `getProjects()` → fetch from Edge Function or keep public view
  - `addProject()` → POST to Edge Function
  - `submitVote()` → POST to Edge Function (auth required)
  - `deleteProject()` → DELETE to Edge Function (ownership check)
  - `submitFeedback()` → POST to Edge Function
  - etc.

### 4.2 Keep Supabase client for
- Auth only: `supabase.auth.signInWithOAuth()`, `supabase.auth.signOut()`, `supabase.auth.onAuthStateChange()`
- Public read-only views (project list, leaderboard) - IF covered by strict RLS

### 4.3 Update components
- `ProjectCard.tsx`: Pass auth state; show vote UI only when logged in
- `ProjectComments.tsx`: Require auth for comment submission
- `ProjectSubmissionForm.tsx`: Require auth for project submission
- `Leaderboard.tsx`: Keep public (read-only aggregate view)
- `AdminDashboard.tsx`: All operations through Edge Functions

---

## Phase 5: Database Schema Updates (Day 5)

### 5.1 New migration: `YYYYMMDD_security_schema.sql`
- Add `user_id UUID REFERENCES auth.users(id)` to `projects`, `votes`, `comments`
- Add `ip_hash TEXT` to relevant tables (not `user_ip` plaintext)
- Add `text_hash TEXT` to `comments` for duplicate detection
- Add `status TEXT DEFAULT 'active'` to `projects` and `comments` (for soft-delete/archive)
- Add `rate_limits` table for rate limiting
- Add `profiles` table (id, user_id, display_name, created_at)
- Add unique constraint: `UNIQUE(project_id, user_id)` on `votes`
- Add unique constraint: `UNIQUE(text_hash)` on `comments` (per user/window)
- Create archive tables: `_archived_projects`, `_archived_comments`

### 5.2 Updated RLS policies
- `projects`:
  - SELECT: public (status='active')
  - INSERT: authenticated users only
  - UPDATE/DELETE: ownership (user_id = auth.uid()) OR admin role
- `votes`:
  - SELECT: no direct access (aggregate view only via `project_stats`)
  - INSERT: authenticated users only, through Edge Function
- `comments`:
  - SELECT: public (status='active')
  - INSERT: authenticated users only
  - DELETE: ownership OR admin
- `feedback`:
  - SELECT/DELETE: admin only
  - INSERT: any (rate-limited at Edge Function level)
- `rate_limits`:
  - No public access
- `profiles`:
  - SELECT: public (own profile + display name only)
  - INSERT/UPDATE: own profile only

### 5.3 Updated views
- `project_stats`: exclude archived projects, only active votes
- Create `public_comments` view: strips `user_id`, `ip_hash`, `text_hash`
- Create `public_projects` view: strips `user_id`, `contact_email`, `ip_hash`

---

## Phase 6: Vote Deduplication & Ownership (Day 6)

### 6.1 Vote system
- `UNIQUE(project_id, user_id)` constraint on DB level
- Edge Function uses `upsert` on conflict
- Client sends vote → Edge Function checks auth → upsert → returns result
- One vote per user per project, mutable (can change scores)

### 6.2 Ownership checks
- Delete project: Edge Function checks `project.user_id === auth.uid()` or admin role
- Delete comment: Edge Function checks `comment.user_id === auth.uid()` or admin role
- Transactional soft-delete: `status = 'archived'`, move to archive table, then delete

### 6.3 Comment deduplication
- Hash comment text with `crypto.SHA256(text + user_id)`
- Store in `text_hash` column
- Edge Function rejects duplicates within a time window (e.g., same text within 5 min)

---

## Phase 7: UGC & Frontend Hardening (Day 6)

### 7.1 UGC rendering safety
- Audit all text rendering: ensure no `dangerouslySetInnerHTML` (confirmed: none exists currently)
- Comment text rendered as plain text via React's default escaping (already safe)
- Add explicit `{String(comment.content)}` casts for safety
- No HTML interpretation of user text

### 7.2 Link safety
- External links use `rel="noopener noreferrer"` (already in place)
- Add URL whitelist validation for `project_url` and `linkedin_url` on server-side
- Reject `javascript:` and `data:` URLs in Edge Function validation

### 7.3 Security headers (detailed)
**nginx.conf additions:**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://gc.zgo.at; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';";
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
```

**vercel.json additions:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## Phase 8: Admin System Overhaul (Day 7)

### 8.1 Admin authentication
- Create `admin_users` table or use Supabase `auth.users` with custom `role = 'admin'` claim
- Admin login via Edge Function that validates credentials and sets admin JWT claim
- Remove hardcoded password from client bundle entirely
- `ProtectedRoute.tsx` checks admin role from auth context (not localStorage)

### 8.2 Admin API routes
- All admin operations go through Edge Functions
- Each admin Edge Function verifies `role = 'admin'` from JWT
- Admin can: delete any project/comment, view all feedback, view aggregated analytics
- Admin cannot: view raw user_id/ip_hash (still stripped in DTO)

---

## Phase 9: Testing & Verification (Day 8)

### 9.1 Security test cases
- [ ] Unauthenticated user cannot vote, comment, or create projects
- [ ] Authenticated user can create project, vote, comment
- [ ] User cannot delete another user's project/comment
- [ ] Admin can delete any project/comment
- [ ] Rate limit returns 429 after threshold
- [ ] Duplicate vote is upserted (one per user per project)
- [ ] Duplicate comment rejected within time window
- [ ] Public API responses contain no user_id, ip_hash, or internal fields
- [ ] Direct Supabase client access blocked by RLS
- [ ] CSP blocks inline script execution
- [ ] Admin password not in client bundle

### 9.2 Automated tests
- Edge Function unit tests (Deno test)
- Frontend integration tests (vitest)
- RLS policy verification via SQL tests

---

## Implementation Order (Priority)

| Step | Phase | Description | Dependency |
|------|-------|-------------|------------|
| 1 | 1.1 | Remove hardcoded password | None |
| 2 | 1.2 | RLS lockdown migration | None |
| 3 | 1.3 | Security headers | None |
| 4 | 2.1 | Supabase Auth setup | Step 2 |
| 5 | 5.1 | Schema updates migration | Step 4 |
| 6 | 5.2 | Updated RLS policies | Step 5 |
| 7 | 3.1-3.4 | Edge Functions + shared utils | Step 5 |
| 8 | 4.1-4.3 | Frontend migration to API | Step 7 |
| 9 | 6.1-6.3 | Vote dedup + ownership | Step 7 |
| 10 | 7.1-7.3 | UGC + frontend hardening | Step 8 |
| 11 | 8.1-8.2 | Admin system overhaul | Step 7 |
| 12 | 9.1-9.2 | Testing & verification | All |

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/_shared/cors.ts` | CORS utility |
| `supabase/functions/_shared/rate-limit.ts` | Rate limiting |
| `supabase/functions/_shared/auth.ts` | Auth verification |
| `supabase/functions/_shared/dto.ts` | Public DTO sanitization |
| `supabase/functions/_shared/validation.ts` | Input validation |
| `supabase/functions/projects/create.ts` | Create project |
| `supabase/functions/projects/delete.ts` | Delete project |
| `supabase/functions/projects/update.ts` | Update project |
| `supabase/functions/votes/submit.ts` | Submit vote |
| `supabase/functions/comments/create.ts` | Create comment |
| `supabase/functions/comments/delete.ts` | Delete comment |
| `supabase/functions/comments/list.ts` | List comments |
| `supabase/functions/feedback/submit.ts` | Submit feedback |
| `supabase/functions/feedback/list.ts` | List feedback (admin) |
| `supabase/functions/feedback/delete.ts` | Delete feedback (admin) |
| `supabase/functions/admin/login.ts` | Admin login |
| `supabase/functions/admin/dashboard.ts` | Admin data |
| `src/lib/auth.tsx` | Auth context provider |
| `src/lib/api.ts` | API client (replaces mockData.ts) |
| `src/components/AuthButton.tsx` | Auth UI component |
| `src/pages/Login.tsx` | Login page |
| `supabase/migrations/YYYYMMDD_rls_lockdown.sql` | RLS lockdown |
| `supabase/migrations/YYYYMMDD_security_schema.sql` | Schema updates |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add AuthProvider, Login route |
| `src/components/Header.tsx` | Add AuthButton |
| `src/components/ProjectCard.tsx` | Auth-gate voting |
| `src/components/ProtectedRoute.tsx` | Use auth context instead of localStorage |
| `src/pages/ProjectComments.tsx` | Auth-gate comments, use API |
| `src/pages/AdminLogin.tsx` | Use Edge Function for login |
| `src/pages/AdminDashboard.tsx` | Use API layer |
| `src/data/mockData.ts` | Rename/replace with API calls |
| `nginx.conf` | Add security headers |
| `vercel.json` | Add security headers |
| `index.html` | Add CSP meta tag |
| `src/types/index.ts` | Add DTO types |

## Files to Delete

| File | Reason |
|------|--------|
| `src/data/mockData.ts` | Replaced by `src/lib/api.ts` |

---

## Notes

- **Supabase Edge Functions** use Deno runtime (TypeScript, no node_modules)
- Edge Functions have built-in JWT verification via `Authorization` header
- For rate limiting without external Redis, use a Supabase table with TTL or Upstash Redis (free tier)
- The `import_map.json` in `supabase/functions/` will manage Deno dependencies
- All Edge Functions should use `Deno.serve()` pattern
