# Project: Unified Toolchain and Testing Consistency in a TypeScript Monorepo

## Paper Topic

**Title:** How a Unified Development Toolchain Supports Automated Testing Consistency in a TypeScript Full-Stack Monorepo: A Case Study of Circles

**Core idea:** Modern TypeScript monorepos face a fragmented toolchain problem — different tools for bundling, testing, linting, and formatting create inconsistent test environments between packages. This paper argues that a unified toolchain (Vite+) collapses this fragmentation and directly improves testing consistency. The Circles project is used as the concrete case study.

**This paper is about toolchain unification, not testing theory.**

**The three main claims:**

1. Toolchain fragmentation in monorepos leads to inconsistent test behavior across packages — the same test logic can pass in one package and fail in another due to different resolution, transform, and runtime configurations.
2. A unified toolchain that shares a single configuration surface (one tool, one resolver, one transform pipeline) eliminates this class of inconsistency.
3. The Circles case study demonstrates this concretely: before unification, tests behaved differently across the frontend, backend, and shared packages; after adopting Vite+, all packages ran the same test stack with identical behavior.

**Key insight the paper must communicate:** The problem is not that tests are wrong — it is that the environment running the tests differs per package. Unification fixes the environment, not the tests.

---

## Writing Style

- **Simple, clear English** — short sentences, no filler words
- **3rd person only** — NO "I", "we", "our", "the authors"
- **No marketing language** — avoid "powerful", "seamless", "modern", "innovative"
- **No AI terms** — avoid "AI model", "prompt", "LLM", "token"
- **Clean punctuation** — no em-dashes, no fancy symbols
- **Passive or neutral voice** — "The toolchain is configured..." not "We configured..."

**Examples:**

- Bad: "Our powerful unified approach seamlessly eliminates all tooling inconsistencies..."
- Good: "The unified toolchain removes per-package configuration differences."

---

## Project Structure

```
paper/
├── AGENTS.md              # Full agent guide
├── CLAUDE.md              # This file — mirrors AGENTS.md
├── package.json           # Dev scripts (typst watch/compile/format)
├── src/                   # The paper (Typst)
│   ├── main.typ           # Entry point — compile with: typst compile src/main.typ main.pdf
│   ├── sections/          # introduction, related-work, methods, results, discussion, conclusion, acknowledgment
│   ├── figures/           # .typ figures and .png images
│   └── references/
│       └── references.bib
├── sources/               # PDF sources (drop PDFs here)
└── artifacts/             # Key findings extracted from each source PDF
    └── __index.md         # Index of all artifacts with BibTeX keys and paper section mapping
```

**Always compile after changes:** `typst compile src/main.typ main.pdf`

---

## Adding a New Source

When a new PDF is added to `sources/`:

1. Read the PDF carefully.
2. Create a new artifact file in `artifacts/<key>.md` using this format:
   - Title, file path, venue, BibTeX key
   - What it says (2–4 bullet points)
   - Key quotes (verbatim, with page numbers)
   - How to use it in the paper (which section, what claim it supports)
3. Update `artifacts/__index.md` — add a row to the table and note which paper section(s) it supports.
4. Add the BibTeX entry to `src/references/references.bib`.

---

## Paper Structure (IMRAD)

| Section            | Purpose                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| Introduction       | Monorepo testing fragmentation problem, research question, contributions          |
| Related Work       | Monorepo tooling literature, testing consistency research, Vite/Vitest prior work |
| System Description | Circles architecture (frontend, backend, shared packages), toolchain before/after |
| Evaluation         | Metrics: config surface, test behavior consistency, CI pipeline uniformity        |
| Discussion         | Threats to validity, generalizability beyond Circles                              |
| Conclusion         | Summary of findings, implications for monorepo projects                           |

---

## Authors

1. **Aldiyar Seylkhanov** — Bachelor Degree Student, AITU (seylkhanov.aldiyar@gmail.com)
2. **Alexandr Tyulkov** — Master Degree Student, AITU (widesehl@gmail.com, ORCID 0009-0009-6422-0559)
3. **Malika Ishakhanova** — Master Degree Student, AITU (malikaishakhanova@gmail.com)

**Venue:** IEEE SIST 2026 conference, `charged-ieee:0.1.4` template

---

## Case Study: Circles

Circles is a TypeScript full-stack monorepo built with:

- **Frontend:** React (Vite+)
- **Backend:** Hono + Drizzle ORM
- **Shared packages:** common types, utilities
- **Toolchain:** Vite+ (`vp` CLI) — wraps Vite, Rolldown, Vitest, Oxlint, Oxfmt

Key facts useful for the paper:

- All packages share the same test runner (Vitest via `vp test`)
- All packages share the same linter (Oxlint via `vp lint`) and formatter (Oxfmt via `vp fmt`)
- No per-package Vitest or Babel config — configuration is centralized
- E2E tests and unit tests coexist and are run through the same CLI entry point

When writing about Circles, use facts observable in the code. Do not invent metrics. If a metric is needed (e.g., number of test files, test pass rate), read the actual repository first.
