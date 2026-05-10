# Assignment 4: Product Thinking and MVP Development

Product: Circles

## Part 1: MVP Definition

### 1.1 MVP Hypothesis

| Field                 | Answer                                                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem               | Spotify users listen every day, but they do not have a clear always-updating view of their own listening history.                                                                                                                      |
| Riskiest assumption   | Users care enough about regularly synced listening history to return after the first login.                                                                                                                                            |
| MVP hypothesis        | If Circles connects to Spotify and syncs recently played tracks every 15 minutes, active Spotify users will return to view their updated listening history because they want a clearer personal record than Spotify's default history. |
| What the MVP is not   | It is not a full social network, playlist generator, or yearly Wrapped replacement. These are excluded because the first risk is whether the sync pipeline and history view are valuable.                                              |
| How it will be tested | A deployed prototype will use real Spotify login, sync recently played tracks, store them, and show them in the dashboard and history views.                                                                                           |

### 1.2 Product-Market Fit Signal

The primary user is an active Spotify listener who wants to understand listening habits over time. The first target group is university students and young adults who use Spotify often and are comfortable trying small web apps.

The retention signal is repeat use after new data appears. A useful signal is the same user returning after several days or one week to check updated listening history. Signups and first login do not prove product-market fit because they only show curiosity.

The main distribution risk is Spotify. Spotify owns the listening data and could add a stronger history view inside its own app. Spotify Wrapped also proves that users like personal listening summaries. Other risks are Last.fm, stats.fm, and Obscurify. These products already show music statistics and have stronger distribution or clearer positioning. Circles reduces this risk by focusing on regular sync and simple personal history first, not only yearly summaries.

### 1.3 Product Debt Awareness

| Debt risk                      | How it could appear                                                                                                | How it will be avoided                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Feature creep                  | The team could spend time on social feeds, music identity cards, and playlist tools before proving the sync value. | The Assignment 4 prototype will focus on Spotify login, sync, storage, and visible history.                 |
| Wrong early-adopter assumption | Friends who like music statistics may not represent normal Spotify users.                                          | Feedback questions will ask whether the history view is useful, not only whether the app looks interesting. |
| North star metric misalignment | The team could optimize for clicks, generated cards, or time spent instead of successful sync and repeat use.      | The first metric will be repeat visits after new listening data is synced.                                  |

## Part 2: Ethics and Privacy

### 2.1 Privacy by Design

| Principle          | Application in Circles                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data minimisation  | Circles only asks for Spotify identity, email, and recently played history needed for the MVP.                                                                                                       |
| Purpose limitation | Listening history is used to show personal history and statistics. It should not be reused for unrelated features without a clear opt-in.                                                            |
| Default private    | Listening history and profile data should remain private by default. Sharing or public profile features should require a user action.                                                                |
| Right to erasure   | Account deletion should remove user records, Spotify tokens, imported history, generated data, and related application logs where possible. Backups should expire according to the retention policy. |

### 2.2 Ethical Risk Analysis

| Risk                                                                     | EAD principle                        | Who is affected                             | Mitigation                                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Listening history may reveal private moods, routines, or interests.      | Human Well-being and Accountability  | Users whose music data is stored by Circles | Keep data private by default, explain the Spotify permission, and support deletion.          |
| Social or public features may expose music habits without clear consent. | Transparency and Awareness of Misuse | Users and their friends                     | Do not publish history automatically. Make sharing opt-in and show what will become visible. |

The Greyball test applies to privacy and sharing features. If a feature needs to hide data use from users to work, it should not be built.

## Part 3: MVP Prototype

The prototype tests the hypothesis through one end-to-end workflow:

1. The user opens Circles and signs in with Spotify.
2. The backend stores the Spotify account and token.
3. The worker syncs recently played tracks on a schedule.
4. The database stores tracks, artists, albums, and play history.
5. The frontend shows the updated history on the dashboard and history pages.

The prototype has more than two screens, including login, dashboard, history, library, and import. The assignment focus is dashboard and history because these screens show whether the regular sync produces useful visible data.

### 3.2 Hypothesis Test Report

This section should be completed after deployment and Telegram feedback.

| Question                                   | Draft answer                                                                                                                           |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Did the prototype test the MVP hypothesis? | Yes. It tested whether a real Spotify user can connect an account, sync listening history, and view updated data in Circles.           |
| What was learned?                          | To be completed after 3-5 friends test the deployed prototype.                                                                         |
| What product debt was introduced?          | The prototype depends on Spotify and Hatchet setup. Some non-MVP screens remain in the app, which may distract from the sync workflow. |
| What is the next hypothesis?               | If users can see regular listening history updates, they will want a simple weekly summary or comparison view.                         |

## Part 4: Reading Connection

Eric Ries defines the MVP in _The Lean Startup_ as a product version that supports a Build-Measure-Learn loop with minimum effort. This idea shaped the Circles MVP. The prototype does not try to prove every possible Circles feature. It tests the riskiest assumption first: whether regular Spotify sync and visible listening history are useful enough for repeat use.

## Feedback Summary

Add 3-5 short Telegram replies here after testing. Keep the wording casual and honest.

| Tester   | Useful point | Concern     | Would return? |
| -------- | ------------ | ----------- | ------------- |
| Friend 1 | To be added  | To be added | To be added   |
| Friend 2 | To be added  | To be added | To be added   |
| Friend 3 | To be added  | To be added | To be added   |
