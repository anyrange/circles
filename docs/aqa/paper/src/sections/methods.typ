= Methodology

== Case Study Context

Circles is a full-stack TypeScript monorepo with three active package areas relevant to testing. The frontend package uses React and contains both browser-level component tests and Playwright end-to-end tests. The backend package exposes API and worker code and uses Vitest for logic-level tests. The shared `packages/utils` package contains reusable helpers and its own test file. Across the repository, the dominant command surface is Vite+, exposed through the `vp` CLI.

The current repository state provides a suitable midterm case because it combines a unified command interface with package-level specialization. The backend and shared package each define testing inside `vite.config.ts`. The frontend keeps one base Vite config plus dedicated Vitest project files for unit and browser execution and a separate Playwright config for end-to-end tests. This structure permits direct observation of where unification succeeds and where configuration divergence remains.

#figure(
  table(
    columns: (1.7fr, 1.6fr, 1.9fr, 1.4fr),
    align: (left, left, left, center),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Package / Area*], [*Primary role*], [*Observed test stack*], [*Observed test files*],
    [Frontend], [UI and route rendering], [Vitest unit project, Vitest browser project, Playwright], [3],
    [Backend], [API, workers, helper logic], [Vitest through `apps/backend/vite.config.ts`], [4],
    [Shared utils], [Reusable helper package], [Vitest through `packages/utils/vite.config.ts`], [1],
  ),
  caption: [Observed package structure and testing stack in Circles],
)

== Data Collection Procedure

The evaluation used only repository-observable evidence. Five classes of data were collected.

First, the repository structure was inspected to identify configuration files, package scripts, and test locations. Second, the CI workflows in `.github/workflows/ci.yml` and `.github/workflows/e2e.yml` were reviewed to document the execution model used on push and pull request events. Third, direct test execution was performed with the same package commands defined in the repository: backend tests, frontend tests, frontend unit coverage, backend coverage, and shared-package coverage. Fourth, execution logs were examined for failures, warnings, and timing information. Fifth, coverage reports were used to identify the current automated scope and any detectability gaps.

The concrete commands executed during the evaluation were `vp run @circles/backend#test`, `vp run @circles/frontend#test`, `vp run @circles/backend#test:coverage`, `vp run @circles/frontend#test:coverage`, and `vp run utils#test:coverage`. All commands were run against the repository state observed on 2026-04-10.

== Evaluation Dimensions

The analysis used four dimensions that match the midterm requirement to connect engineering choices with measurable evidence.

1. *Configuration surface size.* This dimension counts the number of files that directly define test or CI behavior.
2. *Execution consistency.* This dimension checks whether equivalent test commands behave uniformly across packages and across isolated versus aggregated runs.
3. *Coverage and detectability.* This dimension evaluates which modules have automated evidence and whether coverage reports indicate strong or weak visibility into failures.
4. *Pipeline reproducibility.* This dimension documents how repository commands are mapped into CI workflows.

#figure(
  table(
    columns: (1.6fr, 1.2fr, 2.2fr),
    align: (left, center, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Dimension*], [*Metric*], [*Repository evidence*],
    [Configuration surface], [Count of config files], [Vite, Vitest, Playwright, and GitHub Actions files],
    [Execution consistency], [Pass or fail outcome], [Direct command outputs from backend, frontend, and shared package],
    [Coverage and detectability], [Coverage percentage], [V8 coverage reports emitted by package coverage commands],
    [Pipeline reproducibility], [Step mapping], [Workflow YAML files and package scripts],
  ),
  caption: [Evaluation dimensions and evidence sources],
)

== Configuration and Pipeline Model

Nine files were identified as direct parts of the testing and CI configuration surface: two GitHub Actions workflows, three `vite.config.ts` files, three frontend Vitest configuration files, and one Playwright configuration file. This count is small for a multi-package repository, but it is not zero. The result matters because it shows that unification in Circles is operational rather than absolute.

#figure(
  table(
    columns: (1.2fr, 0.4fr, 1.2fr, 0.4fr, 1.2fr, 0.4fr, 1.2fr),
    align: center,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Push / PR*], [→], [*Install*], [→], [*Check and test*], [→], [*Build or E2E*],
    [GitHub event], [→], [`pnpm install`], [→], [`pnpm vp check`, `pnpm vp run test -r`], [→], [`pnpm vp run build -r` or Playwright workflow],
  ),
  caption: [Observed CI pipeline structure across the two workflows],
)

The main CI workflow performs checkout, dependency installation, static checks, recursive test execution, and recursive build execution. A second workflow installs Playwright browsers and runs frontend end-to-end tests. These workflows show that the repository uses one dominant command surface even though the frontend still needs a dedicated E2E path.
