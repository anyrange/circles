# Plan 001: Remove session tokens from URLs and localStorage

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If a STOP condition occurs, stop and report. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5727da7..HEAD -- apps/backend/src/api/index.ts apps/backend/src/library/auth.ts apps/backend/src/api/middleware/auth.ts apps/frontend/src/lib/session-token.ts apps/frontend/src/lib/api.ts apps/frontend/src/routes/_authenticated/route.tsx apps/frontend/src/routes/index.tsx`
> If any in-scope file changed since this plan was written, compare the excerpts below with live code before proceeding.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `5727da7`, 2026-06-10

## Why this matters

The backend currently extracts the Better Auth session cookie and appends the raw session token to the OAuth redirect URL. The frontend then stores that token in `localStorage` and sends it as a bearer token. That converts an HttpOnly cookie session into a URL-visible and script-readable long-lived bearer credential, increasing leak impact through browser history, logs, referrers, extensions, and XSS.

## Current state

- `apps/backend/src/api/index.ts` rewrites callback redirects:

```ts
// apps/backend/src/api/index.ts:36
if (ctx.req.path.startsWith("/api/auth/callback/")) {
  const location = response.headers.get("location");
  const setCookie = response.headers.get("set-cookie");
  const sessionToken = setCookie?.match(/(?:^|, )__Secure-better-auth\.session_token=([^;]+)/)?.[1];
  // apps/backend/src/api/index.ts:45
  redirectUrl.searchParams.set("session_token", decodeURIComponent(sessionToken));
}
```

- `apps/frontend/src/lib/session-token.ts` stores the token in `localStorage`:

```ts
// apps/frontend/src/lib/session-token.ts:8
export const setSessionToken = (token: string) => {
  window.localStorage.setItem(SESSION_TOKEN_KEY, token);
};
```

- `apps/frontend/src/lib/api.ts` attaches that value as `Authorization: Bearer ...`.
- `apps/backend/src/api/middleware/auth.ts` accepts bearer tokens by querying the `session` table directly.
- Repo convention: commands must use Vite+ wrappers. Use `vp run ready`, `vp run @circles/frontend#test`, and `vp run @circles/backend#test`; do not call `pnpm test` or install Vitest directly.

## Commands you will need

| Purpose        | Command                         | Expected on success |
| -------------- | ------------------------------- | ------------------- |
| Static checks  | `vp run ready`                  | exit 0              |
| Frontend tests | `vp run @circles/frontend#test` | exit 0              |
| Backend tests  | `vp run @circles/backend#test`  | exit 0              |

## Scope

**In scope**

- `apps/backend/src/api/index.ts`
- `apps/backend/src/api/middleware/auth.ts`
- `apps/frontend/src/lib/session-token.ts`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/routes/_authenticated/route.tsx`
- `apps/frontend/src/routes/index.tsx`
- focused tests if the repo has a nearby pattern

**Out of scope**

- Changing Better Auth providers or database schema.
- Changing public app navigation outside login/session handling.

## Steps

### Step 1: Stop adding session tokens to callback URLs

Remove the callback-specific `set-cookie` parsing and `session_token` redirect rewriting from `apps/backend/src/api/index.ts`. Let `auth.handler(ctx.req.raw)` return the original Better Auth response.

**Verify**: `rg -n "session_token|set-cookie|__Secure-better-auth" apps/backend/src/api/index.ts` returns no matches.

### Step 2: Remove bearer-token session storage from the frontend

Delete the `localStorage` session-token flow. Remove `apps/frontend/src/lib/session-token.ts` if no callers remain. Update `apps/frontend/src/lib/api.ts` so its custom fetch only uses `credentials: "include"` and does not set `Authorization`.

**Verify**: `rg -n "sessionToken|session_token|Authorization|Bearer|circles\\.sessionToken" apps/frontend/src` returns no matches, except unrelated generated or documentation files if any.

### Step 3: Make route guards rely on Better Auth cookies

Update `apps/frontend/src/routes/_authenticated/route.tsx` and `apps/frontend/src/routes/index.tsx` so they call `authClient.getSession()` as the only session check. Preserve the existing redirect behavior.

**Verify**: `vp run @circles/frontend#test` exits 0.

### Step 4: Remove direct bearer-token auth on backend app routes

In `apps/backend/src/api/middleware/auth.ts`, remove the direct `Authorization` lookup against `sessionTable`. Keep `auth.api.getSession({ headers: ctx.req.raw.headers })`.

**Verify**: `vp run @circles/backend#test` exits 0.

## Test plan

- Add or update the smallest available tests around `consumeSessionTokenFromUrl` deletion and route guard behavior if test helpers exist.
- If no route-level tests exist, add a small unit test for `api` fetch behavior only if it can be done without new infrastructure.
- Final verification: `vp run ready`, `vp run @circles/frontend#test`, and `vp run @circles/backend#test` all exit 0.

## Done criteria

- [ ] No source file contains `session_token`, `circles.sessionToken`, or bearer-session fallback.
- [ ] OAuth callback handling no longer parses `set-cookie`.
- [ ] Frontend API calls still send cookies via `credentials: "include"`.
- [ ] All commands in the test plan exit 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

- Better Auth cookie sessions do not work cross-origin with the current frontend/backend deployment URLs.
- The fix requires changing OAuth provider configuration outside this repo.
- Any in-scope file drift invalidates the excerpts above.

## Maintenance notes

Reviewers should confirm no session credential is exposed to JavaScript. If a future non-browser client needs bearer auth, add a separate explicit token module with revocation and scope rather than reusing browser session tokens.
