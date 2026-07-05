const { categorizeTask, ENERGY_CAPS } = require('../utils/sortLogic');

// Pin a reference date so tests never break due to time-of-day boundary effects
const REF = new Date('2026-07-05T12:00:00Z');

const dateOffset = (n) => {
  const d = new Date(REF);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

describe('categorizeTask — no deadline (importance-only rules)', () => {
  it('high importance → priorities', () => {
    expect(categorizeTask({ importance: 'high' }, REF)).toBe('priorities');
  });

  it('medium importance → tomorrow', () => {
    expect(categorizeTask({ importance: 'medium' }, REF)).toBe('tomorrow');
  });

  it('low importance → dontForget', () => {
    expect(categorizeTask({ importance: 'low' }, REF)).toBe('dontForget');
  });

  it('undefined importance → dontForget', () => {
    expect(categorizeTask({}, REF)).toBe('dontForget');
  });
});

describe('categorizeTask — deadline-based rules', () => {
  it('medium task due tomorrow → priorities (urgent)', () => {
    expect(categorizeTask({ importance: 'medium', deadline: dateOffset(1) }, REF)).toBe('priorities');
  });

  it('low task due tomorrow → tomorrow, NOT priorities', () => {
    expect(categorizeTask({ importance: 'low', deadline: dateOffset(1) }, REF)).not.toBe('priorities');
  });

  it('task due in 2 days → tomorrow (soon)', () => {
    expect(categorizeTask({ importance: 'medium', deadline: dateOffset(2) }, REF)).toBe('tomorrow');
  });

  it('task due in exactly 3 days → tomorrow (boundary)', () => {
    expect(categorizeTask({ importance: 'medium', deadline: dateOffset(3) }, REF)).toBe('tomorrow');
  });

  it('task due in 4 days → dontForget (later)', () => {
    expect(categorizeTask({ importance: 'high', deadline: dateOffset(4) }, REF)).toBe('dontForget');
  });

  it('high-importance task due in 10 days → dontForget', () => {
    expect(categorizeTask({ importance: 'high', deadline: dateOffset(10) }, REF)).toBe('dontForget');
  });
});

describe('ENERGY_CAPS', () => {
  it('early start allows more priorities than typical day', () => {
    expect(ENERGY_CAPS.early.priorities).toBeGreaterThan(ENERGY_CAPS.typical.priorities);
  });

  it('slow day has fewer priorities than typical day', () => {
    expect(ENERGY_CAPS.slow.priorities).toBeLessThan(ENERGY_CAPS.typical.priorities);
  });

  it('slow day caps are all equal to 2', () => {
    expect(ENERGY_CAPS.slow.priorities).toBe(2);
    expect(ENERGY_CAPS.slow.tomorrowTasks).toBe(2);
    expect(ENERGY_CAPS.slow.dontForget).toBe(2);
  });

  it('early start allows the most priorities (5)', () => {
    expect(ENERGY_CAPS.early.priorities).toBe(5);
  });

  it('defines caps for all three energy levels', () => {
    ['early', 'typical', 'slow'].forEach(level => {
      expect(ENERGY_CAPS[level]).toBeDefined();
    });
  });
});
