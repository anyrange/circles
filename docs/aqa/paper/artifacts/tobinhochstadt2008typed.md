# Tobin-Hochstadt and Felleisen (2008) -- The Design and Implementation of Typed Scheme

**File:** `sources/typed-racket-popl-08.pdf`
**Venue:** POPL 2008
**BibTeX key:** `tobinhochstadt2008typed`

## What It Says

- Scripts often grow into larger programs that are harder to maintain over time.
- The absence of types forces programmers to rediscover design information during maintenance.
- Typed Scheme was designed to let programmers add types with minimal disruption to existing scripting idioms.
- Partial migration from untyped to typed modules is feasible when the language preserves the original semantics.

## Key Quotes

> "When scripts in untyped languages grow into large programs, maintaining them becomes difficult." (p. 395)

> "The lack of types means a loss of design information" (p. 395)

## How to Use in Paper

- **Related Work:** Ground the maintenance argument for scripting ecosystems that evolve into larger systems.
- **Discussion:** Connect low-friction migration and compatibility to the need for low-friction shared tooling.
