/**
 * Turns a freeform Parking Lot entry into a structured task suggestion.
 * Pure module: no DB, no Express, same pattern as utils/sortLogic.js.
 *
 * Output: { text, deadline, deadlineSource, hours, importance,
 *           energyRequired, category, steps }
 *
 * Deadline rules, in order:
 *   1. An explicit date phrase in the text wins ("tomorrow", "by friday",
 *      "in 3 days", "june 12", "7/20", "2026-07-20").
 *   2. Otherwise the detected task category sets a default horizon
 *      (pay a bill: 3 days out, research an idea: 14 days out).
 * Both are heuristics. See backend/engine/README.md for the assumptions.
 */

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_PREFIXES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const startOfDay = (ref) => {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (ref, n) => {
  const d = startOfDay(ref);
  d.setDate(d.getDate() + n);
  return d;
};

// Local-time YYYY-MM-DD, matching the format the frontend date input produces
const toYMD = (d) => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

/**
 * Task categories, checked in order. First keyword match wins.
 * defaultOffsetDays: horizon used when the text has no explicit date.
 * hours: rough effort estimate when the user gave none.
 * energy: how much focus the task typically needs (low/medium/high).
 * steps: small, concrete sub-steps shown to the user.
 */
const CATEGORIES = [
  {
    name: 'communication',
    pattern: /\b(call|phone|email|text|reply|respond|message|follow up|reach out|contact|ask|invite|rsvp)\b/,
    defaultOffsetDays: 2,
    hours: 0.5,
    energy: 'low',
    steps: [
      'Find the contact info or the thread',
      'Jot two bullet points on what you need to say',
      'Send the message or make the call',
      'Note the reply or the next step somewhere you will see it',
    ],
  },
  {
    name: 'admin',
    pattern: /\b(pay|bill|invoice|renew|tax|taxes|register|submit|form|application|paperwork|dmv|visa|insurance|cancel|subscription|refund)\b/,
    defaultOffsetDays: 3,
    hours: 0.5,
    energy: 'low',
    steps: [
      'Gather the account login or the document you need',
      'Open the site or form and fill in the details',
      'Submit or pay, then screenshot the confirmation',
    ],
  },
  {
    name: 'appointment',
    pattern: /\b(doctor|dentist|appointment|book|schedule|gym|workout|haircut|checkup|vet|therapy)\b/,
    defaultOffsetDays: 5,
    hours: 1,
    energy: 'medium',
    steps: [
      'Check your calendar for two time slots that work',
      'Book online or call to confirm one',
      'Add it to your calendar with a reminder',
    ],
  },
  {
    name: 'errand',
    pattern: /\b(buy|pick up|order|return|grocery|groceries|shop|shopping|drop off|mail)\b/,
    defaultOffsetDays: 4,
    hours: 1,
    energy: 'low',
    steps: [
      'Write the exact item or list on your phone',
      'Pick a trip that is already happening to attach it to',
      'Do the errand and cross it off',
    ],
  },
  {
    name: 'deepwork',
    pattern: /\b(write|draft|build|code|design|create|prepare|develop|finish|fix|debug|presentation|report|essay|proposal|portfolio|resume|cv)\b/,
    defaultOffsetDays: 7,
    hours: 2,
    energy: 'high',
    steps: [
      'Write one sentence describing what done looks like',
      'Sketch a rough outline or file structure, ugly is fine',
      'Set a 25 minute timer and do the first section only',
      'Take a short break, then do one more block',
      'Leave a note on where you stopped so restarting is easy',
    ],
  },
  {
    name: 'learning',
    pattern: /\b(research|learn|study|read|look into|explore|watch|course|tutorial|documentation|docs)\b/,
    defaultOffsetDays: 10,
    hours: 1.5,
    energy: 'medium',
    steps: [
      'Decide the one question you want answered first',
      'Collect two or three sources into one place',
      'Read or watch for 30 minutes and take three bullet notes',
      'Write down what to look at next time',
    ],
  },
  {
    name: 'chores',
    pattern: /\b(clean|organize|tidy|declutter|sort out|laundry|dishes|vacuum|fold)\b/,
    defaultOffsetDays: 5,
    hours: 1,
    energy: 'medium',
    steps: [
      'Pick one small zone, not the whole thing',
      'Set a 15 minute timer and start there',
      'Stop when the timer ends, done is better than perfect',
    ],
  },
  {
    name: 'planning',
    pattern: /\b(plan|idea|someday|eventually|maybe|think about|brainstorm|figure out|decide)\b/,
    defaultOffsetDays: 14,
    hours: 1,
    energy: 'medium',
    steps: [
      'Brain dump everything about this onto one page',
      'Circle the single next physical action',
      'Put that action in the Parking Lot as its own task',
    ],
  },
];

// Fallback when nothing matched
const GENERIC_CATEGORY = {
  name: 'general',
  defaultOffsetDays: 7,
  hours: 1,
  energy: 'medium',
  steps: [
    'Write one sentence describing what done looks like',
    'Set up what you need: tabs, files, tools',
    'Do the first ten minutes',
    'Keep going, or park it with a note on where you stopped',
  ],
};

const HIGH_IMPORTANCE = /\b(urgent|asap|important|critical|must|overdue|deadline|due)\b/;
const LOW_IMPORTANCE = /\b(someday|maybe|eventually|no rush|whenever|idea|nice to have)\b/;

const detectCategory = (lower) => {
  for (const cat of CATEGORIES) {
    if (cat.pattern.test(lower)) return cat;
  }
  return GENERIC_CATEGORY;
};

/**
 * Finds an explicit date phrase and returns a Date, or null if none.
 * Checked in order from most specific to least, so "day after tomorrow"
 * is not swallowed by "tomorrow".
 */
const detectExplicitDeadline = (lower, ref) => {
  const today = startOfDay(ref);

  // ISO date: 2026-07-20
  let m = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

  // Numeric date: 7/20 or 7/20/2026
  m = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m) {
    const month = Number(m[1]);
    const day = Number(m[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      let year = m[3] ? Number(m[3]) : today.getFullYear();
      if (year < 100) year += 2000;
      let d = new Date(year, month - 1, day);
      // A bare 7/20 that already passed this year means next year
      if (!m[3] && d < today) d = new Date(year + 1, month - 1, day);
      return d;
    }
  }

  // Month name plus day: "june 12", "jun 12th"
  m = lower.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (m) {
    const month = MONTH_PREFIXES.indexOf(m[1]);
    const day = Number(m[2]);
    if (day >= 1 && day <= 31) {
      let d = new Date(today.getFullYear(), month, day);
      if (d < today) d = new Date(today.getFullYear() + 1, month, day);
      return d;
    }
  }

  if (/\bday after tomorrow\b/.test(lower)) return addDays(ref, 2);
  if (/\btomorrow\b/.test(lower)) return addDays(ref, 1);
  if (/\b(today|tonight|end of day|eod)\b/.test(lower)) return addDays(ref, 0);

  // "in 3 days", "in 2 weeks"
  m = lower.match(/\bin (\d{1,2}) (day|days|week|weeks)\b/);
  if (m) {
    const n = Number(m[1]);
    return addDays(ref, m[2].startsWith('week') ? n * 7 : n);
  }

  if (/\bnext week\b/.test(lower)) return addDays(ref, 7);
  if (/\bnext month\b/.test(lower)) return addDays(ref, 30);

  if (/\bend of (the )?month\b/.test(lower)) {
    return new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  if (/\bthis weekend\b/.test(lower)) {
    // Upcoming Saturday; 0 days means today is Saturday
    const daysToSat = (6 - today.getDay() + 7) % 7;
    return addDays(ref, daysToSat);
  }

  // Weekday name: "by friday", "on monday", "next tuesday", bare "friday".
  // "next <weekday>" pushes one week past the coming occurrence.
  m = lower.match(/\b(?:(next)\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (m) {
    const target = WEEKDAYS.indexOf(m[2]);
    let days = (target - today.getDay() + 7) % 7;
    if (m[1]) days += 7;
    return addDays(ref, days);
  }

  return null;
};

const detectImportance = (lower, deadline, ref) => {
  if (HIGH_IMPORTANCE.test(lower)) return 'high';
  if (LOW_IMPORTANCE.test(lower)) return 'low';
  if (deadline) {
    const dueSoon = addDays(ref, 1);
    const [y, mo, d] = deadline.split('-').map(Number);
    if (new Date(y, mo - 1, d) <= dueSoon) return 'high';
  }
  return 'medium';
};

/**
 * Main entry point.
 * @param {string} text - Raw Parking Lot entry
 * @param {Date}   [ref] - Reference date (defaults to now; override in tests)
 */
const parseEntry = (text, ref = new Date()) => {
  const raw = (text || '').trim();
  const lower = raw.toLowerCase();
  const category = detectCategory(lower);

  const explicit = detectExplicitDeadline(lower, ref);
  let deadline = '';
  let deadlineSource = 'none';
  if (explicit) {
    deadline = toYMD(explicit);
    deadlineSource = 'explicit';
  } else if (category.defaultOffsetDays != null) {
    deadline = toYMD(addDays(ref, category.defaultOffsetDays));
    deadlineSource = 'inferred';
  }

  // "quick" in the text overrides the category effort estimate
  const hours = /\bquick(ly)?\b/.test(lower) ? 0.5 : category.hours;

  return {
    text: raw,
    deadline,
    deadlineSource,
    hours,
    importance: detectImportance(lower, deadline, ref),
    energyRequired: category.energy,
    category: category.name,
    steps: [...category.steps],
  };
};

module.exports = { parseEntry, detectExplicitDeadline, toYMD };
