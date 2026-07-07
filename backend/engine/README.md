# BloomSpace Recommendation Engine

BloomSpace is in active development. This folder holds the pure logic for the
task pipeline: parse a Parking Lot entry, score every open task, recommend
exactly 3 for today. No DB or Express imports here, so everything is unit
testable with plain objects.

## Pipeline

1. `parseEntry.js`: freeform text in, structured suggestion out
   (deadline, effort hours, importance, energy required, sub-steps).
   Called by `POST /api/tasks/parse`.
2. `scoreTask.js`: one open task plus context in, score 0..1 out,
   with a per-component breakdown.
3. `recommend.js`: all open tasks in, `{ today (3 max), tomorrow,
   dontForget }` out. Called by `POST /api/tasks/recommend`.

## Assumptions to review

These are starting points, not settled decisions. Each one is a constant or
an injected config, so changing your mind is a one-line edit.

Deadline inference (`parseEntry.js`):

- Explicit date words in the text always win over category defaults.
- Category horizons: communication 2 days, admin/payments 3, errands 4,
  appointments and chores 5, deep work 7, learning 10, planning/ideas 14,
  anything else 7.
- "next friday" means the friday after the coming one (7 extra days).
- A bare "7/20" that already passed this year rolls to next year.
- Every parsed task gets a suggested deadline. The alternative (leave
  vague entries dateless) may feel calmer; the UI can drop the suggestion
  since `deadlineSource` records whether it was inferred.

Scoring (`scoreTask.js`):

- Weights: urgency 0.40, goal alignment 0.25, energy fit 0.20,
  time fit 0.15. Override via `context.weights`.
- Energy level is a pluggable input: the scorer takes
  `context.energy = { level }` and does not care where the level came
  from. The frontend selector supplies it today; a survey, wearable, or
  time-of-day heuristic can replace that later without touching the engine.
  The fit matrix itself can be overridden via `context.energy.fitMatrix`.
- Slow days strongly favor low-energy tasks (high-energy fit drops to 0.3).
- Weekly goals outweigh monthly, which outweigh yearly (1.0 / 0.75 / 0.5),
  on the theory that weekly commitments are the most immediate.
- Goal matching is keyword overlap, not semantics. "Gym 3x" and
  "go to the gym" match; "exercise more" and "go for a run" do not.
- Users with no goals configured score neutral (0.5) on alignment.
- The usable day ends at 22:00 (`context.dayEndHour`). Importance nudges
  urgency by +/- 0.15.

Selection (`recommend.js`):

- Today is exactly 3 tasks (fewer only if fewer exist). Energy changes
  which 3, never the count.
- Leftovers go to "tomorrow" when due within 3 days or scoring >= 0.55,
  otherwise "don't forget".
