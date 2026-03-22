
#import "@preview/cetz:0.3.4": canvas, draw

// ─── Document meta ───────────────────────────────────────────────────────────
#set document(
  title: "Circles — Software Development Case Study Requirements Specification",
  author: ("Alexandr Tyulkov",),
  date: datetime(year: 2026, month: 3, day: 19),
)

// ─── Page ────────────────────────────────────────────────────────────────────
#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.8cm),
  numbering: "1",
  number-align: center,
  header: context {
    if counter(page).get().first() > 2 {
      set text(size: 9pt, fill: luma(140))
      grid(
        columns: (1fr, 1fr),
        align: (left, right),
        [Circles — Case Study Requirements Specification],
        [CSE-2507M · 2026],
      )
      v(-4pt)
      line(length: 100%, stroke: 0.5pt + luma(200))
    }
  },
)

// ─── Typography ──────────────────────────────────────────────────────────────
#set text(size: 11pt, lang: "en")
#set par(justify: true, leading: 0.7em, spacing: 1.2em)
#set heading(numbering: "1.1")

#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  v(0.4em)
  block(
    above: 0.6em,
    below: 0.5em,
    text(size: 15pt, weight: "bold", it),
  )
}
#show heading.where(level: 2): it => {
  block(above: 1em, below: 0.3em, text(size: 12.5pt, weight: "bold", it))
}
#show heading.where(level: 3): it => {
  block(above: 0.8em, below: 0.2em, text(size: 11pt, weight: "bold", style: "italic", it))
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
#let req-table(..rows) = {
  table(
    columns: (auto, 1fr),
    stroke: 0.5pt + luma(180),
    fill: (_, row) => if calc.odd(row) { luma(248) } else { white },
    inset: 7pt,
    ..rows,
  )
}

#let us(id, actor, action, goal) = {
  block(
    stroke: 0.5pt + luma(200),
    radius: 4pt,
    inset: 10pt,
    fill: luma(252),
    width: 100%,
    below: 0.7em,
  )[
    #text(weight: "bold", size: 10pt)[#id]
    #h(6pt) #text(fill: luma(80))[As a *#actor*, I want to *#action* so that #goal.]
  ]
}

// ═══════════════════════════════════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════
#set page(numbering: none)

#v(3.5cm)

#align(center)[
  #text(size: 32pt, weight: "bold")[Circles]
  #v(0.3cm)
  #text(size: 14pt, fill: luma(90))[A Music Statistics & Social Platform]
  #v(0.6cm)
  #line(length: 55%, stroke: 1pt + luma(200))
  #v(0.6cm)
  #text(size: 18pt, weight: "semibold")[Software Development Case Study]
  #v(0.15cm)
  #text(size: 15pt, weight: "medium")[Requirements Specification Document]
  #v(0.2cm)
  #text(size: 12pt, fill: luma(100))[Assignment 1 — Requirements Gathering & Specification]
]

#v(2cm)

#align(center)[
  #block(
    stroke: 0.5pt + luma(200),
    radius: 6pt,
    inset: (x: 1.5cm, y: 0.8cm),
    width: 80%,
  )[
    #set text(size: 11pt)
    #grid(
      columns: (auto, auto),
      column-gutter: 1.5cm,
      row-gutter: 0.5em,
      align: (right, left),
      text(weight: "bold")[Course:], [Software Development Case Study],
      text(weight: "bold")[Assignment:], [1 — Requirements Engineering],
      text(weight: "bold")[Week:], [Week 2],
      text(weight: "bold")[Group:], [CSE-2507M],
      text(weight: "bold")[Team:], [Alexandr Tyulkov],
      text(weight: "bold")[Date:], [March 19, 2026],
    )
  ]
]

#pagebreak()

// ═══════════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS
// ═══════════════════════════════════════════════════════════════════════════
#set page(numbering: "1")
#counter(page).update(1)

#outline(title: "Table of Contents", indent: 1.5em, depth: 3)

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — PROJECT PLANNING
// ═══════════════════════════════════════════════════════════════════════════
= Part 1 — Project Planning

== System Description & Purpose

