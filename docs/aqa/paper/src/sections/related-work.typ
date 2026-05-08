= Literature Review

The literature review is organized around four topics: risk-based testing, automated testing in continuous integration, quality metrics, and advanced testing methods. The goal is not to list papers one by one. The goal is to identify how existing work supports the design of the Circles QA strategy and where the project still fills a practical gap.

== Risk-Based Testing and Software Risk

Risk-based testing gives priority to functions and scenarios that have higher failure probability or higher business impact. This principle is consistent with software risk management, where risk exposure is commonly modeled through likelihood and consequence @boehm1991risk; @iso31000. In testing, this means that test effort should not be distributed evenly across all files. It should be concentrated on authentication, data ingestion, API contracts, and other components where failure has higher user impact.

Earlier risk-based testing studies show that prioritization improves the efficiency of defect detection when risk analysis is explicit and traceable @felderer2014risk; @redmill2005risk. However, risk models are often documented as planning artifacts and are not always connected to pipeline enforcement. Circles addresses this gap by mapping each high-risk area to a test type, automation level, quality gate, and observed metric.

== Test Automation and CI/CD

Automated testing is most useful when it becomes part of continuous integration rather than a separate manual activity. Studies of continuous integration show that frequent automated checks can improve feedback speed, but they also introduce cost, flakiness, and configuration complexity @hilton2016ci; @shahin2017cicd; @memon2017taming. Wang et al. found that higher test automation maturity is associated with better product quality and shorter release cycles @wang2022testautomation. Yu et al. also show that non-functional testing in CI depends on tool support, metrics, and team practice @yu2023nfrci.

This literature supports the use of Vite+ as a common command interface in Circles. A unified command surface reduces the number of ways tests can be executed, which improves reproducibility. However, CI research also warns that passing commands are not enough. A pipeline must still test representative paths and must expose failures at integration boundaries.

Automated test generation and amplification research also supports a staged approach. REST API test generation can improve endpoint coverage, but generated tests still need useful oracles and realistic input structures @stallenberg2021restapi. Developer-centered test amplification can strengthen existing tests, but human review remains important when generated or expanded tests expose ambiguous behavior @brandt2022amplification. This is relevant to Circles because the most useful next tests are not random additional assertions. They are targeted route, middleware, and database checks tied to known risks.

== Quality Metrics and Test Effectiveness

Coverage is a common QA metric, but the literature warns against treating coverage as proof of quality. Inozemtseva and Holmes found that coverage alone has a weak relationship with test suite effectiveness when suite size is controlled @inozemtseva2014coverage. This is important for Circles because selected helper modules can reach 100% coverage while the backend as a whole remains below the global coverage threshold.

Mutation testing is a stronger adequacy signal because it checks whether tests detect small code changes. Jia and Harman describe mutation testing as a mature fault-based testing method, while later surveys show that mutation testing remains useful but expensive @jia2011mutation; @papadakis2019mutation. This supports the use of Stryker on selected backend helper modules. It also limits the interpretation: a high mutation score for four helper files cannot prove full-system quality.

== Advanced Testing Approaches

Performance testing and resilience testing extend QA beyond functional correctness. Load-testing research shows that performance behavior depends on workload, environment, and data shape @jiang2015loadtesting; @barna2011performance. Chaos engineering studies show that deliberate failure injection can reveal resilience weaknesses that normal tests miss @basiri2016chaos; @rosenthal2020chaos. These approaches are relevant to Circles because authenticated data routes depend on PostgreSQL and session lookup.

TypeScript-specific research adds another reason to test configuration boundaries. Bogner and Merkel found that TypeScript projects improve some quality indicators but do not automatically reduce all bug outcomes @bogner2022totype. Tang et al. show that TypeScript failures often occur around toolchains and configuration rather than only application logic @tang2026toolchains. This means a TypeScript monorepo still needs explicit QA evidence for build, test, and runtime composition.

The reviewed literature shows a clear gap. Existing work supports risk-based prioritization, CI automation, coverage, mutation testing, performance testing, and chaos engineering. Less work shows how these activities can be connected in one coursework-scale QA case study for a full-stack TypeScript monorepo. This project addresses that gap by integrating risk, automation, quality gates, and experiments into one research narrative.
