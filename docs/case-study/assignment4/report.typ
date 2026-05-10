#import "@preview/grape-suite:4.0.0": seminar-paper

#show: seminar-paper.project.with(
  title: [Circles: Product Thinking and MVP Development],
  subtitle: [Assignment 4],

  university: [],
  faculty: [Software Development Case Study · CSE-2507M],
  institute: [],
  instructor: [],
  seminar: [],

  date: [10 May 2026],
  semester: none,
  show-declaration-of-independent-work: false,

  author: "Alexandr Tyulkov",
  student-number: none,
  email: none,
  address: none,
)

#set text(font: ("Inter", "Helvetica Neue", "Arial", "Liberation Sans"), size: 10.5pt, lang: "en")
#set par(justify: true, leading: 0.7em, spacing: 1em)
#set heading(numbering: "1.1")

#let th(..cells) = table.header(..cells.pos().map(c =>
  table.cell(fill: luma(30), inset: 6pt, text(fill: white, weight: "bold", size: 9pt, c))
))

#let stripe(_, row) = if row == 0 { luma(30) } else if calc.odd(row) { luma(248) } else { white }

#let screenshot(path, caption) = figure(
  image(path, width: 100%),
  caption: caption,
)

= MVP Definition

== 1.1 MVP Hypothesis

#table(
  columns: (0.8fr, 2.2fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Field], [Answer]),
  [Problem], [Spotify users listen every day, but they do not have a clear always-updating view of their own listening history.],
  [Riskiest assumption], [Users care enough about regularly synced listening history to return after the first login.],
  [MVP hypothesis], [If Circles connects to Spotify and syncs recently played tracks every 15 minutes, active Spotify users will return to view their updated listening history because they want a more complete record than Spotify's default history.],
  [What the MVP is not], [It is not a full social network, playlist generator, or yearly Wrapped replacement. These are excluded because the first risk is whether the sync pipeline and history view are valuable.],
  [How it will be tested], [A deployed prototype will use real Spotify login, sync recently played tracks, store them, and show them in the dashboard and history views.],
)

== 1.2 Product-Market Fit Signal

The primary user is an active Spotify listener who wants to understand listening habits over time. The first target group is university students and young adults who use Spotify often and are comfortable trying small web apps.

The retention signal is repeat use after new data appears. A useful signal is the same user returning after several days or one week to check updated listening history. Signups and first login do not show product-market fit because they only show curiosity.

The main distribution risk is Spotify. Spotify owns the listening data and could add a better history view inside its own app. Spotify Wrapped also shows that users like personal listening summaries. Other risks are Last.fm, stats.fm, and Obscurify. These products already show music statistics and have better distribution or clearer positioning. Circles reduces this risk by focusing on regular sync and simple personal history first, not only yearly summaries.

== 1.3 Product Debt Awareness

#table(
  columns: (0.9fr, 1.2fr, 1.2fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Debt risk], [How it could appear], [How it will be avoided]),
  [Feature creep], [The team could spend time on social feeds, music identity cards, and playlist tools before proving the sync value.], [The Assignment 4 prototype will focus on Spotify login, sync, storage, and visible history.],
  [Wrong early-adopter assumption], [Friends who like music statistics may not represent normal Spotify users.], [Feedback questions will ask whether the history view is useful, not only whether the app looks interesting.],
  [North star metric misalignment], [The team could optimize for clicks, profile cards, or time spent instead of successful sync and repeat use.], [The first metric will be repeat visits after new listening data is synced.],
)

= Ethics and Privacy

== 2.1 Privacy by Design

#table(
  columns: (0.8fr, 2.2fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Principle], [Application in Circles]),
  [Data minimisation], [Circles only asks for Spotify identity, email, and recently played history needed for the MVP.],
  [Purpose limitation], [Listening history is used to show personal history and statistics. It should not be reused for unrelated features without a clear opt-in.],
  [Default private], [Listening history and profile data should remain private by default. Sharing or public profile features should require a user action.],
  [Right to erasure], [Account deletion should remove user records, Spotify access credentials, imported history, derived data, and related application logs where possible. Backups should expire according to the retention policy.],
)

== 2.2 Ethical Risk Analysis

#table(
  columns: (1.2fr, 0.9fr, 0.9fr, 1.1fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Risk], [EAD principle], [Who is affected], [Mitigation]),
  [Listening history may reveal private moods, routines, or interests.], [Human Well-being and Accountability], [Users whose music data is stored by Circles], [Keep data private by default, explain the Spotify permission, and support deletion.],
  [Social or public features may expose music habits without clear consent.], [Transparency and Awareness of Misuse], [Users and their friends], [Do not publish history by default. Make sharing opt-in and show what will become visible.],
)

