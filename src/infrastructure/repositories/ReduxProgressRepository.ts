/**
 * 🎯 Infrastructure: Redux Progress Repository
 * 
 * This implements the ProgressRepository interface using Redux as the storage layer.
 * It demonstrates how infrastructure implements domain interfaces.
 */

import type { ProgressRepository, LearningStatistics, SubjectStatistics } from '../../domain/repositories';
import { ProgressTracker } from '../../domain/entities/ProgressTracker';
import { WordId } from '../../domain/value-objects/WordId';
import { LearnerId } from '../../domain/value-objects/LearnerId';
import { ProgressTrackerMapper } from '../mappers/DomainMappers';
import type { RootState } from '../state/gameState';

export class ReduxProgressRepository implements ProgressRepository {
  private getState: () => RootState;
  private dispatch: (action: any) => void;

  constructor(
    getState: () => RootState,
    dispatch: (action: any) => void
  ) {
    this.getState = getState;
    this.dispatch = dispatch;
  }

  async findByWordAndLearner(wordId: WordId, learnerId: LearnerId): Promise<ProgressTracker | null> {
    const state = this.getState();
    const learnerIdStr = learnerId.toString();
    const wordIdStr = wordId.toString();

    const user = state.users[learnerIdStr];
    if (!user) return null;

    const reduxWord = user.words[wordIdStr];
    if (!reduxWord) return null;

    return ProgressTrackerMapper.toDomain(wordIdStr, learnerIdStr, reduxWord);
  }

  async findByLearner(learnerId: LearnerId): Promise<ProgressTracker[]> {
    const state = this.getState();
    const learnerIdStr = learnerId.toString();
    const user = state.users[learnerIdStr];
    
    if (!user) return [];

    const trackers: ProgressTracker[] = [];
    for (const [wordId, reduxWord] of Object.entries(user.words)) {
      if (reduxWord.attempts.length > 0) { // Only include words with attempts
        trackers.push(ProgressTrackerMapper.toDomain(wordId, learnerIdStr, reduxWord));
      }
    }

    return trackers;
  }

  async findByWordsAndLearner(wordIds: WordId[], learnerId: LearnerId): Promise<Map<string, ProgressTracker>> {
    const state = this.getState();
    const learnerIdStr = learnerId.toString();
    const user = state.users[learnerIdStr];
    
    const trackersMap = new Map<string, ProgressTracker>();
    
    if (!user) return trackersMap;

    for (const wordId of wordIds) {
      const wordIdStr = wordId.toString();
      const reduxWord = user.words[wordIdStr];
      
      if (reduxWord && reduxWord.attempts.length > 0) {
        const tracker = ProgressTrackerMapper.toDomain(wordIdStr, learnerIdStr, reduxWord);
        trackersMap.set(wordIdStr, tracker);
      }
    }

    return trackersMap;
  }

  async findMasteredByLearnerAndSubject(learnerId: LearnerId, subject: string): Promise<ProgressTracker[]> {
    const state = this.getState();
    const learnerIdStr = learnerId.toString();
    const user = state.users[learnerIdStr];
    
    if (!user) return [];

    const masteredTrackers: ProgressTracker[] = [];
    
    for (const [wordId, reduxWord] of Object.entries(user.words)) {
      // Filter by subject (Redux stores as 'language')
      if (reduxWord.language === subject && reduxWord.step >= 2) { // Business rule: step 2+ is mastered
        const tracker = ProgressTrackerMapper.toDomain(wordId, learnerIdStr, reduxWord);
        if (tracker.isMastered()) {
          masteredTrackers.push(tracker);
        }
      }
    }

    return masteredTrackers;
  }

  async save(progressTracker: ProgressTracker): Promise<void> {
    const wordIdStr = progressTracker.getWordId().toString();
    const learnerIdStr = progressTracker.getLearnerId().toString();
    
    // Convert domain entity back to Redux state
    const reduxUpdates = ProgressTrackerMapper.toRedux(progressTracker);
    
    // Dispatch Redux action to update the word
    this.dispatch({
      type: 'game/updateWordProgress',
      payload: {
        userId: learnerIdStr,
        wordId: wordIdStr,
        updates: reduxUpdates
      }
    });
  }

