# Artifacts Index

Quick reference for all source artifacts. Each file contains full notes, key quotes, and usage guidance.

---

| File                         | BibTeX Key                | What It Is                                                                 | Use In Paper                         |
| ---------------------------- | ------------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| `bogner2022totype.md`        | `bogner2022totype`        | MSR study comparing JavaScript and TypeScript software quality on GitHub   | Related Work, Introduction           |
| `shah2023designsystemsjs.md` | `shah2023designsystemsjs` | CoNTESA paper on standardizing design-system requirements with a JS API    | Discussion, optional background      |
| `tang2026toolchains.md`      | `tang2026toolchains`      | MSR study of bug categories in TypeScript projects and toolchain fragility | Introduction, Related Work           |
| `wang2022testautomation.md`  | `wang2022testautomation`  | JSS study connecting test automation maturity with product quality and CI  | Related Work, Evaluation             |
| `yu2023nfrci.md`             | `yu2023nfrci`             | EMSE multi-case study of automated NFR testing through CI environments     | Related Work, Evaluation, Discussion |

---

## By Paper Section

**Introduction**

- `bogner2022totype`
- `tang2026toolchains`

**Related Work**

- `bogner2022totype`
- `tang2026toolchains`
- `wang2022testautomation`
- `yu2023nfrci`

**System Description / Methods**

- _(add sources here)_

**Evaluation**

- `wang2022testautomation`
- `yu2023nfrci`

**Discussion**

- `shah2023designsystemsjs`
- `tang2026toolchains`
- `wang2022testautomation`
- `yu2023nfrci`

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
