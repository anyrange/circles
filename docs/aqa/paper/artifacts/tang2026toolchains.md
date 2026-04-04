# Tang, Alimadadi, and Sumner (2026) -- From Logic to Toolchains: An Empirical Study of Bugs in the TypeScript Ecosystem

**File:** `sources/2601.21186v1.pdf`
**Venue:** MSR 2026
**BibTeX key:** `tang2026toolchains`
**DOI:** `10.1145/3793302.3793379`

## What It Says

- Studies 633 bug reports from 16 TypeScript repositories and builds a taxonomy of fault categories.
- Finds that tooling and configuration faults, API misuse, and asynchronous error handling are more prominent than pure logic or syntax faults.
- Relates fault patterns to build complexity, dependency heterogeneity, and integration boundaries.
- Directly supports the claim that reliability problems in TypeScript projects often move from code logic into orchestration layers.

## Key Quotes

> "a fault landscape dominated not by logic or syntax errors but by tooling and configuration faults" (p. 1)

> "modern failures often arise at integration and orchestration boundaries rather than within algorithmic logic" (p. 1)

> "it has shifted fragility toward build systems and toolchains" (p. 1)

## How to Use in Paper

- **Introduction:** Support the claim that current TypeScript reliability problems are often toolchain-related.
- **Related Work:** Establish the closest prior evidence on TypeScript fault profiles while showing that it does not study monorepo test-environment unification.
- **Discussion:** Compare the Circles case study with broader ecosystem-level fault evidence.
