/**
 * Domain Service for Session Generation
 * 
 * Contains pure business logic for selecting words for practice sessions
 * based on mastery levels, complexity, and learning progression rules.
 */

import { MasteryConfiguration } from '../value-objects/MasteryConfiguration';

export interface Word {
  id: string;
  step: number;
  complexityLevel: number;
  lastPracticedAt?: number;
}

/**
 * Session Generation Domain Service
 * 
 * Encapsulates business rules for word selection and session creation
 * without any infrastructure dependencies.
 */
export class SessionGenerationService {
  /**
   * Simplified session word selection based on domain rules:
   * - Only picks unmastered words (per mastery helper)
   * - Prioritises current complexity level words (caller supplies appropriate pool)
   * - If caller passes a mixed pool (multiple levels) we sort by:
   *     1. complexityLevel ascending
   *     2. step ascending
   *     3. lastPracticedAt (older first; undefined treated as 0)
   *     4. id (stable deterministic tie-break)
   * - Returns up to `size` ids (may be fewer if insufficient unmastered words)
   */
  static selectSessionWords(allWords: Word[], size: number): string[] {
    const unmastered = allWords.filter(w => 
      (w.step === undefined) || !MasteryConfiguration.isMastered(w)
    );
    
    // Sort deterministically according to priority rules
    unmastered.sort((a, b) => {
      if (a.complexityLevel !== b.complexityLevel) {
        return a.complexityLevel - b.complexityLevel;
      }
      
      const stepA = a.step ?? 0; 
      const stepB = b.step ?? 0;
      if (stepA !== stepB) {
        return stepA - stepB;
      }
      
      const lpA = a.lastPracticedAt || 0; 
      const lpB = b.lastPracticedAt || 0;
      if (lpA !== lpB) {
        return lpA - lpB;
      }
      
      return a.id.localeCompare(b.id);
    });

    const selected = unmastered.slice(0, size).map(w => w.id);
    return selected;
  }

  /**
   * Domain rule: Check if session should progress to next level
   * All words at current level must be mastered for progression
   */
  static shouldProgressLevel(words: Word[]): boolean {
    if (words.length === 0) return false;
    return words.every(word => MasteryConfiguration.isMastered(word));
  }

  /**
   * Domain rule: Get default session size
   * Can be overridden by user preferences in application layer
   */
  static getDefaultSessionSize(): number {
    return 12; // Business rule: Default practice session size
  }
}
