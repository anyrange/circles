# Circles Final Video Script

Use this as a read-aloud script during recording. Text in brackets is an action, not something to say.

## Start

[start recording]

Hello, this is the final MVP video for Circles. I will start with a short demo of the Assignment 1 user stories, then I will move to the final presentation.

## Demo

[open Circles]

First, US-01 is Spotify login. The user opens Circles, connects a Spotify account, and reaches the authenticated app. In this recording the account is already connected, so the result is the dashboard with Spotify-backed listening data.

[open dashboard]

US-02 is statistics by time range. On the dashboard, the user can inspect top music and listening statistics from the synced history. The important outcome is that Spotify plays become visible data inside Circles.

[open social page]

US-03 is following users and seeing activity. This part is partial in the final demo because it needs another active public user with listening data. The social page exists, but it is not the strongest MVP evidence.

[open Discover or Tools page]

US-04 is generated music reports. The report cards exist as a secondary feature. This is useful for future discovery, but it is not the main test of the MVP.

[open playlists page]

US-05 is playlists. Basic playlist management exists, but weekly generation is not the main demo path. For this MVP, playlists are secondary to the listening-history workflow.

[show leaderboard]

US-06 is the leaderboard. It compares users by listening activity. This is another social feature, so it supports the product idea, but it is not the core hypothesis.

[open import page]

US-07 is historical import. A Spotify export can be processed so the user can see more than only recent plays. This matters because it makes the history view useful immediately after import.

[show public profile if available]

US-08 is public profiles. This is partial. Public profile routes and privacy checks exist, but the private dashboard is more complete.

[show music match area if available]

US-09 is music match. This is also partial because it needs multiple users with enough listening overlap. It is a secondary social feature.

[open time-machine page]

US-10 is time machine. It lets the user look at listening history for a selected past date. This fits the main product idea because it uses the stored history directly.

[return to dashboard or history]

That completes the demo. The strongest completed path is Spotify login, sync, history, dashboard, import, and time machine. The weaker areas are the secondary social and generated features.

## Presentation

[open Slidev deck]

Now I will move to the short presentation.

[slide 1]

Circles is a web app for active Spotify users who want a permanent record of their listening history. The product is meant for people who listen often and want to inspect their own habits beyond Spotify's default recent history.

[slide 2]

What I built is a Spotify listening-history app. The user connects Spotify, Circles syncs listening history, and the user can inspect it through dashboard, history, import, and time-machine views. The main user is an active listener who wants a private, always-updating record first.

[slide 3]

The decision I stand behind is the architecture. Circles uses a React frontend, a Hono API, PostgreSQL, and a Hatchet worker. This worked well because the app stayed understandable, while slow sync and import work moved out of the request path.

The decision I would reverse is showing too many secondary features too early. Social features, generated reports, and playlists are interesting, but they should have waited until the history workflow had stronger evidence.

[slide 4]

The original MVP hypothesis was that if Circles connects to Spotify and syncs recently played tracks every 15 minutes, active Spotify users will return to view updated listening history.

My judgment is that the hypothesis is supported, but not proven. It is supported because the sync pipeline works and the history view is useful. It is not proven because one-week repeat retention was not measured.

[slide 5]

The concrete next step is to measure whether a connected user returns after new listening data appears. If users return, the product should improve sync status, privacy explanation, and the history dashboard. If users do not return, Circles needs a clearer reason to come back.

That is the final state of Circles: a working MVP for Spotify history and a clear next experiment.
