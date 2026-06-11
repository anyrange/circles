# Plan 007: Consolidate empty states with shadcn Empty

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If a STOP condition occurs, stop and report. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat f668e4f..HEAD -- apps/frontend/src/routes/_authenticated/u/\\$username/route.tsx apps/frontend/src/components/feed-section.tsx apps/frontend/src/components/ui/empty.tsx apps/frontend/components.json`
> If any in-scope file changed since this plan was written, compare the excerpts below with live code before proceeding.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `f668e4f`, 2026-06-11

## Why this matters

Several empty states are custom paragraphs inside sections or cards. shadcn has an Empty primitive for this exact case, and using it will make no-data states more consistent across social feeds and public profiles. This is a low-risk cleanup that removes repeated markup and improves scanning.

## Current state

- Public profile empty sections use a local paragraph helper:

```tsx
// apps/frontend/src/routes/_authenticated/u/$username/route.tsx:371
function EmptyProfileSection({ children }: { children: string }) {
  return <p className="py-8 text-sm text-muted-foreground">{children}</p>;
}
```

- That helper is used for top tracks and top genres:

```tsx
// apps/frontend/src/routes/_authenticated/u/$username/route.tsx:239
<EmptyProfileSection>No top tracks for this range yet.</EmptyProfileSection>

// apps/frontend/src/routes/_authenticated/u/$username/route.tsx:305
<EmptyProfileSection>No genre data for this range yet.</EmptyProfileSection>
```

- Feed empty state is a card with only a paragraph:

```tsx
// apps/frontend/src/components/feed-section.tsx:27
<Card>
  <CardContent className="py-8 text-center">
    <p className="text-sm text-muted-foreground">
      No activity yet. Follow people to see what they're listening to.
    </p>
  </CardContent>
</Card>
```

- `vp exec shadcn info --json` showed installed components do not include `empty`.

## Commands you will need

| Purpose        | Command                          | Expected on success                           |
| -------------- | -------------------------------- | --------------------------------------------- |
| Add component  | `vp exec shadcn add empty`       | exit 0; creates `src/components/ui/empty.tsx` |
| Static checks  | `vp run ready`                   | exit 0                                        |
| Frontend tests | `vp run @circles/frontend#test`  | exit 0                                        |
| Build          | `vp run @circles/frontend#build` | exit 0                                        |

## Suggested executor toolkit

- Use the `shadcn` skill if available.
- Before editing, run `vp exec shadcn docs empty` and read the docs URL it prints.

## Scope

**In scope**

- `apps/frontend/src/routes/_authenticated/u/$username/route.tsx`
- `apps/frontend/src/components/feed-section.tsx`
- `apps/frontend/src/components/ui/empty.tsx` if added by the shadcn CLI
- `apps/frontend/components.json` only if the shadcn CLI updates it

**Out of scope**

- Redesigning PageSection, Card, or social-feed grouping.
- Changing empty-state copy beyond splitting title/description.
- Adding icons unless Empty docs show a built-in icon slot that fits without new dependencies.

## Git workflow

- Branch: `advisor/007-consolidate-empty-states-with-shadcn-empty`
- Commit message style: conventional commits, for example `refactor: use empty states in profile and feed`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add the Empty component through shadcn

Run `vp exec shadcn add empty`. Read the added file and exported component names before using it. Do not guess the API from memory.

**Verify**: `test -f apps/frontend/src/components/ui/empty.tsx` exits 0.

### Step 2: Replace profile empty paragraph helper

Replace `EmptyProfileSection` with Empty composition in `apps/frontend/src/routes/_authenticated/u/$username/route.tsx`.

The target shape should be equivalent to:

- title: the current sentence's short subject, for example `No top tracks`
- description: range-specific context, for example `This profile has no top tracks for the selected range yet.`

Remove the local `EmptyProfileSection` helper if it becomes unused.

**Verify**: `rg -n "EmptyProfileSection|py-8 text-sm text-muted-foreground" 'apps/frontend/src/routes/_authenticated/u/$username/route.tsx'` returns no matches.

### Step 3: Replace feed empty card paragraph

In `apps/frontend/src/components/feed-section.tsx`, replace the empty Card with Empty composition. If Empty is already card-like, do not nest it inside Card. If docs show Empty should sit inside CardContent, keep exactly one card layer.

**Verify**: `rg -n "No activity yet|py-8 text-center|<p className=\"text-sm text-muted-foreground\"" apps/frontend/src/components/feed-section.tsx` returns no raw paragraph empty-state matches.

## Test plan

- Run the existing frontend tests: `vp run @circles/frontend#test`.
- If there are browser specs for feed/profile empty states, update assertions to look for the new title/description text.
- Build the frontend to catch route import and tree-shake issues.

## Done criteria

- [ ] `empty` is installed through shadcn, not hand-copied.
- [ ] Public profile top-tracks and top-genres no-data states use Empty.
- [ ] Social feed no-activity state uses Empty without nested cards inside cards.
- [ ] The obsolete `EmptyProfileSection` helper is removed.
- [ ] `vp run ready` exits 0.
- [ ] `vp run @circles/frontend#test` exits 0.
- [ ] `vp run @circles/frontend#build` exits 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- `vp exec shadcn add empty` attempts to overwrite unrelated files.
- Empty is unavailable in the configured `radix-maia` registry.
- The feed empty state is relied on by tests that require the exact current DOM structure.

## Maintenance notes

After this lands, prefer Empty for no-data states and Alert for actionable warnings/errors. Avoid one-off muted paragraphs for empty UI unless the surrounding component already provides a semantically equivalent empty state.
