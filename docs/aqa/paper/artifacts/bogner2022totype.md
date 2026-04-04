# Bogner and Merkel (2022) -- To Type or Not to Type? A Systematic Comparison of the Software Quality of JavaScript and TypeScript Applications on GitHub

**File:** `sources/3524842.3528454.pdf`
**Venue:** MSR 2022
**BibTeX key:** `bogner2022totype`
**DOI:** `10.1145/3524842.3528454`

## What It Says

- Compares 604 GitHub projects, split between JavaScript and TypeScript, across code quality, understandability, bug proneness, and bug resolution time.
- Reports that TypeScript projects show better code quality and understandability than JavaScript projects.
- Finds no significant reduction in bug proneness or bug resolution time for the TypeScript sample.
- Supports a cautious claim about TypeScript: language-level typing helps some quality dimensions, but it does not remove broader sources of failure by itself.

## Key Quotes

> "there is currently insufficient empirical evidence to broadly support the claim that TS applications exhibit better software quality than JS applications" (p. 658)

> "TS applications exhibit significantly better code quality and understandability than JS applications" (p. 658)

> "it does not automatically lead to less and easier to fix bugs" (p. 658)

## How to Use in Paper

- **Related Work:** Support the point that TypeScript alone does not guarantee fewer bugs or simpler maintenance outcomes.
- **Introduction:** Help distinguish language-level benefits from environment-level consistency.
- **Discussion:** Use as a comparison point when explaining why toolchain unification solves a different problem than static typing.
