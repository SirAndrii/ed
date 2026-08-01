import { describe, expect, it } from 'vitest';
import { applyCollectibleReward } from '../components/NyanGameModal';

describe('Nyan game collectible rewards', () => {
  it('adds one life when the fish is collected', () => {
    expect(applyCollectibleReward(1, 100, { points: 0, extraLife: true }))
      .toEqual({ lives: 2, score: 100 });
  });

  it('does not increase lives above three', () => {
    expect(applyCollectibleReward(3, 100, { points: 0, extraLife: true }))
      .toEqual({ lives: 3, score: 100 });
  });

  it('keeps regular food as a score reward', () => {
    expect(applyCollectibleReward(2, 100, { points: 50 }))
      .toEqual({ lives: 2, score: 150 });
  });
});
