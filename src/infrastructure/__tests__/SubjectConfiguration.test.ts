import { describe, expect, test } from 'vitest';
import { SubjectConfiguration } from '../config/subjectConfiguration';

describe('SubjectConfiguration (Kannada-only)', () => {
  test('returns display names for supported subjects', () => {
    expect(SubjectConfiguration.getDisplayName('kannada')).toBe('Kannada Words');
    expect(SubjectConfiguration.getDisplayName('kannadaalphabets')).toBe('Kannada Alphabets');
  });

  test('falls back to capitalising unknown codes', () => {
    expect(SubjectConfiguration.getDisplayName('mysterysubject')).toBe('Mysterysubject');
  });

  test('exposes parent tips only where configured', () => {
    expect(SubjectConfiguration.getParentTip('kannadaalphabets')).toBe('Trace in air + say the sound.');
    expect(SubjectConfiguration.getParentTip('kannada')).toBeNull();
    expect(SubjectConfiguration.getParentTip('unknown')).toBeNull();
  });

  test('tracks configured subjects accurately', () => {
    expect(SubjectConfiguration.isConfigured('kannada')).toBe(true);
    expect(SubjectConfiguration.isConfigured('kannadaalphabets')).toBe(true);
    expect(SubjectConfiguration.isConfigured('english')).toBe(false);
  });
});
