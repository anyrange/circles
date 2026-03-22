#import "@preview/grape-suite:4.0.0": seminar-paper

#show: seminar-paper.project.with(
  title: [Circles — Development Plan & Methodology Selection],
  subtitle: [Assignment 2],

  university: [],
  faculty: [Software Development Case Study · CSE-2507M],
  institute: [],
  instructor: [],
  seminar: [],

  date: [3 April 2026],
  semester: none,
  show-declaration-of-independent-work: false,

  author: "Alexandr Tyulkov",
  student-number: none,
  email: none,
  address: none,
)

// ─── override font to sans-serif ─────────────────────────────────────────────
#set text(font: ("Inter", "Helvetica Neue", "Arial", "Liberation Sans"))

// ─── helpers ──────────────────────────────────────────────────────────────────
#let th(..cells) = table.header(..cells.pos().map(c =>
  table.cell(fill: luma(30), text(fill: white, weight: "bold", size: 9pt, c))))

#let stripe(_, row) = if row == 0 { luma(30) } else if calc.odd(row) { luma(248) } else { white }

// Gantt fill helpers
#let gd = rgb("#bbf7d0")   // done (green)
#let gc = rgb("#1d4ed8")   // critical path (dark blue)
#let gw = rgb("#bfdbfe")   // planned (light blue)
#let gt = rgb("#fde68a")   // testing (amber)
#let gm = rgb("#1e3a5f")   // milestone (navy)
#let ge = white

#let gcell(k: "e") = {
  if k == "d"  { table.cell(fill: gd, []) }
  else if k == "c" { table.cell(fill: gc, []) }
  else if k == "w" { table.cell(fill: gw, []) }
  else if k == "t" { table.cell(fill: gt, []) }
  else if k == "m" { table.cell(fill: gm, align(center, text(fill: white, size: 9pt, "★"))) }
  else             { table.cell(fill: ge, []) }
}

// ─────────────────────────────────────────────────────────────────────────────
= Methodology Selection

== Scoring Matrix

Score: 0 = not a fit, 1 = partial, 2 = strong fit. Scored against Circles specifically -- one developer, 10 weeks, and a feature list that changed a lot during development.

#table(
  columns: (2fr, 1fr, 1fr, 1fr, 1fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Criterion], [Waterfall], [Scrum], [Kanban], [SAFe]),
  [Requirements known upfront], [0], [2], [2], [1],
  [Team size fit (solo = 1)],   [0], [1], [2], [0],
  [Stakeholder involvement],    [1], [2], [1], [0],
  [Tolerance for change],       [0], [2], [2], [2],
  [Timeline flexibility],       [0], [2], [2], [1],
  [Incremental delivery],       [0], [2], [2], [0],
  [Best suited for this context],[0],[2], [1], [0],
  table.cell(fill: luma(30), text(fill: white, weight: "bold")[Total / 14]),
  table.cell(fill: luma(30), align(center, text(fill: white, weight: "bold")[1])),
  table.cell(fill: rgb("#1d4ed8"), align(center, text(fill: white, weight: "bold")[13])),
  table.cell(fill: luma(30), align(center, text(fill: white, weight: "bold")[12])),
  table.cell(fill: luma(30), align(center, text(fill: white, weight: "bold")[4])),
)

== Justification

Scrum scored 13/14 and was selected. One-week sprints are used across the 10-week semester.

The feature list for Circles wasn't settled at the start. Authentication and basic stats were planned first. Things like AI personality reports, playlist generation, and a ZIP importer came later, as it became clear they were feasible. Scrum works well here because the backlog can be updated between sprints -- there's no need to plan everything upfront. Kanban scored 12/14 and was close, but it has no fixed cadence. For a project with a hard deadline, having a sprint boundary every week is more useful than open-ended flow.

Stakeholder involvement scored 2 because each sprint ends with a self-review against the sprint goal. Even solo, this creates a regular checkpoint.

Scrum assumes 3 to 9 people, so team size scored 1. Daily stand-ups don't make sense for one developer. In practice: a short task note each morning and a 5-minute checklist at sprint end.

*Trade-off 1 -- ceremonies take time.* Planning and reviewing every sprint adds up. In practice it's kept to 10 minutes -- picking 2 or 3 tasks from the backlog, nothing more.

