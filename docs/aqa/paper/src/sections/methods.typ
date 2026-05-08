= Methodology

The methodology connects the earlier QA assignments into one pipeline. Assignment 1 provides the risk strategy. Assignment 2 provides the automation framework and quality gates. Assignment 3 provides performance, mutation, and chaos experiments. The midterm report provides evidence-based risk revision. The resulting pipeline is:

- Risk identification and scoring.
- Test design based on risk priority.
- Automated execution through Vite+ and CI.
- Quality gates for pass, coverage, execution time, and static checks.
- Experimental measurement through coverage, load, mutation, and failure injection.

== Mapping from Previous Work

The paper does not copy the earlier assignments directly. Each previous submission is transformed into a research-paper role. The first assignment is used as the formal risk model. The second assignment is used as the implementation baseline for automated tests and quality gates. The third assignment is used as the experimental evidence source. The midterm report is used as the empirical correction step because it revises the original assumptions using observed behavior.

#figure(
  table(
    columns: (1.5fr, 1.5fr, 2.4fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Previous work*], [*Paper location*], [*Transformation*],
    [Assignment 1], [Methodology], [Risk descriptions become a scored and traceable risk strategy],
    [Assignment 2], [Methodology and results], [Test scripts and gates become an evaluated automation framework],
    [Assignment 3], [Results and discussion], [Raw experiments become performance, mutation, and chaos evidence],
    [Midterm], [Results and discussion], [Revised risks and edge cases become evidence-backed limitations],
  ),
  caption: [Explicit mapping from previous assignments to the paper],
)

== Risk-Based Testing Strategy

Risks were identified through architecture analysis, user-flow impact, implementation complexity, and earlier test observations. The scoring model is:

$ "Risk Score" = "Likelihood" times "Impact" $

Likelihood and impact are scored from 1 to 5. Likelihood estimates the chance of failure based on complexity, dependency count, and observed behavior. Impact estimates the user-facing or system-level consequence if the component fails.

#figure(
  table(
    columns: (0.8fr, 2.1fr, 1.5fr, 0.8fr, 0.8fr, 0.8fr),
    align: (left, left, left, center, center, center),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Risk*], [*Description*], [*Component*], [*L*], [*I*], [*Score*],
    [R1], [Sign-in or session failure blocks authenticated access], [OAuth and sessions], [4], [5], [20],
    [R2], [Incorrect import parsing corrupts listening statistics], [Spotify export ingestion], [4], [5], [20],
    [R3], [Wrong range filtering produces misleading dashboard data], [Dashboard and library queries], [3], [5], [15],
    [R4], [API contract or middleware error breaks route behavior], [Backend controllers], [3], [4], [12],
    [R5], [Pipeline composition failure hides package-level inconsistency], [Frontend test orchestration], [3], [4], [12],
    [R6], [Database outage causes authenticated requests to fail], [PostgreSQL dependency], [3], [5], [15],
  ),
  caption: [Risk list used for test prioritization],
)

The midterm evidence revised two risks upward. Data ingestion increased because edge-case tests found permissive parsing and incomplete field validation. API correctness increased because controller-level and middleware paths remained weakly covered.

The risk model is intentionally simple. A more complex model could include cost, detectability, and historical defect frequency. Those values were not available consistently across the repository. The likelihood times impact model was therefore selected because it is reproducible from the available evidence and easy to defend during review.

== Risk to Test Mapping

Each risk is mapped to at least one test type and one metric. This prevents a common weakness in QA plans: risk tables that do not affect test execution.

#figure(
  table(
    columns: (0.8fr, 1.4fr, 2.5fr, 1.2fr),
    align: (left, left, left, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Risk*], [*Test type*], [*Test description*], [*Automation*],
    [R1], [E2E and chaos], [Session creation, authenticated route access, database outage behavior], [Partial],
    [R2], [Unit and mutation], [Spotify export validation, URI parsing, boundary cases], [Full],
    [R3], [Unit and performance], [Range helper checks and authenticated library overview load test], [Full],
    [R4], [Integration], [HTTP contract and middleware behavior], [Planned],
    [R5], [CI execution], [Aggregated versus isolated frontend test runs], [Partial],
    [R6], [Chaos], [PostgreSQL stop and restart during authenticated request path], [Full],
  ),
  caption: [Mapping from risks to tests and automation level],
)

The mapping also separates current evidence from planned evidence. R2 and R3 have strong helper-level automation because their behavior is expressed in pure functions. R1, R4, R5, and R6 require integration or environment-level checks because they involve authentication, routing, CI composition, or database availability. This distinction is important because not every high-risk component can be tested well with the same method.

