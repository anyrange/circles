# Plan 005: Use shadcn Button primitives on the landing page

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If a STOP condition occurs, stop and report. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat f668e4f..HEAD -- apps/frontend/src/routes/index.tsx apps/frontend/src/components/ui/button.tsx apps/frontend/src/components/ui/avatar.tsx`
> If any in-scope file changed since this plan was written, compare the excerpts below with live code before proceeding.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `f668e4f`, 2026-06-11

## Why this matters

The landing page still hand-builds button styling with raw color classes, icon sizing, template-literal class strings, and `-space-x-2`. That bypasses the installed shadcn Button and Avatar patterns, so future visual changes have to be made in two places. Moving these controls to installed primitives reduces custom CSS and makes the first screen match the app's component system.

## Current state

- `apps/frontend/src/routes/index.tsx` imports lucide icons directly but does not import `Button`.
- Header sign-in button is raw markup:

```tsx
// apps/frontend/src/routes/index.tsx:49
<button
  onClick={signIn}
  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur transition hover:bg-white/14 focus-visible:ring-3 focus-visible:ring-[#1db954]/45 focus-visible:outline-none"
>
  <SpotifyIcon />
  Sign in
</button>
```

- Primary CTA is another raw button with raw Spotify green classes:

```tsx
// apps/frontend/src/routes/index.tsx:76
<button
  onClick={signIn}
  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#1DB954] px-7 text-base font-bold text-[#041008] shadow-2xl shadow-[#1db954]/25 transition hover:bg-[#28d463] focus-visible:ring-3 focus-visible:ring-[#1db954]/45 focus-visible:outline-none sm:w-auto"
>
```

- The mini-disc stack uses a shadcn-forbidden negative spacing utility:

```tsx
// apps/frontend/src/routes/index.tsx:84
<div className="flex -space-x-2">
```

- Project shadcn context: Radix base, Tailwind v4, lucide icon library, Button installed at `apps/frontend/src/components/ui/button.tsx`.

## Commands you will need

| Purpose        | Command                          | Expected on success |
| -------------- | -------------------------------- | ------------------- |
| Static checks  | `vp run ready`                   | exit 0              |
| Frontend tests | `vp run @circles/frontend#test`  | exit 0              |
| Build          | `vp run @circles/frontend#build` | exit 0              |

## Suggested executor toolkit

- Use the `shadcn` skill if available.
- Component docs already resolved by the advisor: Button docs are at `https://ui.shadcn.com/docs/components/radix/button`.

## Scope

**In scope**

- `apps/frontend/src/routes/index.tsx`
- Add a focused browser/unit test only if existing landing route tests already exist; otherwise do not create a broad new test harness.

**Out of scope**

- Reworking landing-page copy or page composition.
- Changing auth provider behavior.
- Editing installed shadcn UI component source.

## Git workflow

- Branch: `advisor/005-use-shadcn-buttons-on-landing`
- Commit message style: conventional commits, for example `fix: use shadcn buttons on landing`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Replace raw CTA buttons with `Button`

Import `Button` from `@/components/ui/button`. Replace both raw `<button>` elements with `<Button type="button" onClick={signIn}>`.

Use existing variants first:

- Header action: `variant="outline"` or `variant="ghost"` with only layout classes needed for landing contrast.
- Primary CTA: `variant="default"` with `size="lg"` and `className="w-full sm:w-auto"` if width control is still needed.

Keep icons inside the button, but mark them with `data-icon="inline-start"` or `data-icon="inline-end"` instead of sizing classes. The custom `SpotifyIcon` should accept component props and receive `data-icon="inline-start"`.

**Verify**: `rg -n "<button|</button>|focus-visible:ring-\\[#|bg-\\[#1DB954\\]|hover:bg-\\[#28d463\\]" apps/frontend/src/routes/index.tsx` returns no matches.

### Step 2: Remove shadcn spacing and class composition violations

Replace `className={\`...\`}`in`AlbumArt`and`MiniDisc`with`cn(...)`from`@/lib/utils`. Replace the mini-disc `-space-x-2`stack with`AvatarGroup`or an explicit`flex gap-0` layout using overlap via child margins only if AvatarGroup does not fit the design.

If using `AvatarGroup`, import `Avatar`, `AvatarFallback`, and `AvatarGroup` from `@/components/ui/avatar`, and use semantic fallback content. Do not keep `Music2 className="size-3.5"` inside a Button; icon sizing inside Button is handled by Button CSS.

**Verify**: `rg -n "-space-x-|className=\\{`|Music2 className|ArrowRight className|Sparkles className" apps/frontend/src/routes/index.tsx` returns no matches unless the remaining match is outside a shadcn component and intentionally documented in a nearby comment.

### Step 3: Keep the landing page visually stable

Run the app and inspect the unauthenticated route at desktop and mobile widths. The first viewport should still show Circles, the Spotify CTA, and a hint of the bottom signal row.

**Verify**: `vp run @circles/frontend#build` exits 0.

## Test plan

- Existing route/component tests are not required for this cosmetic refactor unless a landing test already exists.
- Run `vp run @circles/frontend#test` to ensure no component regressions.
- Manually inspect with the dev server if available: `vp run @circles/frontend#dev -- --port 3000`.

## Done criteria

- [ ] Landing page sign-in actions use `Button`.
- [ ] Icons inside Button use `data-icon` and no explicit `size-*` class.
- [ ] `apps/frontend/src/routes/index.tsx` no longer contains raw CTA button styling, `-space-x-*`, or template-literal className composition.
- [ ] `vp run ready` exits 0.
- [ ] `vp run @circles/frontend#test` exits 0.
- [ ] `vp run @circles/frontend#build` exits 0.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- The landing page has changed enough that the excerpts above no longer identify the current CTA controls.
- The visual design requires raw brand colors that cannot be represented without changing global theme tokens.
- A passing build requires touching files outside the Scope section.

## Maintenance notes

Reviewers should check that landing-specific layout classes do not override Button color and typography. If product wants a branded Spotify button later, add a named Button variant or theme token instead of reintroducing one-off raw color classes.
