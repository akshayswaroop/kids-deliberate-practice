import { describe, test, expect } from 'vitest';
import { isMastered, MASTER_STEP } from '../modeConfig';

describe('isMastered helper', () => {
  test('returns false for undefined or null word', () => {
    expect(isMastered(undefined)).toBe(false);
    expect(isMastered(null)).toBe(false);
  });

  test('returns false for step less than MASTER_STEP and true for step >= MASTER_STEP', () => {
    // Test a range of steps around MASTER_STEP
    const below = MASTER_STEP - 1;
    const at = MASTER_STEP;
    const above = MASTER_STEP + 1;

    const wBelow = { step: below } as any;
    const wAt = { step: at } as any;
    const wAbove = { step: above } as any;

    expect(isMastered(wBelow)).toBe(false);
    expect(isMastered(wAt)).toBe(true);
    expect(isMastered(wAbove)).toBe(true);
  });

  test('treats missing step as 0', () => {
    const w: any = { }; // no step property
    expect(isMastered(w)).toBe(false);
  });
});
