// Merges the POST /tasks/recommend response into local task state.
// Pure function, extracted from App.jsx so it can be unit-tested.
//
// The response has three buckets of full task objects (with scores).
// Local tasks that appear in a bucket get their sorted fields and score
// updated; tasks the server did not mention (completed ones, or tasks
// created after the request) come back unchanged.
export const applyRecommendations = (tasks, response, now = Date.now()) => {
  const buckets = [
    ['today', 'priorities'],
    ['tomorrow', 'tomorrow'],
    ['dontForget', 'dontForget'],
  ];

  const byId = new Map();
  for (const [bucket, category] of buckets) {
    for (const [sectionOrder, item] of (response?.[bucket] || []).entries()) {
      byId.set(item._id, { category, score: item.score, sectionOrder });
    }
  }

  return tasks.map((task) => {
    const hit = byId.get(task._id);
    if (!hit) return task;
    return {
      ...task,
      sorted: true,
      sortedCategory: hit.category,
      sortedAt: now,
      score: hit.score,
      sectionOrder: hit.sectionOrder,
    };
  });
};

// Keep a user's explicit priority choice when the recommendation engine is
// rerun after changing energy modes. The displaced recommendation returns to
// the same bucket the chosen task came from.
export const applySavedPriorityOrder = (response, preferredTaskIds = []) => {
  if (!preferredTaskIds.length || !response?.today?.length) return response;

  const buckets = ['today', 'tomorrow', 'dontForget'];
  const locations = new Map();
  buckets.forEach(bucket => (response[bucket] || []).forEach(task => {
    locations.set(task._id, { task, bucket });
  }));

  const capacity = response.today.length;
  const desiredIds = preferredTaskIds
    .filter((id, index) => locations.has(id) && preferredTaskIds.indexOf(id) === index)
    .slice(0, capacity);
  response.today.forEach(task => {
    if (desiredIds.length < capacity && !desiredIds.includes(task._id)) desiredIds.push(task._id);
  });
  if (desiredIds.length !== capacity) return response;

  const originalTodayIds = response.today.map(task => task._id);
  const addedIds = desiredIds.filter(id => !originalTodayIds.includes(id));
  const displacedTasks = response.today.filter(task => !desiredIds.includes(task._id));
  const next = {
    ...response,
    today: desiredIds.map(id => locations.get(id).task),
    tomorrow: [...(response.tomorrow || [])],
    dontForget: [...(response.dontForget || [])],
  };

  addedIds.forEach((id, index) => {
    const sourceBucket = locations.get(id).bucket;
    next[sourceBucket] = next[sourceBucket].filter(task => task._id !== id);
    if (displacedTasks[index]) next[sourceBucket].push(displacedTasks[index]);
  });

  const unchanged = buckets.every(bucket =>
    (response[bucket] || []).map(task => task._id).join('|') === next[bucket].map(task => task._id).join('|')
  );
  return unchanged ? response : next;
};
