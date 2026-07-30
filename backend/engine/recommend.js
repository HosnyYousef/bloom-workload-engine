/**
 * Picks a deliberately small set of tasks for today and buckets the rest.
 * Pure module: no DB, no Express.
 *
 * recommendTasks(tasks, context) returns:
 *   {
 *     today:      up to the selected energy level's capacity
 *     tomorrow:   near-term leftovers (due soon or scoring well)
 *     dontForget: everything else that is open
 *   }
 * Each item is { task, score, breakdown }.
 *
 * Today is capped on purpose: a short list the user can actually finish is
 * the whole point of BloomSpace. Early Start allows one additional task.
 */

const { scoreTask, daysUntil } = require('./scoreTask');

const TODAY_COUNTS = Object.freeze({ early: 4, typical: 3, slow: 3 });
const todayCapacity = (energyLevel) => TODAY_COUNTS[energyLevel] ?? TODAY_COUNTS.typical;

// Leftovers land in "tomorrow" only when due within this many days.
const TOMORROW_DEADLINE_DAYS = 3;

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
  const capacity = todayCapacity(context.energy?.level);

  const scored = (tasks || [])
    .filter((t) => !t.completed)
    .map((task) => ({ task, ...scoreTask(task, context) }))
    .sort(compareScored);

  const today = scored.slice(0, capacity);
  const rest = scored.slice(capacity);

  const tomorrow = [];
  const dontForget = [];
  for (const item of rest) {
    const days = daysUntil(item.task.deadline, now);
    const dueSoon = days !== null && days <= TOMORROW_DEADLINE_DAYS;
    if (dueSoon) tomorrow.push(item);
    else dontForget.push(item);
  }

  return { today, tomorrow, dontForget };
};

module.exports = { recommendTasks, TODAY_COUNTS, todayCapacity, TOMORROW_DEADLINE_DAYS };
