#import "colors.typ": (
  accent-amber,
  accent-green,
  accent-red,
  ink-light,
)

#let head-fill = rgb("#dfe8f2")
#let line-fill = rgb("#f8fafc")

#let tbl(..args) = table(
  stroke: 0.5pt + rgb("#b9c5d1"),
  inset: 5pt,
  fill: (_, row) => if row == 0 { head-fill } else { white },
  ..args,
)

#let tag(label, fill: ink-light) = box(
  inset: (x: 6pt, y: 3pt),
  radius: 3pt,
  fill: fill,
  stroke: 0.4pt + rgb("#b9c5d1"),
  text(size: 12pt, weight: "bold")[#label],
)

#let metric-card(title, value, note, fill: ink-light) = block(
  width: 100%,
  inset: 8pt,
  radius: 5pt,
  fill: fill,
  stroke: 0.5pt + rgb("#bcc8d4"),
)[
  #text(size: 20pt, weight: "bold")[#value] \
  #text(size: 12pt, weight: "bold")[#title] \
  #text(size: 11pt)[#note]
]

#let status(label, result, tone) = {
  let fill = if tone == "pass" { rgb("#dcefe5") } else if tone == "partial" { rgb("#fff0cf") } else { rgb("#f5d8d5") }
  let color = if tone == "pass" { accent-green } else if tone == "partial" { accent-amber } else { accent-red }
  block(
    width: 100%,
    inset: 6pt,
    radius: 4pt,
    fill: fill,
    stroke: 0.6pt + color,
  )[
    #text(size: 12pt, weight: "bold", fill: color)[#label] \
    #text(size: 13pt)[#result]
  ]
}

#let bar(label, value, max, fill) = {
  let total = 220pt
  let ratio = value / max
  grid(
    columns: (112pt, total, 58pt),
    gutter: 7pt,
    align: horizon,
    text(size: 12pt, weight: "bold")[#label],
    box(width: total, height: 13pt, fill: rgb("#e5ebf1"), radius: 3pt)[
      #box(width: ratio * total, height: 13pt, fill: fill, radius: 3pt)
    ],
    text(size: 12pt)[#str(value)],
  )
}

#let stage(name, detail, tone: ink-light) = block(
  width: 100%,
  inset: 7pt,
  radius: 5pt,
  fill: tone,
  stroke: 0.5pt + rgb("#b9c5d1"),
)[
  #text(size: 13pt, weight: "bold")[#name] \
  #text(size: 11pt)[#detail]
]

#let problem = [
  Circles is a TypeScript monorepo for Spotify listening-history analytics. It contains a React frontend, a Hono backend, shared packages, PostgreSQL storage, and background import workflows.

  The QA problem is not only whether tests pass. The main problem is whether high-risk behavior is covered by the right evidence. This is important because TypeScript projects can still fail through toolchain and configuration boundaries, not only through application logic @tang2026toolchains.

  #grid(
    columns: 2,
    gutter: 8pt,
    metric-card[Backend tests][33/33][extended suite passed],
    metric-card[Workflows][2][GitHub Actions checks],
    metric-card[Dataset][16,600][synthetic history rows],
    metric-card[Toolchain][Vite+][one command surface],
  )

  Main risk areas: authentication, Spotify export ingestion, dashboard range filtering, API routing, CI test composition, and PostgreSQL availability.
]

#let literature = [
  The poster keeps the evidence base from the research paper. Risk-based testing supports prioritizing high-impact failure areas instead of distributing effort evenly @boehm1991risk @felderer2014risk.

  Continuous integration literature supports frequent automated checks, but also shows that pipeline cost, configuration, and test stability matter @wang2022testautomation @shahin2017cicd.

  Coverage is used as a signal, not as proof of quality. Prior work shows that coverage alone is weakly related to test effectiveness when suite size is controlled @inozemtseva2014coverage. Mutation testing is therefore used for selected helper modules because it gives a stronger adequacy signal @jia2011mutation.
]

#let risk-model = [
  Risks were scored with a simple model:
  $ "Risk Score" = "Likelihood" times "Impact" $

  #tbl(
    columns: (0.7fr, 2.2fr, 1fr, 1fr),
    align: left,
    [*Risk*], [*Area*], [*Score*], [*Evidence*],
    [R1], [Sign-in and sessions], [20], [Partial],
    [R2], [Spotify export ingestion], [20], [Strong helper tests],
    [R3], [Range-filtered analytics], [15], [Unit + load],
    [R4], [API and middleware contracts], [12], [Gap],
    [R5], [Frontend test composition], [12], [Partial],
    [R6], [Database outage behavior], [15], [Chaos test],
  )

  The model changed test selection. High-impact paths were not treated as equal to low-risk helper code. Performance and resilience experiments were kept separate because load behavior and failure recovery need environment-level evidence @jiang2015loadtesting @basiri2016chaos.
]

#let research-question = [
  *Research question.* How can risk-based planning, automation, quality gates, and experiments be connected into one reproducible QA argument for Circles?

  *Method.* Earlier assignments were integrated into one pipeline. Assignment 1 supplied the risk strategy. Assignment 2 supplied automated tests and gates. Assignment 3 supplied performance, mutation, and chaos evidence. The final paper connected those parts into one case study.

  *Claim.* The current QA process is useful but incomplete. It gives fast feedback and exposes real weaknesses, but the strongest evidence is concentrated in helper modules rather than full user workflows.
]