*Circles* is a web-based music statistics and social platform built on the Spotify API. It stores every played track as a "scrobble" and exposes that data through analytics dashboards, a social graph, and AI-generated insights.

Users can browse top artists, albums, and tracks across configurable time windows; view audio-feature profiles (energy, valence, danceability); follow other users; compete on leaderboards; request AI personality reports; manage playlists; and import historical listening data.

Circles draws on Last.fm (scrobbling) and Spotify Wrapped (periodic summaries), but makes statistics and social features available continuously — not just at year's end.

== Target Audience

The primary users of Circles are:

- *Music enthusiasts and power listeners* (ages 16–35) who want persistent statistics beyond what Spotify's native app exposes.
- *Socially driven listeners* who compare tastes with friends and discover music through others' activity.
- *Data-curious individuals* interested in genre evolution, mood trends, and listening streaks.

A secondary audience is *casual Spotify users* who join through a friend's invite.

== Problem Statement

Spotify provides end-of-year "Wrapped" summaries and a "Recently Played" list capped at 50 tracks. There is no built-in way to:

- Maintain a permanent, searchable listening history beyond the 50-track API limit.
- Track statistics over arbitrary time windows (e.g., "my top artists in the last 90 days").
- See what friends are listening to or discover music through social connections.
- Get narrative-style insights about one's own listening identity.

Last.fm covers scrobbling but has a dated UI and no AI features. Circles combines persistent scrobbling, analytics, social features, and AI profiling in one product.

== Feasibility Study (TELOS Model)

#req-table(
  table.header(
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[Dimension]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[Assessment]),
  ),
  [*Technical*],
  [
    All required technologies are mature and in active use across the stack. The Spotify Web API provides OAuth 2.0 and recently-played endpoints. PostgreSQL handles time-series scrobble data. Hono and React with TanStack cover the API and frontend layers. The Claude API provides generative text. The team has hands-on experience with each component.
  ],
  [*Economic*],
  [
    A student/portfolio project with no commercial requirement. The Spotify and Claude APIs both offer free tiers sufficient for development. PostgreSQL and S3 run on free or low-cost cloud plans (~\$10–20/month for a full deployment).
  ],
  [*Legal*],
  [
    Spotify data is accessed only after explicit OAuth consent and is not redistributed. Only metadata (track IDs, timestamps) is stored — no audio content. User data handling is GDPR-aligned: minimisation, consent, right to deletion. AI-generated content is per-user and not persisted beyond a short cache window.
  ],
  [*Operational*],
  [
    Browser-based, no installation required. OAuth tokens are refreshed automatically on a scheduled job before expiry. Scrobble syncing runs on a cron schedule. Local development uses Docker Compose; production uses standard cloud deployment.
  ],
  [*Schedule*],
  [
    14-week semester project. Auth, scrobble storage, and basic analytics are the critical path (first four weeks). Social, AI, and import features follow in subsequent sprints.
  ],
)

== Team

#req-table(
  table.header(
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[Name]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[Responsibilities]),
  ),
  [Alexandr Tyulkov], [Backend API design, database schema, background worker, Spotify integration, AI features, frontend architecture, UI/UX, React components, TanStack Router, data visualisations],
)

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — REQUIREMENTS DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════
= Part 2 — Requirements Documentation

== Project Overview

*Goal:* A web application that gives Spotify users a permanent record of their listening history, with analytics, social interactions, playlist management, and AI-generated insights.

*Main functionalities:*
#list(
  [Spotify OAuth authentication and automatic scrobble syncing],
  [Statistics dashboards — top artists, albums, tracks, genres across time ranges],
  [Audio-feature analysis and visualisation (radar charts, timeline)],
  [Social graph — follow/unfollow users, view friends' recent activity],
  [Global and time-windowed leaderboards],
  [Music-match score between two users based on shared listening],
  [AI-generated personality reports: Taste DNA, personalised roasts, scene reports],
  [Playlist creation, management, and auto-generation],
  [Historical data import via ZIP file upload],
  [Public user profiles with customisable usernames],
)

