/**
 * Test suite for prompt labels feature
 * Verifies that appropriate prompt labels are displayed for different subject types
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PracticeCard from '../ui/PracticeCard.jsx';
import { getSubjectPromptLabel, getSubjectParentInstruction } from '../../infrastructure/repositories/subjectLoader.ts';

// Mock dependencies
const mockProps = {
  mainWord: 'Test',
  answer: 'Test Answer',
  choices: [],
  onCorrect: () => {},
  onWrong: () => {},
  onNext: () => {},
  onRevealAnswer: () => {},
  isAnswerRevealed: false,
  isEnglishMode: false,
  currentUserId: 'test-user',
  attemptStats: { total: 0, correct: 0, incorrect: 0 }
};

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
    it('should display parent instruction when mode is provided', () => {
      render(<PracticeCard {...mockProps} mode="kannadaalphabets" />);
      
      // Check that the parent instruction appears in the DOM
      expect(screen.getByText('Show letter, ask for sound, then tap result.')).toBeInTheDocument();
    });

    it('should display different parent instructions for different modes', () => {
      const { rerender } = render(<PracticeCard {...mockProps} mode="numberspellings" />);
      expect(screen.getByText('Show number, ask child to spell aloud, then tap.')).toBeInTheDocument();

      rerender(<PracticeCard {...mockProps} mode="mathtables" />);
      expect(screen.getByText('Ask mentally, encourage quick recall, then tap.')).toBeInTheDocument();

      rerender(<PracticeCard {...mockProps} mode="comprehension" />);
      expect(screen.getByText('Read passage together, discuss, then record answer.')).toBeInTheDocument();
    });

    it('should not display parent instruction when mode is not provided', () => {
      render(<PracticeCard {...mockProps} mode={undefined} />);
      
      // Should not find any of our parent instruction texts
      expect(screen.queryByText('Show letter, ask for sound, then tap result.')).not.toBeInTheDocument();
      expect(screen.queryByText('Show number, ask child to spell aloud, then tap.')).not.toBeInTheDocument();
      expect(screen.queryByText('Ask mentally, encourage quick recall, then tap.')).not.toBeInTheDocument();
    });
  });
});