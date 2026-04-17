# User Scenarios — hyped.today LinkedIn Support Platform

> Platform: LinkedIn mutual engagement exchange. Users submit posts requesting likes/comments/reposts; supporters complete tasks and earn points. Roles: `visitor`, `user` (post owner + supporter), `admin`.

---

## 1. Visitor (Unauthenticated)

### US-V1 — Browse the LinkedIn Feed
**Actor:** Anonymous visitor  
**Entry:** `/showroom`  
**Flow:**
1. Lands on Showroom page showing active LinkedIn posts from `public_posts` view.
2. Each card shows: owner display name + avatar, post title/description, requested actions (like/comment/repost), approved count, pending count.
3. Visitor can see posts but cannot claim any task.
4. Clicking "Claim" or any action prompts a login redirect.

**Outcome:** Visitor sees what the platform does; conversion funnel starts.

---

### US-V2 — View Leaderboard
**Actor:** Anonymous visitor  
**Entry:** `/leaderboard`  
**Flow:**
1. Loads `public_leaderboard` view — top 100 supporters ranked by total points.
2. Each row shows: display name, avatar, total points, event count, combo count.
3. No auth required.

**Outcome:** Social proof visible to anyone; motivates sign-up.

---

### US-V3 — Sign In
**Actor:** Visitor converting to user  
**Flow:**
1. Clicks any protected action (claim a task, request support).
2. Redirected to auth flow — three options:
   - **Google OAuth** (`signInWithGoogle`)
   - **GitHub OAuth** (`signInWithGitHub`)
   - **Magic Link** (`signInWithMagicLink`) — email OTP
3. On first sign-in, `handle_new_user` trigger auto-creates a `profiles` row with `role = 'user'`.
4. Redirected back to `/` after auth.

**Outcome:** Profile created; user can now act as post owner or supporter.

---

## 2. Post Owner (Authenticated User Submitting Posts)

### US-O1 — Submit a LinkedIn Post for Support
**Actor:** Authenticated user  
**Entry:** `/add-project`  
**Preconditions:** Not request-banned; within daily/weekly/active post limits.  
**Flow:**
1. User opens "Request Support" page.
2. `RequestCapacityWidget` shows remaining daily/weekly quota and cooldown status.
3. User fills `ProjectSubmissionForm`:
   - LinkedIn post URL (required)
   - Title / description (optional)
   - Selects which actions to request: `like`, `comment`, `repost` (at least one)
   - Optional: expiry date
4. Form submits → inserts row into `linkedin_posts` (status `active`) + corresponding `post_tasks` rows.
5. Post appears immediately in `/showroom` feed.

**Outcome:** Post is discoverable; supporters can start claiming tasks.

---

### US-O2 — Post Blocked by Rate Limit
**Actor:** Authenticated user  
**Trigger:** Attempting submission while over a limit.  
**Possible block reasons (logged to `request_limit_logs`):**

| Reason Code | Condition |
|---|---|
| `daily_limit_reached` | ≥ 2 posts today |
| `weekly_limit_reached` | ≥ 7 posts this week |
| `active_post_limit_reached` | ≥ 3 active posts |
| `pending_review_over_limit` | ≥ 10 pending_review claims on own posts |
| `cooldown_active` | Last post < 120 min ago |
| `request_banned` | Admin set `request_banned = true` on profile |

**Outcome:** Submission rejected with a clear reason; limit event logged for admin visibility.

---

### US-O3 — Review Pending Claims (Owner Review Queue)
**Actor:** Post owner  
**Entry:** `/owner-reviews`  
**Flow:**
1. Page loads `owner_pending_reviews` view — only claims in `pending_review` status on owner's posts.
2. Each item shows: supporter name/avatar, task type (like/comment/repost), time elapsed, supporter note, comment/repost text if applicable.
3. Owner selects a claim → modal opens with full detail + optional note field.
4. Owner clicks **Approve** or **Reject**:
   - **Approve** → `task_claims.status = 'approved'`; `score_events` row created; points awarded to supporter.
   - **Reject** → `task_claims.status = 'rejected'`; `post_owner_reviews` row records decision + note.
5. If all three tasks on a post are approved for one supporter → combo bonus score event (50 pts) triggered.

**Outcome:** Supporter is rewarded or notified of rejection; owner controls quality.

---

### US-O4 — Pause or Archive Own Post
**Actor:** Post owner  
**Flow:**
1. From a post management UI (linked from Showroom or dashboard), owner sets post status.
2. `active` → `paused`: post hidden from feed; existing claims unaffected.
3. `active` / `paused` → `archived`: post closed; no new claims possible.

**Outcome:** Owner controls lifecycle of their own posts.

---

## 3. Supporter (Authenticated User Completing Tasks)

