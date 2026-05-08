= Discussion

The results show that the risk-based strategy worked best where risks were mapped to small, deterministic units. The Spotify export parser, range helper, retry helper, and ZIP guard all became measurable through automated tests. These modules produced fast execution, selected-scope coverage, and mutation evidence. This pattern supports the value of starting with high-risk helper functions when a system does not yet have broad integration coverage.

The results also show that high local coverage can be misleading. Four helper modules reached full selected-scope coverage, but global backend coverage stayed below 7%. The cause is scope mismatch. The test suite covers helper logic more strongly than controllers, middleware, workflow orchestration, and database-backed behavior. Therefore, the coverage gate did not fail because individual helper tests were weak. It failed because the automated scope was too narrow.

Automation improved feedback speed. Backend test execution took milliseconds, while manual checking of the same boundaries would require repeated setup and manual input construction. Mutation testing gave a deeper signal than coverage for the selected helpers. The 87.93% score indicates that most injected changes were detected, but the surviving mutants in `retry.ts` and `zip.ts` show that some boundary behavior remains under-specified.

The performance results were strong under local conditions. The authenticated library overview endpoint stayed near 13 ms average latency and below 25 ms P99. This happened because the experiment used a small synthetic dataset and a local database. The result is useful as a baseline, but it does not prove production behavior under remote network latency, larger datasets, or concurrent real users.

The chaos experiment exposed the clearest user-visible failure. When PostgreSQL stopped, the authenticated endpoint failed during session lookup and returned HTTP 500. The service recovered after the database restarted without restarting the API. This is a mixed result. Process-level recovery worked, but user-visible availability did not. The failure point also means that every authenticated route depends on database availability, not only the tested library route.

== Trade-Offs

The main trade-off is speed versus coverage. The current suite is fast because it focuses on helper modules. The cost is limited representativeness. Adding controller, workflow, and database integration tests will improve confidence but increase setup complexity and execution time.

The second trade-off is automation versus flexibility. Vite+ provides one command interface and reduces configuration differences, but browser tests, end-to-end tests, and mutation tests still need specialized configuration. A unified toolchain reduces fragmentation. It does not remove all package-specific testing requirements.

The third trade-off is accuracy versus cost. Mutation testing and chaos testing provide stronger evidence than ordinary unit tests, but they are slower and require more controlled environments. For that reason, they are better suited to scheduled or release-level checks than to every commit.

== Limitations

This study has four limitations. First, it is a single-repository case study, so results cannot be generalized without more projects. Second, the performance dataset is synthetic and small. Third, mutation testing covers only four helper modules. Fourth, controller-level and workflow-level integration tests remain incomplete.

Several unexpected results were useful. The leaderboard route required authentication during real execution even though it was selected as a public aggregate benchmark. The frontend aggregate test command behaved differently from isolated frontend unit execution in the earlier paper inspection. These findings show that composition-level tests are necessary because implementation behavior can differ from local assumptions.

The main lesson is that a QA strategy should not stop at adding tests. Tests must be tied to risks, gates, and measured outcomes. For Circles, the next improvement should focus on backend integration tests for authenticated routes, stronger validation in the import pipeline, and repeated performance and chaos runs on a larger dataset.

== Lessons Learned

Three lessons follow from the study. First, risk-based testing is useful only when it changes test selection. The highest-value evidence came from components that were explicitly identified as high risk before testing began. Second, quality gates need scope labels. A coverage value is meaningful only when the covered files are known. Third, experimental tests reveal different information than unit tests. Performance testing exposed route behavior and latency. Mutation testing exposed weak assertions. Chaos testing exposed dependency recovery behavior.

The next iteration should therefore expand breadth before adding more specialized tools. The backend needs integration tests for authenticated controllers, route middleware, and database-backed queries. The frontend needs repeated aggregate test execution to confirm whether the observed composition failure is stable or intermittent. The import pipeline needs stricter tests for Spotify URI types and required metadata fields. After those changes, mutation and performance experiments should be repeated so that the results represent more of the system.
