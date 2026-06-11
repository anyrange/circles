# Plan 006: Use semantic shadcn feedback in the import uploader

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If a STOP condition occurs, stop and report. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat f668e4f..HEAD -- apps/frontend/src/components/import-uploader.tsx apps/frontend/src/components/ui/alert.tsx apps/frontend/components.json`
> If any in-scope file changed since this plan was written, compare the excerpts below with live code before proceeding.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `f668e4f`, 2026-06-11

## Why this matters

The import uploader currently renders success and failure states as hand-styled muted divs, while errors and upload status are plain paragraphs. That makes feedback semantics inconsistent and easy to miss for assistive technologies. shadcn's Alert component is the right primitive for callouts and error feedback, and adding it keeps upload status styling centralized.

## Current state

- `apps/frontend/src/components/import-uploader.tsx` uses `Progress` and custom markup:

```tsx
// apps/frontend/src/components/import-uploader.tsx:72
{
  fileError && <p className="text-sm text-destructive">{fileError}</p>;
}

// apps/frontend/src/components/import-uploader.tsx:94
{
  isCompleted && (
    <div className="rounded-lg bg-muted p-3 text-sm">
      Import complete! {status && "importedTracks" in status && status.importedTracks} tracks
      imported.
    </div>
  );
}

// apps/frontend/src/components/import-uploader.tsx:101
{
  isFailed && (
    <div className="rounded-lg bg-muted p-3 text-sm text-destructive">
      Import failed: {status && "errorMessage" in status && status.errorMessage}
    </div>
  );
}
```

- `apps/frontend/components.json` shows aliases use `@/components/ui`.
- `vp exec shadcn info --json` showed installed components do not include `alert`.

## Commands you will need

| Purpose        | Command                          | Expected on success                           |
| -------------- | -------------------------------- | --------------------------------------------- |
| Add component  | `vp exec shadcn add alert`       | exit 0; creates `src/components/ui/alert.tsx` |
| Static checks  | `vp run ready`                   | exit 0                                        |
| Frontend tests | `vp run @circles/frontend#test`  | exit 0                                        |
| Build          | `vp run @circles/frontend#build` | exit 0                                        |

## Suggested executor toolkit

- Use the `shadcn` skill if available.
- Before editing, run `vp exec shadcn docs alert` and read the docs URL it prints.

## Scope

**In scope**

- `apps/frontend/src/components/import-uploader.tsx`
- `apps/frontend/src/components/ui/alert.tsx` if added by the shadcn CLI
- `apps/frontend/components.json` only if the shadcn CLI updates it

**Out of scope**

- Backend import limits or worker behavior.
- Replacing the upload drag-and-drop interaction.
- Adding new upload status API fields.

## Git workflow

- Branch: `advisor/006-use-alerts-for-import-uploader-feedback`
- Commit message style: conventional commits, for example `fix: use alerts for import feedback`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add the Alert component through shadcn

Run `vp exec shadcn add alert` from `apps/frontend` or repo root as appropriate. Read the added `apps/frontend/src/components/ui/alert.tsx` file and confirm imports use the repo aliases.

**Verify**: `test -f apps/frontend/src/components/ui/alert.tsx` exits 0, and `rg -n '"alert"' apps/frontend/components.json apps/frontend/src/components/ui` finds the new component or source file.

### Step 2: Replace custom feedback boxes with Alert composition

Import `Alert`, `AlertDescription`, and `AlertTitle` from `@/components/ui/alert`. Render:

- `fileError` as destructive Alert with `role="alert"`.
- `isCompleted` as default Alert with a short success title.
- `isFailed` as destructive Alert with title `Import failed`.

Keep the existing copy and track count. Use `AlertDescription` for dynamic detail text. Do not use raw rounded muted divs for these states.

**Verify**: `rg -n "rounded-lg bg-muted p-3|text-sm text-destructive|Import failed:" apps/frontend/src/components/import-uploader.tsx` returns no matches.

### Step 3: Improve status accessibility without changing behavior

For `trigger.isPending`, render status text with `role="status"` or `aria-live="polite"`. For the processing progress block, keep `Progress` and add an accessible label if the existing Progress component does not already provide one via props.

**Verify**: `rg -n "role=\"status\"|aria-live=\"polite\"|aria-label" apps/frontend/src/components/import-uploader.tsx` finds the new status semantics.

## Test plan

- If there is no focused test, add one only if nearby component tests already cover uploader behavior. Otherwise rely on static checks and build for this small UI primitive swap.
- Run `vp run @circles/frontend#test`.

## Done criteria

- [ ] `alert` is installed through shadcn, not hand-copied from the internet.
- [ ] Import uploader success, file error, and failed states use Alert composition.
- [ ] Uploading/processing status has live-region or status semantics.
- [ ] `vp run ready` exits 0.
- [ ] `vp run @circles/frontend#test` exits 0.
- [ ] `vp run @circles/frontend#build` exits 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- `vp exec shadcn add alert` wants to overwrite unrelated existing files.
- The installed Alert API differs from the docs and cannot support destructive/default variants without editing component source.
- Tests reveal existing uploader behavior is broken before this change.

## Maintenance notes

After this lands, future import feedback should use Alert or toast consistently. Keep backend validation authoritative; the uploader's client-side messages are only UX.