### US-S1 — Discover and Claim a Task
**Actor:** Authenticated user  
**Entry:** `/showroom`  
**Preconditions:** Fewer than 5 active claims (`max_active_claims_per_user`); not already claimed this post+task combination.  
**Flow:**
1. Browses feed; each card shows available task buttons (Like / Comment / Repost).
2. Clicks a task button → `task_claims` row inserted with status `claimed`.
3. System enforces unique index: one active claim per (post_id, task_type, supporter_user_id).
4. Supporter is shown the LinkedIn post URL to open.

**Outcome:** Task locked to this supporter; other supporters see updated `pending_count`.

---

### US-S2 — Complete a Claimed Task
**Actor:** Supporter  
**Entry:** `/supporter` (Supporter Dashboard)  
**Flow:**
1. Dashboard loads all own claims from `task_claims` with joined post data.
2. Supporter finds a claim in `claimed` status; expands completion form.
3. Fills in:
   - **Like**: optional supporter note.
   - **Comment**: `comment_text` (min 10 chars enforced by `min_comment_length`), optional screenshot proof URL.
   - **Repost**: `repost_text`, optional screenshot proof URL.
4. Submits → `task_claims.status = 'completed'`; `completed_at` timestamp set.
5. If completed within 30 seconds of claiming (`fast_complete_seconds`) → system auto-generates an `admin_flags` row (`flag_type = 'fast_complete'`) for review.
6. Claim moves to owner's review queue (`status = 'pending_review'`).

**Outcome:** Owner is notified (via queue) to approve or reject the claim.

---

### US-S3 — Track Claim Status
**Actor:** Supporter  
**Entry:** `/supporter`  
**Flow:**
1. Dashboard shows all claims with status badges:
   - `claimed` (yellow) — in progress
   - `completed` (blue) — submitted, awaiting owner action
   - `pending_review` (orange) — owner notified
   - `approved` (green) — points earned
   - `rejected` (red) — not accepted
   - `cancelled` / `expired` (grey) — terminal, no points

**Outcome:** Supporter has full visibility into claim history and earned points.

---

### US-S4 — Earn Points and Check Score
**Actor:** Supporter  
**Trigger:** Owner approves a claim  
**Flow:**
1. `score_events` row created with appropriate `event_type`:
   - `like_approved` → 10 pts
   - `comment_approved` → 15 pts
   - `repost_approved` → 10 pts
   - `combo_bonus` → 50 pts (if all three tasks approved on same post)
2. `user_score_summary` view aggregates total, today's, and this week's points.
3. Leaderboard at `/leaderboard` updates to reflect new ranking.

**Outcome:** Points reflected in score summary and public leaderboard.

---

### US-S5 — Report a Post
**Actor:** Supporter  
**Trigger:** Post appears to be spam, abusive, or has a broken link  
**Flow:**
1. Supporter clicks "Report" on a post card.
2. Selects flag type: `spam` | `abuse` | `inappropriate` | `broken_link` | `other`.
3. Writes reason text (required).
4. `user_reports` row inserted (unique: one report per reporter per target).
5. Report appears in admin queue with `status = 'open'`.

**Outcome:** Admin is alerted for review; supporter cannot double-report the same post.

---

## 4. Admin

### US-A1 — Log In to Admin Panel
**Actor:** Admin user (`role = 'admin'` in profiles)  
**Entry:** `/admin/login`  
**Flow:**
1. Uses same auth methods as regular users (Google/GitHub/Magic Link).
2. After sign-in, `fetchProfileRole` checks `profiles.role`; if `admin`, `ProtectedRoute` permits access to `/admin`.
3. Non-admins attempting `/admin` are redirected.

---

### US-A2 — Review Platform Dashboard Stats
**Actor:** Admin  
**Entry:** `/admin` → Dashboard tab  
**Metrics displayed:**

| Metric | Source |
|---|---|
| Total users | `profiles` count |
| Total posts | `linkedin_posts` count |
| Total claims | `task_claims` count |
| Pending approvals | `task_claims WHERE status = 'pending_review'` |
| Approval / rejection rate | derived |
| Total points distributed | sum of `score_events.points` |
| Open flags | `admin_flags WHERE status = 'open'` |
| Limit rejections today | `request_limit_logs` count today |

---

### US-A3 — Manage Users
**Actor:** Admin → Users tab  
**Actions:**

| Action | Effect |
|---|---|
| Suspend user | `profiles.role` or ban flag set; `admin_actions` row logged (`user_suspended`) |
| Unsuspend user | Reverses suspension; logged (`user_unsuspended`) |
| Set request ban | `profiles.request_banned = true`; blocks post submission |
| Remove request ban | `profiles.request_banned = false` |
| Change request limit | Overrides per-user limits via `profiles.request_limit_overrides` |

---

