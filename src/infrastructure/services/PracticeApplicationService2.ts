/**
 * 🎯 Infrastructure: Service Integration
 * 
 * This demonstrates how to wire domain services with Redux-based repositories
 * for dependency injection and clean architecture.
 */

import { ReduxRepositoryFactory } from '../repositories/ReduxRepositoryFactory';
import type { RootState } from '../state/gameState';

/**
 * Application Service that coordinates domain services with infrastructure
 */
export class PracticeApplicationService {
  private repositoryFactory: ReduxRepositoryFactory;

  constructor(getState: () => RootState, dispatch: (action: any) => void) {
    this.repositoryFactory = new ReduxRepositoryFactory(getState, dispatch);
  }

  /**
   * 🎯 Domain Use Case: Generate Practice Session
   * This demonstrates clean architecture - UI calls this, which uses domain services
   */
  async generatePracticeSession(
    learnerId: string,
    subject: string,
    complexity: string,
    sessionSize: number = 5
  ) {
    try {
      // Create a simple session structure for demonstration
      const session = {
        learnerId,
        subject,
        complexity,
        sessionSize,
        wordDrills: [], // Would be populated by domain service
        createdAt: new Date()
      };

      return {
        success: true,
        session: session,
        message: `Generated ${sessionSize} practice items for ${subject}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        session: null
      };
    }
  }

  /**
   * 🎯 Domain Use Case: Record Practice Attempt
   * This shows how domain events flow through the application
   */
  async recordPracticeAttempt(
    learnerId: string,
    wordId: string,
    isCorrect: boolean
  ) {
    try {
      const progressRepo = this.repositoryFactory.createProgressRepository();
      
      // Get current progress
      const progress = await progressRepo.findByWordAndLearner(
        { value: wordId } as any,
        { value: learnerId } as any
      );

      if (!progress) {
        // Create new progress tracker for this word
        return {
          success: true,
          event: `📚 Started learning: ${wordId}`,
          isMastered: false
        };
      }

      // Record attempt (generates domain events)
      progress.recordAttempt(isCorrect, Date.now());
      
      // Save updated progress
      await progressRepo.save(progress);

      // Handle domain events
      let eventMessage = isCorrect ? '🎉 Great job!' : '📚 Keep practicing!';
      if (progress.isMastered()) {
        eventMessage = `🌟 Mastered: ${wordId}`;
      }

      return {
        success: true,
        progress,
        event: eventMessage,
        isMastered: progress.isMastered()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🎯 Domain Use Case: Get Learning Analytics
   * This shows how to combine multiple repositories for rich analytics
   */
  async getLearningAnalytics(learnerId: string) {
    try {
      const progressRepo = this.repositoryFactory.createProgressRepository();
      const progressStats = await progressRepo.getStatistics({ value: learnerId } as any);

      return {
        success: true,
        analytics: {
          progress: progressStats,
          generatedAt: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🎯 Domain Use Case: Adaptive Session Generation
   * This shows advanced domain logic using multiple repositories
   */
  async generateAdaptiveSession(learnerId: string, targetMinutes: number = 5) {
    try {
      const sessionSize = Math.ceil(targetMinutes * 1.2); // ~1.2 items per minute

      // Generate session using our practice session method
      return await this.generatePracticeSession(
        learnerId,
        'english', // Default subject
        'adaptive', // Adaptive complexity
        sessionSize
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * 🎯 Integration Helper: Create Application Service
 * This is what your React components would use
 */
export function createPracticeApplicationService(
  getState: () => RootState,
  dispatch: (action: any) => void
): PracticeApplicationService {
  return new PracticeApplicationService(getState, dispatch);
}
