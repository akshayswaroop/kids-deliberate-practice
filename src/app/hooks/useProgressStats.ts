/**
 * 🎯 useProgressStats Hook
 * 
 * Application layer hook for accessing progress statistics.
 * Follows DDD architecture by separating UI from infrastructure.
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../infrastructure/state/gameState';
import { store } from '../../infrastructure/store';
import { ReduxRepositoryFactory } from '../../infrastructure/repositories/ReduxRepositoryFactory';
import { LearnerId } from '../../domain/value-objects/LearnerId';
import type { LearningStatistics } from '../../domain/repositories/ProgressRepository';

interface UseProgressStatsOptions {
  userId: string | null;
  subject?: string;
}

interface ProgressStatsResult {
  stats: LearningStatistics | null;
  loading: boolean;
  error: Error | null;
  todayAttempts: number; // Number of questions attempted today
}

/**
 * Hook to fetch and track progress statistics for a learner.
 * Automatically updates when user attempts change.
 * 
 * @param options - Configuration including userId and optional subject filter
 * @returns Statistics, loading state, and any errors
 */
export function useProgressStats({ userId, subject }: UseProgressStatsOptions): ProgressStatsResult {
  const [stats, setStats] = useState<LearningStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [todayAttempts, setTodayAttempts] = useState<number>(0);
  
  // Track state changes to reload stats - monitors attempts across all words
  const stateVersion = useSelector((state: { game: RootState }) => {
    const user = userId ? state.game.users[userId] : null;
    if (!user) return 0;
    // Track both word count and total attempts to trigger updates
    const wordCount = Object.keys(user.words).length;
    const attemptCount = Object.values(user.words).reduce((sum, word) => sum + word.attempts.length, 0);
    return wordCount * 1000000 + attemptCount;
  });
  
  useEffect(() => {
    const loadStats = async () => {
      if (!userId) {
        setStats(null);
        setTodayAttempts(0);
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get current user's words from state
        const state = store.getState().game;
        const user = state.users[userId];
        
        // Calculate today's attempts (subject-specific if subject is provided)
        let todayCount = 0;
        if (user) {
          for (const word of Object.values(user.words)) {
            // Filter by subject if provided
            if (subject && word.language !== subject) {
              continue;
            }
            
            // Count attempts from today
            for (const attempt of word.attempts) {
              const attemptDate = new Date(attempt.timestamp).toISOString().split('T')[0];
              if (attemptDate === today) {
                todayCount++;
              }
            }
          }
        }
        
        setTodayAttempts(todayCount);
        
        // Use repository pattern through factory
        const factory = new ReduxRepositoryFactory(
          () => store.getState().game,
          store.dispatch
        );
        const progressRepo = factory.createProgressRepository();
        const learnerId = LearnerId.fromString(userId);
        const allStats = await progressRepo.getStatistics(learnerId);
        
        // Apply subject filter if provided
        let filteredStats = allStats;
        if (subject && allStats.subjectBreakdown) {
          const subjectStat = allStats.subjectBreakdown.find(s => s.subject === subject);
          if (subjectStat) {
            // Create subject-scoped stats (attempts only)
            // Streak and turnarounds remain global
            filteredStats = {
              ...allStats,
              totalWordsAttempted: subjectStat.wordsAttempted,
              totalWordsMastered: subjectStat.wordsMastered,
              masteryPercentage: subjectStat.masteryPercentage,
            };
          } else {
            // Subject has no data yet
            filteredStats = {
              totalWordsAttempted: 0,
              totalWordsMastered: 0,
              masteryPercentage: 0,
              averageAttemptsToMastery: 0,
              subjectBreakdown: [],
              currentStreak: allStats.currentStreak,
              longestStreak: allStats.longestStreak,
              turnaroundCount: allStats.turnaroundCount
            };
          }
        }
        
        setStats(filteredStats);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load stats'));
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [userId, stateVersion, subject]);
  
  return { stats, loading, error, todayAttempts };
}
