# BloomSpace Product Backlog

Last updated: July 28, 2026

Use this file to continue work across sessions. Work on one item at a time.
Do not begin the next item until the current item is tested and accepted.

## Current Item

### 1. Demo Mode loading feedback

Status: Implemented, awaiting manual acceptance

Add a clear loading bar after the user clicks **Try Demo**. Keep the button
disabled during loading. Show a calm error with a retry action if loading fails.

Acceptance checks:

- The loading state is easy to see, including on a fast connection.
- A second click cannot start another login request.
- Failure leaves the user on the login screen with a retry option.
- Successful login opens the dashboard and shows the demo tasks.

## Demo Mode Review

Completed manually on July 28, 2026:

- Logging out works.
- Try Demo opens the dashboard.
- Demo tasks appear.
- Tasks can be added and completed.
- Logging out and entering Demo Mode again restores the original demo data.

Term: **demo tasks** means the example tasks added automatically to the demo
account. Older notes and tests may call these **seeded tasks**.

## Parking Lot

### 2. Clarify task sections

Status: Accepted

Make it clear that **Top Priorities**, **For Tomorrow**, and **Don't Forget**
are the three recommendation sections. Explain where a task went after
organization without adding a long scoring explanation.

### 3. Notes-style Parking Lot editor

Status: Accepted July 29, 2026

Make the Parking Lot feel closer to a notes app while keeping capture fast.
Consider bullets, numbered lists, simple formatting, and optional colors.
Start with the smallest useful toolbar. Remove controls that add friction.

### 4. Parking Lot execution and undo

Status: Accepted July 30, 2026

Convert written lines into tasks, keep the original text recoverable, and let
the user undo the conversion. Review the partial uncommitted implementation
before continuing.

## Task Steps

### 5. Generate steps only when useful

Status: Accepted July 30, 2026

Do not add generic steps to simple tasks such as logging in or sending a quick
message. Generate steps for larger or unclear tasks, or let the user request
them.

### 6. Make steps specific to the task

Status: Accepted July 30, 2026

Steps should perform the actual task. Avoid generic preparation that creates
more work unless clarification is genuinely needed.

### 7. Add step checkboxes

Status: Implemented, awaiting manual acceptance

Show a small checkbox beside each step. Save step completion separately from
completion of the main task.

## Recommendations

### 8. Set daily focus capacity

Status: Required for MVP

Recommend 3 tasks on a Typical Day or Slow Day. Allow up to 4 tasks when the
user chooses Early Start. Keep the daily list intentionally short.

### 9. Explain why a task was selected

Add an optional short reason such as **Due tomorrow** or **Supports your weekly
goal**. Do not show a scoring essay.

### 10. Improve urgency and consequence detection

Use due dates on the same line when present. When no date exists, estimate
consequence and importance from the task wording and context. Do not assume the
first written line is the first task to complete.

### 11. Add standing goals and daily focus

Finish the standing-goal interface and add the short start-of-session focus
question. Feed both signals into recommendations and prove they can change the
top three.

### 12. Formalize energy signal sources

Keep manual energy selection as the fallback. Add a small source interface so
time patterns and HealthKit can be added later without rewriting scoring.

## Later Work

### 13. Connect real dashboard stats

Replace the empty stat cards with live task and goal data.

### 14. Design pass

Polish layout, colors, spacing, accessibility, mobile responsiveness, and calm
session flow after the core loop works.

### 15. Choose monetization

Select the RevenueCat purchase model before finalizing mobile architecture.

### 16. Build and publish the mobile app

Build the React Native app, connect it to the shared backend, add RevenueCat,
test purchases, and prepare the store submission package.

### 17. Beta tester feedback box

Status: Shelved for later

Give beta testers an obvious place to send feedback without leaving the app.
Possible directions to review before building:

- Replace **Notes/Thoughts** if it does not have a distinct purpose from the
  Parking Lot.
- Add a highlighted feedback button that opens a small writing window.
- Keep feedback entry as simple as the Parking Lot.
- After submission, leave the comment visible but greyed out.
- Let the tester edit or undo an accidental submission.
- Decide where submitted feedback is stored and how the builder reads it.

Write and review a focused feature prompt before implementation. Do not build
this until the core loop is stable.

### 18. Optional task breakdown and cognitive-load scheduling

Status: Shelved for after the MVP

Add a **Break down task** action for large tasks. Estimate the cognitive load
of each step, then spread heavy work across appropriate days instead of filling
one day with too much difficult work. Keep breakdown optional because simple
tasks should not receive unnecessary steps.

### 19. Daily history, calendar navigation, and search

Status: Future task after the core MVP

Let users move backward and forward through dates to review what they worked on
each day. Add a calendar picker and direct date entry for jumping to a specific
day. Add Apple Calendar-style search that can find a past task by its text and
open the day where it appeared.

### 20. Add product analytics before launch

Status: Required during final web and App Store launch preparation

Instrument BloomSpace to measure how clients use the core experience on web
and in the mobile app. Choose the analytics service later when the planned
provider is shared. Define the small set of useful events before integrating
it, avoid collecting note or task contents, and include any privacy disclosure,
consent, and App Store requirements. Do not build this during the current core
MVP work, but do not launch publicly without reviewing it.

## Core Loop Acceptance Test

Before design work, confirm this complete flow:

1. Write a messy thought.
2. Turn it into an appropriate task.
3. Suggest a deadline only when needed.
4. Add specific steps only when useful.
5. Rank it using urgency, goals, energy, and time left.
6. Place it in the correct recommendation section.
7. Complete steps and the main task.
8. Undo organization without losing the original writing.
