/**
 * 🎯 Negative Tests: SessionGuidance
 * 
 * Tests edge cases, invalid inputs, and boundary conditions
 * to catch potential bugs in SessionGuidance domain entity.
 * 
 * Architecture principle: "Tests Buy Freedom - sprinkle targeted internal tests"
 */

import { describe, test, expect } from 'vitest';
import { SessionGuidance } from '../entities/SessionGuidance';

describe('SessionGuidance Negative Tests', () => {
  describe('Invalid Data Handling', () => {
    test('should return null for empty session ID', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: '', // Invalid: empty
        currentQuestionIndex: 0,
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: true
      });

      const guidance = sessionGuidance.getSessionGuidance();
      expect(guidance).toBeNull();
    });

    test('should return null for negative current index', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: -1, // Invalid: negative
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      expect(guidance).toBeNull();
    });

    test('should return null for zero or negative total questions', () => {
      const sessionGuidance1 = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 0, // Invalid: zero
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      expect(sessionGuidance1.getSessionGuidance()).toBeNull();

      const sessionGuidance2 = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: -5, // Invalid: negative
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      expect(sessionGuidance2.getSessionGuidance()).toBeNull();
    });

    test('should return null when current index exceeds total questions', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 15, // Invalid: out of bounds
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      expect(guidance).toBeNull();
    });

    test('should return null when mastered count exceeds total questions', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 5,
        totalQuestions: 12,
        masteredInSession: 20, // Invalid: more than total
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      expect(guidance).toBeNull();
    });

    test('should return null when mastered count is negative', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 5,
        totalQuestions: 12,
        masteredInSession: -3, // Invalid: negative
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      expect(guidance).toBeNull();
    });

    test('should return null for empty subject', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: '', // Invalid: empty
        isFirstQuestionEver: true
      });

      const guidance = sessionGuidance.getSessionGuidance();
      expect(guidance).toBeNull();
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle single question session correctly', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 1, // Boundary: single question
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: true
      });

      const guidance = sessionGuidance.getSessionGuidance();
      expect(guidance).not.toBeNull();
      expect(guidance!.context).toBe('set-introduction');
      expect(guidance!.message).toContain('Master this question');
    });

    test('should handle last question index correctly', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 11, // Last index (0-based)
        totalQuestions: 12,
        masteredInSession: 5,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      // Should return null for normal operation (not a special case)
      expect(guidance).toBeNull();
    });

    test('should handle all questions mastered at start (edge case)', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 12,
        masteredInSession: 12, // All mastered
        allQuestionsInSetMastered: true,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: true
      });

      const guidance = sessionGuidance.getSessionGuidance();
      // First question ever takes priority over level transition
      expect(guidance!.context).toBe('set-introduction');
    });
  });

  describe('Conflicting States', () => {
    test('should handle conflicting mastery flags gracefully', () => {
      // allQuestionsInSetMastered=true but masteredInSession < totalQuestions
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 5,
        totalQuestions: 12,
        masteredInSession: 8, // Not all mastered numerically
        allQuestionsInSetMastered: true, // But flag says all mastered
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: false
      });

      const guidance = sessionGuidance.getSessionGuidance();
      // Should use the flag and not return guidance (validation fails)
      expect(guidance).toBeNull();
    });

    test('should handle first question flag after attempts', () => {
      // isFirstQuestionEver=true but currentQuestionIndex != 0
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 5, // Not first index
        totalQuestions: 12,
        masteredInSession: 3,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'english',
        isFirstQuestionEver: true // But marked as first ever
      });

      const guidance = sessionGuidance.getSessionGuidance();
      // Should return null since index is not 0
      expect(guidance).toBeNull();
    });
  });

  describe('Subject Code Exposure', () => {
    test('should expose subject code for infrastructure formatting', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'kannadaalphabets',
        isFirstQuestionEver: true
      });

      // Domain entity should expose raw subject code
      expect(sessionGuidance.getSubject()).toBe('kannadaalphabets');
    });

    test('should expose subject code even for unknown subjects', () => {
      const sessionGuidance = SessionGuidance.fromSessionData({
        sessionId: 'test-session',
        currentQuestionIndex: 0,
        totalQuestions: 12,
        masteredInSession: 0,
        allQuestionsInSetMastered: false,
        hasMoreLevels: true,
        subject: 'unknownsubject123', // Unknown subject
        isFirstQuestionEver: true
      });

      // Should still expose it (infrastructure will handle formatting)
      expect(sessionGuidance.getSubject()).toBe('unknownsubject123');
    });
  });
});
