/**
 * Mastery Business Rules - Domain Constants
 *
 * Pure domain helper that tells whether a word is mastered.
 */

export class MasteryConfiguration {
  // Centralized threshold for considering a word "mastered"
  static readonly MASTER_STEP = 2; // Words with step >= MASTER_STEP are considered mastered

  // Helper to check mastery on a word object (keeps domain logic consistent)
  static isMastered(word: { step: number } | undefined | null): boolean {
    if (!word) return false;
    return (word.step || 0) >= this.MASTER_STEP;
  }
}
