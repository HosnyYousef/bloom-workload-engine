// Deadlines are local YYYY-MM-DD strings from the date input. Parse them in
// local time; new Date('YYYY-MM-DD') would read UTC midnight and shift the
// day in timezones ahead of UTC.
const parseLocalDate = (s) => {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
};

// Pure function — no side effects, deterministic output given the same inputs.
// Extracted from App.jsx so it can be unit-tested independently.
export const sortTasks = (tasks, energyLevel) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const threeDays = new Date(today);
  threeDays.setDate(threeDays.getDate() + 3);

  const urgent = tasks.filter(task => {
    if (!task.deadline) return task.importance === 'high';
    const deadline = parseLocalDate(task.deadline);
    return deadline <= tomorrow && task.importance !== 'low';
  });

  const soon = tasks.filter(task => {
    if (!task.deadline) return task.importance === 'medium';
    const deadline = parseLocalDate(task.deadline);
    return deadline > tomorrow && deadline <= threeDays;
  });

  const later = tasks.filter(task => {
    if (!task.deadline) return task.importance === 'low' || !task.importance;
    const deadline = parseLocalDate(task.deadline);
    return deadline > threeDays;
  });

  let priorities = [];
  let tomorrowTasks = [];
  let dontForget = [];

  if (energyLevel === 'early') {
    priorities = urgent.slice(0, 5);
    tomorrowTasks = soon.slice(0, 3);
    dontForget = later.slice(0, 2);
  } else if (energyLevel === 'typical') {
    priorities = urgent.slice(0, 3);
    tomorrowTasks = soon.slice(0, 3);
    dontForget = later.slice(0, 3);
  } else if (energyLevel === 'slow') {
    const quickTasks = urgent.filter(t => !t.hours || t.hours <= 1);
    priorities = quickTasks.slice(0, 2);
    tomorrowTasks = soon.slice(0, 2);
    dontForget = later.slice(0, 2);
  }

  return { priorities, tomorrowTasks, dontForget };
};