*Trade-off 2 -- one week is short.* A task that runs 2 days over leaves almost no room to recover. Sprint goals are kept small on purpose. If a feature isn't finished, it moves to the next sprint rather than blocking everything else.

// ─────────────────────────────────────────────────────────────────────────────
= Project Timeline & Milestones

#table(
  columns: (auto, auto, auto, 1fr, auto),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Sprint], [Week], [Dates], [Goal], [Status]),
  [*S1*], [W1], [17–23 Mar], [DB schema, Spotify OAuth, auth setup], [✓ Done],
  [*S2*], [W2], [24–30 Mar], [Scrobble sync background worker, token-refresh cron], [✓ Done],
  [*S3*], [W3], [31 Mar–6 Apr], [Top artists/albums/tracks endpoints with time-range params], [In Progress],
  [*S4*], [W4], [7–13 Apr], [Time machine, audio features, extended stats], [Not Started],
  [*S5*], [W5], [14–20 Apr], [Follow/unfollow, leaderboard, music-match, public profiles], [Not Started],
  [*S6*], [W6], [21–27 Apr], [Playlists + auto-cron, AI insights, ZIP import -- M1], [Not Started],
  [*S7*], [W7], [28 Apr–4 May], [Frontend core — stats dashboards, charts, main routes], [Not Started],
  [*S8*], [W8], [5–11 May], [Frontend polish — social/AI/playlist UI, responsive, WCAG], [Not Started],
  [*S9*], [W9], [12–18 May], [Unit tests, E2E, NFR validation, bug fixes -- M2], [Not Started],
  [*S10*], [W10], [19–25 May], [Deployment, docs, final submission -- M3], [Not Started],
)

#v(0.5em)
#table(
  columns: (auto, auto, 1fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Milestone], [Date], [Criteria]),
  [*M1* Prototype Demo],   [27 Apr], [Stats and social features return real data from the API; at least one page in the UI shows live data],
  [*M2* Testing Complete], [18 May], [All tests pass; no critical bugs open; performance and auth checks verified],
  [*M3* Final Submission], [25 May], [App is deployed and accessible; all documents submitted],
)

== Gantt Chart

#text(size: 8pt)[
#table(
  columns: (1.6fr, 0.6fr, 0.6fr, 0.6fr, 0.6fr, 0.6fr, 0.6fr, 0.6fr, 0.6fr, 0.6fr, 0.6fr),
  fill: (_, row) => if row == 0 { luma(30) } else { white },
  inset: (x: 4pt, y: 4pt),
  stroke: 0.5pt + luma(200),
  table.header(
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[Sprint]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W1]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W2]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W3]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W4]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W5]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W6]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W7]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W8]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W9]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[W10]),
  ),
  [S1 — Foundation],           gcell(k:"c"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),
  [S2 — Scrobble sync],        gcell(k:"d"),gcell(k:"c"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),
  [S3 — Core stats],           gcell(k:"d"),gcell(k:"d"),gcell(k:"c"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),
  [S4 — Extended analytics],   gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"w"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),
  [S5 — Social],               gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"w"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),
  [S6 — Advanced ★ M1],        gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"m"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),
  [S7 — Frontend core],        gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"w"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),
  [S8 — Frontend polish],      gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"w"),gcell(k:"e"),gcell(k:"e"),
  [S9 — Testing ★ M2],         gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"t"),gcell(k:"e"),
  [S10 — Final ★ M3],          gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"e"),gcell(k:"w"),
)

#v(0.3em)
#box(fill: luma(252), stroke: 0.5pt + luma(200), radius: 3pt, inset: 6pt)[
  #set text(size: 8pt)
  #box(fill: gc, width: 10pt, height: 10pt) Critical path #h(8pt)
  #box(fill: gd, width: 10pt, height: 10pt) Done #h(8pt)
  #box(fill: gw, width: 10pt, height: 10pt) Planned #h(8pt)
  #box(fill: gt, width: 10pt, height: 10pt) Testing #h(8pt)
  #box(fill: gm, width: 10pt, height: 10pt) #text(fill: white)[★] Milestone
]
]

Critical path is S1 to S4 (dark blue). S1 is the most important sprint -- the database schema it creates is what every later feature reads from. If S1 slips, everything else slips too.

