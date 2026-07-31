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

const TODAY_COUNTS = Object.freeze({ early: 4, typical: 3, slow: 1 });
const todayCapacity = (energyLevel) => TODAY_COUNTS[energyLevel] ?? TODAY_COUNTS.typical;

const taskId = (item) => String(item.task._id);

const applyPriorityPlan = (result, preferredTaskIds = []) => {
  if (!preferredTaskIds.length || !result.today.length) return result;

  const buckets = ['today', 'tomorrow', 'dontForget'];
  const locations = new Map();
  buckets.forEach(bucket => result[bucket].forEach(item => {
    locations.set(taskId(item), { item, bucket });
  }));

  const capacity = result.today.length;
  const desiredIds = preferredTaskIds
    .map(String)
    .filter((id, index, ids) => locations.has(id) && ids.indexOf(id) === index)
    .slice(0, capacity);
  result.today.forEach(item => {
    const id = taskId(item);
    if (desiredIds.length < capacity && !desiredIds.includes(id)) desiredIds.push(id);
  });

  const originalTodayIds = result.today.map(taskId);
  const addedIds = desiredIds.filter(id => !originalTodayIds.includes(id));
  const displacedItems = result.today.filter(item => !desiredIds.includes(taskId(item)));
  const next = {
    ...result,
    today: desiredIds.map(id => locations.get(id).item),
    tomorrow: [...result.tomorrow],
    dontForget: [...result.dontForget],
  };

  addedIds.forEach((id, index) => {
    const sourceBucket = locations.get(id).bucket;
    next[sourceBucket] = next[sourceBucket].filter(item => taskId(item) !== id);
    if (displacedItems[index]) next[sourceBucket].push(displacedItems[index]);
  });

  return next;
};

// Leftovers land in "tomorrow" only when due within this many days.
const TOMORROW_DEADLINE_DAYS = 3;
const TOMORROW_COUNT = 3;

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

  const dueSoon = [];
  const later = [];
  for (const item of rest) {
    const days = daysUntil(item.task.deadline, now);
    if (days !== null && days <= TOMORROW_DEADLINE_DAYS) dueSoon.push(item);
    else later.push(item);
  }

  const nextUp = [...dueSoon, ...later];
  const tomorrow = nextUp.slice(0, TOMORROW_COUNT);
  const tomorrowIds = new Set(tomorrow.map((item) => item.task._id));
  const dontForget = rest.filter((item) => !tomorrowIds.has(item.task._id));

  return { today, tomorrow, dontForget };
};

module.exports = { recommendTasks, applyPriorityPlan, TODAY_COUNTS, todayCapacity, TOMORROW_COUNT, TOMORROW_DEADLINE_DAYS };
