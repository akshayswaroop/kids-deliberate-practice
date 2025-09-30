/**
 * 🎯 Application Service Provider for DDD Integration
 * 
 * This provides your React app with access to domain services
 * through clean application service interfaces.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAppDispatch } from '../../infrastructure/hooks/reduxHooks';
import { createPracticeApplicationService } from '../../infrastructure/services/PracticeApplicationService2';
import { store } from '../../infrastructure/store';

interface PracticeServiceContextType {
  generatePracticeSession: (learnerId: string, subject: string, complexity: string, sessionSize?: number) => Promise<any>;
  recordPracticeAttempt: (learnerId: string, wordId: string, isCorrect: boolean) => Promise<any>;
  getLearningAnalytics: (learnerId: string) => Promise<any>;
  generateAdaptiveSession: (learnerId: string, targetMinutes?: number) => Promise<any>;
}

const PracticeServiceContext = createContext<PracticeServiceContextType | null>(null);

export function PracticeServiceProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  
  const serviceApi = useMemo(() => {
    // Adapt the real Redux state to what our repositories expect
    const getState = () => {
      const state = store.getState();
      // Transform actual Redux state (which has structure { game: GameState })
      // to the shape our repositories expect
      return {
        users: state.game.users || {},
        currentUserId: state.game.currentUserId || 'demo-user',
        words: {}, // Words are stored per-user in this app
        sessions: {} // Sessions aren't implemented in current Redux
      } as any;
    };
    
    const applicationService = createPracticeApplicationService(getState, dispatch);
    
    return {
      generatePracticeSession: applicationService.generatePracticeSession.bind(applicationService),
      recordPracticeAttempt: applicationService.recordPracticeAttempt.bind(applicationService),
      getLearningAnalytics: applicationService.getLearningAnalytics.bind(applicationService),
      generateAdaptiveSession: applicationService.generateAdaptiveSession.bind(applicationService)
    };
  }, [dispatch]);

  return (
    <PracticeServiceContext.Provider value={serviceApi}>
      {children}
    </PracticeServiceContext.Provider>
  );
}

export function usePracticeApplicationService(): PracticeServiceContextType {
  const service = useContext(PracticeServiceContext);
  if (!service) {
    throw new Error('usePracticeApplicationService must be used within PracticeServiceProvider');
  }
  return service;
}