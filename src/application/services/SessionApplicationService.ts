/**
 * Application Service for Session Management
 * 
 * Coordinates between domain services and infrastructure state management
 * for session-related operations following DDD principles.
 */

import { SessionGenerationService } from '../../domain/services/SessionGenerationService';
import { MasteryConfiguration } from '../../domain/value-objects/ModeConfiguration';
import type { Word } from '../../infrastructure/state/gameState';

export interface SessionApplicationServiceInterface {
  generateSession(words: Word[], sessionSize: number): string[];
  shouldProgressLevel(words: Word[]): boolean;
  getDefaultSessionSize(): number;
}

/**
 * Session Application Service
 * 
 * Bridges the gap between domain logic and infrastructure concerns
 * by coordinating session generation and level progression rules.
 */
export class SessionApplicationService implements SessionApplicationServiceInterface {
  
  /**
   * Generate a new practice session using domain rules
   * 
   * @param words Available words for the session
   * @param sessionSize Desired session size
   * @returns Array of word IDs for the session
   */
  generateSession(words: Word[], sessionSize: number): string[] {
    return SessionGenerationService.selectSessionWords(words, sessionSize);
  }

  /**
   * Check if user should progress to next complexity level
   * 
   * @param words Words at current complexity level
   * @returns Whether progression should occur
   */
  shouldProgressLevel(words: Word[]): boolean {
    return SessionGenerationService.shouldProgressLevel(words);
  }

  /**
   * Get default session size from domain rules
   * 
   * @returns Default session size
   */
  getDefaultSessionSize(): number {
    return SessionGenerationService.getDefaultSessionSize();
  }

  /**
   * Check if a word is mastered using domain rules
   * 
   * @param word Word to check
   * @returns Whether the word is mastered
   */
  isWordMastered(word: Word): boolean {
    return MasteryConfiguration.isMastered(word);
  }

  /**
   * Filter words by mastery status
   * 
   * @param words Words to filter
   * @returns Object with mastered and unmastered word arrays
   */
  filterWordsByMastery(words: Word[]): { mastered: Word[]; unmastered: Word[] } {
    const mastered: Word[] = [];
    const unmastered: Word[] = [];

    words.forEach(word => {
      if (this.isWordMastered(word)) {
        mastered.push(word);
      } else {
        unmastered.push(word);
      }
    });

    return { mastered, unmastered };
  }
}