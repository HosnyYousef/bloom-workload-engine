import { describe, it, expect, beforeEach } from 'vitest';
import { sortTasks } from '../sortTasks';

// Local-time YYYY-MM-DD, matching what the app's date input produces.
// toISOString() would give the UTC date, which is a different day in
// timezones ahead of UTC.
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

describe('sortTasks', () => {
  let tasks;

  beforeEach(() => {
    tasks = [
      { _id: '1', text: 'High, no deadline',   importance: 'high',   hours: 2 },
      { _id: '2', text: 'Medium, no deadline',  importance: 'medium', hours: 1 },
      { _id: '3', text: 'Low, no deadline',     importance: 'low',    hours: 0.5 },
      { _id: '4', text: 'Due tomorrow, medium', importance: 'medium', deadline: daysFromNow(1), hours: 3 },
      { _id: '5', text: 'Due in 2 days',        importance: 'medium', deadline: daysFromNow(2), hours: 1 },
      { _id: '6', text: 'Due in 5 days, high',  importance: 'high',   deadline: daysFromNow(5), hours: 1 },
    ];
  });

  // ── Typical day ────────────────────────────────────────────────────────────
  describe('typical energy level', () => {
    it('places high-importance no-deadline tasks in priorities', () => {
      const { priorities } = sortTasks(tasks, 'typical');
      expect(priorities.some(t => t._id === '1')).toBe(true);
    });

    it('places medium-importance no-deadline tasks in tomorrowTasks', () => {
      const { tomorrowTasks } = sortTasks(tasks, 'typical');
      expect(tomorrowTasks.some(t => t._id === '2')).toBe(true);
    });

    it('places low-importance no-deadline tasks in dontForget', () => {
      const { dontForget } = sortTasks(tasks, 'typical');
      expect(dontForget.some(t => t._id === '3')).toBe(true);
    });

    it('caps priorities at 3 tasks', () => {
      const many = Array.from({ length: 8 }, (_, i) => ({
        _id: `h${i}`, text: `High ${i}`, importance: 'high', hours: 1,
      }));
      const { priorities } = sortTasks(many, 'typical');
      expect(priorities.length).toBeLessThanOrEqual(3);
    });

    it('caps tomorrowTasks at 3 tasks', () => {
      const many = Array.from({ length: 8 }, (_, i) => ({
        _id: `m${i}`, text: `Med ${i}`, importance: 'medium', hours: 1,
      }));
      const { tomorrowTasks } = sortTasks(many, 'typical');
      expect(tomorrowTasks.length).toBeLessThanOrEqual(3);
    });
  });

  // ── Early start ────────────────────────────────────────────────────────────
  describe('early start energy level', () => {
    it('allows more priorities (up to 5) than typical day', () => {
      const many = Array.from({ length: 8 }, (_, i) => ({
        _id: `h${i}`, text: `High ${i}`, importance: 'high', hours: 1,
      }));
      const { priorities: earlyP } = sortTasks(many, 'early');
      const { priorities: typicalP } = sortTasks(many, 'typical');
      expect(earlyP.length).toBeGreaterThan(typicalP.length);
    });

    it('caps priorities at 5', () => {
      const many = Array.from({ length: 10 }, (_, i) => ({
        _id: `h${i}`, text: `High ${i}`, importance: 'high', hours: 1,
      }));
      const { priorities } = sortTasks(many, 'early');
      expect(priorities.length).toBeLessThanOrEqual(5);
    });

    it('caps dontForget at 2 tasks', () => {
      const many = Array.from({ length: 6 }, (_, i) => ({
        _id: `l${i}`, text: `Low ${i}`, importance: 'low', hours: 0.5,
      }));
      const { dontForget } = sortTasks(many, 'early');
      expect(dontForget.length).toBeLessThanOrEqual(2);
    });
  });

  // ── Slow day ───────────────────────────────────────────────────────────────
  describe('slow day energy level', () => {
    it('only includes tasks with hours <= 1 in priorities', () => {
      const { priorities } = sortTasks(tasks, 'slow');
      priorities.forEach(t => {
        expect(!t.hours || t.hours <= 1).toBe(true);
      });
    });

    it('excludes task _id "1" (hours 2) from slow-day priorities', () => {
      const { priorities } = sortTasks(tasks, 'slow');
      expect(priorities.some(t => t._id === '1')).toBe(false);
    });

    it('caps priorities at 2', () => {
      const many = Array.from({ length: 8 }, (_, i) => ({
        _id: `h${i}`, text: `High ${i}`, importance: 'high', hours: 0.5,
      }));
      const { priorities } = sortTasks(many, 'slow');
      expect(priorities.length).toBeLessThanOrEqual(2);
    });
  });

  // ── Deadline-based logic ───────────────────────────────────────────────────
  describe('deadline-based categorization', () => {
    it('sends a task due tomorrow (medium importance) to urgent/priorities', () => {
      const { priorities } = sortTasks(tasks, 'typical');
      expect(priorities.some(t => t._id === '4')).toBe(true);
    });

    it('sends a task due in 2 days to tomorrowTasks (soon)', () => {
      const { tomorrowTasks } = sortTasks(tasks, 'typical');
      expect(tomorrowTasks.some(t => t._id === '5')).toBe(true);
    });

    it('sends a high-importance task due in 5 days to dontForget (later)', () => {
      const { dontForget } = sortTasks(tasks, 'typical');
      expect(dontForget.some(t => t._id === '6')).toBe(true);
    });

    it('does not assign a low-importance task due tomorrow to priorities', () => {
      const lowTomorrow = [{ _id: 'lt', text: 'Low, due tomorrow', importance: 'low', deadline: daysFromNow(1), hours: 1 }];
      const { priorities } = sortTasks(lowTomorrow, 'typical');
      expect(priorities).toHaveLength(0);
    });
  });

  // ── No duplicate categorization ────────────────────────────────────────────
  it('never assigns a task to more than one category', () => {
    const { priorities, tomorrowTasks, dontForget } = sortTasks(tasks, 'typical');
    const all = [...priorities, ...tomorrowTasks, ...dontForget].map(t => t._id);
    expect(all.length).toBe(new Set(all).size);
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────
  it('returns three empty arrays for an empty task list', () => {
    const result = sortTasks([], 'typical');
    expect(result.priorities).toHaveLength(0);
    expect(result.tomorrowTasks).toHaveLength(0);
    expect(result.dontForget).toHaveLength(0);
  });

  it('treats a task with no importance field as low (dontForget)', () => {
    const noImportance = [{ _id: 'ni', text: 'No importance field' }];
    const { dontForget } = sortTasks(noImportance, 'typical');
    expect(dontForget.some(t => t._id === 'ni')).toBe(true);
  });
});
