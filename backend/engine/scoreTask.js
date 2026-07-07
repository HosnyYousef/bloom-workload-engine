/**
 * Scores a single open task for "should you do this today".
 * Pure module: no DB, no Express.
 *
 * Four weighted components, each normalized to 0..1:
 *   urgency       - how close the deadline is (importance nudges it)
 *   goalAlignment - keyword overlap with the user's yearly/monthly/weekly goals
 *   energyFit     - task energy demand vs the user's energy level today
 *   timeFit       - task length vs hours left in the day
 *
 * Everything tunable lives in the context object so callers can swap it:
 *   context = {
 *     now:        Date, defaults to new Date()
 *     energy:     { level: 'early'|'typical'|'slow', fitMatrix?: {...} }
 *                 The level is a pluggable input. Today the frontend selector
 *                 supplies it; the measurement method is not finalized, so any
 *                 future provider (survey, wearable, time of day) just needs
 *                 to produce this object.
 *     goals:      { yearly: [String], monthly: [String], weekly: [String] }
 *     weights:    override DEFAULT_WEIGHTS
 *     dayEndHour: when the usable day ends, default 22 (10pm)
 *   }
 *
 * The default weights and the energy fit matrix are starting-point
 * assumptions, listed in backend/engine/README.md for review.
 */

const DEFAULT_WEIGHTS = {
  urgency: 0.4,
  goalAlignment: 0.25,
  energyFit: 0.2,
  timeFit: 0.15,
};

// How well a task's energy demand fits the user's day type.
// Rows: user energy level. Columns: task energyRequired.
const DEFAULT_ENERGY_FIT = {
  early:   { low: 0.6, medium: 0.8, high: 1.0 },
  typical: { low: 0.8, medium: 1.0, high: 0.7 },
  slow:    { low: 1.0, medium: 0.6, high: 0.3 },
};

// Goal tiers: weekly goals are the most immediate commitments, so a match
// there counts more than a yearly theme. Assumption to review.
const GOAL_TIER_WEIGHTS = { weekly: 1.0, monthly: 0.75, yearly: 0.5 };

const DEFAULT_DAY_END_HOUR = 22;

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'into', 'about',
  'more', 'some', 'get', 'make', 'have', 'will', 'your', 'you',
]);

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Deadlines are stored as YYYY-MM-DD strings. Parse in local time so a
// deadline of "today" is not shifted a day by UTC parsing.
const parseDeadline = (deadline) => {
  if (!deadline) return null;
  const m = String(deadline).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    const d = new Date(deadline);
    return isNaN(d) ? null : d;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

const daysUntil = (deadline, now) => {
  const due = parseDeadline(deadline);
  if (!due) return null;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

/** Deadline closeness, with importance as a small nudge. */
const urgencyScore = (task, now) => {
  const days = daysUntil(task.deadline, now);
  // No deadline: low urgency baseline so dated tasks come first
  let base;
  if (days === null) base = 0.15;
  else if (days <= 0) base = 1; // due today or overdue
  else base = clamp01(1 - days / 14); // linear decay over two weeks

  if (task.importance === 'high') base += 0.15;
  if (task.importance === 'low') base -= 0.15;
  return clamp01(base);
};

const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

/**
 * Best goal-tier match for this task. A task matches a goal statement when
 * they share at least one meaningful word, or when the task's goal category
 * (Health, Career, ...) appears in the goal text.
 * No goals configured at all scores neutral 0.5 so those users are not
 * penalized. No match scores 0.2, not 0, so off-goal urgent tasks survive.
 */
const goalAlignmentScore = (task, goals) => {
  const tiers = ['weekly', 'monthly', 'yearly'];
  const hasAnyGoal = tiers.some((t) => Array.isArray(goals && goals[t]) && goals[t].length > 0);
  if (!hasAnyGoal) return 0.5;

  const taskWords = new Set(tokenize(`${task.text} ${task.goal || ''}`));
  let best = 0;
  for (const tier of tiers) {
    for (const statement of goals[tier] || []) {
      const goalWords = tokenize(statement);
      const overlaps = goalWords.some((w) => taskWords.has(w));
      if (overlaps) best = Math.max(best, GOAL_TIER_WEIGHTS[tier]);
    }
  }
  return best > 0 ? best : 0.2;
};

const energyFitScore = (task, energy) => {
  const matrix = (energy && energy.fitMatrix) || DEFAULT_ENERGY_FIT;
  const level = (energy && energy.level) || 'typical';
  const row = matrix[level] || matrix.typical;
  return row[task.energyRequired || 'medium'] ?? row.medium;
};

/**
 * Fit between the task's estimated hours and the time left today.
 * Unknown task length scores neutral. After dayEndHour every task gets the
 * same floor, so late-night ranking falls back to the other components.
 */
const timeFitScore = (task, now, dayEndHour = DEFAULT_DAY_END_HOUR) => {
  const hours = Number(task.hours) || 0;
  if (hours <= 0) return 0.7;

  const hoursLeft = Math.max(0, dayEndHour - (now.getHours() + now.getMinutes() / 60));
  if (hoursLeft <= 0) return 0.3;
  if (hours <= hoursLeft) return 1;
  return Math.max(0.2, hoursLeft / hours);
};

/**
 * @returns {{ score: number, breakdown: object }} score in 0..1
 */
const scoreTask = (task, context = {}) => {
  const now = context.now || new Date();
  const weights = { ...DEFAULT_WEIGHTS, ...(context.weights || {}) };
  const goals = context.goals || {};

  const breakdown = {
    urgency: urgencyScore(task, now),
    goalAlignment: goalAlignmentScore(task, goals),
    energyFit: energyFitScore(task, context.energy),
    timeFit: timeFitScore(task, now, context.dayEndHour),
  };

  const totalWeight =
    weights.urgency + weights.goalAlignment + weights.energyFit + weights.timeFit;
  const score =
    (breakdown.urgency * weights.urgency +
      breakdown.goalAlignment * weights.goalAlignment +
      breakdown.energyFit * weights.energyFit +
      breakdown.timeFit * weights.timeFit) /
    totalWeight;

  return { score, breakdown };
};

module.exports = {
  scoreTask,
  urgencyScore,
  goalAlignmentScore,
  energyFitScore,
  timeFitScore,
  daysUntil,
  DEFAULT_WEIGHTS,
  DEFAULT_ENERGY_FIT,
  GOAL_TIER_WEIGHTS,
};
