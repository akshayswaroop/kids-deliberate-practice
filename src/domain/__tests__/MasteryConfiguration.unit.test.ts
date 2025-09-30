import { describe, test, expect } from 'vitest';
import { MasteryConfiguration } from '../value-objects/ModeConfiguration';

describe('MasteryConfiguration.isMastered', () => {
  test('returns false for undefined or null word', () => {
    expect(MasteryConfiguration.isMastered(undefined)).toBe(false);
    expect(MasteryConfiguration.isMastered(null)).toBe(false);
  });

  test('returns false for step less than MASTER_STEP and true for step >= MASTER_STEP', () => {
    // Test a range of steps around MASTER_STEP
    const below = MasteryConfiguration.MASTER_STEP - 1;
    const at = MasteryConfiguration.MASTER_STEP;
    const above = MasteryConfiguration.MASTER_STEP + 1;

    const wBelow = { step: below } as any;
    const wAt = { step: at } as any;
    const wAbove = { step: above } as any;

    expect(MasteryConfiguration.isMastered(wBelow)).toBe(false);
    expect(MasteryConfiguration.isMastered(wAt)).toBe(true);
    expect(MasteryConfiguration.isMastered(wAbove)).toBe(true);
  });

  test('treats missing step as 0', () => {
    const w: any = { }; // no step property
    expect(MasteryConfiguration.isMastered(w)).toBe(false);
  });
});