  async saveAll(progressTrackers: ProgressTracker[]): Promise<void> {
    // Batch save all trackers
    for (const tracker of progressTrackers) {
      await this.save(tracker);
    }
  }

  async delete(wordId: WordId, learnerId: LearnerId): Promise<void> {
    const wordIdStr = wordId.toString();
    const learnerIdStr = learnerId.toString();
    
    this.dispatch({
      type: 'game/resetWordProgress',
      payload: {
        userId: learnerIdStr,
        wordId: wordIdStr
      }
    });
  }

  async getStatistics(learnerId: LearnerId): Promise<LearningStatistics> {
    const state = this.getState();
    const learnerIdStr = learnerId.toString();
    const user = state.users[learnerIdStr];
    
    if (!user) {
      return this.createEmptyStatistics();
    }

    const wordsWithAttempts = Object.values(user.words).filter(word => word.attempts.length > 0);
    const masteredWords = wordsWithAttempts.filter(word => word.step >= 2);
    
    const subjectStats = this.calculateSubjectStatistics(wordsWithAttempts);
    const streakData = this.calculateStreakData(wordsWithAttempts);

    return {
      totalWordsAttempted: wordsWithAttempts.length,
      totalWordsMastered: masteredWords.length,
      masteryPercentage: wordsWithAttempts.length > 0 
        ? (masteredWords.length / wordsWithAttempts.length) * 100 
        : 0,
      averageAttemptsToMastery: this.calculateAverageAttemptsToMastery(masteredWords),
      subjectBreakdown: subjectStats,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak
    };
  }

  private createEmptyStatistics(): LearningStatistics {
    return {
      totalWordsAttempted: 0,
      totalWordsMastered: 0,
      masteryPercentage: 0,
      averageAttemptsToMastery: 0,
      subjectBreakdown: [],
      currentStreak: 0,
      longestStreak: 0
    };
  }

  private calculateSubjectStatistics(words: any[]): SubjectStatistics[] {
    const subjectMap = new Map<string, any[]>();
    
    // Group words by subject
    for (const word of words) {
      const subject = word.language;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, []);
      }
      subjectMap.get(subject)!.push(word);
    }
    
    // Calculate statistics for each subject
    const subjectStats: SubjectStatistics[] = [];
    for (const [subject, subjectWords] of subjectMap) {
      const masteredCount = subjectWords.filter(w => w.step >= 2).length;
      const totalAttempts = subjectWords.reduce((sum, w) => sum + w.attempts.length, 0);
      const correctAttempts = subjectWords.reduce((sum, w) => 
        sum + w.attempts.filter((a: any) => a.result === 'correct').length, 0);
      
      subjectStats.push({
        subject,
        wordsAttempted: subjectWords.length,
        wordsMastered: masteredCount,
        masteryPercentage: subjectWords.length > 0 ? (masteredCount / subjectWords.length) * 100 : 0,
        averageAccuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0
      });
    }
    
    return subjectStats;
  }

  private calculateAverageAttemptsToMastery(masteredWords: any[]): number {
    if (masteredWords.length === 0) return 0;
    
    const totalAttempts = masteredWords.reduce((sum, word) => sum + word.attempts.length, 0);
    return totalAttempts / masteredWords.length;
  }

  private calculateStreakData(words: any[]): { currentStreak: number; longestStreak: number } {
    // Simple implementation - could be enhanced with actual date-based streak calculation
    const recentWords = words.filter(w => w.lastPracticedAt && 
      (Date.now() - w.lastPracticedAt) < 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    return {
      currentStreak: recentWords.length > 0 ? 1 : 0, // Simplified
      longestStreak: Math.max(3, recentWords.length) // Simplified
    };
  }
}