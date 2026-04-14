# FinalPlan.md - Stepwise Delivery Plan with Supabase Execution Ownership

## Summary

Convert the current `hypedtoday` app into a secure, authenticated LinkedIn support workflow product in many small implementation steps. This version of the plan assumes **Supabase is already authenticated via token** and that **I will execute the required Supabase queries, migrations, and function deployment commands directly** during implementation rather than leaving DB execution as a manual handoff.

## Execution Ownership

- Database schema changes will be executed by me through Supabase migrations and SQL application.
- RLS and view changes will be authored and applied by me.
- Edge Functions will be created and deployed by me.
- Auth/provider wiring that requires dashboard-only values will be prepared in code/config by me; provider secrets that only exist in Supabase dashboard remain a deployment prerequisite.
- Validation queries, policy checks, and post-migration verification queries will also be executed by me.

## Step List

### Track 1 - Freeze risky behavior first
1. Inventory all direct client-side Supabase writes and reads that expose unsafe access.
2. Remove the hardcoded admin password flow from the implementation plan baseline.
3. Replace the `localStorage` admin gate with an auth-role gate design.
4. Create and execute an emergency migration that disables permissive write policies.
5. Keep only explicitly public read access for safe public views.
6. Block direct public access to votes, feedback, and admin-only data.
7. Verify from Supabase that public writes fail after lockdown.
8. Document which current screens temporarily lose write capability until Edge Functions are live.

### Track 2 - Auth foundation
9. Enable Supabase Auth as the canonical identity layer.
10. Lock providers: Google, GitHub, optional magic link.
11. Create and execute migration for `profiles` table keyed to `auth.users`.
12. Add profile bootstrap logic for first sign-in.
13. Define role model with `user` and `admin`.
14. Define where admin role is stored and how JWT/session checks will read it.
15. Add frontend auth context/provider.
16. Add login page and auth entry UI.
17. Add logout flow.
18. Add session restore flow on refresh.
19. Update route protection to use auth context.
20. Update header/nav to reflect signed-in state.
21. Remove any remaining admin logic tied to browser-only flags.
22. Run verification query set for `profiles` creation and auth-linked ownership columns.

### Track 3 - Core domain remodel
23. Define `linkedin_posts` as the main request entity.
24. Define `post_tasks` for `like`, `comment`, `repost`.
25. Define `task_claims` as the supporter work record.
26. Define `post_owner_reviews` as owner decision history.
27. Define `score_events` as the only source of truth for points.
28. Define `admin_actions` for privileged operations.
29. Define `system_settings` for tunable limits and scoring.
30. Define `request_limit_logs` for rejected request attempts.
31. Define `admin_flags` for suspicious patterns.
32. Add ownership foreign keys from posts/claims/comments to `auth.users`.
33. Add status conventions for posts.
34. Add status conventions for claims.
35. Add timestamps needed for lifecycle transitions.
36. Add archival/moderation fields for soft-delete and hiding.
37. Add indexes for owner lookups, pending review counts, and request-limit queries.
38. Create and execute the migration for this domain model.
39. Run post-migration verification queries for tables, constraints, indexes, and enums/status defaults.

### Track 4 - Public/private data separation
40. Define public DTOs for posts.
41. Define public DTOs for comments.
42. Define public DTOs for leaderboard rows.
43. Define owner-view DTOs for pending reviews.
44. Define admin-view DTOs for moderation and audit screens.
45. Define which fields never leave the server.
46. Create and execute public SQL views only where read-only access is acceptable.
47. Exclude internal fields from every public-facing response contract.
48. Verify view outputs with direct SQL queries run by me.

### Track 5 - Request-limit system
49. Define global setting keys for daily, weekly, active-post, pending-review, and cooldown limits.
50. Add nullable per-user override fields.
51. Add request-ban field.
52. Define request-limit evaluation order.
53. Build `canUserCreatePost(userId)` service contract.
54. Build `getUserRequestLimits(userId)` service contract.
55. Build `setUserRequestLimits(userId, overrides)` admin contract.
56. Implement daily request count query.
57. Implement weekly request count query.
58. Implement active post count query.
59. Implement pending review load query.
60. Implement cooldown check.
61. Implement request-ban check.
62. Add rejection reason codes.
63. Insert log rows for every blocked request creation attempt.
64. Return user-facing error payloads with actionable messages.
65. Add frontend "remaining request capacity" widget plan.
66. Add frontend cooldown/status notice plan.
67. Run SQL verification for request-limit edge cases using seeded/sample rows executed by me.

