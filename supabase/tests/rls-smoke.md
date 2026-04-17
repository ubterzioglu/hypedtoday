# RLS Smoke Test Checklist

Run these SQL statements against staging/prod to verify RLS policies.

## Test Users

- **Admin user**: (set admin user email/id here)
- **Normal user**: (set normal user email/id here)

## 1. Profiles Table

```sql
-- Admin user -> should see all profiles
SELECT count(*) FROM profiles;
-- Expected: > 1 row

-- Normal user -> should only see own profile (via RLS)
-- Run as normal user:
SELECT * FROM profiles WHERE id != auth.uid();
-- Expected: 0 rows
```

## 2. Admin Tables Access

```sql
-- Admin user -> should read admin_actions
SELECT count(*) FROM admin_actions;
-- Expected: >= 0 rows (no error)

-- Admin user -> should read admin_flags
SELECT count(*) FROM admin_flags;
-- Expected: >= 0 rows (no error)

-- Normal user -> should NOT read admin_actions
-- Run as normal user:
SELECT count(*) FROM admin_actions;
-- Expected: 0 rows or permission denied
```

## 3. System Settings

```sql
-- Anyone -> should read system_settings
SELECT count(*) FROM system_settings;
-- Expected: > 0 rows
```

## 4. Request Limit Logs

```sql
-- Admin user -> should read all request_limit_logs
SELECT count(*) FROM request_limit_logs;
-- Expected: >= 0 rows (no error)

-- Normal user -> should only see own logs
-- Run as normal user:
SELECT * FROM request_limit_logs WHERE user_id != auth.uid();
-- Expected: 0 rows
```

## 5. is_admin Function

```sql
-- Verify function exists and is SECURITY DEFINER
SELECT prosecdef FROM pg_proc WHERE proname = 'is_admin';
-- Expected: true

-- Verify only authenticated can execute
SELECT has_function_privilege('anon', 'public.is_admin(uuid)', 'execute');
-- Expected: false

SELECT has_function_privilege('authenticated', 'public.is_admin(uuid)', 'execute');
-- Expected: true
```

## Verification Steps

- [ ] Admin user -> profiles SELECT successful
- [ ] Normal user -> only own profile visible
- [ ] Admin -> admin tables readable
- [ ] Normal user -> admin tables not readable
- [ ] System settings readable by all
- [ ] is_admin is SECURITY DEFINER
- [ ] is_admin only accessible by authenticated role
