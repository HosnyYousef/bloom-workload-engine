const { parseEntry } = require('../engine/parseEntry');

// Monday July 6 2026, 9am local time. Local constructor (not an ISO string)
// so weekday math is stable in any timezone.
const REF = new Date(2026, 6, 6, 9, 0, 0);

const ymdOffset = (n) => {
  const d = new Date(REF);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

describe('parseEntry: explicit date phrases', () => {
  it('"today" resolves to the reference date', () => {
    const r = parseEntry('pay rent today', REF);
    expect(r.deadline).toBe(ymdOffset(0));
    expect(r.deadlineSource).toBe('explicit');
  });

  it('"tomorrow" resolves to ref + 1', () => {
    expect(parseEntry('email Sarah tomorrow', REF).deadline).toBe(ymdOffset(1));
  });

  it('"day after tomorrow" resolves to ref + 2, not swallowed by "tomorrow"', () => {
    expect(parseEntry('call the bank day after tomorrow', REF).deadline).toBe(ymdOffset(2));
  });

  it('"by friday" from a Monday resolves to that same week', () => {
    expect(parseEntry('submit the report by friday', REF).deadline).toBe('2026-07-10');
  });

  it('"next friday" adds a week beyond the coming friday', () => {
    expect(parseEntry('submit the report next friday', REF).deadline).toBe('2026-07-17');
  });

  it('"in 3 days" resolves to ref + 3', () => {
    expect(parseEntry('renew passport in 3 days', REF).deadline).toBe(ymdOffset(3));
  });

  it('"in 2 weeks" resolves to ref + 14', () => {
    expect(parseEntry('plan the trip in 2 weeks', REF).deadline).toBe(ymdOffset(14));
  });

  it('"next week" resolves to ref + 7', () => {
    expect(parseEntry('start the essay next week', REF).deadline).toBe(ymdOffset(7));
  });

  it('"end of month" resolves to the last day of July', () => {
    expect(parseEntry('file expenses end of month', REF).deadline).toBe('2026-07-31');
  });

  it('"this weekend" resolves to the coming Saturday', () => {
    expect(parseEntry('clean the garage this weekend', REF).deadline).toBe('2026-07-11');
  });

  it('a month-name date like "july 20" parses', () => {
    expect(parseEntry('dentist appointment july 20', REF).deadline).toBe('2026-07-20');
  });

  it('a numeric date like 7/20 parses to this year when still ahead', () => {
    expect(parseEntry('taxes due 7/20', REF).deadline).toBe('2026-07-20');
  });

  it('a bare numeric date already past rolls to next year', () => {
    expect(parseEntry('renew domain 3/15', REF).deadline).toBe('2027-03-15');
  });

  it('an ISO date parses as written', () => {
    expect(parseEntry('conference talk 2026-09-01', REF).deadline).toBe('2026-09-01');
  });
});

describe('parseEntry: inferred deadlines by category', () => {
  it('a bill with no date gets the 3-day admin horizon', () => {
    const r = parseEntry('pay the electricity bill', REF);
    expect(r.deadline).toBe(ymdOffset(3));
    expect(r.deadlineSource).toBe('inferred');
    expect(r.category).toBe('admin');
  });

  it('a call with no date gets the 2-day communication horizon', () => {
    const r = parseEntry('call mom', REF);
    expect(r.deadline).toBe(ymdOffset(2));
    expect(r.category).toBe('communication');
  });

  it('deep work with no date gets a 7-day horizon', () => {
    const r = parseEntry('write the project proposal', REF);
    expect(r.deadline).toBe(ymdOffset(7));
    expect(r.category).toBe('deepwork');
  });

  it('a vague idea gets the long 14-day planning horizon', () => {
    const r = parseEntry('maybe brainstorm gift ideas', REF);
    expect(r.deadline).toBe(ymdOffset(14));
    expect(r.category).toBe('planning');
  });

  it('unrecognized text falls back to the 7-day generic horizon', () => {
    const r = parseEntry('the thing with the garage door', REF);
    expect(r.deadline).toBe(ymdOffset(7));
    expect(r.category).toBe('general');
    expect(r.deadlineSource).toBe('inferred');
  });
});

describe('parseEntry: importance', () => {
  it('urgency words force high importance', () => {
    expect(parseEntry('urgent: reply to the landlord', REF).importance).toBe('high');
  });

  it('a deadline today or tomorrow forces high importance', () => {
    expect(parseEntry('pick up the package tomorrow', REF).importance).toBe('high');
  });

  it('someday-style words force low importance', () => {
    expect(parseEntry('someday learn guitar', REF).importance).toBe('low');
  });

  it('everything else defaults to medium', () => {
    expect(parseEntry('write blog post', REF).importance).toBe('medium');
  });
});

describe('parseEntry: energy and effort', () => {
  it('deep work needs high energy', () => {
    expect(parseEntry('write blog post', REF).energyRequired).toBe('high');
  });

  it('a quick call needs low energy', () => {
    expect(parseEntry('call the dentist office', REF).energyRequired).toBe('low');
  });

  it('"quick" in the text shrinks the hours estimate', () => {
    expect(parseEntry('quick email to the team', REF).hours).toBe(0.5);
  });

  it('deep work gets a bigger default estimate than communication', () => {
    const deep = parseEntry('draft the quarterly report', REF).hours;
    const comm = parseEntry('reply to Alex', REF).hours;
    expect(deep).toBeGreaterThan(comm);
  });
});

describe('parseEntry: steps', () => {
  it('every entry gets between 3 and 5 steps', () => {
    const samples = [
      'pay rent',
      'call mom',
      'write the essay',
      'research standing desks',
      'random thing with no keywords',
    ];
    for (const text of samples) {
      const { steps } = parseEntry(text, REF);
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(steps.length).toBeLessThanOrEqual(5);
      steps.forEach((s) => expect(typeof s).toBe('string'));
    }
  });

  it('keeps the original text unchanged', () => {
    expect(parseEntry('  Submit the report by Friday  ', REF).text).toBe(
      'Submit the report by Friday'
    );
  });

  it('deadline is always YYYY-MM-DD when present', () => {
    const r = parseEntry('pay rent today', REF);
    expect(r.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
