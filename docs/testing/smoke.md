# Smoke Tests

Manual smoke tests to run before a release or after a major deploy. These cover critical paths only — not exhaustive.

## Auth

| # | Test | Steps | Expected |
|---|------|-------|----------|
| A1 | Unauthenticated home | Visit `/` while signed out | Shows "Circles" heading, "Your music, visualized." tagline, and "Continue with Spotify" button |
| A2 | Spotify OAuth redirect | Click "Continue with Spotify" | Redirects to `accounts.spotify.com` OAuth consent page |
| A3 | OAuth callback | Complete Spotify login | Lands on `/dashboard`, user is signed in |
| A4 | Auth guard redirect | Visit `/dashboard` while signed out | Redirected back to `/` |
| A5 | Sign out | Sign out via sidebar | Session cleared, redirected to `/` |

## Dashboard

| # | Test | Steps | Expected |
|---|------|-------|----------|
| D1 | Dashboard loads | Sign in and visit `/dashboard` | "Home" heading visible, sidebar links present |
| D2 | Stats render | Open dashboard | At least one stat card renders without error |
| D3 | Top artists row | Open dashboard | Artist bubbles or skeleton loaders appear |
| D4 | Time range tabs | Switch between "1 month", "6 months", "All time" | Stats update without crash |

## Import

| # | Test | Steps | Expected |
|---|------|-------|----------|
| I1 | Import page loads | Visit `/import` | Upload UI is visible |
| I2 | File upload | Drop a valid Spotify export ZIP | Progress indicator appears, no JS error |

## Library

| # | Test | Steps | Expected |
|---|------|-------|----------|
| L1 | Library page loads | Visit `/library` | Page renders without error |
| L2 | History page loads | Visit `/history` | Scrobble list or empty state visible |

## Playlists

| # | Test | Steps | Expected |
|---|------|-------|----------|
| P1 | Playlists page loads | Visit `/playlists` | "Playlists" heading and "New playlist" button visible |
| P2 | Create playlist | Click "New playlist", enter name, click "Create" | New playlist card appears in list |
| P3 | Delete playlist | Click "Delete" on a playlist | Playlist card removed from list |

## Detail Pages

| # | Test | Steps | Expected |
|---|------|-------|----------|
| Det1 | Artist detail | Click an artist | `/artists/:id` loads with artist name |
| Det2 | Track detail | Click a track | `/tracks/:id` loads with track name |
| Det3 | Album detail | Click an album | `/albums/:id` loads with album name |

## Social

| # | Test | Steps | Expected |
|---|------|-------|----------|
| S1 | Social page loads | Visit `/social` | Page renders, feed or empty state visible |
| S2 | Public profile | Visit `/u/:username` for a known user | Profile renders with stats |
| S3 | Private profile | Visit `/u/:username` for a private user | Shows private/not found state, no data leak |

## Tools / AI

| # | Test | Steps | Expected |
|---|------|-------|----------|
| T1 | Tools page loads | Visit `/tools` | AI tool cards render |
| T2 | Roast card | Trigger roast generation | Card populates with roast text, no 500 error |

## Time Machine

| # | Test | Steps | Expected |
|---|------|-------|----------|
| TM1 | Time machine loads | Visit `/time-machine` | Date picker or controls visible |
| TM2 | Date navigation | Select a past date | Stats update to reflect that period |