### Track 6 - Edge Function platform
68. Create shared Edge Function helper folder.
69. Add shared auth verification helper.
70. Add shared admin-role verification helper.
71. Add shared validation schemas.
72. Add shared DTO sanitization helper.
73. Add shared CORS/origin helper.
74. Add shared rate-limit helper.
75. Choose storage for rate-limit counters.
76. Add common error response format.
77. Add common success response format.
78. Define environment variables required by Edge Functions.
79. Create Supabase function scaffolds.
80. Deploy shared function set and verify deployment status.

### Track 7 - Request creation flow
81. Create request creation Edge Function.
82. Validate LinkedIn URL input.
83. Validate selected task types.
84. Run request-limit checks before write.
85. Create `linkedin_posts` record.
86. Create `post_tasks` children.
87. Return normalized created request DTO.
88. Add audit/logging where needed for blocked or suspicious attempts.
89. Update frontend request submission screen to call the new API.
90. Require auth before request creation.
91. Show request-limit failures clearly in UI.
92. Execute end-to-end verification with live Supabase requests run by me.

### Track 8 - Claim flow
93. Create claim creation Edge Function.
94. Validate task availability before claiming.
95. Prevent invalid duplicate claims according to business rules.
96. Store supporter and owner references on the claim.
97. Record `started_at`.
98. Return supporter-facing claim DTO.
99. Add claim listing endpoint for supporter dashboard.
100. Add claim listing endpoint for owner pending approvals.
101. Update frontend feed cards to support claim actions.
102. Gate claim actions behind auth.
103. Execute verification queries and API checks for claim creation outcomes.

### Track 9 - Completion flow
104. Create claim completion Edge Function.
105. Validate claim ownership before completion.
106. Accept optional supporter note, comment text, repost text, and proof reference if used.
107. Set `completed_at`.
108. Move claim into pending owner review state.
109. Return updated claim DTO.
110. Add owner pending-review badge/count endpoint.
111. Add pending-review UI surface for owners.
112. Execute verification queries against claim lifecycle timestamps and statuses.

### Track 10 - Owner approval flow
113. Create approve Edge Function.
114. Create reject Edge Function.
115. Validate owner is the post owner.
116. Prevent duplicate final decisions.
117. Persist `post_owner_reviews` history rows.
118. Set claim `approved_at` or `rejected_at`.
119. On approve, create score event(s).
120. On reject, store rejection note.
121. Return updated claim state to owner and supporter views.
122. Add owner review queue UI.
123. Add review detail drawer/page UI.
124. Execute SQL and API verification to confirm score creation only on approval.

### Track 11 - Combo bonus and scoring
125. Define point keys for like/comment/repost.
126. Define combo bonus key.
127. Implement score event creation on approval.
128. Implement combo detection for same supporter + same post + all three approved tasks.
129. Prevent duplicate combo awards.
130. Add score summary query per user.
131. Add leaderboard aggregate query/view from score events.
132. Replace current vote-driven leaderboard with score-driven leaderboard.
133. Update UI copy and labels to reflect support points rather than anonymous rating.
134. Run SQL verification for combo and non-combo cases executed by me.

### Track 12 - Comments and feedback
135. Rework comments to authenticated create path.
136. Keep public read through safe DTO/view if required.
137. Add comment ownership delete path.
138. Add duplicate/spam guard for repeated comments if retained.
139. Rework feedback submission through Edge Function.
140. Restrict feedback list/delete to admin only.
141. Update current contact/comments screens to use new API layer.
142. Verify comments and feedback policies with direct SQL and function-level checks.

### Track 13 - Admin platform
143. Define admin dashboard metrics.
144. Define admin users list contract.
145. Define admin user detail contract.
146. Define admin posts list contract.
147. Define admin claims list contract.
148. Define admin scores/audit/settings contracts.
149. Define admin flags list contract.
150. Create admin dashboard Edge Function.
151. Create admin users query Edge Function.
152. Create admin user suspend action.
153. Create admin user unsuspend action.
154. Create admin request-ban action.
155. Create admin request-ban removal action.
156. Create admin user-limit override action.
157. Create admin manual score adjustment action.
158. Create admin posts moderation actions: pause, archive, hide, delete.
159. Create admin claims moderation actions: approve override, reject override, cancel, expire.
160. Create admin settings read/update actions.
161. Create admin audit listing action.
162. Ensure every admin mutation writes `admin_actions`.
163. Require mandatory note for critical admin mutations.
164. Execute admin-flow verification against live Supabase auth/role checks.