*Target audience:* Music enthusiasts, social listeners, and data-curious Spotify users aged 16–35 (see Section 1.2).

== Functional Requirements

#us("US-01", "registered user", "connect my Spotify account via OAuth", "my listening history is automatically tracked without manual input.")

#us("US-02", "user", "view my top artists, albums, and tracks across selectable time ranges (7 days, 30 days, 90 days, 1 year, all-time)", "I can understand how my music taste changes over time.")

#us("US-03", "user", "follow other users and see a feed of their recent listening activity", "I can discover new music through people whose taste I trust.")

#us("US-04", "user", "request an AI-generated report about my music personality (Taste DNA, roast, or scene report)", "I receive a fun and personalised narrative about my listening identity.")

#us("US-05", "user", "create playlists, add or remove tracks, and have the system auto-generate a weekly playlist from my recent listening", "I can organise and share my music collections without leaving the platform.")

#us("US-06", "user", "see a global leaderboard ranked by total scrobbles for the current week and all-time", "I can compare my listening volume with the broader community.")

#us("US-07", "user", "upload a ZIP archive of my historical listening data", "I can retroactively import listening history from before I joined Circles and have a complete statistical picture.")

#us("US-08", "user", "view a public profile for any other registered user, including their stats and top tracks", "I can learn about someone's music taste before deciding to follow them.")

#us("US-09", "user", "see a 'music match' score between myself and another user", "I can quantify how similar our tastes are and find people with overlapping preferences.")

#us("US-10", "user", "browse a 'time machine' view that shows what I was listening to on any past date", "I can relive specific moments through the music I had on at the time.")

=== Use Case Diagrams

// ── shared helpers ────────────────────────────────────────────────────────────
// (defined inside each canvas to stay in draw scope)

*Diagram A — Statistics, Social & Discovery*

#align(center)[
  #canvas(length: 0.85cm, {
    let act(pos, lbl) = {
      let (x, y) = pos
      draw.circle((x, y), radius: 0.28, fill: white, stroke: 0.6pt)
      draw.line((x, y - 0.28), (x, y - 0.95), stroke: 0.6pt)
      draw.line((x - 0.42, y - 0.52), (x + 0.42, y - 0.52), stroke: 0.6pt)
      draw.line((x, y - 0.95), (x - 0.33, y - 1.6), stroke: 0.6pt)
      draw.line((x, y - 0.95), (x + 0.33, y - 1.6), stroke: 0.6pt)
      draw.content((x, y - 2.15), align(center, text(size: 8pt, lbl)))
    }
    let uc(pos, lbl) = {
      draw.circle(pos, radius: (1.85, 0.47), fill: white, stroke: 0.6pt)
      draw.content(pos, align(center, text(size: 8pt, lbl)))
    }

    // system boundary
    draw.rect((-2.9, -2.5), (2.9, 7.5), fill: none, stroke: 1pt)
    draw.content((0, 7.15), align(center, text(size: 9pt, weight: "bold", "Circles")))

    // lines (drawn before ovals so fills cover endpoints)
    draw.line((-5.0, 2.1), (0, 6.0), stroke: 0.5pt)
    draw.line((-5.0, 2.1), (0, 4.7), stroke: 0.5pt)
    draw.line((-5.0, 2.1), (0, 3.4), stroke: 0.5pt)
    draw.line((-5.0, 2.1), (0, 2.1), stroke: 0.5pt)
    draw.line((-5.0, 2.1), (0, 0.8), stroke: 0.5pt)
    draw.line((-5.0, 2.1), (0, -0.5), stroke: 0.5pt)
    draw.line((-5.0, 2.1), (0, -1.8), stroke: 0.5pt)

    // use cases
    uc((0,  6.0), "View Statistics")       // US-02
    uc((0,  4.7), "Browse Time Machine")   // US-10
    uc((0,  3.4), "Follow / Unfollow")     // US-03
    uc((0,  2.1), "View Activity Feed")    // US-03
    uc((0,  0.8), "View User Profile")     // US-08
    uc((0, -0.5), "Music Match Score")     // US-09
    uc((0, -1.8), "View Leaderboard")      // US-06

    // actor
    act((-5.0, 2.1), "User")
  })
]

