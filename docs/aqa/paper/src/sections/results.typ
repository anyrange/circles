= Results

This section reports observed data only. Interpretation is reserved for the discussion.

== Test Coverage Versus Risk Priority

#figure(
  table(
    columns: (0.8fr, 1.1fr, 1.2fr, 2fr),
    align: (left, center, center, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Risk*], [*Priority*], [*Coverage*], [*Test types applied*],
    [R1], [High], [Partial], [E2E login support, authenticated route checks, chaos dependency test],
    [R2], [High], [100% selected scope], [Unit, edge-case, invalid-input, mutation],
    [R3], [High], [100% selected scope], [Unit range tests, performance test],
    [R4], [High], [0% direct scope], [Controller tests planned, routing behavior observed during performance setup],
    [R5], [High], [Partial], [Frontend aggregated and isolated execution comparison],
    [R6], [High], [Scenario covered], [PostgreSQL stop and restart chaos test],
  ),
  caption: [Coverage alignment by risk priority],
)

The backend coverage command executed 33 tests successfully. The global backend coverage remained below configured thresholds: 5.88% statements, 6.83% branches, 5.45% functions, and 5.17% lines. The selected helper modules reached full local coverage in the earlier targeted reports.

#figure(
  table(
    columns: (1.4fr, 1.1fr, 1.1fr, 1.1fr, 1.1fr, 1.4fr),
    align: (left, center, center, center, center, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Scope*], [*Stmt.*], [*Branch*], [*Func.*], [*Lines*], [*Gate status*],
    [Selected helper scope], [100%], [100%], [100%], [100%], [Pass in targeted reports],
    [Whole backend], [5.88%], [6.83%], [5.45%], [5.17%], [Fail global threshold],
  ),
  caption: [Coverage by measurement scope],
)

== Defect Detection: Manual Versus Automated

#figure(
  table(
    columns: (1.3fr, 1.2fr, 1.1fr, 1.7fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Method*], [*Total findings*], [*Critical findings*], [*Detection stage*],
    [Manual architecture review], [2], [0], [Assignment 1 risk planning],
    [Automated unit tests], [3 design behaviors], [0], [Midterm edge-case execution],
    [Coverage analysis], [1 gate failure], [0], [Assignment 3 baseline validation],
    [Performance setup], [1 route behavior], [0], [Assignment 3 load-test preparation],
    [Chaos experiment], [1 outage behavior], [1], [Assignment 3 failure injection],
  ),
  caption: [Observed findings by detection method],
)

#figure(
  table(
    columns: (1.4fr, 1fr, 1fr, 1.4fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Test type*], [*Findings*], [*Severity*], [*Example*],
    [Unit and edge tests], [3], [Medium], [Permissive URI parsing and weak ZIP signature acceptance],
    [Coverage command], [1], [High], [Global backend coverage below configured gate],
    [Performance test setup], [1], [Medium], [`/leaderboard` required authentication during execution],
    [Chaos test], [1], [High], [Authenticated route returned HTTP 500 during database outage],
  ),
  caption: [Automated and experimental findings],
)

== Execution Time Analysis

#figure(
  table(
    columns: (1.7fr, 1.4fr, 1.4fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Test stage*], [*Manual estimate*], [*Automated time*],
    [Backend baseline suite], [10-15 min], [95 ms],
    [Backend extended suite], [20-30 min], [206 ms],
    [Coverage command], [Not practical manually], [Tests pass, threshold fails],
    [Mutation testing], [Not practical manually], [29 s],
    [Performance test], [Not practical manually], [10 s per endpoint],
  ),
  caption: [Manual versus automated execution time],
)

Direct package execution also produced the following observed outcomes: backend unit tests passed with 7 files and 33 tests during Assignment 3, while the earlier paper inspection recorded stable backend and shared-package execution and a frontend aggregated-run failure.

