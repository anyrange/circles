= Methodology

== Case Study Context

Circles is a full-stack TypeScript monorepo. It has three active package areas relevant to testing. The frontend uses React and contains browser component tests and end-to-end tests. The backend exposes API and worker code and uses unit tests for logic-level checks. The shared utilities package contains reusable helpers with its own test file. All packages use Vite+ as the main toolchain, accessed through a single CLI.

The repository provides a useful case because it combines a unified command interface with some package-level specialization. The backend and shared package each define testing inside their main Vite config file. The frontend keeps a base config plus dedicated files for unit testing, browser testing, and end-to-end testing. This structure allows direct observation of where unification works and where configuration differences remain.

#figure(
  table(
    columns: (1.7fr, 1.6fr, 1.9fr, 1.4fr),
    align: (left, left, left, center),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Package*], [*Primary role*], [*Test stack*], [*Test files*],
    [Frontend], [UI and route rendering], [Vitest unit, Vitest browser, Playwright], [3],
    [Backend], [API, workers, helper logic], [Vitest through shared Vite config], [4],
    [Shared utils], [Reusable helper package], [Vitest through shared Vite config], [1],
  ),
  caption: [Package structure and testing stack in Circles],
)

== Data Collection

The evaluation used only repository-observable evidence. Five types of data were collected.

First, the repository structure was inspected to find configuration files, package scripts, and test file locations. Second, the CI workflows were reviewed to document the execution model used on push and pull request events. Third, direct test execution was performed using the commands defined in the repository for each package. Fourth, execution logs were examined for failures, warnings, and output patterns. Fifth, coverage reports were used to identify the current automated scope.

All observations were made against the repository state on 2026-04-10.

== Evaluation Dimensions

The analysis used four dimensions.

1. *Configuration surface size.* The number of files that directly define test or CI behavior.
2. *Execution consistency.* Whether equivalent test commands produce the same outcome across packages and across isolated versus aggregated runs.
3. *Coverage and detectability.* Which modules have automated test coverage and how much of the system is visible to the test suite.
4. *Pipeline reproducibility.* How repository test commands map into CI workflows.

#figure(
  table(
    columns: (1.6fr, 1.2fr, 2.2fr),
    align: (left, center, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Dimension*], [*Metric*], [*Evidence source*],
    [Configuration surface], [Count of config files], [Vite, Vitest, Playwright, and GitHub Actions files],
    [Execution consistency], [Pass or fail outcome], [Direct test runs across backend, frontend, and shared package],
    [Coverage and detectability], [Coverage percentage], [V8 coverage reports from package coverage commands],
    [Pipeline reproducibility], [Step mapping], [CI workflow YAML files and package scripts],
  ),
  caption: [Evaluation dimensions and evidence sources],
)

== Configuration and Pipeline Model

Nine files form the testing and CI configuration surface. Two are GitHub Actions workflows. Three are Vite config files, one per package. Three are frontend-specific Vitest config files. One is the Playwright config for end-to-end tests. This count is small for a multi-package repository but it is not zero. Unification in Circles is real but not absolute.

#figure(
  table(
    columns: (1.2fr, 0.4fr, 1.2fr, 0.4fr, 1.2fr, 0.4fr, 1.2fr),
    align: center,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Push / PR*], [→], [*Install*], [→], [*Check and test*], [→], [*Build or E2E*],
    [GitHub event], [→], [Install dependencies], [→], [Static checks and recursive test run], [→], [Recursive build or Playwright E2E],
  ),
  caption: [CI pipeline structure across the two workflows],
)

The main CI workflow performs checkout, dependency installation, static analysis, recursive test execution, and recursive build. A second workflow handles end-to-end tests using a browser runner. Both workflows use the same unified command interface. The frontend still requires a separate E2E workflow, which shows that some package-specific steps remain even under a unified toolchain.
