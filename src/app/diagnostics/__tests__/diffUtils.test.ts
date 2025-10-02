import { describe, expect, it } from 'vitest';
import { computeDiff } from '../diffUtils';

describe('computeDiff', () => {
  it('returns empty array when values are identical', () => {
    expect(computeDiff({ a: 1 }, { a: 1 })).toEqual([]);
  });

  it('returns diff for primitive change', () => {
    expect(computeDiff({ a: 1 }, { a: 2 })).toEqual([
      { path: 'a', before: 1, after: 2 },
    ]);
  });

  it('walks nested objects', () => {
    const before = { user: { id: 'u1', mode: 'english' } };
    const after = { user: { id: 'u1', mode: 'kannada' } };
    expect(computeDiff(before, after)).toEqual([
      { path: 'user.mode', before: 'english', after: 'kannada' },
    ]);
  });

  it('detects array changes', () => {
    const before = { items: ['a', 'b'] };
    const after = { items: ['a', 'c'] };
    expect(computeDiff(before, after)).toEqual([
      { path: 'items', before: ['a', 'b'], after: ['a', 'c'] },
    ]);
  });
});
