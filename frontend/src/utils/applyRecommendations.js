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
    for (const item of response?.[bucket] || []) {
      byId.set(item._id, { category, score: item.score });
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
    };
  });
};