### US-A4 — Moderate Posts
**Actor:** Admin → Posts tab  
**Actions on `linkedin_posts`:**

| Action | New Status | Use Case |
|---|---|---|
| Hide | `hidden_by_admin` | Temporarily remove from feed |
| Pause | `paused` | Freeze new claims |
| Archive | `archived` | Close post permanently |
| Delete | `deleted` | Remove completely |

All actions logged to `admin_actions` with `target_post_id`.

---

### US-A5 — Override Claim Decisions
**Actor:** Admin → Claims tab  
**Flow:**
1. Browses `admin_claims_overview` view (full supporter + owner detail).
2. Can override any claim regardless of current status:
   - `claim_override_approved` → force approve
   - `claim_override_rejected` → force reject
   - `claim_cancelled` → cancel
   - `claim_expired` → expire
3. Action logged to `admin_actions` with `target_claim_id`.

**Use case:** Dispute resolution when owner is unresponsive or acting in bad faith.

---

### US-A6 — Adjust User Scores
**Actor:** Admin → Scores tab  
**Flow:**
1. Selects a user; enters point delta + reason note.
2. Creates `score_events` row with `event_type = 'admin_adjustment_plus'` or `'admin_adjustment_minus'`.
3. Logged to `admin_actions` (`score_adjusted_plus` / `score_adjusted_minus`).

**Use case:** Correct fraudulent scores; compensate for system errors.

---

### US-A7 — Review Auto-Generated Flags
**Actor:** Admin → Flags tab  
**Flag types auto-created by the system:**

| Flag Type | Trigger |
|---|---|
| `fast_complete` | Claim completed within 30 seconds of claiming |
| `high_rejection` | Supporter accumulates many rejected claims |
| `mutual_support` | Two users exclusively support each other (gaming detection) |
| `owner_mass_approval` | Owner approves all claims without apparent review |
| `request_limit_abuse` | User repeatedly hits rate limits |
| `suspicious_pattern` | Other anomalous behavior |

**Resolution actions:** `reviewed`, `ignored`, `actioned` — all saved to `admin_flags.status`.

---

### US-A8 — Review User Reports
**Actor:** Admin → Flags/Reports tab  
**Flow:**
1. Views `user_reports` with `status = 'open'`.
2. Reviews flag type (`spam`, `abuse`, `inappropriate`, `broken_link`, `other`) and reporter's reason.
3. Takes action (hide post, ban user, dismiss) → updates `status` to `reviewed`, `dismissed`, or `actioned`.

---

### US-A9 — Configure System Settings
**Actor:** Admin → Settings tab  
**Editable keys in `system_settings`:**

| Key | Default | Description |
|---|---|---|
| `points_like` | 10 | Points for approved like |
| `points_comment` | 15 | Points for approved comment |
| `points_repost` | 10 | Points for approved repost |
| `points_combo_all_three` | 50 | Bonus for all three approved on same post |
| `daily_post_limit` | 2 | Max new posts per user per day |
| `weekly_post_limit` | 7 | Max new posts per user per week |
| `active_post_limit` | 3 | Max simultaneous active posts per user |
| `pending_review_limit_per_owner` | 10 | Max pending_review claims before blocking new posts |
| `request_cooldown_minutes` | 120 | Min minutes between post submissions |
| `max_active_claims_per_user` | 5 | Max concurrent in-flight claims per supporter |
| `fast_complete_seconds` | 30 | Threshold for fast_complete fraud flag |
| `min_comment_length` | 10 | Minimum characters in comment task text |

Changes logged to `admin_actions` (`global_setting_changed`).

---

### US-A10 — Audit Log Review
**Actor:** Admin → Audit tab  
**Flow:**
1. Views `admin_actions` table — all admin operations in chronological order.
2. Filterable by: admin user, action type, target user, target post, target claim.
3. Each row shows: action type, payload JSON, note, timestamp.

**Use case:** Accountability trail; no admin action goes unlogged.

---

## 5. Claim Lifecycle Summary

```
[Supporter]       [Owner]          [Admin / System]

  claimed ──────────────────────────────────────────────────►
                                      auto-flag if < 30s
  completed ───────────────────────────────────────────────►
                  pending_review
                  ┌─► approved ──► score_events created
                  │               (combo_bonus if all 3)
                  └─► rejected
                                      admin can override:
                                      override_approved
                                      override_rejected
                                      claim_cancelled
                                      claim_expired
```

---

## 6. Point Economy at a Glance

| Action | Points | Notes |
|---|---|---|
| Like approved | 10 | Base reward |
| Comment approved | 15 | Higher for more effort |
| Repost approved | 10 | Base reward |
| All 3 combo bonus | +50 | Added on top of individual rewards |
| Admin adjustment | ± variable | Manual correction only |
| Combo reversal | − variable | If combo awarded then reversed |
