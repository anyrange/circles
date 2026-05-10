# Poster Visual Plan

The poster uses native Typst visuals so the PDF stays sharp at A1 size.

Included visuals:

- Metric cards for tests, CI workflows, dataset size, Vite+ toolchain, mutation score, latency, coverage, and recovery.
- A risk table that maps each high-priority system risk to current evidence.
- A five-stage QA pipeline diagram from risk scoring to review.
- Mutation-score bars for `range.ts`, `retry.ts`, `spotify-export.ts`, and `zip.ts`.
- Tables for performance and PostgreSQL chaos testing outcomes.
- Gate status blocks for passed, failed, and partial results.

Optional screenshots for the oral defense:

- GitHub Actions workflow run showing `vp check`, tests, and build.
- Backend coverage output showing whole-backend coverage below 7%.
- Stryker mutation report showing the 87.93% selected-helper score.
- Terminal or log capture from the PostgreSQL stop/start chaos experiment.
- Circles dashboard or library overview screen to show the user-facing system under test.