// ─────────────────────────────────────────────────────────────────────────────
= Requirements Traceability

All requirements from Assignment 1 are listed below with the sprint they belong to and current status. Tasks are scoped to fit within 1 to 3 days of work.

== Functional Requirements

#table(
  columns: (auto, 1.3fr, 2fr, auto, auto),
  fill: stripe,
  inset: 5.5pt,
  stroke: 0.5pt + luma(200),
  th([ID], [Summary], [Tasks], [Sprint], [Status]),
  [FR-01], [Spotify OAuth + auto scrobble sync], [Set up auth flow with Spotify; store listening history automatically in the background; schedule token refresh], [S1–S2], [✓ Done],
  [FR-02], [Top artists/albums/tracks, time ranges], [Build stats endpoints with configurable time windows; add genre and audio-feature summaries], [S3], [In Prog],
  [FR-03], [Follow/unfollow + activity feed], [Social graph storage; follow/unfollow actions; feed showing friends' recent listening], [S5], [–],
  [FR-04], [AI personality reports], [Build listening-history context; call AI API with three prompt types (roast, taste profile, scene); cache results weekly], [S6], [–],
  [FR-05], [Playlist CRUD + auto weekly playlist], [Create/read/update/delete playlists; auto-generate a weekly playlist from recent listening on a schedule], [S6], [–],
  [FR-06], [Global leaderboard], [Aggregate total scrobbles per user; expose weekly and all-time rankings with short-lived cache], [S5], [–],
  [FR-07], [ZIP historical data import], [Accept Spotify data export ZIP; unpack and bulk-insert historical tracks into the database via background job], [S6], [–],
  [FR-08], [Public user profiles], [Add username, bio, and visibility setting to user accounts; serve a public profile page per username], [S5], [–],
  [FR-09], [Music-match score], [Score overlap between two users' top artists and tracks; expose as a single match percentage], [S5], [–],
  [FR-10], [Time-machine view], [Query listening history for a specific past date and return tracks played that day], [S4], [–],
)

== Non-Functional Requirements

#table(
  columns: (auto, 1.4fr, 2fr, auto, auto),
  fill: stripe,
  inset: 5.5pt,
  stroke: 0.5pt + luma(200),
  th([ID], [Summary], [Tasks], [Sprint], [Status]),
  [NFR-P1], [API p95 ≤ 200 ms],        [Add database indexes on user + date columns; profile slow endpoints; add response-time logging], [S1/S9], [S1 ✓],
  [NFR-P2], [Sync ≤ 30 s/user],        [Process track metadata in batches; measure sync duration in background worker], [S2/S9], [S2 ✓],
  [NFR-P3], [Leaderboard ≤ 500 ms],    [Cache leaderboard result for 5 minutes; validate latency under load], [S5/S9], [–],
  [NFR-P4], [Frontend FCP ≤ 2 s],      [Audit bundle size; enable server-side rendering; lazy-load chart components], [S8/S9], [–],
  [NFR-U1], [Responsive ≥ 375 px],     [Apply responsive styles to all layouts; verify on narrow viewport], [S8], [–],
  [NFR-U2], [WCAG 2.1 AA contrast],    [Run automated accessibility audit; fix any contrast failures], [S8], [–],
  [NFR-U3], [Onboarding ≤ 60 s],       [Streamline OAuth redirect; show loading skeleton while data fetches], [S1/S8], [S1 ✓],
  [NFR-U4], [Human-readable errors],   [Global error handler mapping failures to plain-language messages; friendly fallback states], [S3/S8], [Partial],
  [NFR-S1], [HTTPS / TLS 1.2+],        [Configure TLS on production host; redirect plain HTTP; run SSL audit], [S10], [–],
  [NFR-S2], [Tokens encrypted at rest],[Verify auth library stores tokens encrypted; confirm tokens never appear in API responses], [S1/S9], [S1 ✓],
  [NFR-S3], [401 on unauthenticated],  [Require valid session on all protected routes; write test asserting 401 for missing session], [S1/S9], [S1 ✓],
  [NFR-S4], [Private data inaccessible],[Apply visibility check on all social endpoints; test both public and private account scenarios], [S5/S9], [–],
  [NFR-R1], [≥ 99.5% uptime],          [Add health-check endpoint; set up uptime monitoring; write incident runbook], [S10], [–],
  [NFR-R2], [Token refresh ≤ 50 min],  [Confirm background refresh job fires every 50 minutes reliably], [S2/S9], [S2 ✓],
  [NFR-R3], [Auto-retry x3, back-off], [Configure retries with back-off on all background workflows; test with simulated failures], [S2/S6/S9], [S2 ✓],
  [NFR-R4], [Graceful Spotify 429],    [Detect rate-limit responses; pause and retry automatically; never expose the error to users], [S2/S9], [S2 ✓],
  [NFR-SC1], [No degradation at 10 M rows], [Profile aggregation queries against a large synthetic dataset; add covering indexes where needed], [S1/S9], [S1 ✓],
  [NFR-SC2], [Horizontal worker scaling],[Verify background jobs are deduplicated when multiple worker instances run; document how to scale], [S2/S9], [S2 ✓],
  [NFR-SC3], [Stateless API server],   [Confirm all session state lives in the database, not in-process; verify load-balancer compatibility], [S1/S9], [S1 ✓],
)

