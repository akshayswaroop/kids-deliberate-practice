/**
 * Test suite for prompt labels feature
 * Verifies that appropriate prompt labels are displayed for different subject types
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnifiedParentBanner from '../ui/UnifiedParentBanner';
import { getSubjectPromptLabel } from '../../infrastructure/repositories/subjectLoader.ts';

// Mock dependencies

describe('Prompt Labels', () => {
  describe('getSubjectPromptLabel helper function', () => {
    it('should return correct prompt for alphabet subjects', () => {
      expect(getSubjectPromptLabel('kannadaalphabets')).toBe('Say the letter');
      expect(getSubjectPromptLabel('hindialphabets')).toBe('Say the letter');
    });

    it('should return correct prompt for number spelling', () => {
      expect(getSubjectPromptLabel('numberspellings')).toBe('Spell this number');
    });

    it('should return correct prompt for math tables', () => {
      expect(getSubjectPromptLabel('mathtables')).toBe('Solve this problem');
    });

    it('should return correct prompt for comprehension subjects', () => {
      expect(getSubjectPromptLabel('comprehension')).toBe('Read and answer');
      expect(getSubjectPromptLabel('hanuman')).toBe('Read and answer');
    });

    it('should return correct prompt for knowledge subjects', () => {
      expect(getSubjectPromptLabel('humanbody')).toBe('Answer the question');
      expect(getSubjectPromptLabel('indiageography')).toBe('Answer the question');
      expect(getSubjectPromptLabel('nationalsymbols')).toBe('Answer the question');
    });

    it('should return correct prompt for word reading', () => {
      expect(getSubjectPromptLabel('kannada')).toBe('Read this word');
    });

    it('should return correct prompt for sequence subjects', () => {
      expect(getSubjectPromptLabel('beforeafternumbers')).toBe('Complete the sequence');
    });

    it('should return default prompt for unknown subjects', () => {
      expect(getSubjectPromptLabel('unknown-subject')).toBe('Answer the question');
    });
  });

  describe('PracticeCard prompt label display', () => {
    // Banner moved to UnifiedParentBanner; assert banner text there
    const mockWord = {
      id: 'w1',
      text: 'Test',
      attempts: [],
      revealCount: 0,
    } as any;

    it('should display parent instruction when mode is provided (unified banner)', () => {
      render(<UnifiedParentBanner currentWord={mockWord} mode="kannadaalphabets" />);
      // Check that the actionable instruction appears (now integrated with subject tip)
      expect(screen.getByText(/Trace in air \+ say the sound/)).toBeInTheDocument();
    });

    it('should display different parent instructions for different modes (unified banner)', () => {
      const { rerender } = render(<UnifiedParentBanner currentWord={mockWord} mode="numberspellings" />);
      expect(screen.getByText(/Show number, ask child to spell aloud/)).toBeInTheDocument();

      rerender(<UnifiedParentBanner currentWord={mockWord} mode="mathtables" />);
      expect(screen.getByText(/Ask them to explain the step/)).toBeInTheDocument();

      rerender(<UnifiedParentBanner currentWord={mockWord} mode="comprehension" />);
      expect(screen.getByText(/One-line re-tell/)).toBeInTheDocument();
    });

    it('should not display parent instruction when mode is not provided', () => {
      render(<UnifiedParentBanner currentWord={mockWord} mode={undefined as any} />);
      // Should show generic "First try" message when no mode and no attempts
      expect(screen.getByText(/First try/)).toBeInTheDocument();
    });
  });
});