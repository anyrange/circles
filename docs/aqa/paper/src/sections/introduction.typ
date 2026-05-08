= Introduction

Full-stack web systems increasingly combine user interfaces, API services, background workflows, databases, and third-party integrations in one delivery pipeline. Quality assurance is important in this setting because a failure in one layer can affect authentication, data correctness, user trust, and deployment confidence. Automated tests help reduce this risk, but automation is only useful when it is linked to clear risk priorities and measured evidence. Without that link, teams can collect passing tests while important system risks remain untested.

This paper studies Circles, a TypeScript full-stack monorepo for Spotify listening-history analytics. The system includes a React frontend, a Hono backend, PostgreSQL storage through Drizzle ORM, background import workflows, and shared utility packages. Users authenticate through Spotify OAuth, import listening data, and view statistics such as top artists, listening time, range-filtered summaries, leaderboards, and library overviews. The repository uses Vite+ as a unified command interface for development, testing, formatting, linting, and builds. The main QA-relevant complexity comes from authentication, external data ingestion, database-backed queries, workspace-level test configuration, and continuous integration.

Testing Circles is difficult for four reasons. First, Spotify OAuth and session handling are integration-heavy and can block every authenticated user flow. Second, import and parsing errors can silently corrupt listening statistics before a user notices the defect. Third, the frontend, backend, and shared packages use different runtime assumptions even though they share one monorepo. Fourth, performance and availability risks cannot be detected by ordinary unit tests alone. These risks require a strategy that connects critical components to the right test type and metric.

Despite the adoption of Vite+ and automated tests, there is a lack of integrated evidence connecting risk-based prioritization, automated execution, quality gates, and experimental validation. This creates a negative consequence: narrow test suites can pass while controller behavior, workflow orchestration, database failure handling, and full-pipeline consistency remain weakly supported.

This work aims to design and evaluate a risk-based automated QA framework for the Circles monorepo. The study connects planning evidence from earlier assignments with direct experiments on coverage, execution time, mutation score, performance, and failure recovery.

The paper makes four contributions:

- Proposed a risk-based testing strategy tailored to a TypeScript full-stack monorepo.
- Mapped high-priority risks to automated test types, quality gates, and measurable metrics.
- Evaluated the current Circles automation pipeline using test execution, coverage, performance, mutation, and chaos evidence.
- Identified remaining QA gaps in backend integration coverage, frontend test orchestration, and database dependency handling.
