// ============================================
// IEEE Conference Paper (charged-ieee)
// Unified Toolchain and Testing Consistency
// in a TypeScript Full-Stack Monorepo
// ============================================

#import "@preview/charged-ieee:0.1.4": ieee

#show: ieee.with(
  title: [How a Unified Development Toolchain Supports Automated Testing Consistency in a TypeScript Full-Stack Monorepo: A Case Study of Circles],

  abstract: [
    Quality assurance in full-stack TypeScript monorepos is difficult because frontend, backend, shared packages, and continuous integration pipelines can fail at different technical boundaries. This paper studies the Circles repository as a case study and addresses a specific gap: risk-based test planning, automated execution, quality gates, and experimental evidence are often documented separately rather than as one reproducible QA argument. The study proposes a risk-based automated testing strategy for Circles. The strategy maps system risks to unit, integration, end-to-end, performance, mutation, and chaos tests, then evaluates the resulting pipeline through repository inspection and direct execution. The observed automation baseline includes 33 passing backend tests, 7 backend test files, 2 GitHub Actions workflows, and a selected-helper mutation score of 87.93%. Local performance testing reached 1,523.90 requests per second for the authenticated library overview endpoint with 12.62 ms average latency. Chaos testing showed that a PostgreSQL outage produced a user-visible HTTP 500 response, but the service recovered after the database restarted. These findings show that risk-based automation improves traceability and exposes concrete gaps, but current evidence remains limited by low whole-backend coverage and a local synthetic dataset.
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
    (
      name: "Malika Ishakhanova",
      department: [Master Degree Student, School of Software Engineering],
      organization: [Astana IT University (AITU)],
      location: [Astana, Kazakhstan \ malikaishakhanova\@gmail.com],
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