#v(1.5em)

*Diagram B — Auth, Import, AI & Playlists*

#align(center)[
  #canvas(length: 0.85cm, {
    let act(pos, lbl) = {
      let (x, y) = pos
      draw.circle((x, y), radius: 0.28, fill: white, stroke: 0.6pt)
      draw.line((x, y - 0.28), (x, y - 0.95), stroke: 0.6pt)
      draw.line((x - 0.42, y - 0.52), (x + 0.42, y - 0.52), stroke: 0.6pt)
      draw.line((x, y - 0.95), (x - 0.33, y - 1.6), stroke: 0.6pt)
      draw.line((x, y - 0.95), (x + 0.33, y - 1.6), stroke: 0.6pt)
      draw.content((x, y - 2.15), align(center, text(size: 8pt, lbl)))
    }
    let uc(pos, lbl) = {
      draw.circle(pos, radius: (1.85, 0.47), fill: white, stroke: 0.6pt)
      draw.content(pos, align(center, text(size: 8pt, lbl)))
    }
    let ext(pos, lbl) = {
      let (x, y) = pos
      draw.rect((x - 1.3, y - 0.38), (x + 1.3, y + 0.38),
        fill: luma(245), stroke: 0.6pt, radius: 2pt)
      draw.content((x, y), align(center, text(size: 7.5pt, lbl)))
    }

    // system boundary
    draw.rect((-2.9, -1.7), (2.9, 4.5), fill: none, stroke: 1pt)
    draw.content((0, 4.15), align(center, text(size: 9pt, weight: "bold", "Circles")))

    // lines — User to use cases
    draw.line((-5.0, 1.25), (0,  3.5), stroke: 0.5pt)
    draw.line((-5.0, 1.25), (0,  2.0), stroke: 0.5pt)
    draw.line((-5.0, 1.25), (0,  0.5), stroke: 0.5pt)
    draw.line((-5.0, 1.25), (0, -1.0), stroke: 0.5pt)

    // lines — external systems to use cases
    draw.line((5.5, 3.5), (1.85, 3.5), stroke: 0.5pt)  // Spotify API
    draw.line((5.5, 0.5), (1.85, 0.5), stroke: 0.5pt)  // Claude AI API

    // use cases
    uc((0,  3.5), "Connect Spotify")       // US-01
    uc((0,  2.0), "Upload History ZIP")    // US-07
    uc((0,  0.5), "Request AI Report")     // US-04
    uc((0, -1.0), "Manage Playlists")      // US-05

    // actors
    act((-5.0, 1.25), "User")
    ext((5.5,  3.5),  "Spotify API")
    ext((5.5,  0.5),  "Claude AI API")
  })
]

== Non-Functional Requirements

=== Performance

#req-table(
  [*NFR-P1*], [The API must respond to 95% of requests within *200 ms* under normal load (up to 100 concurrent users).],
  [*NFR-P2*], [The Spotify history sync workflow must complete for a single user within *30 seconds* of being triggered.],
  [*NFR-P3*], [The leaderboard endpoint, which aggregates millions of rows, must respond within *500 ms* by using server-side caching with a TTL of 5 minutes.],
  [*NFR-P4*], [Frontend initial page load (First Contentful Paint) must occur within *2 seconds* on a standard broadband connection.],
)

=== Usability

#req-table(
  [*NFR-U1*], [The UI must be fully responsive and usable on screens with a minimum width of *375 px* (iPhone SE equivalent).],
  [*NFR-U2*], [All interactive controls must meet WCAG 2.1 Level AA contrast ratios (*4.5:1* minimum for normal text).],
  [*NFR-U3*], [A new user must be able to complete Spotify login and reach their first dashboard within *under 60 seconds* with no prior instruction.],
  [*NFR-U4*], [Error states (failed API calls, empty history) must surface a human-readable message — never a raw stack trace or HTTP status code.],
)

=== Security

