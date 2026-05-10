---
theme: apple-basic
title: Circles Final MVP
info: Final Software Development Case Study presentation.
drawings:
  persist: false
transition: fade
class: text-left
fonts:
  sans: Inter
---

# Circles

Final MVP presentation

<div class="muted">Software Development Case Study</div>

<!--
Say: "Circles is a web app for active Spotify users who want a permanent record of their listening history."
-->

---

# Built and for whom

<div class="big">A Spotify history app for active listeners.</div>

<div class="points">
  <div>Connect Spotify</div>
  <div>Sync listening history</div>
  <div>Show dashboard, history, import, and time-machine views</div>
</div>

<!--
Say: "What I built is a Spotify listening-history app for active Spotify users. The main user is someone who listens often and wants a private, always-updating record of what they played. The core flow is simple: connect Spotify, sync listening history, and inspect it through dashboard, history, import, and time-machine views."
-->

---

# One decision review

<div class="two">
  <div>
    <h2>Stand behind</h2>
    <p>React frontend, Hono API, PostgreSQL, and Hatchet worker.</p>
  </div>
  <div>
    <h2>Reverse</h2>
    <p>Too many secondary features became visible before retention was measured.</p>
  </div>
</div>

<!--
Say: "The decision I stand behind is the architecture: React frontend, Hono API, PostgreSQL, and a Hatchet worker. It kept the project understandable while moving slow sync and import work out of the request path. The decision I would reverse is showing too many secondary features too early. Social comparison, generated reports, and playlists should have waited until the history workflow had stronger retention evidence."
-->

---

# MVP hypothesis

<div class="big">Supported, not proven.</div>

<div class="points">
  <div>Evidence: real Spotify connection and sync</div>
  <div>Evidence: visible dashboard and chronological history</div>
  <div>Limit: no measured one-week return rate yet</div>
</div>

<!--
Say: "The original MVP hypothesis was that if Circles connects to Spotify and syncs recently played tracks every 15 minutes, active Spotify users will return to view their updated listening history because they want a more complete record than Spotify gives by default. My judgment is supported, not proven. It is supported because the app connects to Spotify, syncs listening data, and shows useful dashboard and history views. It is not proven because I did not measure one-week repeat retention."
-->

---

# Next step

<div class="big">Measure return after new data appears.</div>

<div class="muted">Then simplify the product around the screens that cause that return.</div>

<!--
Say: "The concrete next step is to measure whether a connected user returns after new listening data appears. If users return, I would improve sync status, privacy explanation, and the history dashboard. If they do not return, Circles needs a clearer reason to come back. That is the final state of the MVP: a working Spotify-history product and a clear next experiment."
-->

<style>
.muted {
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.62);
  font-size: 2rem;
}

.big {
  margin-top: 3rem;
  max-width: 1050px;
  font-size: 4.6rem;
  line-height: 1.05;
}

.points {
  display: grid;
  gap: 1rem;
  margin-top: 3rem;
  max-width: 980px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 1.6rem;
}

.points div {
  padding: 1rem 1.2rem;
  border-left: 4px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.06);
}

.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 4rem;
}

.two div {
  min-height: 300px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
}

.two h2 {
  margin: 0 0 2rem;
  font-size: 2.1rem;
}

.two p {
  color: rgba(255, 255, 255, 0.78);
  font-size: 2rem;
  line-height: 1.2;
}
</style>
