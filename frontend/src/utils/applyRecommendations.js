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
export const applySavedPriorityChoice = (response, preferredTaskId) => {
  if (!preferredTaskId || !response?.today?.length) return response;

  const sourceBucket = ['tomorrow', 'dontForget'].find(bucket =>
    response[bucket]?.some(task => task._id === preferredTaskId)
  );
  if (!sourceBucket) return response;

  const chosenTask = response[sourceBucket].find(task => task._id === preferredTaskId);
  const displacedTask = response.today[response.today.length - 1];

  return {
    ...response,
    today: [...response.today.slice(0, -1), chosenTask],
    [sourceBucket]: [
      ...response[sourceBucket].filter(task => task._id !== preferredTaskId),
      displacedTask,
    ],
  };
};