#req-table(
  [*NFR-S1*], [All communication between the browser, API, and external services must use *HTTPS/TLS 1.2+*. HTTP requests must be rejected or redirected.],
  [*NFR-S2*], [Spotify OAuth access tokens and refresh tokens must be stored *encrypted at rest* and never exposed to the client.],
  [*NFR-S3*], [All protected API routes must validate a session token on every request; unauthenticated requests must receive *HTTP 401*.],
  [*NFR-S4*], [User data must not be accessible to other users unless the account is explicitly set to *public*.],
)

=== Reliability

#req-table(
  [*NFR-R1*], [The system must maintain *≥ 99.5%* monthly uptime for the web application (≤ 3.6 hours downtime/month).],
  [*NFR-R2*], [The token-refresh background job must run at least every *50 minutes* to ensure Spotify tokens (valid for 60 minutes) never expire unexpectedly during a user session.],
  [*NFR-R3*], [Failed background jobs (sync, import) must be *retried automatically* up to 3 times with exponential back-off before being marked as failed.],
  [*NFR-R4*], [The system must handle Spotify API rate-limit responses (HTTP 429) gracefully by *backing off and retrying* without data loss.],
)

=== Scalability

#req-table(
  [*NFR-SC1*], [The database schema must support *at least 10 million scrobble records* across all users without query degradation (achieved via indexed `played_at` and `user_id` columns).],
  [*NFR-SC2*], [The background worker must be horizontally scalable — multiple worker instances must be deployable without duplicate job execution (guaranteed by the Hatchet job queue).],
  [*NFR-SC3*], [The API server must be stateless so that *multiple instances* can run behind a load balancer without session-affinity requirements.],
)

== Constraints & Assumptions

=== Constraints

#req-table(
  [*Team*], [Two developers, each contributing approximately 10–15 hours per week for 14 weeks.],
  [*Spotify API*], [Access to recently-played tracks is limited to the last 50 plays per API call; full history reconstruction requires either iterative polling or a user-supplied data export.],
  [*Spotify API (rate limits)*], [The Spotify Web API imposes rate limits that prevent syncing more than a few hundred tracks per minute per user token.],
  [*AI cost*], [AI report generation is gated behind a per-user weekly cache bucket to limit Anthropic API spend to within the free-tier quota during development.],
  [*Time*], [The full feature set must be demonstrable by the end of the semester (approximately 14 weeks from project start).],
  [*Platform*], [Circles is a web-only application for the scope of this project. Native mobile apps are out of scope.],
)

=== Assumptions

#req-table(
  [*A1*], [All target users have an existing Spotify account; the system does not manage music playback or require a Spotify Premium subscription.],
  [*A2*], [Users grant the required Spotify OAuth scopes (`user-read-recently-played`, `playlist-modify-public`) during first login.],
  [*A3*], [The development environment uses Docker Compose to run PostgreSQL, the Hatchet job queue, and MinIO (S3-compatible storage) locally. A cloud equivalent is assumed for production.],
  [*A4*], [Internet connectivity is required; the application has no offline mode.],
  [*A5*], [Historical import files are in the Spotify Extended Streaming History JSON format (ZIP archive as provided by Spotify's "Download your data" feature).],
)

=== Technology Stack (Fixed)

#req-table(
  [*Frontend*], [React 19, TanStack Start (SSR), TanStack Router, TanStack Query, Tailwind CSS],
  [*Backend*], [Node.js ≥ 22, Hono (HTTP framework), better-auth (OAuth)],
  [*Database*], [PostgreSQL 16, Drizzle ORM],
  [*Background Jobs*], [Hatchet Lite (workflow orchestration)],
  [*AI*], [Anthropic Claude API],
  [*File Storage*], [AWS S3 (MinIO for local dev)],
  [*Build Tooling*], [Vite+ (`vp` CLI), pnpm workspaces],
)

== AI Tools Usage Log

