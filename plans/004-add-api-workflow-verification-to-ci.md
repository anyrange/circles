# Plan 004: Add API and workflow verification to CI

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If a STOP condition occurs, stop and report. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 5727da7..HEAD -- .github/workflows/ci.yml apps/backend/vite.config.ts apps/backend/src/api apps/backend/src/worker`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `5727da7`, 2026-06-10

## Why this matters

The backend coverage configuration explicitly excludes API controllers and worker workflows, while CI runs only `vp run ready`, which maps to format and lint. The highest-risk code paths in this app are auth, imports, Spotify sync, and worker orchestration; currently they can regress without a required test or build gate.

## Current state

- `.github/workflows/ci.yml:20` runs `pnpm vp run ready` only.
- Root `package.json:6` defines `"ready": "vp fmt && vp lint"`, so tests are not included.
- `apps/backend/vite.config.ts:18-19` excludes `src/api/controllers/*.ts` and `src/worker/workflows/*.ts` from coverage.
- Existing backend tests cover only library helpers such as `range`, `retry`, `spotify-export`, and `zip`.
- Existing frontend tests cover unit and component/browser specs.

## Commands you will need

| Purpose        | Command                         | Expected on success |
| -------------- | ------------------------------- | ------------------- |
| Static checks  | `vp run ready`                  | exit 0              |
| Backend tests  | `vp run @circles/backend#test`  | exit 0              |
| Frontend tests | `vp run @circles/frontend#test` | exit 0              |
| Build          | `vp run build -r`               | exit 0              |

## Scope

**In scope**

- `.github/workflows/ci.yml`
- root `package.json` scripts if adding a single aggregate verification script
- `apps/backend/vite.config.ts`
- focused tests for auth/import controllers or workflow helpers

**Out of scope**

- Browser automation requiring credentials or deployment secrets.
- Raising coverage thresholds before excluded code has tests.

## Steps

### Step 1: Add a CI verification command that includes tests and build

Add a root script such as `"verify": "vp run ready && vp run test -r && vp run build -r"` or update CI to run the equivalent Vite+ commands directly. Keep package-manager invocations wrapped through `vp` after install.

**Verify**: Run the chosen command locally; it exits 0 or exposes real failures to fix in subsequent steps.

### Step 2: Add focused backend tests for import and auth seams

Add tests that exercise controller/workflow helper behavior introduced by plans 001 and 002 if those plans have landed. If they have not landed, add characterization tests for the current behavior and mark the dangerous cases with TODO assertions only if they cannot pass yet.

**Verify**: `vp run @circles/backend#test` exits 0.

### Step 3: Revisit backend coverage exclusions

Remove broad exclusions for `src/api/controllers/*.ts` and `src/worker/workflows/*.ts` only after at least one focused test exists in each area. If direct workflow tests are too costly, extract pure helpers for parsing/validation and cover those first, then narrow the exclusion to Hatchet registration glue.

**Verify**: `vp run @circles/backend#test:coverage` exits 0 and coverage output includes the new helper/controller files.

### Step 4: Update CI workflow

Update `.github/workflows/ci.yml` so pull requests run static checks, tests, and build. Keep pnpm setup as-is unless the repo has moved to `vp install` in CI.

**Verify**: `git diff -- .github/workflows/ci.yml package.json apps/backend/vite.config.ts` shows only verification-related changes.

## Test plan

- New backend tests for at least one API controller seam and one import/workflow parsing seam.
- Existing frontend component tests remain part of the aggregate command.
- Build is included to catch package export and TanStack route issues.

## Done criteria

- [ ] Pull-request CI runs static checks, tests, and build.
- [ ] API/workflow code is no longer wholly excluded from meaningful coverage.
- [ ] `vp run ready`, `vp run @circles/backend#test`, `vp run @circles/frontend#test`, and `vp run build -r` exit 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

- The aggregate test/build command requires unavailable external services.
- Existing tests are flaky or fail for unrelated reasons; report the failing command and first failure instead of weakening CI.

## Maintenance notes

Keep CI as the repo's verification interface for future agents. Plans that touch auth/import/sync should name the exact focused tests they add, not rely only on lint.