The Greyball test applies to privacy and sharing features. If a feature needs to hide data use from users to work, it should not be built.

= MVP Prototype

The prototype tests the hypothesis through one end-to-end workflow:

1. The user opens Circles and signs in with Spotify.
2. The backend stores the Spotify account and access credentials.
3. The worker syncs recently played tracks on a schedule.
4. The database stores tracks, artists, albums, and play history.
5. The frontend shows the updated history on the dashboard and history pages.

The prototype has more than two screens, including login, dashboard, history, library, and import. The assignment focus is dashboard and history because these screens show whether the regular sync produces useful visible data.

== 3.1 Prototype Evidence

The submitted screenshots show both the user-facing product and the background worker that keeps the data updated.

#screenshot("images/home-dashboard.png", [Home dashboard showing synced listening statistics, top artists, current obsessions, top tracks, and a listening-over-time chart.])

The dashboard shows that recent Spotify history can become visible statistics for the user.

#screenshot("images/hatchet-runs.png", [Hatchet runs page showing successful user sync and credential refresh workflow runs.])

The Hatchet dashboard shows the technical part of the MVP. The backend can refresh Spotify access and sync users without a manual step.

#screenshot("images/listening-history.png", [Listening history page showing chronological track plays with timestamps and durations.])

The history page is the main MVP screen for checking whether synced history is useful.

#screenshot("images/library-summary.png", [Library page showing total scrobbles, artists, albums, tracks, and a year-based date range.])

The library page shows the scale of stored listening data across scrobbles, artists, albums, and tracks.

#screenshot("images/social-leaderboard.png", [Social leaderboard page showing a user ranking and total listening score.])

The leaderboard shows a simple social comparison layer. This is context for future work, but it is not the main MVP test.

#screenshot("images/spotify-import.png", [Spotify import page showing a completed import of 54,963 tracks.])

The import page shows that the prototype can handle historical data in addition to scheduled recent-play sync.

#screenshot("images/track-detail.png", [Track detail page showing metadata, audio feature placeholders, and playback window data.])

The track page connects one history item to a deeper detail view.

== 3.2 Hypothesis Test Report

#table(
  columns: (1fr, 2fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Question], [Draft answer]),
  [Did the prototype test the MVP hypothesis?], [Yes. It tested whether a real Spotify user can connect an account, sync listening history, and view updated data in Circles.],
  [What was learned?], [Draft feedback suggests that the history timeline and dashboard are the main value points. Testers also need clearer information about sync time, stored Spotify data, and performance with large accounts.],
  [What product debt was introduced?], [The prototype depends on Spotify and Hatchet setup. Some non-MVP screens remain in the app, which may distract from the sync workflow.],
  [What is the next hypothesis?], [If users can see regular listening history updates, they will want a simple weekly summary or comparison view.],
)

= Reading Connection

Eric Ries defines the MVP in _The Lean Startup_ as a product version that supports a Build-Measure-Learn loop with minimum effort. This idea shaped the Circles MVP. The prototype does not test every possible Circles feature. It tests the riskiest assumption first: whether regular Spotify sync and visible listening history are useful enough for repeat use.

= Feedback Summary

The feedback below is draft response data for the MVP test. It should be replaced with real Telegram replies after testing. The sample is still useful for showing how the result will be reported.

#table(
  columns: (0.7fr, 1fr, 1fr, 0.8fr),
  fill: stripe,
  inset: 6pt,
  stroke: 0.5pt + luma(200),
  th([Tester], [Useful point], [Concern], [Would return?]),
  [Friend 1], [The listening history page is clear and gives a better record than Spotify's recent list.], [The first sync should explain how long import will take.], [Yes],
  [Friend 2], [Top artists and repeated tracks are easy to understand.], [The leaderboard is less important than private statistics.], [Yes],
  [Friend 3], [The import summary gives value after one login.], [The page should say what Spotify data is stored.], [Maybe],
  [Friend 4], [The dashboard gives a quick view of recent habits.], [Some cards are outside the main MVP path.], [Yes],
  [Friend 5], [The history timeline is the main reason to come back.], [Performance may matter if the account has many plays.], [Yes],
)

== Response Charts

These charts use the same simple chart style as the Hohli chart editor. They summarize the draft sample above and show how the final feedback evidence can be presented.

#figure(
  image("images/feedback-return-pie.svg", width: 72%),
  caption: [Draft pie chart showing that four of five testers would return after new data syncs.],
)

#figure(
  image("images/feedback-feature-pie.svg", width: 72%),
  caption: [Draft pie chart showing which feature testers found most useful.],
)

#figure(
  image("images/feedback-score-bars.svg", width: 86%),
  caption: [Draft bar chart showing average response scores across five MVP areas.],
)
