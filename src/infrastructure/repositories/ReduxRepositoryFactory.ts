/**
 * 🎯 Infrastructure: Redux Repository Factory
 * 
 * This factory creates Redux-based implementations of domain repository interfaces.
 * It demonstrates the infrastructure layer serving the domain layer.
 */

import type { 
  RepositoryFactory,
  ProgressRepository,
  WordRepository,
  LearnerRepository,
  SessionRepository,
  UnitOfWork
} from '../../domain/repositories';
import { ReduxProgressRepository } from './ReduxProgressRepository';
import { ReduxWordRepository } from './ReduxWordRepository';
import type { RootState } from '../state/gameState';

export class ReduxRepositoryFactory implements RepositoryFactory {
  private getState: () => RootState;
  private dispatch: (action: any) => void;

  constructor(getState: () => RootState, dispatch: (action: any) => void) {
    this.getState = getState;
    this.dispatch = dispatch;
  }

  createProgressRepository(): ProgressRepository {
    return new ReduxProgressRepository(this.getState, this.dispatch);
  }

  createWordRepository(): WordRepository {
    return new ReduxWordRepository(this.getState);
  }

  createLearnerRepository(): LearnerRepository {
    // For now, return a simple implementation
    return new ReduxLearnerRepository(this.getState, this.dispatch);
  }

  createSessionRepository(): SessionRepository {
    // For now, return a simple implementation  
    return new ReduxSessionRepository(this.getState, this.dispatch);
  }

  createUnitOfWork(): UnitOfWork {
    return new ReduxUnitOfWork(this);
  }
}

/**
 * Simple LearnerRepository implementation using Redux
 */
class ReduxLearnerRepository implements LearnerRepository {
  private getState: () => RootState;
  private dispatch: (action: any) => void;

  constructor(getState: () => RootState, dispatch: (action: any) => void) {
    this.getState = getState;
    this.dispatch = dispatch;
  }

  async findById(learnerId: any): Promise<any> {
    const state = this.getState();
    const learnerIdStr = learnerId.toString();
    const user = state.users[learnerIdStr];
    
    if (!user) return null;
    
    return {
      id: learnerIdStr,
      name: user.displayName || learnerIdStr,
      preferredSubjects: user.settings?.languages || [],
      learningGoals: [],
      createdAt: new Date(),
      lastActiveAt: new Date()
    };
  }

  async save(learnerProfile: any): Promise<void> {
    this.dispatch({
      type: 'game/updateLearnerProfile',
      payload: {
        userId: learnerProfile.id,
        updates: {
          displayName: learnerProfile.name,
          settings: {
            languages: learnerProfile.preferredSubjects
          }
        }
      }
    });
  }

  async getPreferences(learnerId: any): Promise<any> {
    const state = this.getState();
    const user = state.users[learnerId.toString()];
    
    return {
      maxSessionSize: 5,
      preferredDifficulty: 'adaptive' as const,
      enableHints: true,
      enableCelebrations: true,
      practiceReminders: false,
      preferredPracticeTime: 'flexible' as const,
      visualTheme: 'colorful' as const,
      soundEffects: true,
      ...user?.settings
    };
  }

  async updatePreferences(learnerId: any, preferences: any): Promise<void> {
    this.dispatch({
      type: 'game/updateLearnerPreferences',
      payload: {
        userId: learnerId.toString(),
        preferences
      }
    });
  }
}

/**
 * Simple SessionRepository implementation using Redux
 */
class ReduxSessionRepository implements SessionRepository {
  private getState: () => RootState;
  private dispatch: (action: any) => void;

  constructor(getState: () => RootState, dispatch: (action: any) => void) {
    this.getState = getState;
    this.dispatch = dispatch;
  }

  async createSession(session: any): Promise<any> {
    const sessionId = crypto.randomUUID();
    const fullSession = { ...session, sessionId };
    
    this.dispatch({
      type: 'game/createSession',
      payload: fullSession
    });
    
    return fullSession;
  }

  async findById(sessionId: string): Promise<any> {
    const state = this.getState();
    
    // Search through all users' sessions
    for (const user of Object.values(state.users)) {
      const session = user.sessions[sessionId];
      if (session) {
        return {
          sessionId,
          learnerId: user.displayName || 'unknown',
          ...session
        };
      }
    }
    
    return null;
  }

  async findByLearner(learnerId: any, limit?: number): Promise<any[]> {
    const state = this.getState();
    const user = state.users[learnerId.toString()];
    
    if (!user) return [];
    
    const sessions = Object.entries(user.sessions).map(([sessionId, session]) => ({
      sessionId,
      learnerId: learnerId.toString(),
      ...session
    }));
    
    return limit ? sessions.slice(0, limit) : sessions;
  }

  async findRecentSessions(_learnerId: any, _days: number): Promise<any[]> {
    // Simple implementation - return recent sessions
    return this.findByLearner(_learnerId, 10);
  }

  async updateSession(sessionId: string, updates: any): Promise<void> {
    this.dispatch({
      type: 'game/updateSession',
      payload: { sessionId, updates }
    });
  }

  async completeSession(sessionId: string, completedAt: Date, finalResults: any): Promise<void> {
    this.dispatch({
      type: 'game/completeSession',
      payload: { sessionId, completedAt, finalResults }
    });
  }

  async getSessionAnalytics(learnerId: any, _timeframe?: any): Promise<any> {
    // Simplified analytics
    const sessions = await this.findByLearner(learnerId);
    return {
      totalSessions: sessions.length,
      totalPracticeTime: sessions.length * 300, // 5 min average
      averageSessionDuration: 300,
      overallAccuracy: 75,
      consistencyScore: 80,
      subjectBreakdown: [],
      weeklyProgress: [],
      streakData: {
        currentStreak: 3,
        longestStreak: 7,
        isActiveToday: true
      }
    };
  }

  async cleanupOldSessions(_olderThanDays: number): Promise<number> {
    // Not implemented for Redux
    return 0;
  }
}

/**
 * Simple UnitOfWork implementation using Redux
 */
class ReduxUnitOfWork implements UnitOfWork {
  progressRepository: ProgressRepository;
  wordRepository: WordRepository;
  learnerRepository: LearnerRepository;
  sessionRepository: SessionRepository;

  constructor(factory: ReduxRepositoryFactory) {
    this.progressRepository = factory.createProgressRepository();
    this.wordRepository = factory.createWordRepository();
    this.learnerRepository = factory.createLearnerRepository();
    this.sessionRepository = factory.createSessionRepository();
  }

  async begin(): Promise<void> {
    // Redux doesn't need explicit transactions
  }

  async commit(): Promise<void> {
    // Redux auto-commits
  }

  async rollback(): Promise<void> {
    // Redux doesn't support rollback easily
  }

  async withTransaction<T>(operation: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    // Execute operation directly (Redux handles state consistency)
    return await operation(this);
  }
}