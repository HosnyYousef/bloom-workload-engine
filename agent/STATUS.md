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