// ─────────────────────────────────────────────────────────────────────────────
= Risk Register

#table(
  columns: (2fr, auto, auto, auto, 1.8fr, 1.5fr),
  fill: stripe,
  inset: 5.5pt,
  stroke: 0.5pt + luma(200),
  th([Risk (category)], [Prob.], [Impact], [Priority], [Mitigation], [Owner & By]),
  [Spotify changes or removes an API endpoint *(technical)*],
  [M],[H],[P1],[Keep Spotify calls behind a wrapper layer so changes are easy to fix in one place; handle missing data gracefully],[Dev -- S3],

  [Stats queries become too slow with real user data *(technical)*],
  [L],[H],[P2],[Test queries against a large dataset before launch; add indexes; cache the leaderboard result],[Dev -- S9],

  [Getting sick or stuck for several days *(resource)*],
  [M],[H],[P1],[Push code to remote every day so no work is lost; keep sprint goals small so one bad day does not break the whole sprint],[Dev -- ongoing],

  [Adding too many features and running out of time *(timeline)*],
  [H],[M],[P1],[Stop adding features after Sprint 6; anything new goes into a backlog for later],[Dev -- 27 Apr],

  [Not enough time left for testing *(timeline)*],
  [M],[M],[P2],[Sprint 9 is reserved only for testing; write tests for each feature as it is finished, not all at the end],[Dev -- S5],

  [Personality report service gets expensive *(resource)*],
  [L],[M],[P3],[Store the generated report and reuse it for a week; only call the service again when the week is over],[Dev -- S6],

  [Bus factor is 1 *(resource)*],
  [H],[H],[P1],[One developer means one point of failure. If that person is unavailable for any reason, the project stops. Commit messages are kept descriptive, non-obvious decisions are commented in code, and credentials are stored in a password manager so the project can be picked up after a break],[Dev -- ongoing],
)

== Task Dependencies

#table(
  columns: (1fr, 1fr, 1fr),
  fill: stripe,
  inset: 5.5pt,
  stroke: 0.5pt + luma(200),
  th([Upstream], [Downstream], [Why]),
  [S1: DB schema], [S3: Analytics], [All stat queries read from history; schema must be final first],
  [S2: Scrobble sync], [S4: Time machine and extended stats], [Time-series analytics need real scrobble data in the database],
  [S5: Social graph], [S5: Activity feed and music match], [Follow relationships must exist before feed or match queries work],
  [S6: All backend features], [S7: Frontend integration], [Building UI against incomplete endpoints wastes effort],
  [S8: Frontend complete], [S9: E2E testing], [End-to-end tests require both frontend and backend to be stable],
  [S9: All tests pass], [S10: Final submission], [Submission requires a working, tested system],
)

// ─────────────────────────────────────────────────────────────────────────────
= AI Tools Usage

#table(
  columns: (auto, 1fr, 1fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Tool], [Used for], [Kept / changed / rejected]),
  [Claude (claude-sonnet-4-6)],
  [Helped structure the scoring matrix and suggested an initial list of risks to consider.],
  [Scores were set based on the actual project context. Risk descriptions were rewritten to reflect realistic solo-developer scenarios. Several suggestions that did not apply were removed.],
)
