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
    const turnaroundCount = this.calculateTurnarounds(masteredWords);

    return {
      totalWordsAttempted: wordsWithAttempts.length,
      totalWordsMastered: masteredWords.length,
      masteryPercentage: wordsWithAttempts.length > 0 
        ? (masteredWords.length / wordsWithAttempts.length) * 100 
        : 0,
      averageAttemptsToMastery: this.calculateAverageAttemptsToMastery(masteredWords),
      subjectBreakdown: subjectStats,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      turnaroundCount
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
      longestStreak: 0,
      turnaroundCount: 0
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
    if (words.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Extract all practice dates (YYYY-MM-DD format)
    const practiceDates = new Set<string>();
    for (const word of words) {
      if (word.attempts && word.attempts.length > 0) {
        for (const attempt of word.attempts) {
          const date = new Date(attempt.timestamp);
          const dateStr = date.toISOString().split('T')[0];
          practiceDates.add(dateStr);
        }
      }
    }

    if (practiceDates.size === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Convert to sorted array of dates
    const sortedDates = Array.from(practiceDates)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    // Calculate current streak (consecutive days ending today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastPracticeDate = sortedDates[sortedDates.length - 1];
    lastPracticeDate.setHours(0, 0, 0, 0);
    const isActiveToday = lastPracticeDate.getTime() === today.getTime();

    let currentStreak = 0;
    const checkDate = new Date(today);
    if (!isActiveToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const practiceDate = sortedDates[i];
      practiceDate.setHours(0, 0, 0, 0);
      
      if (practiceDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  /**
   * 🌱 Calculate turnarounds: words that were once wrong but now mastered
   * 
   * Shows growth and resilience - "You conquered 18 tricky words!"
   */
  private calculateTurnarounds(masteredWords: any[]): number {
    return masteredWords.filter(word => {
      // Must be currently mastered (step >= 2)
      if (word.step < 2) return false;
      
      // Must have at least one wrong attempt in history
      const hasWrongAttempt = word.attempts.some((attempt: any) => 
        attempt.result === 'wrong'
      );
      
      return hasWrongAttempt;
    }).length;
  }
}