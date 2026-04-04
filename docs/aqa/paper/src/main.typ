// ============================================
// IEEE Conference Paper (charged-ieee)
// Unified Toolchain and Testing Consistency
// in a TypeScript Full-Stack Monorepo
// ============================================

#import "@preview/charged-ieee:0.1.4": ieee

#show: ieee.with(
  title: [How a Unified Development Toolchain Supports Automated Testing Consistency in a TypeScript Full-Stack Monorepo: A Case Study of Circles],

  abstract: [
    TypeScript monorepos often use different tools for bundling, testing, linting, and formatting across packages. This fragmentation causes the same test code to behave differently depending on which package runs it. This paper examines how adopting a unified development toolchain addresses this inconsistency. The Circles project, a full-stack TypeScript monorepo, is used as a case study. Before unification, each package configured its own test runner and transform pipeline. After adopting Vite+, all packages share a single tool entry point, one module resolver, and one transform pipeline. The paper describes the toolchain architecture, identifies the sources of inconsistency in the fragmented setup, and evaluates the outcome using configuration surface size, test environment uniformity, and CI pipeline structure. Results show that unification eliminates the main categories of cross-package test inconsistency without requiring per-package configuration.
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
