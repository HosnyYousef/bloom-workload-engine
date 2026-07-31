import { describe, it, expect } from 'vitest';
import { applyRecommendations, applySavedPriorityOrder } from '../applyRecommendations';

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
      sectionOrder: 0,
    });
  });

  it('maps tomorrow and dontForget buckets', () => {
    const result = applyRecommendations(localTasks, response, NOW);
    expect(result.find((t) => t._id === 'b').sortedCategory).toBe('tomorrow');
    expect(result.find((t) => t._id === 'c').sortedCategory).toBe('dontForget');
  });

  it('resets saved manual order to the new recommendation order', () => {
    const result = applyRecommendations(
      [{ _id: 'x', sectionOrder: 9 }, { _id: 'y', sectionOrder: 2 }],
      { today: [{ _id: 'y', score: 1 }, { _id: 'x', score: 0.9 }] },
      NOW
    );
    expect(result.find((task) => task._id === 'y').sectionOrder).toBe(0);
    expect(result.find((task) => task._id === 'x').sectionOrder).toBe(1);
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

describe('applySavedPriorityOrder', () => {
  it('restores saved choices and their order while returning displaced tasks', () => {
    const recommendations = {
      today: [{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }],
      tomorrow: [{ _id: 'chosen' }, { _id: 'e' }],
      dontForget: [{ _id: 'f' }],
    };

    const result = applySavedPriorityOrder(recommendations, ['chosen', 'b', 'a']);

    expect(result.today.map(task => task._id)).toEqual(['chosen', 'b', 'a']);
    expect(result.tomorrow.map(task => task._id)).toEqual(['e', 'c']);
    expect(recommendations.today.map(task => task._id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps recommendations unchanged when the saved task is unavailable', () => {
    const recommendations = { today: [{ _id: 'a' }], tomorrow: [], dontForget: [] };
    expect(applySavedPriorityOrder(recommendations, ['missing'])).toBe(recommendations);
  });
});
