# Plan 002: Bind import processing to owned upload keys

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If a STOP condition occurs, stop and report. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5727da7..HEAD -- apps/backend/src/api/controllers/import.ts apps/backend/src/worker/workflows/process-import.ts apps/backend/src/db/postgres/schema.ts apps/frontend/src/lib/queries/imports.ts`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `5727da7`, 2026-06-10

## Why this matters

The upload endpoint returns an S3 key scoped to the current user, but the process endpoint accepts any `s3Key` string from the client and immediately records a new job for the authenticated user. That allows a client to ask the worker to fetch an arbitrary key in the configured bucket. Even if bucket access is private, this breaks the intended ownership interface and can process another user's upload if the key is guessed or leaked.

## Current state

- `apps/backend/src/api/controllers/import.ts:29` creates keys as `imports/${userId}/${Date.now()}.bin`.
- `apps/backend/src/api/controllers/import.ts:42` validates only `z.object({ s3Key: z.string() })`.
- `apps/backend/src/api/controllers/import.ts:46` inserts `{ userId, s3Key, status: "pending" }` without checking the key prefix or a previously-created upload record.
- `apps/backend/src/worker/workflows/process-import.ts:47` fetches `Key: s3Key`.
- `apps/backend/src/db/postgres/schema.ts:224` has `importJobs` but no separate upload record or uniqueness/idempotency constraint.

## Commands you will need

| Purpose       | Command                        | Expected on success |
| ------------- | ------------------------------ | ------------------- |
| Static checks | `vp run ready`                 | exit 0              |
| Backend tests | `vp run @circles/backend#test` | exit 0              |

## Scope

**In scope**

- `apps/backend/src/api/controllers/import.ts`
- `apps/backend/src/db/postgres/schema.ts`
- a new Drizzle migration under `apps/backend/src/db/postgres/migrations/` if schema changes are required
- focused backend tests

**Out of scope**

- Replacing S3.
- Rewriting the entire import worker.
- Changing the frontend upload UI beyond handling a changed response shape if needed.

## Steps

### Step 1: Choose the smallest ownership model

Prefer a database-backed upload claim: create an import job in `pending_upload` status during `/me/import/upload`, store `userId` and generated `s3Key`, and return `{ uploadUrl, jobId }`. Then `/me/import/process` should accept `{ jobId }`, load the job by `(id, userId)`, require `pending_upload`, and enqueue the worker with the stored key.

If adding `pending_upload` status is incompatible with current status consumers, use a new `import_uploads` table instead. Do not continue with only `s3Key.startsWith(...)`; prefix validation is acceptable as defense in depth, not as the sole ownership record.

**Verify**: `rg -n "s3Key: z\\.string|json: \\{ s3Key \\}" apps/backend/src apps/frontend/src` returns no remaining process-call contract.

### Step 2: Add validation and state transitions

Update the process endpoint so it:

- Authenticates with `authMiddleware`.
- Looks up the upload/job by authenticated `userId`.
- Rejects missing, already-processing, completed, or failed jobs with 404 or 409.
- Enqueues `processImport.runNoWait({ userId, jobId, s3Key: storedKey })` only from the stored key.

**Verify**: Add tests covering another user's job/key and duplicate process calls, then run `vp run @circles/backend#test`.

### Step 3: Keep frontend contract aligned

Update `apps/frontend/src/lib/queries/imports.ts` so it stores the returned `jobId` from upload and sends that to process. Keep the S3 PUT unchanged.

**Verify**: `vp run ready` exits 0.

## Test plan

- Backend tests for:
  - upload creates a processable record owned by the user,
  - process succeeds for the owner,
  - process rejects a job owned by another user,
  - process rejects a duplicate process request.
- Use existing Vite+ test imports from `vite-plus/test`; do not import from `vitest` directly.

## Done criteria

- [ ] `/me/import/process` no longer accepts a raw S3 key as authority.
- [ ] Worker input uses the key loaded from the database.
- [ ] Cross-user process attempts are tested and rejected.
- [ ] `vp run ready` and `vp run @circles/backend#test` exit 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

- Drizzle migration generation requires credentials or mutates non-ignored state unexpectedly.
- Existing clients outside `apps/frontend` depend on the raw `s3Key` process contract.

## Maintenance notes

The import module's interface should be "create upload, then process owned upload." Keep raw object storage keys behind that module; callers should not be able to invent them.
