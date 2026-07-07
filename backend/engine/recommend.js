/**
 * Picks the top 3 tasks for today and buckets the rest.
 * Pure module: no DB, no Express.
 *
 * recommendTasks(tasks, context) returns:
 *   {
 *     today:      up to 3 items, highest score first
 *     tomorrow:   near-term leftovers (due soon or scoring well)
 *     dontForget: everything else that is open
 *   }
 * Each item is { task, score, breakdown }.
 *
 * Today is capped at exactly TODAY_COUNT (3) on purpose: a short list the
 * user can actually finish is the whole point of BloomSpace. Energy level
 * changes which 3 win via scoring, never how many.
 */

const { scoreTask, daysUntil } = require('./scoreTask');

const TODAY_COUNT = 3;

// Leftovers land in "tomorrow" when due within this many days...
const TOMORROW_DEADLINE_DAYS = 3;
// ...or when they scored at least this much. Assumption to review.
const TOMORROW_SCORE_FLOOR = 0.55;

/**
 * Sort: score desc, then earlier deadline, then older createdAt.
 * The tiebreakers keep output stable across calls with equal scores.
 */
const compareScored = (a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  const da = a.task.deadline ? new Date(a.task.deadline).getTime() : Infinity;
  const db = b.task.deadline ? new Date(b.task.deadline).getTime() : Infinity;
  if (da !== db) return da - db;
  const ca = a.task.createdAt ? new Date(a.task.createdAt).getTime() : 0;
  const cb = b.task.createdAt ? new Date(b.task.createdAt).getTime() : 0;
  return ca - cb;
};

/**
 * @param {Array}  tasks   - Task documents or plain objects
 * @param {Object} context - See scoreTask.js for the shape
 */
const recommendTasks = (tasks, context = {}) => {
  const now = context.now || new Date();

  const scored = (tasks || [])
    .filter((t) => !t.completed)
    .map((task) => ({ task, ...scoreTask(task, context) }))
    .sort(compareScored);

  const today = scored.slice(0, TODAY_COUNT);
  const rest = scored.slice(TODAY_COUNT);

  const tomorrow = [];
  const dontForget = [];
  for (const item of rest) {
    const days = daysUntil(item.task.deadline, now);
    const dueSoon = days !== null && days <= TOMORROW_DEADLINE_DAYS;
    if (dueSoon || item.score >= TOMORROW_SCORE_FLOOR) tomorrow.push(item);
    else dontForget.push(item);
  }

  return { today, tomorrow, dontForget };
};

module.exports = { recommendTasks, TODAY_COUNT, TOMORROW_DEADLINE_DAYS, TOMORROW_SCORE_FLOOR };