#table(
  columns: (auto, 1fr, 1fr),
  stroke: 0.5pt + luma(180),
  fill: (_, row) => if row == 0 { luma(30) } else if calc.odd(row) { luma(248) } else { white },
  inset: 7pt,
  table.header(
    text(fill: white, weight: "bold")[Tool],
    text(fill: white, weight: "bold")[Specific Purpose],
    text(fill: white, weight: "bold")[What was kept / changed / rejected],
  ),
  [Claude (claude-sonnet-4-6)],
  [Brainstormed section structure, suggested candidate user stories and NFR wording, cross-checked requirements against the implemented codebase (schema, routes, worker workflows).],
  [Kept structural suggestions and a few feature prompts that matched the project. All requirements were rewritten against the actual source code. NFRs were tightened with measurable thresholds. Suggestions that didn't match scope (e.g. unimplemented features) were discarded or reworded.],
)

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — INITIAL SYSTEM SCOPE DIAGRAM
// ═══════════════════════════════════════════════════════════════════════════
= Part 3 — Initial System Scope Diagram

Major subsystems, actors, and data/control flow between components.

// ── Helper: a labelled module box ────────────────────────────────────────────
#let mbox(label, fill: white, stroke-col: luma(160), width: auto) = box(
  fill: fill,
  stroke: 0.8pt + stroke-col,
  radius: 5pt,
  inset: (x: 8pt, y: 7pt),
  width: width,
  align(center, text(size: 9pt, label)),
)

// ── Helper: arrow label ───────────────────────────────────────────────────────
#let arr(lbl) = text(size: 7.5pt, fill: luma(90), lbl)

#v(1em)

