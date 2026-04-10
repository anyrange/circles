// ============================================
// IEEE Conference Paper (charged-ieee)
// Unified Toolchain and Testing Consistency
// in a TypeScript Full-Stack Monorepo
// ============================================

#import "@preview/charged-ieee:0.1.4": ieee

#show: ieee.with(
  title: [How a Unified Development Toolchain Supports Automated Testing Consistency in a TypeScript Full-Stack Monorepo: A Case Study of Circles],

  abstract: [
    TypeScript monorepos often combine frontend, backend, and shared packages under one repository, but test execution is still shaped by package-local configuration. This paper studies how a unified toolchain affects testing consistency in such a setting. The Circles repository is used as a case study because it runs backend, frontend, and shared-package tests through the Vite+ command interface while still keeping a small number of package-specific overrides. The evaluation uses repository inspection, CI workflow analysis, and direct execution of test and coverage commands. The observed configuration surface consists of nine testing and CI configuration files, seven automated test files, and two GitHub Actions workflows. Empirical results show stable execution in the backend and shared package, with 21 backend tests and one shared-package test passing, while the aggregated frontend run exposes a configuration-level failure that does not appear when the frontend unit project is executed in isolation. This result is important because it shows that a unified command surface improves consistency, but multi-project composition can still preserve hidden environment differences. The paper therefore argues that unified toolchains reduce configuration fragmentation and improve reproducibility, yet consistency must still be evaluated at the combined pipeline level rather than only at the per-project level.
  ],

  authors: (
    (
      name: "Aldiyar Seylkhanov",
      department: [Bachelor Degree Student, School of Software Engineering],
      organization: [Astana IT University (AITU)],
      location: [Astana, Kazakhstan \ seylkhanov.aldiyar\@gmail.com],
    ),
    (
      name: "Alexandr Tyulkov",
      department: [Master Degree Student, School of Software Engineering],
      organization: [Astana IT University (AITU)],
      location: [Astana, Kazakhstan \ widesehl\@gmail.com \ #link("https://orcid.org/0009-0009-6422-0559")[0009-0009-6422-0559]],
    ),
  ),

  index-terms: (
    "monorepo",
    "TypeScript",
    "unified toolchain",
    "automated testing",
    "Vite",
    "software engineering",
  ),

  figure-supplement: [Fig.],
)

// ============================================
// MAIN CONTENT — IMRAD
// ============================================

#include "sections/introduction.typ"
#include "sections/related-work.typ"
#include "sections/methods.typ"
#include "sections/results.typ"
#include "sections/discussion.typ"
#include "sections/conclusion.typ"
#include "sections/acknowledgment.typ"

// ============================================
// REFERENCES
// ============================================

#bibliography("references/references.bib")