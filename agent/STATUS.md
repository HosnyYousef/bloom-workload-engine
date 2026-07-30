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

### 2026-07-30: Daily focus capacity by energy level

What changed:

* Limited Typical Day and Slow Day to 3 Top Priorities.
* Allowed up to 4 Top Priorities for Early Start.
* Aligned the backend recommendation engine and client fallback limits.
* Kept energy selection non-destructive: it affects the next explicit
  organization and does not immediately overwrite manual task placement.
* Recorded persistent small-step checkboxes as accepted.

What needs to happen next: organize at least eight tasks under each energy mode
and confirm the 4/3/3 capacities and energy-appropriate selection.

### 2026-07-30: Persistent small-step checkboxes

What changed:

* Added a checkbox beside every small step in all recommendation sections.
* Saved each step independently without completing the parent task.
* Added completed-step styling and an `x of y small steps complete` summary.
* Kept step progress visible after the parent task is completed and preserved
  completion while editing or reordering steps.
* Recorded item 6 as accepted after manual testing.

What needs to happen next: test step completion, refresh persistence, editing,
reordering, and parent-task completion before accepting item 7.

### 2026-07-30: Make generated steps task-specific

What changed:

* Replaced broad category templates with task-aware steps that include the
  actual task subject.
* Added dedicated actionable flows for parties, presentations, reports, taxes,
  applications, research, planning, broad chores, and other deep work.
* Removed timer/setup filler from newly generated breakdowns.
* Recorded item 5 as accepted after manual testing.

What needs to happen next: manually review the generated breakdowns for several
large tasks, then begin item 7 only after item 6 is accepted.

### 2026-07-30: Generate small steps only when useful

What changed:

* Stopped generating steps for calls, messages, errands, appointments, simple
  payments, small chores, trivial fixes, and unmatched generic notes.
* Kept step generation for planning, learning/research, substantial deep work,
  broad chores, and complex administrative tasks.
* Preserved user-authored Parking Lot sub-bullets as the highest-priority step
  source.
* Recorded Parking Lot execution, movement, editing, and undo as accepted.
* Fixed multi-line paste while a list is active so each visible same-level line
  becomes its own task instead of being concatenated into one task.

What needs to happen next: manually compare simple and complex tasks, then
begin item 6 only after item 5 is accepted.

Verification: all 43 parser tests pass, along with frontend lint and production
build. The full backend run passed 96 tests but its HTTP route-integration suite
could not bind a temporary local server in this environment, so 8 route tests
did not run successfully.

### 2026-07-28: Notes-style Parking Lot editor

What changed:

* Replaced the plain textarea with an autosaving rich-text editor.
* Added bold, italic, bulleted-list, and numbered-list controls.
* Kept each visible line compatible with Turn into tasks.
* Sanitized saved formatting and pasted text.
* Fixed typing that appeared backwards by preventing caret-resetting rerenders.
* Followed up after manual testing showed the editable HTML was still being
  restored after each edit; React now restores it only once on mount so typing,
  Backspace, and Delete work normally.
* Made formatting controls readable in dark mode.
* Added Ctrl/Cmd+B and Ctrl/Cmd+I while preserving native undo, redo, cut,
  copy, paste, and select-all shortcuts.
* Kept Enter's conventional new-line behavior and made Tab indent plain text;
  Tab and Shift+Tab indent and outdent list items while the editor is focused.
* Kept the writing area at a stable height and made long notes scroll inside it
  instead of expanding the entire Parking Lot card.
* Added a contrasting scrollbar that remains visible in light and dark mode.
* Added Ctrl/Cmd+Shift+7 for numbered lists, Ctrl/Cmd+Shift+8 for bulleted
  lists, and automatic list creation after typing a dash followed by Space.
* Accepted the Notes-style editor after manual testing on July 29, 2026.
* Made nested list items explicit small steps under their parent task during
  Turn into tasks, rather than creating a separate task for each sub-bullet.
* Added automatic numbered-list creation after typing `1.` followed by Space.
* Fixed conversion of browser-generated sibling nested lists so indented items
  remain steps under the preceding parent task.
* Added indent/outdent toolbar buttons, Ctrl/Cmd+] and Ctrl/Cmd+[ shortcuts,
  and Ctrl/Cmd+Enter to run Turn into tasks while the editor is focused.
* Added a focused inline editor to Top Priorities for renaming a task and
  editing, adding, removing, or reordering its small steps.
* Added Ctrl/Cmd+Enter as the Save shortcut while the Top Priority inline
  editor is focused, matching the Parking Lot submission convention.
* Shared task and small-step editing across Top Priorities, For Tomorrow, and
  Don't Forget.
* Added persisted drag-and-drop ordering within and between recommendation
  sections, plus visible controls for moving a task up or down a section.
* Made the Parking Lot a task drop target and added a keyboard/touch-friendly
  return action that restores the task and its steps as editable text.

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