The selected strategy therefore follows a layered test design. Unit tests are used for deterministic parsing, date conversion, retry, and ZIP signature logic. Integration tests are reserved for route and middleware contracts. End-to-end tests are reserved for user-visible browser flows. Mutation testing checks selected unit-test strength. Performance testing checks latency and throughput under local load. Chaos testing checks behavior when a required dependency fails.

== Automation Framework

Circles uses Vite+ as the main automation entry point. Backend, frontend, and shared packages use one command interface, while package-specific configurations handle browser tests and end-to-end tests. The backend unit suite uses Vitest through Vite+. Playwright covers browser-level flows. Stryker is configured for mutation testing on selected backend helper modules. Autocannon is used for local performance testing.

#figure(
  table(
    columns: (1.3fr, 1.6fr, 2.4fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Tool*], [*Role*], [*Reason for selection*],
    [Vite+], [Unified command interface], [Matches repository workflow and reduces per-package command differences],
    [Vitest], [Unit and component tests], [Already integrated through Vite+ and suitable for TypeScript modules],
    [Playwright], [End-to-end browser checks], [Supports real browser execution for user flows],
    [Stryker], [Mutation testing], [Measures whether selected tests detect code changes],
    [Autocannon], [Performance testing], [Provides repeatable local HTTP load tests],
    [GitHub Actions], [CI enforcement], [Runs checks on push and pull request events],
  ),
  caption: [Automation tools and roles],
)

The CI model follows a staged flow: install dependencies, run static checks, execute recursive tests, then run build or end-to-end checks. This structure favors fast feedback before slower browser and experimental checks. The trade-off is that full performance, mutation, and chaos experiments are not run on every commit because they require more time and local infrastructure.

#figure(
  table(
    columns: (1.3fr, 2.1fr, 2.1fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Pipeline stage*], [*Executed checks*], [*Primary evidence produced*],
    [Commit or PR], [`vp check`, recursive tests], [Static correctness and regression pass/fail],
    [Package validation], [Backend, frontend, and shared package tests], [Execution consistency across workspaces],
    [Coverage run], [Backend coverage command], [Covered scope and failed global threshold],
    [Experimental run], [Autocannon, Stryker, PostgreSQL outage], [Performance, mutation, and resilience metrics],
    [Review], [Manual analysis of reports], [Limitations, trade-offs, and future work],
  ),
  caption: [Automation pipeline and evidence flow],
)

== Quality Gates

Quality gates define whether the pipeline can proceed. The gates are intentionally simple because the project is still in a coursework-scale stage.

#figure(
  table(
    columns: (1.5fr, 1.2fr, 2.1fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Metric*], [*Threshold*], [*Action if failed*],
    [Critical tests], [100% pass], [Block merge until the failing test is fixed],
    [Critical-module coverage], [>= 80%], [Add tests or reduce unsupported claims],
    [Backend execution time], [<= 5 min], [Inspect slow tests or async waits],
    [Static checks], [0 major violations], [Block merge through `vp check`],
    [Mutation score on selected helpers], [>= 80%], [Add targeted tests for surviving mutants],
    [Read endpoint latency], [P99 <= 200 ms], [Investigate query and database behavior],
  ),
  caption: [Quality gates and failure actions],
)

The thresholds are not arbitrary. The pass-rate gate protects the existing regression baseline. The coverage gate comes from the earlier automation plan and is used as a signal that high-risk modules need broader tests. The 5 minute execution-time gate is much higher than the current backend suite time, which leaves room for future integration tests. The mutation score gate follows the common high-threshold interpretation used by mutation-testing tools. The 200 ms read-latency gate is selected as a user-facing responsiveness target for dashboard and library views.

== Experimental Setup

Experiments were executed locally against the Circles repository using supported commands. The runtime environment used Vite+ `vp v0.1.18`, Node.js `v24.15.0`, PostgreSQL 16, and a dedicated local database container on port `5433`. The seeded dataset contained 7 users, 30 tracks, and 16,600 history rows. The authenticated tests used the built-in E2E login endpoint so that Spotify OAuth did not block reproducibility.

Performance testing used a live backend server on port `8001`, 20 concurrent connections, and 10-second runs. Mutation testing used the backend Stryker configuration and targeted four helper files: `range.ts`, `retry.ts`, `spotify-export.ts`, and `zip.ts`. Chaos testing stopped and restarted PostgreSQL while the backend process remained running.

The experiment can be reproduced by installing dependencies with `vp install`, running checks with `vp check`, executing backend tests with `vp run @circles/backend#test`, running coverage and mutation commands from the backend package scripts, starting the local backend and PostgreSQL container, then repeating the documented Autocannon and database outage steps.

The data used in the experiments is synthetic. This choice avoids privacy risk from real Spotify history and keeps the experiment repeatable. The cost is lower realism. The dataset is large enough to exercise query paths, but it does not represent long-term production traffic, many concurrent users, or rare Spotify export formats.
