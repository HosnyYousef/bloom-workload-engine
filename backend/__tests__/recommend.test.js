const { recommendTasks, TODAY_COUNT } = require('../engine/recommend');

// Monday July 6 2026, 9am local time
const REF = new Date(2026, 6, 6, 9, 0, 0);

const ymdOffset = (n) => {
  const d = new Date(REF);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const ctx = (energyLevel = 'typical') => ({
  now: REF,
  energy: { level: energyLevel },
  goals: {},
});

let idCounter = 0;
const task = (overrides = {}) => ({
  _id: `t${++idCounter}`,
  text: 'a task',
  hours: 1,
  deadline: '',
  importance: 'medium',
  completed: false,
  energyRequired: 'medium',
  ...overrides,
});

describe('recommendTasks: today selection', () => {
  it('returns exactly 3 today tasks when more are open', () => {
    const tasks = Array.from({ length: 8 }, (_, i) =>
      task({ deadline: ymdOffset(i), text: `task ${i}` })
    );
    const { today } = recommendTasks(tasks, ctx());
    expect(today).toHaveLength(TODAY_COUNT);
  });

  it('returns all open tasks when fewer than 3 exist', () => {
    const { today, tomorrow, dontForget } = recommendTasks(
      [task(), task()],
      ctx()
    );
    expect(today).toHaveLength(2);
    expect(tomorrow).toHaveLength(0);
    expect(dontForget).toHaveLength(0);
  });

  it('excludes completed tasks entirely', () => {
    const done = task({ completed: true, deadline: ymdOffset(0), text: 'done thing' });
    const open = task({ deadline: ymdOffset(5) });
    const result = recommendTasks([done, open], ctx());
    const allIds = [...result.today, ...result.tomorrow, ...result.dontForget].map(
      (i) => i.task._id
    );
    expect(allIds).toEqual([open._id]);
  });

  it('today is ordered highest score first and the most urgent task wins', () => {
    const dueToday = task({ deadline: ymdOffset(0), text: 'due today' });
    const dueLater = task({ deadline: ymdOffset(10), text: 'due later' });
    const noDate = task({ text: 'no date' });
    const { today } = recommendTasks([noDate, dueLater, dueToday], ctx());
    expect(today[0].task._id).toBe(dueToday._id);
    expect(today[0].score).toBeGreaterThanOrEqual(today[1].score);
    expect(today[1].score).toBeGreaterThanOrEqual(today[2].score);
  });

  it('every returned item carries a score and a breakdown', () => {
    const { today } = recommendTasks([task({ deadline: ymdOffset(1) })], ctx());
    expect(today[0].score).toEqual(expect.any(Number));
    expect(today[0].breakdown).toHaveProperty('urgency');
  });
});

describe('recommendTasks: bucketing the rest', () => {
  it('a leftover due within 3 days goes to tomorrow, not dontForget', () => {
    // Three overdue tasks lock up today; the 4th is due in 2 days
    const tasks = [
      task({ deadline: ymdOffset(-1), importance: 'high' }),
      task({ deadline: ymdOffset(0), importance: 'high' }),
      task({ deadline: ymdOffset(0), importance: 'high' }),
      task({ deadline: ymdOffset(2), importance: 'low', text: 'due soon leftover' }),
    ];
    const { tomorrow, dontForget } = recommendTasks(tasks, ctx());
    const tomorrowIds = tomorrow.map((i) => i.task._id);
    expect(tomorrowIds).toContain(tasks[3]._id);
    expect(dontForget.map((i) => i.task._id)).not.toContain(tasks[3]._id);
  });

  it('a distant low-importance leftover lands in dontForget', () => {
    const tasks = [
      task({ deadline: ymdOffset(0), importance: 'high' }),
      task({ deadline: ymdOffset(0), importance: 'high' }),
      task({ deadline: ymdOffset(1), importance: 'high' }),
      task({ deadline: ymdOffset(30), importance: 'low', text: 'far away' }),
    ];
    const { dontForget } = recommendTasks(tasks, ctx());
    expect(dontForget.map((i) => i.task._id)).toContain(tasks[3]._id);
  });

  it('every open task lands in exactly one bucket', () => {
    const tasks = Array.from({ length: 10 }, (_, i) =>
      task({ deadline: i % 2 ? ymdOffset(i) : '', text: `task ${i}` })
    );
    const { today, tomorrow, dontForget } = recommendTasks(tasks, ctx());
    const allIds = [...today, ...tomorrow, ...dontForget].map((i) => i.task._id);
    expect(allIds.sort()).toEqual(tasks.map((t) => t._id).sort());
    expect(new Set(allIds).size).toBe(tasks.length);
  });
});

describe('recommendTasks: energy level changes which tasks win', () => {
  it('a heavy task makes today on an early start but not on a slow day', () => {
    // Same deadline pressure across the board; energy fit is the differentiator
    const heavy = task({ energyRequired: 'high', deadline: ymdOffset(5), text: 'deep work' });
    const light = [
      task({ energyRequired: 'low', deadline: ymdOffset(5) }),
      task({ energyRequired: 'low', deadline: ymdOffset(5) }),
      task({ energyRequired: 'low', deadline: ymdOffset(5) }),
    ];
    const all = [heavy, ...light];

    const earlyToday = recommendTasks(all, ctx('early')).today.map((i) => i.task._id);
    const slowToday = recommendTasks(all, ctx('slow')).today.map((i) => i.task._id);

    expect(earlyToday).toContain(heavy._id);
    expect(slowToday).not.toContain(heavy._id);
  });

  it('empty input returns three empty buckets', () => {
    const result = recommendTasks([], ctx());
    expect(result).toEqual({ today: [], tomorrow: [], dontForget: [] });
  });
});

describe('recommendTasks: deterministic tiebreaks', () => {
  it('equal scores fall back to earlier deadline, then older createdAt', () => {
    const older = task({ deadline: ymdOffset(5), createdAt: '2026-07-01T00:00:00Z', text: 'older' });
    const newer = task({ deadline: ymdOffset(5), createdAt: '2026-07-05T00:00:00Z', text: 'newer' });
    const earlierDeadline = task({ deadline: ymdOffset(4), importance: 'medium', text: 'earlier' });

    const r1 = recommendTasks([newer, older], ctx());
    expect(r1.today[0].task._id).toBe(older._id);

    // Deadline beats createdAt when scores differ by deadline anyway;
    // here we just confirm repeated runs give identical order
    const r2 = recommendTasks([newer, earlierDeadline, older], ctx());
    const r3 = recommendTasks([older, newer, earlierDeadline], ctx());
    expect(r2.today.map((i) => i.task._id)).toEqual(r3.today.map((i) => i.task._id));
  });
});