### Track 14 - Admin UI
165. Build admin dashboard summary cards.
166. Build admin users table.
167. Build admin user detail view.
168. Build admin posts table.
169. Build admin post detail view.
170. Build admin claims table with filters.
171. Build admin claim detail drawer.
172. Build admin scores/history screen.
173. Build admin settings screen.
174. Build admin flags screen.
175. Build admin audit screen.
176. Add pagination/filter state handling for large datasets.
177. Add clear destructive action confirmation modals.

### Track 15 - Security hardening
178. Add production security headers in deployment config.
179. Add CSP policy suitable for the app's asset and Supabase usage.
180. Add `X-Frame-Options`.
181. Add `X-Content-Type-Options`.
182. Add `Referrer-Policy`.
183. Add `Permissions-Policy`.
184. Validate all outbound links server-side where user-provided URLs are stored.
185. Reject unsafe URL schemes.
186. Confirm user-generated text is always rendered as plain text.
187. Confirm no `dangerouslySetInnerHTML` paths are introduced.
188. Remove plaintext IP storage where not strictly needed.
189. Prefer hashed identifiers if abuse detection needs network fingerprints.
190. Verify client bundle no longer contains admin secret or privileged logic.

### Track 16 - Frontend API migration
191. Replace `src/data/mockData.ts` with `src/lib/api.ts`.
192. Add shared fetch wrapper with auth/session headers.
193. Move request creation calls to API wrapper.
194. Move comments calls to API wrapper.
195. Move feedback calls to API wrapper.
196. Move admin calls to API wrapper.
197. Replace old vote submission UI/logic with claim/support workflow.
198. Remove dead code tied to anonymous vote model.
199. Update types to match DTO contracts.
200. Keep Supabase browser client only for auth/session operations.

### Track 17 - Supabase execution and verification passes
201. Run `supabase migration list` before each DB phase.
202. Apply each migration through the linked Supabase project.
203. Run schema verification queries after each migration.
204. Run RLS policy verification queries after each policy change.
205. Deploy Edge Functions incrementally rather than as one batch.
206. Run live function smoke tests after each deployment.
207. Validate auth claims and admin-role gating against real sessions.
208. Capture a compact execution log of applied migrations, deployed functions, and verification query outcomes.
209. Reconcile any schema drift between local migration history and remote project before continuing.

### Track 18 - Testing
210. Add unit tests for request-limit evaluation.
211. Add unit tests for combo bonus detection.
212. Add unit tests for DTO sanitization.
213. Add Edge Function tests for auth-required endpoints.
214. Add Edge Function tests for owner-only approval.
215. Add Edge Function tests for admin-only actions.
216. Add tests for blocked direct writes under RLS.
217. Add tests for duplicate/invalid claim flows.
218. Add tests for request-ban and cooldown behavior.
219. Add frontend integration tests for auth gating.
220. Add frontend integration tests for owner review flow.
221. Add frontend integration tests for admin access control.
222. Add regression test ensuring no hardcoded admin password remains.

## Acceptance Scenarios

- A signed-in user can open a LinkedIn support request only when within limits.
- Another signed-in user can claim one of the request's enabled tasks.
- The supporter can mark the claimed task complete.
- The request owner can approve or reject the completion.
- Approved completions create score events and affect leaderboard.
- Completing and approving all three task types for the same post gives one combo bonus.
- Admin can suspend users, override claims, adjust limits, and all such actions appear in audit logs.
- Public users can browse public content without seeing internal identities or abuse metadata.
- Browser-side direct table writes fail because RLS no longer permits them.
- All migrations, verification queries, and Edge Function deployments are executed by me against the authenticated Supabase project.

## Assumptions

- `today.md` supplies the product and operations model.
- `plano roota today2.md` supplies the security architecture and migration strategy.
- The merged plan replaces the current anonymous public voting product with the LinkedIn task/approval model rather than supporting both in parallel.
- Supabase token auth is already available and sufficient for CLI-driven migration, query, and deployment work.
- Provider client IDs/secrets that only live in Supabase dashboard remain an external prerequisite, but all code/config around them is still part of implementation.
