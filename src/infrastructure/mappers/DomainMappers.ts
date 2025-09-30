/**
 * 🎯 Infrastructure: Domain Mappers
 * 
 * These mappers convert between domain objects and Redux state,
 * enabling clean separation between domain and infrastructure layers.
 */

import { ProgressTracker } from '../../domain/entities/ProgressTracker';
import { WordId } from '../../domain/value-objects/WordId';
import { LearnerId } from '../../domain/value-objects/LearnerId';
import type { Word } from '../state/gameState';
import type { WordDrill, LearnerProfile } from '../../domain/repositories';

/**
 * Maps Redux Word state to domain ProgressTracker entity
 */
export class ProgressTrackerMapper {
  static toDomain(wordId: string, learnerId: string, reduxWord: Word): ProgressTracker {
    const domainWordId = WordId.fromString(wordId);
    const domainLearnerId = LearnerId.fromString(learnerId);
    
    // Create ProgressTracker - we'll use createNew and then restore state
    const tracker = ProgressTracker.createNew(domainWordId, domainLearnerId);
    
    // Restore the state from Redux (we'll need to add this method to ProgressTracker)
    // For now, create attempts to simulate the progress
    for (let i = 0; i < reduxWord.step; i++) {
      tracker.recordAttempt(true); // Simulate correct attempts to reach current step
    }
    
    return tracker;
  }

  static toRedux(tracker: ProgressTracker): Partial<Word> {
    return {
      step: tracker.getProgress(),
      cooldownSessionsLeft: tracker.getCooldownSessionsLeft(),
      lastRevisedAt: tracker.getMasteryAchievedAt()?.getTime(),
      revealCount: tracker.getRevealCount(),
      attempts: tracker.getAttempts().map(attempt => ({
        timestamp: attempt.getTimestamp(),
        result: attempt.isCorrect() ? 'correct' as const : 'wrong' as const
      })),
      lastPracticedAt: tracker.getAttempts().length > 0 
        ? Math.max(...tracker.getAttempts().map(a => a.getTimestamp()))
        : undefined
    };
  }
}

/**
 * Maps Redux Word state to domain WordDrill
 */
export class WordDrillMapper {
  static toDomain(reduxWord: Word): WordDrill {
    return {
      id: reduxWord.id,
      text: reduxWord.text,
      subject: reduxWord.language, // Redux uses 'language', domain uses 'subject'
      complexityLevel: reduxWord.complexityLevel,
      category: reduxWord.category,
      metadata: {
        // Include Kannada-specific fields if present
        ...(reduxWord.wordKannada && { wordKannada: reduxWord.wordKannada }),
        ...(reduxWord.transliteration && { transliteration: reduxWord.transliteration }),
        ...(reduxWord.transliterationHi && { transliterationHi: reduxWord.transliterationHi }),
        ...(reduxWord.answer && { answer: reduxWord.answer }),
        ...(reduxWord.notes && { notes: reduxWord.notes })
      }
    };
  }
}

/**
 * Maps Redux User state to domain LearnerProfile
 */
export class LearnerProfileMapper {
  static toDomain(userId: string, reduxUser: any): LearnerProfile {
    return {
      id: userId,
      name: reduxUser.displayName || userId,
      preferredSubjects: reduxUser.settings?.languages || [],
      learningGoals: [], // Not in current Redux state, could be added
      createdAt: new Date(), // Not tracked in current Redux, could be added
      lastActiveAt: new Date() // Not tracked in current Redux, could be added
    };
  }
}

/**
 * Maps between domain and Redux session data
 */
export class SessionMapper {
  static sessionIdToDomain(sessionId: string) {
    return sessionId;
  }

  static sessionIdToRedux(sessionId: string) {
    return sessionId;
  }
}

/**
 * 🎯 Error handling for mapping operations
 */
export class MappingError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'MappingError';
    this.cause = cause;
  }
}

/**
 * 🎯 Validation helpers for mapping
 */
export class MappingValidation {
  static validateWordId(wordId: string): void {
    if (!wordId || typeof wordId !== 'string') {
      throw new MappingError(`Invalid wordId: ${wordId}`);
    }
  }

  static validateLearnerId(learnerId: string): void {
    if (!learnerId || typeof learnerId !== 'string') {
      throw new MappingError(`Invalid learnerId: ${learnerId}`);
    }
  }

  static validateReduxWord(word: any): void {
    if (!word || typeof word !== 'object') {
      throw new MappingError('Invalid Redux word object');
    }
    if (typeof word.step !== 'number') {
      throw new MappingError('Redux word missing valid step field');
    }
    if (!Array.isArray(word.attempts)) {
      throw new MappingError('Redux word missing attempts array');
    }
  }
}