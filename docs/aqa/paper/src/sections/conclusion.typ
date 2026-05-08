= Conclusion

This work addressed the problem of fragmented QA evidence in a full-stack TypeScript monorepo. Circles already had automated tests and a unified Vite+ toolchain, but the earlier assignments showed that passing tests alone did not explain whether the most important system risks were covered.

The study proposed a risk-based automated QA strategy. The strategy identified high-impact risks, mapped them to test types, connected those tests to quality gates, and evaluated the system through coverage, execution time, performance, mutation, and chaos experiments. This created a single research narrative from the earlier planning, automation, experimental, and midterm work.

The main findings are realistic rather than absolute. Backend helper tests were fast and stable, with 33 tests passing in the extended suite. The selected mutation scope reached 87.93%, and local authenticated read performance stayed below 25 ms P99. The chaos experiment showed that the backend recovered after PostgreSQL restarted. However, the same experiment also showed a user-visible HTTP 500 during the outage, and global backend coverage stayed below 7%.

The contribution is both methodological and practical. Methodologically, the paper shows how risk-based planning, automation, gates, and experiments can be connected in one QA case study. Practically, it gives the Circles project a clearer test roadmap: strengthen API integration coverage, improve import validation, test authenticated route behavior, and repeat performance and failure-injection experiments on larger data.

The main limitations are the local dataset, narrow mutation scope, incomplete integration coverage, and single-project setting. Future work should add database-backed controller tests, expand Playwright coverage for dashboard and import flows, collect repeated run data for flakiness analysis, and evaluate the same QA framework on a larger deployment-like environment.

Overall, the study shows that the current Circles QA process is useful but not complete. It is useful because the pipeline can already execute tests, collect metrics, and expose real weaknesses. It is incomplete because the strongest evidence is concentrated in helper modules while the most important production risks involve authentication, persistence, and route composition. The final value of the work is therefore not a claim that the system is fully tested. The value is a structured, evidence-based path from risk planning to stronger automated quality assurance.