// ─── ROW 0: External systems (top) ───────────────────────────────────────────
#align(center)[
  #grid(
    columns: (1fr, 1fr, 1fr),
    column-gutter: 1cm,
    align: center,
    mbox([*Spotify API*\ #text(size: 8pt)[OAuth · Recently Played\ Track / Artist metadata]], fill: rgb("#f0fff4"), stroke-col: rgb("#22c55e"), width: 100%),
    mbox([*Claude AI API*\ #text(size: 8pt)[Text generation\ Personality insights]], fill: rgb("#fff7ed"), stroke-col: rgb("#f97316"), width: 100%),
    mbox([*AWS S3*\ #text(size: 8pt)[ZIP archive storage\ Presigned URLs]], fill: rgb("#faf5ff"), stroke-col: rgb("#a855f7"), width: 100%),
  )

  #v(0.1cm)
  // Arrows from external systems down
  #grid(
    columns: (1fr, 1fr, 1fr),
    column-gutter: 1cm,
    align: center,
    arr([↕ OAuth tokens\ Recently Played]),
    arr([↓ Prompts  ↑ Responses]),
    arr([↕ Read / Write]),
  )
  #v(0.1cm)

  // ─── ROW 1: Worker + API Server ──────────────────────────────────────────
  #grid(
    columns: (1fr, 2fr, 1fr),
    column-gutter: 0.8cm,
    align: center + horizon,

    // Left: Background Worker
    mbox([*Background Worker*\ #text(size: 8pt)[(Hatchet Lite)\ Sync History · Token Refresh\ Import Processor · Auto-Playlists]], fill: rgb("#fdf2f8"), stroke-col: rgb("#ec4899"), width: 100%),

    // Centre arrows ↔
    align(center)[
      #arr([↔ Trigger jobs\ via API])
    ],

    // Right: API Server
    mbox([*API Server*\ #text(size: 8pt)[(Hono + Node.js)\ Auth · Analytics · Social\ AI Insights · Playlists\ Import · Leaderboard]], fill: rgb("#fefce8"), stroke-col: rgb("#eab308"), width: 100%),
  )

  #v(0.15cm)
  #grid(
    columns: (1fr, 2fr, 1fr),
    column-gutter: 0.8cm,
    align: center,
    arr([↕ Write scrobbles]),
    [],
    arr([↕ JSON / RPC]),
  )
  #v(0.05cm)

  // ─── ROW 2: Database + Frontend ──────────────────────────────────────────
  #grid(
    columns: (1fr, 2fr, 1fr),
    column-gutter: 0.8cm,
    align: center + horizon,

    mbox([*PostgreSQL*\ #text(size: 8pt)[(Drizzle ORM)\ 14 tables\ Scrobbles · Users · Tracks\ Artists · Playlists · AI Cache]], fill: rgb("#f0fdf4"), stroke-col: rgb("#16a34a"), width: 100%),

    align(center)[
      #arr([↔ SQL queries])
    ],

    mbox([*Frontend*\ #text(size: 8pt)[(React 19 + TanStack)\ Dashboards · Charts\ Social Feed · AI Reports\ Playlists · Import UI]], fill: rgb("#eff6ff"), stroke-col: rgb("#3b82f6"), width: 100%),
  )

  #v(0.15cm)
  #grid(
    columns: (1fr, 2fr, 1fr),
    column-gutter: 0.8cm,
    align: center,
    [],
    [],
    arr([↑ HTTPS]),
  )
  #v(0.05cm)

  // ─── ROW 3: User ─────────────────────────────────────────────────────────
  #align(right)[
    #box(width: 33%)[
      #align(center)[
        #mbox([*User (Browser)*\ #text(size: 8pt)[Spotify account required\ Any modern browser]], fill: rgb("#e0f2fe"), stroke-col: rgb("#0ea5e9"), width: 100%)
      ]
    ]
  ]
]

#v(1em)

// ── Legend ────────────────────────────────────────────────────────────────────
#block(
  stroke: 0.5pt + luma(210),
  radius: 4pt,
  inset: 9pt,
  fill: luma(252),
  width: 100%,
)[
  #set text(size: 9pt)
  *Legend:* #h(6pt)
  #mbox([External API], fill: rgb("#f0fff4"), stroke-col: rgb("#22c55e")) #h(4pt)
  #mbox([Worker], fill: rgb("#fdf2f8"), stroke-col: rgb("#ec4899")) #h(4pt)
  #mbox([API Server], fill: rgb("#fefce8"), stroke-col: rgb("#eab308")) #h(4pt)
  #mbox([Database], fill: rgb("#f0fdf4"), stroke-col: rgb("#16a34a")) #h(4pt)
  #mbox([Frontend], fill: rgb("#eff6ff"), stroke-col: rgb("#3b82f6")) #h(4pt)
  #mbox([User], fill: rgb("#e0f2fe"), stroke-col: rgb("#0ea5e9")) #h(8pt)
  ↕ = bidirectional flow  #h(6pt) ↓ / ↑ = unidirectional flow
]

#v(1.5em)

=== Component Descriptions

#req-table(
  table.header(
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[Component]),
    table.cell(fill: luma(30), text(fill: white, weight: "bold")[Responsibility]),
  ),
  [User (Browser)], [Authenticates via Spotify OAuth and uses all platform features through a web browser.],
  [Frontend (React + TanStack)], [Renders the UI; handles SSR + client-side routing; fetches data via TanStack Query.],
  [API Server (Hono)], [Central HTTP API. Routes to feature controllers (analytics, social, playlists, AI, import). Validates session token on every protected route.],
  [Auth Module (better-auth)], [Handles Spotify OAuth 2.0 login, issues session tokens, stores encrypted provider credentials.],
  [Analytics Engine], [Aggregates scrobbles into top-artists/tracks/albums stats, audio-feature summaries, genre distributions, and timeline charts.],
  [AI Insights Module], [Builds prompts from a user's listening history and calls the Claude API. Caches responses per user per week.],
  [Playlist & Social Module], [Playlist CRUD, follow/unfollow, leaderboard aggregation, music-match scoring, activity feeds.],
  [Background Worker (Hatchet)], [Runs async jobs: scrobble sync, token refresh cron, ZIP import processing, weekly playlist generation.],
  [PostgreSQL (Drizzle ORM)], [Persistent store for users, scrobbles, tracks, artists, albums, playlists, social graph, AI cache, and import jobs.],
  [Spotify API], [OAuth + recently-played endpoint (50 tracks/call). Source of track, artist, album, and audio-feature metadata.],
  [Claude AI API], [Produces Taste DNA profiles, personalised roasts, and music-scene reports from listening-history context.],
  [AWS S3], [Stores user-uploaded ZIP archives (Spotify Extended Streaming History format).],
)
