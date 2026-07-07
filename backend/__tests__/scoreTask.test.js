const {
  scoreTask,
  urgencyScore,
  goalAlignmentScore,
  energyFitScore,
  timeFitScore,
} = require('../engine/scoreTask');

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

const baseContext = { now: REF, energy: { level: 'typical' }, goals: {} };

describe('urgencyScore', () => {
  it('due today scores 1', () => {
    expect(urgencyScore({ deadline: ymdOffset(0) }, REF)).toBe(1);
  });

  it('overdue scores 1', () => {
    expect(urgencyScore({ deadline: ymdOffset(-3) }, REF)).toBe(1);
  });

  it('decays as the deadline moves out', () => {
    const soon = urgencyScore({ deadline: ymdOffset(1) }, REF);
    const later = urgencyScore({ deadline: ymdOffset(7) }, REF);
    const far = urgencyScore({ deadline: ymdOffset(20) }, REF);
    expect(soon).toBeGreaterThan(later);
    expect(later).toBeGreaterThan(far);
  });

  it('no deadline scores below any dated task inside two weeks', () => {
    const none = urgencyScore({}, REF);
    const dated = urgencyScore({ deadline: ymdOffset(10) }, REF);
    expect(none).toBeLessThan(dated);
  });

  it('high importance nudges the score up, low nudges it down', () => {
    const mid = urgencyScore({ deadline: ymdOffset(5), importance: 'medium' }, REF);
    const high = urgencyScore({ deadline: ymdOffset(5), importance: 'high' }, REF);
    const low = urgencyScore({ deadline: ymdOffset(5), importance: 'low' }, REF);
    expect(high).toBeGreaterThan(mid);
    expect(low).toBeLessThan(mid);
  });
});

describe('goalAlignmentScore', () => {
  const goals = {
    yearly: ['get promoted to senior engineer'],
    monthly: ['finish the portfolio site'],
    weekly: ['gym three times', 'ship the resume update'],
  };

  it('weekly goal match beats monthly beats yearly', () => {
    const weekly = goalAlignmentScore({ text: 'go to the gym' }, goals);
    const monthly = goalAlignmentScore({ text: 'work on portfolio homepage' }, goals);
    const yearly = goalAlignmentScore({ text: 'ask about senior promotion path' }, goals);
    expect(weekly).toBeGreaterThan(monthly);
    expect(monthly).toBeGreaterThan(yearly);
  });

  it('matches through the task goal category too', () => {
    const withCategory = goalAlignmentScore(
      { text: 'morning session', goal: 'gym' },
      goals
    );
    expect(withCategory).toBe(1);
  });

  it('no match scores low but not zero', () => {
    const s = goalAlignmentScore({ text: 'water the plants' }, goals);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(0.5);
  });

  it('a user with no goals scores neutral', () => {
    expect(goalAlignmentScore({ text: 'anything' }, {})).toBe(0.5);
    expect(goalAlignmentScore({ text: 'anything' }, { weekly: [] })).toBe(0.5);
  });
});

describe('energyFitScore', () => {
  it('slow days favor low-energy tasks', () => {
    const low = energyFitScore({ energyRequired: 'low' }, { level: 'slow' });
    const high = energyFitScore({ energyRequired: 'high' }, { level: 'slow' });
    expect(low).toBeGreaterThan(high);
  });

  it('early starts favor high-energy tasks', () => {
    const low = energyFitScore({ energyRequired: 'low' }, { level: 'early' });
    const high = energyFitScore({ energyRequired: 'high' }, { level: 'early' });
    expect(high).toBeGreaterThan(low);
  });

  it('missing energyRequired is treated as medium', () => {
    expect(energyFitScore({}, { level: 'typical' })).toBe(
      energyFitScore({ energyRequired: 'medium' }, { level: 'typical' })
    );
  });

  it('missing or unknown level falls back to typical', () => {
    expect(energyFitScore({ energyRequired: 'high' }, undefined)).toBe(0.7);
    expect(energyFitScore({ energyRequired: 'high' }, { level: 'zzz' })).toBe(0.7);
  });

  it('accepts a custom fit matrix (pluggable measurement)', () => {
    const fitMatrix = {
      typical: { low: 0.1, medium: 0.1, high: 0.99 },
    };
    expect(energyFitScore({ energyRequired: 'high' }, { level: 'typical', fitMatrix })).toBe(0.99);
  });
});

describe('timeFitScore', () => {
  it('a short task fits fully when hours remain', () => {
    expect(timeFitScore({ hours: 1 }, REF)).toBe(1);
  });

  it('a task longer than the time left is penalized', () => {
    const evening = new Date(2026, 6, 6, 20, 0, 0); // 2h before the 22:00 day end
    expect(timeFitScore({ hours: 6 }, evening)).toBeLessThan(1);
  });

  it('unknown hours score neutral', () => {
    expect(timeFitScore({ hours: 0 }, REF)).toBe(0.7);
    expect(timeFitScore({}, REF)).toBe(0.7);
  });

  it('after the day end every sized task gets the same floor', () => {
    const lateNight = new Date(2026, 6, 6, 23, 30, 0);
    expect(timeFitScore({ hours: 1 }, lateNight)).toBe(0.3);
    expect(timeFitScore({ hours: 5 }, lateNight)).toBe(0.3);
  });

  it('respects a custom dayEndHour', () => {
    const afternoon = new Date(2026, 6, 6, 16, 0, 0);
    // Day ends at 17: only 1 hour left for a 2 hour task
    expect(timeFitScore({ hours: 2 }, afternoon, 17)).toBeLessThan(1);
  });
});

describe('scoreTask', () => {
  it('returns a score in 0..1 with a full breakdown', () => {
    const { score, breakdown } = scoreTask(
      { text: 'pay rent', deadline: ymdOffset(1), hours: 0.5 },
      baseContext
    );
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
    expect(breakdown).toHaveProperty('urgency');
    expect(breakdown).toHaveProperty('goalAlignment');
    expect(breakdown).toHaveProperty('energyFit');
    expect(breakdown).toHaveProperty('timeFit');
  });

  it('an urgent task outscores a distant one, all else equal', () => {
    const urgent = scoreTask({ text: 'a', deadline: ymdOffset(0), hours: 1 }, baseContext);
    const distant = scoreTask({ text: 'a', deadline: ymdOffset(12), hours: 1 }, baseContext);
    expect(urgent.score).toBeGreaterThan(distant.score);
  });

  it('custom weights change the ranking', () => {
    // Task A: urgent but high energy. Task B: no deadline but low energy.
    const a = { text: 'a', deadline: ymdOffset(0), energyRequired: 'high', hours: 1 };
    const b = { text: 'b', deadline: '', energyRequired: 'low', hours: 1 };
    const slowContext = { now: REF, energy: { level: 'slow' }, goals: {} };

    const defaultA = scoreTask(a, slowContext).score;
    const defaultB = scoreTask(b, slowContext).score;
    expect(defaultA).toBeGreaterThan(defaultB); // urgency dominates by default

    const energyHeavy = { ...slowContext, weights: { urgency: 0.05, goalAlignment: 0.05, energyFit: 0.85, timeFit: 0.05 } };
    const weightedA = scoreTask(a, energyHeavy).score;
    const weightedB = scoreTask(b, energyHeavy).score;
    expect(weightedB).toBeGreaterThan(weightedA); // now energy fit dominates
  });
});
