/**
 * Pure business-logic helpers for task categorization.
 * Used by the sorting algorithm; kept here so tests don't need a DB or Express.
 */

// Deadlines are local YYYY-MM-DD strings. Parse in local time so the day
// does not shift in timezones ahead of UTC.
const parseLocalDate = (s) => {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
};

/**
 * Returns which display category a single task belongs to.
 * @param {object} task - { importance, deadline?, hours? }
 * @param {Date}   [ref]  - Reference date (defaults to now; override in tests for determinism)
 * @returns {'priorities'|'tomorrow'|'dontForget'}
 */
const categorizeTask = (task, ref = new Date()) => {
  const today = new Date(ref);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);

  if (!task.deadline) {
    if (task.importance === 'high') return 'priorities';
    if (task.importance === 'medium') return 'tomorrow';
    return 'dontForget';
  }

  const deadline = parseLocalDate(task.deadline);
  if (deadline <= tomorrow && task.importance !== 'low') return 'priorities';
  if (deadline > tomorrow && deadline <= threeDays) return 'tomorrow';
  return 'dontForget';
};

// How many tasks each energy level shows per panel
const ENERGY_CAPS = {
  early:   { priorities: 5, tomorrowTasks: 3, dontForget: 2 },
  typical: { priorities: 3, tomorrowTasks: 3, dontForget: 3 },
  slow:    { priorities: 2, tomorrowTasks: 2, dontForget: 2 },
};

module.exports = { categorizeTask, ENERGY_CAPS };
