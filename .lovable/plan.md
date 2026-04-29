## Goal

Add a **Role** selector (Admin / Associate) to the Sign Up tab on the `/auth` page. The selection is recorded as a *request* — no role is granted at signup. An existing admin must approve the request before the role is actually inserted into `user_roles`. The Sign In tab is unchanged (login does not need a role selector — the real role is read from the database).

## Why this design

Letting a user pick their own role on signup would be a privilege-escalation vulnerability. Instead, the selector captures a *desired* role; an admin reviews and grants it. This matches the existing security model (roles in a separate `user_roles` table, gated by `has_role()` and RLS).

## Database changes

Create a new table `role_requests` to track pending requests:

```text
role_requests
  id           uuid PK
  user_id      uuid  (the signer-up)
  requested_role app_role  ('admin' | 'associate')
  status       text  ('pending' | 'approved' | 'rejected')  default 'pending'
  created_at   timestamptz
  reviewed_at  timestamptz nullable
  reviewed_by  uuid nullable
```

RLS policies:
- INSERT: any authenticated user can insert a row where `user_id = auth.uid()` and `status = 'pending'`.
- SELECT: user can see own requests; admins can see all.
- UPDATE: only admins (uses `has_role(auth.uid(), 'admin')`).

## Frontend changes

**`src/pages/Auth.tsx`** — Sign Up tab only:
- Add a `RadioGroup` (shadcn) with two options: **Associate** (default) and **Admin**.
- Store selection in `signUpForm.requestedRole`.
- After a successful `signUp(...)`, insert a row into `role_requests` with the new user's id and the chosen role.
- Update the success toast to say: *"Account created. Your role request is pending admin approval."*
- Sign In tab: untouched.

**`src/i18n/locales/en/auth.json` & `hi/auth.json`** — add keys: `role`, `roleAdmin`, `roleAssociate`, `roleHint`, `roleRequestPending`.

**`src/pages/UserManagement.tsx`** — add a "Pending Role Requests" section:
- List pending rows from `role_requests` joined with `profiles` (name) and email (via an edge function or stored at request time — see note below).
- Each row has **Approve** and **Reject** buttons.
- **Approve** → insert into `user_roles (user_id, role)` and update request to `approved`.
- **Reject** → update request to `rejected`.

Note on email display: `auth.users.email` isn't queryable from the client. Either (a) store `email` on the request row at insert time, or (b) just show the user's `name` from `profiles`. Plan uses option (a) — add an `email` text column to `role_requests` for admin visibility.

## Files touched

- New migration: `role_requests` table + RLS.
- `src/pages/Auth.tsx` — add role selector + insert request after signup.
- `src/pages/UserManagement.tsx` — add pending requests section with approve/reject.
- `src/i18n/locales/en/auth.json`, `src/i18n/locales/hi/auth.json` — new translation keys.

## Out of scope

- No selector on the Sign In tab (would be misleading since real role is DB-driven).
- No email notifications to admins on new requests (can add later via edge function if desired).
