# Artifacts Index

Quick reference for all source artifacts. Each file contains full notes, key quotes, and usage guidance.

---

| File                         | BibTeX Key                | What It Is                                                                | Use In Paper               |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------------- | -------------------------- |
| `brooks1986silver.md`        | `brooks1986silver`        | Classic software engineering essay on essential vs accidental complexity  | Related Work, Discussion   |
| `potvin2016monorepo.md`      | `potvin2016monorepo`      | CACM article on Google's monorepo model and supporting infrastructure     | Related Work, Introduction |
| `bierman2014typescript.md`   | `bierman2014typescript`   | Formal account of TypeScript as a pragmatic typed extension of JavaScript | Related Work               |
| `tobinhochstadt2008typed.md` | `tobinhochstadt2008typed` | Typed Scheme paper on migrating scripts into maintainable typed programs  | Related Work               |
| `hilton2016ci.md`            | `hilton2016ci`            | Empirical study of continuous integration adoption and effects            | Related Work, Evaluation   |

---

## By Paper Section

**Introduction**

- `potvin2016monorepo`

**Related Work**

- `brooks1986silver`
- `potvin2016monorepo`
- `bierman2014typescript`
- `tobinhochstadt2008typed`
- `hilton2016ci`

**System Description / Methods**

- _(add sources here)_

**Evaluation**

- `hilton2016ci`

**Discussion**

- `brooks1986silver`

---

## Artifact File Format

Each `artifacts/<key>.md` should follow this structure:

```markdown
# Author (Year) — Title

**File:** `sources/<filename>.pdf`
**Venue:** Journal/Conference, Year
**BibTeX key:** `key`
**DOI:** ...

## What It Says

- bullet 1
- bullet 2

## Key Quotes

> "verbatim quote" (p. X)

## How to Use in Paper

- **Section X:** what claim this source supports
```