#let qa-pipeline = [
  #grid(
    columns: 5,
    gutter: 7pt,
    stage[1. Risks][likelihood and impact scoring],
    stage[2. Tests][unit, integration, E2E, mutation],
    stage[3. Gates][pass, coverage, latency, mutation],
    stage[4. Experiments][load and failure injection],
    stage[5. Review][limitations and next tests],
  )

  #v(8pt)
  #tbl(
    columns: (1fr, 1.7fr, 2.2fr),
    align: left,
    [*Tool*], [*Role*], [*Reason*],
    [Vite+], [Unified command interface], [Matches repository workflow],
    [Vitest], [Unit and component tests], [Fast TypeScript feedback],
    [Stryker], [Mutation testing], [Checks assertion strength],
    [Autocannon], [Performance testing], [Repeatable local HTTP load],
    [GitHub Actions], [CI enforcement], [Push and pull-request checks],
  )
]

#let metrics = [
  #grid(
    columns: 2,
    gutter: 8pt,
    metric-card(fill: rgb("#e7f4ec"))[Mutation score][87.93%][selected helper files],
    metric-card(fill: rgb("#e7f4ec"))[Worst P99][24 ms][local read endpoint],
    metric-card(fill: rgb("#fbe9e7"))[Backend coverage][< 7%][whole-backend gate failed],
    metric-card(fill: rgb("#fff2d5"))[Recovery][200 again][after PostgreSQL restart],
  )

  #v(8pt)
  #text(size: 13pt, weight: "bold")[Selected helper mutation results]
  #bar([`range.ts`], 100, 100, accent-green)
  #bar([`retry.ts`], 77, 100, accent-amber)
  #bar([`spotify-export.ts`], 100, 100, accent-green)
  #bar([`zip.ts`], 88, 100, accent-green)

  #v(5pt)
  The load test used 20 concurrent connections for 10 seconds. The worst observed P99 was 24 ms on `/leaderboard?period=all`. The chaos test followed a 200, 500, 200 sequence when PostgreSQL was available, stopped, and restarted.
]

#let experiment-results = [
  #tbl(
    columns: (1.5fr, 1fr, 1fr, 1fr),
    align: left,
    [*Scenario*], [*Avg latency*], [*P99*], [*Avg RPS*],
    [`/health`], [0.01 ms], [0 ms], [43,093.82],
    [`/leaderboard?period=all`], [13.83 ms], [24 ms], [1,396.70],
    [`/library/overview?range=30d`], [12.62 ms], [21 ms], [1,523.90],
  )

  #v(8pt)
  #tbl(
    columns: (1.3fr, 1fr, 2fr),
    align: left,
    [*Chaos stage*], [*HTTP*], [*Observed behavior*],
    [Before failure], [200], [Library overview returned JSON],
    [PostgreSQL stopped], [500], [Session lookup failed],
    [PostgreSQL restarted], [200], [Service recovered without API restart],
  )
]

#let findings = [
  The results show a useful but incomplete QA process. The extended backend suite passed with 33 tests, and selected helper modules reached an 87.93% mutation score. Local read performance was also strong, with the worst observed P99 at 24 ms. These results support the value of the risk-based automation plan.

  The same evidence also shows clear gaps. Whole-backend coverage stayed below 7%, so the coverage gate failed at system scope. The PostgreSQL chaos experiment produced a user-visible HTTP 500 during the outage, although the service recovered after the database restarted. The strongest evidence is therefore concentrated in helper modules, while authentication, route composition, and database-backed workflows still need broader integration tests.
]

#let recommendations = [
  The next iteration should expand breadth before adding more tools.

  - Add integration tests for authenticated backend controllers.
  - Test route middleware and public/private route boundaries.
  - Strengthen Spotify import validation for malformed exports.
  - Repeat performance tests with larger data and multiple runs.
  - Add graceful error handling for database outages.
  - Keep mutation testing focused on high-risk modules unless runtime cost is reduced.

  The main defense point is that passing tests are not enough. Evidence must show which risks are covered and which risks remain open.
]

#let limitations = [
  The study has four limits:

  - It uses one repository, so the result is a case study.
  - Performance data comes from a local machine.
  - Mutation testing covers four helper files only.
  - Controller and workflow integration coverage is still incomplete.
]

#let references = [
  #grid(
    columns: (56pt, 1fr),
    gutter: 8pt,
    align: horizon,
    block(
      width: 56pt,
      inset: 3pt,
      radius: 4pt,
      fill: white,
      stroke: 0.5pt + rgb("#b9c5d1"),
    )[
      #image("repo-qr.svg", width: 50pt)
    ],
    [
      #text(size: 10.5pt, weight: "bold")[Repository source] \
      #text(size: 8pt)[Scan for the code, tests, and QA artifacts.] \
      #link("https://github.com/anyrange/circles")[
        #text(size: 7.5pt)[github.com/anyrange/circles]
      ]
    ],
  )

  #v(5pt)
  #text(size: 10.5pt, weight: "bold")[Cited sources]

  #set text(size: 5.8pt)
  #set par(leading: 0.18em)
  #bibliography("references.bib", title: [], full: false)
]
