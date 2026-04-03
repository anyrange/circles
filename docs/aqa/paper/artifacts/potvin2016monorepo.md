# Potvin and Levenberg (2016) -- Why Google Stores Billions of Lines of Code in a Single Repository

**File:** `sources/2854146.pdf`
**Venue:** Communications of the ACM, 2016
**BibTeX key:** `potvin2016monorepo`
**DOI:** `10.1145/2854146`

## What It Says

- A single shared repository can scale to very large organizations when it is supported by strong internal tooling.
- Benefits include unified versioning, atomic changes, dependency management, code sharing, and large-scale refactoring.
- Drawbacks include the need to maintain code health and invest heavily in development and execution infrastructure.
- Build-and-test systems are central to making the repository model workable at scale.

## Key Quotes

> "Benefits include unified versioning, extensive code sharing" (p. 78)

> "Drawbacks include having to create and scale tools" (p. 78)

## How to Use in Paper

- **Introduction:** Motivate why large shared repositories create pressure for common infrastructure.
- **Related Work:** Support the claim that repository unification and toolchain unification are related but distinct concerns.
