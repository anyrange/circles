= Preliminary Results

== Configuration Surface and Test Inventory

Repository inspection found seven automated test files and two CI workflows. Of the seven test files, six belong to unit or component-style automation and one belongs to end-to-end testing. The backend contributes four spec files, the frontend contributes one unit file, one browser component file, and one Playwright file, and the shared package contributes one test file. This distribution shows that the current automated baseline is concentrated on helper logic and lightweight UI checks rather than on cross-package interaction paths.

#figure(
  table(
    columns: (1.8fr, 1fr, 1fr, 1.4fr, 1.6fr),
    align: (left, center, center, center, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Area*], [*Unit / component*], [*E2E*], [*Config files*], [*Main config locations*],
    [Frontend], [2], [1], [5], [Vite config, three Vitest configs (aggregated, unit, browser), Playwright config],
    [Backend], [4], [0], [1], [Vite config],
    [Shared utils], [1], [0], [1], [Vite config],
    [CI workflows], [N/A], [N/A], [2], [Unit CI workflow, E2E CI workflow],
  ),
  caption: [Observed testing inventory and configuration surface],
)

The frontend has the richest test-stack composition and the largest local configuration surface. The backend and shared package each depend on a single Vite+ configuration file. This asymmetry is relevant to the later failure analysis because the only observed inconsistency during direct execution appears in the frontend package.

== Direct Execution Outcomes

Direct test execution produced stable results in the backend and shared package. The backend test suite completed successfully with 4 passing files and 21 passing tests. The shared utilities suite completed successfully with 1 passing file and 1 passing test. The frontend produced mixed results. The aggregated frontend test command reported one passing file, one failed suite, and a runner initialization failure in the unit test suite. However, running the unit suite in isolation through its dedicated configuration passed with 1 passing file and 4 passing tests.

#figure(
  table(
    columns: (1.8fr, 1.8fr, 1.1fr, 1.1fr, 1.2fr, 2.2fr),
    align: (left, left, center, center, center, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Run scope*], [*Package*], [*Files*], [*Tests*], [*Result*], [*Notes*],
    [Backend test suite], [Backend], [4 passed], [21 passed], [Pass], [Stable package-level execution],
    [Frontend aggregated], [Frontend], [1 passed, 1 failed], [2 passed], [Fail], [Initialization error in unit suite during multi-project run],
    [Frontend unit (isolated)], [Frontend unit only], [1 passed], [4 passed], [Pass], [Unit project succeeds in isolation],
    [Shared utils suite], [Shared utils], [1 passed], [1 passed], [Pass], [Stable single-package execution],
  ),
  caption: [Observed execution outcomes on 2026-04-10],
)

The failing frontend run is important because it changes the interpretation of consistency. A shared CLI entry point is present, but consistent outcomes are not guaranteed when multiple frontend test projects are composed under one aggregate command. The initialization error appears before unit assertions execute, indicating an environment or runner composition problem rather than a fault in the tested utility function itself.

== Coverage and Detectability

Coverage commands show strong detectability for the currently targeted helper modules and very limited breadth beyond that scope. Backend coverage reached 100% statement, branch, function, and line coverage across four helper modules. Frontend unit coverage reached 100% for the UI utility module. Shared-package coverage reached 100% for the package entry point. These results confirm that the automated baseline is precise but narrow.

#figure(
  table(
    columns: (1.8fr, 1.3fr, 1fr, 1fr, 1fr, 1fr),
    align: (left, left, center, center, center, center),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Package*], [*Covered target*], [*Statements*], [*Branches*], [*Functions*], [*Lines*],
    [Backend], [Four helper utility modules], [100%], [100%], [100%], [100%],
    [Frontend unit], [UI utility module], [100%], [100%], [100%], [100%],
    [Shared utils], [Package entry point], [100%], [100%], [100%], [100%],
  ),
  caption: [Observed coverage for the currently instrumented scope],
)

The coverage data should not be interpreted as system-wide completeness. In the frontend, coverage is restricted to one utility module. In the backend, controller and workflow layers remain outside the reported coverage target set even though they are likely to carry higher integration risk. Therefore, detectability is high inside the instrumented helper scope and lower outside it.

== Failure Pattern Analysis

Only one concrete failure was observed during direct execution, but it is analytically useful because it was not predicted by simple per-file unit reasoning. The failure affected the frontend unit suite during the aggregated frontend command and did not reproduce in the isolated unit-project run. This creates a difference between local project success and combined pipeline behavior.

#figure(
  table(
    columns: (1.5fr, 1.4fr, 1.6fr, 1fr, 2.2fr),
    align: (left, left, left, center, left),
    stroke: 0.5pt,
    fill: (_, row) => if row == 0 { luma(220) } else { white },
    [*Failure ID*], [*Affected module*], [*Failure type*], [*Frequency*], [*Interpretation*],
    [F01], [Frontend unit test suite], [Runner initialization error during aggregated run], [1 observed aggregated run], [The command surface is unified, but the composed frontend test environment is still sensitive to project interaction],
  ),
  caption: [Observed failure evidence],
)

This result increases the apparent risk of frontend test orchestration and lowers confidence in detectability at the package boundary. The backend and shared package currently show no analogous evidence of instability. At this stage, the strongest preliminary finding is therefore mixed: unification simplifies the command surface and supports reproducible coverage reporting, but consistency claims remain weaker in the most configuration-heavy package.
