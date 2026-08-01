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

### 2026-08-01: Repair completed/deleted priorities and drag sources

What changed:

* Removed completed tasks from active recommendation sections so they no longer
  inflate the visible 4/3/1 energy-mode capacities.
* Completing or deleting an active priority now immediately asks the server to
  repair only the missing plan position.
* Made each task row the native drag source while allowing drag initiation only
  from the task title or grip, improving browser drag reliability without
  making its controls draggable.
* Added focused drag-source regression coverage.

What works: frontend lint and the production build pass. Mode-specific plans,
switching, refresh, normal-account logout/login, alternative selection, and
collapsed-section memory passed deployed acceptance before this change.

What still needs work: the focused Vitest file could not start a forks worker in
this environment. After deployment, manually retest completion, deletion,
capacity limits, and drag behavior.

### 2026-08-01: Record future account identity and recovery

What changed:

* Added a future backlog item to display the signed-in username for normal and
  Demo accounts.
* Included account-confirmation email and secure forgot-password/reset support
  in the same future authentication work.
* Kept the active recommendation acceptance test unchanged.

What needs to happen next: finish the current item 8 acceptance test before
starting this future authentication enhancement.

### 2026-08-01: Fix deployed priority-plan saves

What changed:

* Fixed the Mongoose 9 user pre-save hook that caused every persisted
  recommendation and priority-plan save to fail with `next is not a function`.
* Added a focused regression test for saving non-password user fields without
  rehashing the password.
* Confirmed the deployed frontend contains the latest priority-plan client
  code; the live backend error was the blocker.
* Clarified that logout/login persistence must be tested with a normal account.
  Try Demo intentionally deletes and recreates the shared demo tasks on login.

What needs to happen next: deploy the backend fix, then rerun the energy-mode
acceptance checks with a normal account containing at least eight tasks.

### 2026-07-30: Daily focus capacity by energy level

What changed:

* Limited Typical Day to 3 Top Priorities and Slow Day to 1.
* Allowed up to 4 Top Priorities for Early Start.
* Aligned the backend recommendation engine and client fallback limits.
* Kept energy selection non-destructive: it affects the next explicit
  organization and does not immediately overwrite manual task placement.
* Recorded persistent small-step checkboxes as accepted.
* Made energy-level changes immediately rerun recommendation and update the
  focused list.
* Limited Tomorrow and Don't Forget to three visible items by default, with
  subdued styling and a working See all/Show less control for overflow.
* Renamed Turn into tasks to Organize Parking Lot to clarify that it converts,
  groups, and categorizes the captured writing.
* Tightened Tomorrow to near-term work due within three days; later major work
  remains in Don't Forget, where the three highest-ranked items show first.
* Followed up by making Tomorrow fill to three tasks when fewer than three are
  due soon, using the highest-ranked remaining next-up work.
* Made Tomorrow and Don't Forget independently collapsible and saved each
  preference on the device.
* Added a Typical/Slow priority chooser that lets users replace the last
  recommendation with another available task while preserving the focus cap.

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

### 2026-07-31: Remember priority choices and clarify drag destinations

What changed:

* Typical and Slow Day now restore the user's chosen alternative after changing
  energy modes and returning.
* Task dragging uses a compact one-line preview instead of an image of the full
  task card.
* Valid destination sections glow while dragging, and an insertion line shows
  the exact landing position.
* Same-section moves account for the removed task so the insertion line and
  persisted order agree.

What works: frontend lint and the production build pass.

What is broken: the frontend test runner timed out while starting its workers,
so the focused tests could not execute in this environment.

What needs to happen next: manually verify the saved choices and drag cues in
the deployed browser, then continue with the separate Parking Lot task library.

### 2026-07-31: Preserve full priority order by energy mode

What changed:

* Typical and Slow Day now remember their complete chosen priority order rather
  than only one manually selected task.
* Switching away and back reapplies that mode's saved selection and order after
  the recommendation engine runs.
* Tasks can be dragged from either their title or the drag grip.
* Escape follows the native cancel-drag convention and also clears BloomSpace's
  section glow and insertion marker.

What works: frontend lint and the production build pass.

What is broken: no confirmed failure; browser acceptance is still required for
native dragging and switching repeatedly among energy modes.

What needs to happen next: test Typical and Slow with different selections and
orders, including refresh, then continue with the Parking Lot task library.

### 2026-07-31: Save manual priority decisions immediately

What changed:

* Manual priority order is now saved locally at the moment of a drop instead of
  waiting for every server update to finish.
* Choosing an alternative makes it the first priority and renumbers the rest of
  the section without duplicate order values.
* Failed saves restore the previous local preference and task state.
* Late recommendation responses no longer replace the newest selected energy
  mode on screen.

What works: frontend lint and the production build pass.

What is broken: no confirmed failure; the deployed app needs another repeated
mode-switch acceptance check.

What needs to happen next: choose and reorder priorities in Typical and Slow,
switch among modes, and confirm each arrangement returns exactly.

### 2026-07-31: Store independent energy-mode plans on the user account

What changed:

* User accounts now store separate ordered priority plans for Early, Typical,
  and Slow modes.
* The server applies the selected plan before persisting recommendations and
  fills gaps left by completed or deleted tasks.
* Manual choices and drag ordering save directly to the active server-side plan.
* Existing browser preferences migrate through the recommendation request.
* The selected energy mode now remains active after refresh.
* Double-click-to-edit is recorded as backlog item 21.

What works: frontend lint/build pass; 107 backend non-HTTP tests and all 11
focused task-route integration tests pass.

What is broken: no confirmed failure. One full backend-suite run had a transient
timeout on its first localhost HTTP request; the complete focused HTTP suite
passed immediately afterward.

What needs to happen next: deploy both backend and frontend, then configure a
different plan for each mode and verify switching and refresh preserve them.

Update this file after every coding session.

Include:

* What changed
* What works
* What is broken
* What needs to happen next
