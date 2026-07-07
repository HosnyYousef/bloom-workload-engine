/**
 * HTTP-level integration tests for the engine endpoints.
 * Boots the real Express router on an ephemeral port and talks to it with
 * fetch. Auth and the Task model are mocked so no database is needed.
 */

// Fake logged-in user with one weekly goal the scorer can match
const FAKE_USER = {
  _id: 'user1',
  name: 'Test',
  goals: { yearly: [], monthly: [], weekly: ['go to the gym'] },
};

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = FAKE_USER;
    next();
  },
}));

const bulkWriteCalls = [];
jest.mock('../models/Task', () => ({
  find: jest.fn(),
  bulkWrite: jest.fn(async (ops) => {
    bulkWriteCalls.push(ops);
    return { ok: 1 };
  }),
}));

const express = require('express');
const Task = require('../models/Task');
const tasksRouter = require('../routes/tasks');

let server;
let baseUrl;

const ymdOffset = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const OPEN_TASKS = [
  { _id: 'a', text: 'pay rent', deadline: ymdOffset(0), importance: 'high', hours: 0.5, energyRequired: 'low', completed: false },
  { _id: 'b', text: 'go to the gym', deadline: '', importance: 'medium', hours: 1, energyRequired: 'medium', completed: false },
  { _id: 'c', text: 'write the report', deadline: ymdOffset(2), importance: 'medium', hours: 2, energyRequired: 'high', completed: false },
  { _id: 'd', text: 'research standing desks', deadline: ymdOffset(20), importance: 'low', hours: 1, energyRequired: 'medium', completed: false },
  { _id: 'e', text: 'water the plants', deadline: '', importance: 'low', hours: 0.5, energyRequired: 'low', completed: false },
];

const post = (path, body) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeAll((done) => {
  const app = express();
  app.use(express.json());
  app.use('/api/tasks', tasksRouter);
  server = app.listen(0, () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  bulkWriteCalls.length = 0;
  Task.find.mockResolvedValue([...OPEN_TASKS]);
});

describe('POST /api/tasks/parse', () => {
  it('returns a structured suggestion for freeform text', async () => {
    const res = await post('/api/tasks/parse', { text: 'pay the electricity bill' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.deadlineSource).toBe('inferred');
    expect(body.steps.length).toBeGreaterThanOrEqual(3);
    expect(body.energyRequired).toBe('low');
  });

  it('rejects empty text with 400', async () => {
    const res = await post('/api/tasks/parse', { text: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/tasks/recommend', () => {
  it('returns exactly 3 today tasks with scores, rest bucketed', async () => {
    const res = await post('/api/tasks/recommend', { energyLevel: 'typical' });
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.today).toHaveLength(3);
    expect(body.today[0].score).toEqual(expect.any(Number));
    expect(body.today[0].scoreBreakdown).toHaveProperty('urgency');

    const total = body.today.length + body.tomorrow.length + body.dontForget.length;
    expect(total).toBe(OPEN_TASKS.length);
  });

  it('queries only the logged-in user\'s open tasks', async () => {
    await post('/api/tasks/recommend', { energyLevel: 'typical' });
    expect(Task.find).toHaveBeenCalledWith({ user: FAKE_USER._id, completed: false });
  });

  it('does not write to the DB without persist', async () => {
    await post('/api/tasks/recommend', { energyLevel: 'typical' });
    expect(bulkWriteCalls).toHaveLength(0);
  });

  it('persist: true writes one categorized update per open task', async () => {
    const res = await post('/api/tasks/recommend', { energyLevel: 'typical', persist: true });
    expect(res.status).toBe(200);

    expect(bulkWriteCalls).toHaveLength(1);
    const ops = bulkWriteCalls[0];
    expect(ops).toHaveLength(OPEN_TASKS.length);

    const categories = ops.map((op) => op.updateOne.update.sortedCategory);
    expect(categories.filter((c) => c === 'priorities')).toHaveLength(3);
    ops.forEach((op) => {
      expect(op.updateOne.update.sorted).toBe(true);
      expect(['priorities', 'tomorrow', 'dontForget']).toContain(op.updateOne.update.sortedCategory);
    });
  });

  it('the weekly goal task benefits from goal alignment', async () => {
    const res = await post('/api/tasks/recommend', { energyLevel: 'typical' });
    const body = await res.json();
    const gym = [...body.today, ...body.tomorrow, ...body.dontForget].find((t) => t._id === 'b');
    expect(gym.scoreBreakdown.goalAlignment).toBe(1);
  });

  it('the energy level from the request body reaches the scorer', async () => {
    const findTask = (body, id) =>
      [...body.today, ...body.tomorrow, ...body.dontForget].find((t) => t._id === id);

    const slowRes = await post('/api/tasks/recommend', { energyLevel: 'slow' });
    const earlyRes = await post('/api/tasks/recommend', { energyLevel: 'early' });
    const slow = findTask(await slowRes.json(), 'c'); // the high-energy task
    const early = findTask(await earlyRes.json(), 'c');

    expect(slow.scoreBreakdown.energyFit).toBeLessThan(early.scoreBreakdown.energyFit);
    expect(slow.score).toBeLessThan(early.score);
  });
});