#figure(
  table(
    columns: (1.6fr, 1.1fr, 1.1fr, 1.1fr, 2fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Run scope*], [*Files*], [*Tests*], [*Result*], [*Notes*],
    [Backend baseline], [4], [21], [Pass], [Assignment 2 helper suite],
    [Backend extended], [7], [33], [Pass], [Assignment 3 and midterm suite],
    [Shared utils], [1], [1], [Pass], [Package-level utility check],
    [Frontend unit isolated], [1], [4], [Pass], [Dedicated unit project],
    [Frontend aggregated], [1 pass, 1 fail], [2 pass], [Fail], [Runner initialization failure in combined project run],
  ),
  caption: [Observed test execution outcomes],
)

== Performance Testing Results

#figure(
  table(
    columns: (2fr, 1.1fr, 1.2fr, 1.2fr, 1.2fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Scenario*], [*Auth*], [*Avg latency*], [*P99*], [*Avg RPS*],
    [`/health` normal baseline], [No], [0.01 ms], [0 ms], [43,093.82],
    [`/leaderboard?period=all` aggregate read], [Yes], [13.83 ms], [24 ms], [1,396.70],
    [`/library/overview?range=30d` authenticated read], [Yes], [12.62 ms], [21 ms], [1,523.90],
  ),
  caption: [Local load-test results with 20 concurrent connections over 10 seconds],
)

All measured read scenarios stayed below the informal 200 ms P99 target in the local experiment.

#figure(
  table(
    columns: (1.5fr, 1.2fr, 1.2fr, 1.2fr, 1.4fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Metric*], [*Target*], [*Best observed*], [*Worst observed*], [*Status*],
    [P99 latency], [<= 200 ms], [0 ms], [24 ms], [Pass],
    [Average latency], [Report only], [0.01 ms], [13.83 ms], [Recorded],
    [Throughput], [Report only], [1,396.70 RPS], [43,093.82 RPS], [Recorded],
    [Error behavior], [0 critical route defects], [n/a], [Auth required on selected public route], [Finding],
  ),
  caption: [Performance quality-gate summary],
)

== Mutation Testing Results

#figure(
  table(
    columns: (1.8fr, 1fr, 1fr, 1fr, 1fr, 1.1fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*File*], [*Total*], [*Killed*], [*Survived*], [*Timeout*], [*Score*],
    [`range.ts`], [8], [8], [0], [0], [100.00%],
    [`retry.ts`], [26], [19], [6], [1], [76.92%],
    [`spotify-export.ts`], [16], [16], [0], [0], [100.00%],
    [`zip.ts`], [8], [7], [1], [0], [87.50%],
    [*All selected files*], [58], [50], [7], [1], [87.93%],
  ),
  caption: [Mutation testing results for selected backend helpers],
)

The mutation run generated 58 mutants and completed in 29 seconds. The selected helper scope passed the 80% mutation-score gate overall, but `retry.ts` alone stayed below that threshold.

== Chaos Testing Outcomes

#figure(
  table(
    columns: (1.6fr, 1.2fr, 2.7fr, 1.2fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Experiment*], [*Failure injected*], [*System behavior*], [*Recovery*],
    [Baseline request], [None], [`/library/overview?range=30d` returned HTTP 200], [n/a],
    [Database outage], [PostgreSQL stopped], [Endpoint returned HTTP 500 with session lookup failure], [Not available during outage],
    [Database restart], [PostgreSQL started], [Same endpoint returned HTTP 200 again], [Recovered without API restart],
  ),
  caption: [Chaos experiment against PostgreSQL availability],
)

#figure(
  table(
    columns: (1.5fr, 1.1fr, 1.4fr, 1.7fr),
    align: left,
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Gate*], [*Threshold*], [*Observed*], [*Status*],
    [Critical tests], [100% pass], [33/33 backend tests passed], [Pass],
    [Critical-module coverage], [>= 80%], [57% high-risk module coverage in midterm], [Partial],
    [Whole-backend coverage], [Configured high threshold], [Below 7%], [Fail],
    [Mutation score], [>= 80%], [87.93% selected helper score], [Pass],
    [Read latency], [P99 <= 200 ms], [Worst observed P99 24 ms], [Pass],
    [Database availability], [No user-visible critical error], [HTTP 500 during outage], [Fail],
  ),
  caption: [Quality gate outcomes],
)
