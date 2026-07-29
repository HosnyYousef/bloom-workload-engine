# /agent/STATUS.md

## Current Phase

Phase 1: MVP Foundation

## Completed

* [ ] Expo app initialized
* [ ] TypeScript configured
* [ ] Expo Router installed
* [ ] Basic navigation created
* [ ] Placeholder screens created
* [ ] Task type created
* [ ] Local task state working
* [ ] Brain Dump screen working
* [ ] Today screen working
* [ ] Task suggestion logic working
* [ ] Supabase connected
* [ ] Auth working
* [ ] Database task saving working
* [ ] Dashboard counts working
* [ ] Settings/logout working
* [ ] UI polished
* [ ] TestFlight-ready build prepared

## Session Log

### 2026-07-28: Notes-style Parking Lot editor

What changed:

* Replaced the plain textarea with an autosaving rich-text editor.
* Added bold, italic, bulleted-list, and numbered-list controls.
* Kept each visible line compatible with Turn into tasks.
* Sanitized saved formatting and pasted text.
* Fixed typing that appeared backwards by preventing caret-resetting rerenders.
* Made formatting controls readable in dark mode.
* Added Ctrl/Cmd+B and Ctrl/Cmd+I while preserving native undo, redo, cut,
  copy, paste, and select-all shortcuts.

What works: the production frontend build and lint check pass.

Automated test note: the focused Vitest command starts but hangs before running
tests in this environment. The editor still needs the manual acceptance checks
listed in `agent/NEXT.md`.

What is broken: no confirmed failure. The editor needs manual acceptance.

What needs to happen next: test editor formatting and refresh persistence, then
begin item 4 only after item 3 is accepted.

### 2026-07-28: Clear recommendation sections

What changed:

* Added a short purpose below each recommendation section name.
* Added a result message showing how many tasks entered each section.
* Tasks added inside a section now remain in that section.
* Shelved the beta tester feedback box idea in `agent/BACKLOG.md`.
* Recorded the 3-task daily target, 4-task Early Start limit, and deferred
  cognitive-load scheduling rules.

What works: the production frontend build and lint check pass.

What is broken: no confirmed failure. The change needs manual acceptance.

What needs to happen next: test task placement, then begin item 3 in
`agent/BACKLOG.md` only after item 2 is accepted.

### 2026-07-28: Demo Mode progress

What changed:

* Added a visible percentage bar tied to completed Demo Mode stages.
* Demo Mode now loads its example tasks before opening the dashboard.
* Added a clear retry label after a failed attempt.
* Added focused progress-bar tests.

What works: the production frontend build and lint check pass.

What is broken: Vitest could not start its worker in this environment, so the
new focused tests still need a clean run.

What needs to happen next: manually accept the Demo Mode progress display, then
complete item 2 in `agent/BACKLOG.md`.

### 2026-07-28: Repository audit and Demo Mode review

What changed:

* Audited the MERN repository against the full project handoff.
* Verified the deployed Demo Mode API and completed the manual Demo Mode flow.
* Added `agent/BACKLOG.md` to preserve ordered product work across sessions.
* Recorded partial, uncommitted Parking Lot work for review before continuation.

What works: Demo login, demo task reset, task creation, and task completion.

What is broken: no confirmed Demo Mode failure. Loading feedback is too easy to
miss. The stats cards are placeholders.

What needs to happen next: complete item 1 in `agent/BACKLOG.md`, Demo Mode
loading feedback.

### 2026-07-06: Recommendation engine

What changed:

* Added the core recommendation engine in `backend/engine/`
  (parseEntry, scoreTask, recommend), pure modules with no DB coupling.
* New endpoints: `POST /api/tasks/parse`, `POST /api/tasks/recommend`,
  `GET/PUT /api/goals`. New Task fields: steps, energyRequired,
  deadlineSource. New User field: goals (yearly/monthly/weekly).
* ORGANIZE now calls the engine (top 3 exactly), with the old client
  sort kept as an offline fallback. Adding a dateless task runs it
  through the parser for a suggested deadline and sub-steps.
* Fixed a timezone bug: deadlines parsed as UTC midnight instead of
  local, which miscategorized due-tomorrow tasks in UTC+ timezones.

What works: 91 backend tests, 37 frontend tests, vite build clean.

What is broken: the MongoDB Atlas hostname in backend/.env
(cluster0.m4qnvex.mongodb.net) no longer resolves in DNS, so the
backend cannot connect to the database at all. The cluster looks
deleted or renamed. Nothing DB-backed can run until that is fixed.

What needs to happen next: fix the Atlas connection string, then do a
manual pass over the engine assumptions in `backend/engine/README.md`
(deadline horizons, scoring weights, energy fit matrix).

## Notes

Update this file after every coding session.

Include:

* What changed
* What works
* What is broken
* What needs to happen next
