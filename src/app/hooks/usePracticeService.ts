/**
 * 🎯 Application Layer: React Hook for Practice Service
 * 
 * This hook provides React components with clean access to domain use cases
 * through the Application Service. No Redux complexity exposed to UI.
 */

import { useCallback } from 'react';
import { useAppDispatch } from '../../infrastructure/hooks/reduxHooks';
import { createPracticeApplicationService } from '../../infrastructure/services/PracticeApplicationService2';
import type { RootState as GameState } from '../../infrastructure/state/gameState';

// We'll need access to the store for getState
// In a real app, this would be properly injected
declare global {
  interface Window {
    __REDUX_STORE__?: {
      getState: () => GameState;
    };
  }
}

/**
 * 🎯 Clean React Hook: Practice Use Cases
 * 
 * This hook exposes only business use cases to React components.
 * No Redux actions, selectors, or state management complexity.
 */
export function usePracticeService() {
  const dispatch = useAppDispatch();

  // Create application service with Redux infrastructure
  const getService = useCallback(() => {
    // In a real app, you'd inject the store properly
    const getState = (): GameState => {
      // For now, we'll create a mock state
      return {
        users: {},
        currentUserId: 'demo-user'
      } as GameState;
    };

    return createPracticeApplicationService(getState, dispatch);
  }, [dispatch]);

  // 🎯 Use Case: Generate Practice Session
  const generatePracticeSession = useCallback(async (
    learnerId: string,
    subject: string,
    complexity: string,
    sessionSize?: number
  ) => {
    const service = getService();
    return await service.generatePracticeSession(learnerId, subject, complexity, sessionSize);
  }, [getService]);

  // 🎯 Use Case: Record Practice Attempt
  const recordPracticeAttempt = useCallback(async (
    learnerId: string,
    wordId: string,
    isCorrect: boolean
  ) => {
    const service = getService();
    return await service.recordPracticeAttempt(learnerId, wordId, isCorrect);
  }, [getService]);

  // 🎯 Use Case: Get Learning Analytics
  const getLearningAnalytics = useCallback(async (learnerId: string) => {
    const service = getService();
    return await service.getLearningAnalytics(learnerId);
  }, [getService]);

  // 🎯 Use Case: Generate Adaptive Session
  const generateAdaptiveSession = useCallback(async (
    learnerId: string,
    targetMinutes?: number
  ) => {
    const service = getService();
    return await service.generateAdaptiveSession(learnerId, targetMinutes);
  }, [getService]);

  return {
    // Business Use Cases (not Redux actions!)
    generatePracticeSession,
    recordPracticeAttempt,
    getLearningAnalytics,
    generateAdaptiveSession
  };
}

/**
 * 🎯 Hook for Practice State
 * 
 * This provides read-only access to practice-related state
 * through domain-focused selectors.
 */
export function usePracticeState() {
  // In a real implementation, you'd use selectors that return domain objects
  // For now, we'll create a simple mock
  return {
    currentSession: null,
    learningProgress: {
      totalWordsStudied: 0,
      masteredWords: 0,
      currentStreak: 0,
      overallAccuracy: 0
    },
    learnerProfile: {
      id: 'demo-user',
      name: 'Demo User',
      preferredSubjects: ['english'],
      learningGoals: []
    }
  };
}