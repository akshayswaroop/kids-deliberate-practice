/**
 * 🎯 Domain Tests: Session Guidance
 * 
 * Tests for session-level guidance that replaces ReadyToPracticeCard modal.
 * Following TDD approach and architecture patterns from docs.
 */

import { describe, test, expect } from 'vitest';
import { SessionGuidance } from '../entities/SessionGuidance';

describe('SessionGuidance Domain Entity', () => {
  describe('Set Introduction Scenario', () => {
    test('should provide set introduction guidance on first question of new session', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0, // First question (0-based)
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: true
      });

      const guidance = sessionGuidance.getSessionGuidance();

  expect(guidance).not.toBeNull();
  expect(guidance!.context).toBe('set-introduction');
  expect(guidance!.message).toContain('cycle through 12 questions');
  expect(guidance!.message).toContain('until each is mastered');
  expect(guidance!.urgency).toBe('info');
    });

    test('should handle single question set introduction', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 1,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'math',
        isFirstQuestionEver: true
      });

      const guidance = sessionGuidance.getSessionGuidance();

  expect(guidance).not.toBeNull();
  expect(guidance!.context).toBe('set-introduction');
  expect(guidance!.message).toContain('Master this question');
  expect(guidance!.urgency).toBe('info');
    });
  });

  describe('Level Transition Scenario', () => {
    test('should provide level transition guidance when all questions in set are mastered', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session', 
        currentQuestionIndex: 11, // Last question in set
        totalQuestions: 12,
        masteredInSession: 12, // All mastered
        allQuestionsInSetMastered: true,
        hasMoreLevels: true,
        subject: 'kannada',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

  expect(guidance).not.toBeNull();
  expect(guidance!.context).toBe('level-transition');
  expect(guidance!.message).toContain('All questions mastered');
  expect(guidance!.message).toContain('Ready for the next challenge');
  expect(guidance!.urgency).toBe('success');
    });

    test('should not show level transition if more questions remain in current level', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 11,
        totalQuestions: 12,
        masteredInSession: 8, // Not all mastered
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

      expect(guidance).toBeNull(); // Should fall back to word-level guidance
    });
  });

  describe('Completion Scenario', () => {
    test('should provide completion guidance without subject formatting (domain agnostic)', () => {
      // Domain test: Domain layer should not format subject names
      // Infrastructure layer will format subject names per architecture docs
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 5,
        totalQuestions: 6,
        masteredInSession: 6,
        allQuestionsInSetMastered: true,
        hasMoreLevels: false, // No more levels
        subject: 'mathtables',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

  expect(guidance).not.toBeNull();
  expect(guidance!.context).toBe('completion');
  expect(guidance!.message).toContain('mastered everything');
  expect(guidance!.message).toContain('Check back for new questions');
  expect(guidance!.urgency).toBe('success');
  // Domain entity exposes subject code for infrastructure to format
  expect(sessionGuidance.getSubject()).toBe('mathtables');
    });

    test('should provide completion message without subject-specific formatting', () => {
      // Domain test: Domain layer should not format subject names
      // That's infrastructure concern per architecture docs
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 2,
        totalQuestions: 3,
        masteredInSession: 3,
        allQuestionsInSetMastered: true,
        hasMoreLevels: false,
        subject: 'kannadaalphabets',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

  expect(guidance).not.toBeNull();
  expect(guidance!.context).toBe('completion');
  expect(guidance!.message).toContain('mastered everything');
  // Domain entity exposes subject code for infrastructure to format
  expect(sessionGuidance.getSubject()).toBe('kannadaalphabets');
    });
  });

  describe('Normal Operation Scenario', () => {
    test('should return null for normal mid-session questions', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 5, // Mid-session
        totalQuestions: 12,
        masteredInSession: 3,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

      expect(guidance).toBeNull(); // Should fall back to word-level guidance
    });

    test('should return null when session data is invalid', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: '',
        currentQuestionIndex: -1,
        totalQuestions: 0,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: false,
        subject: '',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

      expect(guidance).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero total questions gracefully', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 0,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: false,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

      expect(guidance).toBeNull();
    });

    test('should handle negative question index gracefully', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: -5,
        totalQuestions: 10,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'math',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();

      expect(guidance).toBeNull();
    });
  });
});