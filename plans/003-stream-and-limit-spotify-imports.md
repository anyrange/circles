# Plan 003: Stream and limit Spotify import processing

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If a STOP condition occurs, stop and report. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5727da7..HEAD -- apps/backend/src/worker/workflows/process-import.ts apps/backend/src/worker/workflows/import-batch.ts apps/backend/src/library/spotify-export.ts apps/frontend/src/components/import-uploader.tsx`

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/002-bind-import-jobs-to-owned-upload-keys.md`
- **Category**: perf
- **Planned at**: commit `5727da7`, 2026-06-10

## Why this matters

Import processing reads the entire uploaded object into memory, unzips the entire archive synchronously, accumulates every valid entry in an array, writes the whole valid array back to S3, and each batch rereads that whole valid JSON file before slicing its chunk. Large Spotify exports can therefore create avoidable memory spikes and repeated S3/download/JSON parse work.

## Current state

- `apps/backend/src/worker/workflows/process-import.ts:48` calls `streamToBuffer` for the whole object.
- `apps/backend/src/worker/workflows/process-import.ts:53` calls `unzipSync(bodyBytes)`.
- `apps/backend/src/worker/workflows/process-import.ts:68` builds `const valid = entries.filter(isValidEntry)`.
- `apps/backend/src/worker/workflows/process-import.ts:72` writes the full valid array as one `-valid.json`.
- `apps/backend/src/worker/workflows/import-batch.ts:47-50` downloads and parses the full valid JSON for every batch, then slices.
- `apps/frontend/src/components/import-uploader.tsx:62` accepts `.zip,.json` but does not enforce a client-side size limit.

## Commands you will need

| Purpose       | Command                        | Expected on success |
| ------------- | ------------------------------ | ------------------- |
| Static checks | `vp run ready`                 | exit 0              |
| Backend tests | `vp run @circles/backend#test` | exit 0              |

## Scope

**In scope**

- `apps/backend/src/worker/workflows/process-import.ts`
- `apps/backend/src/worker/workflows/import-batch.ts`
- `apps/backend/src/library/spotify-export.ts`
- `apps/frontend/src/components/import-uploader.tsx` only for mirrored client limit messaging
- focused parser/import tests

**Out of scope**

- Changing Spotify API hydration behavior.
- Changing the public library/history data model.

## Steps

### Step 1: Add explicit size and entry limits

Define backend constants near the import workflow, for example `MAX_IMPORT_BYTES`, `MAX_UNZIPPED_BYTES`, and `MAX_IMPORT_ENTRIES`. Check S3 `ContentLength` before reading if available, enforce accumulated bytes while streaming, and fail the job with a user-safe error message if limits are exceeded.

**Verify**: Add tests for over-limit JSON and zip inputs; `vp run @circles/backend#test` exits 0.

### Step 2: Split validated entries into per-batch objects once

Instead of writing one `validKey`, write one object per batch, such as `imports/<userId>/<jobId>/batch-00001.json`. Pass `batchKey` to `importBatch`. Each child then downloads only its own batch and no longer needs `offset` or `limit`.

**Verify**: `rg -n "valid\\.slice|offset|limit|validKey" apps/backend/src/worker/workflows/import-batch.ts apps/backend/src/worker/workflows/process-import.ts` shows no old slicing contract except constants that intentionally remain.

### Step 3: Avoid synchronous full-archive expansion where feasible

If `fflate` streaming unzip can be integrated cleanly, parse JSON entries as streams and enforce unzipped byte limits. If that proves too broad for this plan, keep `unzipSync` but enforce compressed and uncompressed size limits before accepting entries. Do not leave unlimited sync unzip.

**Verify**: Backend tests include a zip with multiple JSON files and a zip exceeding the limit.

### Step 4: Mirror limits in the uploader UI

Add client-side file-size rejection in `ImportUploader` with accessible status text. This is UX only; backend limits remain authoritative.

**Verify**: `vp run @circles/frontend#test` exits 0.

## Test plan

- Parser tests modeled after `apps/backend/src/library/spotify-export.spec.ts` and `apps/backend/src/library/zip.spec.ts`.
- Workflow-level unit tests if the Hatchet workflow is difficult to invoke directly; extract pure helpers only when they improve locality.
- Cases: valid JSON, valid zip with multiple JSON files, invalid JSON, too-large file, too many valid entries.

## Done criteria

- [ ] Backend rejects imports above configured byte/entry limits.
- [ ] Each batch reads only a batch-sized object.
- [ ] The old full-valid-file slicing contract is gone.
- [ ] Frontend refuses obviously too-large files before upload.
- [ ] `vp run ready`, backend tests, and frontend tests exit 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

- Hatchet child workflow input migration would break currently running production jobs.
- Streaming unzip requires replacing `fflate` or a large new dependency without maintainer approval.

## Maintenance notes

Keep the import parser as a deep module: callers should pass an object stream and get bounded batches or a typed failure. Avoid spreading byte/entry limit checks across controllers, workflows, and UI.
