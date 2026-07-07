import { describe, it, expect } from 'vitest';
import { applyRecommendations } from '../applyRecommendations';

const NOW = 1750000000000;

const localTasks = [
  { _id: 'a', text: 'urgent thing', sorted: false, sortedCategory: null },
  { _id: 'b', text: 'soon thing', sorted: false, sortedCategory: null },
  { _id: 'c', text: 'later thing', sorted: true, sortedCategory: 'priorities' },
  { _id: 'd', text: 'not mentioned', sorted: false, sortedCategory: null },
];

const response = {
  today: [{ _id: 'a', score: 0.9 }],
  tomorrow: [{ _id: 'b', score: 0.6 }],
  dontForget: [{ _id: 'c', score: 0.3 }],
};

describe('applyRecommendations', () => {
  it('maps today to priorities and carries the score', () => {
    const result = applyRecommendations(localTasks, response, NOW);
    const a = result.find((t) => t._id === 'a');
    expect(a).toMatchObject({
      sorted: true,
      sortedCategory: 'priorities',
      sortedAt: NOW,
      score: 0.9,
    });
  });

  it('maps tomorrow and dontForget buckets', () => {
    const result = applyRecommendations(localTasks, response, NOW);
    expect(result.find((t) => t._id === 'b').sortedCategory).toBe('tomorrow');
    expect(result.find((t) => t._id === 'c').sortedCategory).toBe('dontForget');
  });

  it('re-buckets a task that was already sorted (c moves out of priorities)', () => {
    const result = applyRecommendations(localTasks, response, NOW);
    const c = result.find((t) => t._id === 'c');
    expect(c.sortedCategory).toBe('dontForget');
  });

  it('leaves tasks the server did not mention untouched', () => {
    const result = applyRecommendations(localTasks, response, NOW);
    expect(result.find((t) => t._id === 'd')).toBe(localTasks[3]);
  });

  it('handles an empty or partial response without throwing', () => {
    expect(applyRecommendations(localTasks, {}, NOW)).toHaveLength(4);
    expect(applyRecommendations(localTasks, { today: [] }, NOW)).toHaveLength(4);
  });

  it('does not mutate the input array', () => {
    const before = JSON.parse(JSON.stringify(localTasks));
    applyRecommendations(localTasks, response, NOW);
    expect(localTasks).toEqual(before);
  });
});
