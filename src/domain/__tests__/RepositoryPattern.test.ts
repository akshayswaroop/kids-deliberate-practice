/**
 * 🧪 Learning Test: Repository Pattern with Domain Services
 * 
 * This test demonstrates how repository interfaces enable
 * clean separation between domain logic and data access,
 * and how to test domain services with mock repositories.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { EnhancedPracticeSessionService } from '../services/EnhancedPracticeSessionService';
import type { EnhancedSessionRequirements } from '../services/EnhancedPracticeSessionService';
import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';
import { ProgressTracker } from '../entities/ProgressTracker';
import type { WordRepository, ProgressRepository, WordDrill } from '../repositories';

describe('Repository Pattern with Domain Services', () => {
  let sessionService: EnhancedPracticeSessionService;
  let mockWordRepository: WordRepository;
  let mockProgressRepository: ProgressRepository;
  let learnerId: LearnerId;

  beforeEach(() => {
    // Create mock repositories with domain-focused interfaces
    mockWordRepository = {
      findById: vi.fn(),
      findBySubjectAndLevel: vi.fn(),
      findBySubject: vi.fn(),
      getAvailableSubjects: vi.fn(),
      getComplexityLevels: vi.fn(),
      searchByText: vi.fn(),
      getRecommendedWords: vi.fn(),
      getWordCount: vi.fn()
    };

    mockProgressRepository = {
      findByWordAndLearner: vi.fn(),
      findByLearner: vi.fn(),
      findByWordsAndLearner: vi.fn(),
      findMasteredByLearnerAndSubject: vi.fn(),
      save: vi.fn(),
      saveAll: vi.fn(),
      delete: vi.fn(),
      getStatistics: vi.fn()
    };

    // Inject dependencies via constructor (Dependency Inversion Principle)
    sessionService = new EnhancedPracticeSessionService(
      mockWordRepository,
      mockProgressRepository
    );

    learnerId = LearnerId.fromString('learner_123');
  });

  test('should use repositories to generate session with domain logic', async () => {
    // Arrange - Set up repository responses
    const mockWords: WordDrill[] = [
      { id: 'word1', text: 'cat', subject: 'english', complexityLevel: 1 },
      { id: 'word2', text: 'dog', subject: 'english', complexityLevel: 1 },
      { id: 'word3', text: 'bird', subject: 'english', complexityLevel: 1 }
    ];

    const progressMap = new Map<string, ProgressTracker>();
    const strugglingTracker = ProgressTracker.createNew(WordId.fromString('word2'), learnerId);
    strugglingTracker.recordAttempt(true); // progress = 1 (struggling)
    progressMap.set('word2', strugglingTracker);

    // Configure mock repository responses
    vi.mocked(mockWordRepository.findBySubjectAndLevel).mockResolvedValue(mockWords);
    vi.mocked(mockProgressRepository.findByWordsAndLearner).mockResolvedValue(progressMap);

    const requirements: EnhancedSessionRequirements = {
      learnerId,
      subject: 'english',
      complexityLevel: 1,
      maxSessionSize: 2
    };

    // Act - Call domain service method
    const session = await sessionService.generateSessionFromRepositories(requirements);

    // Assert - Repository interfaces were used correctly
    expect(mockWordRepository.findBySubjectAndLevel).toHaveBeenCalledWith('english', 1);
    expect(mockProgressRepository.findByWordsAndLearner).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ value: 'word1' }),
        expect.objectContaining({ value: 'word2' }),
        expect.objectContaining({ value: 'word3' })
      ]),
      learnerId
    );

    // Assert - Domain logic applied correctly
    expect(session.selectedWordIds).toHaveLength(2);
    expect(session.selectedWordIds[0].toString()).toBe('word2'); // Struggling word prioritized
    expect(session.sessionType).toBe('learning');
    expect(session.reasoning).toContain('1 struggling words');
    expect(session.estimatedDuration).toBe(3); // 2 words * 1.5 minutes
  });

  test('should determine level progression using repository data', async () => {
    // Arrange - Mock repository responses for level progression
    const masteredTrackers = [
      ProgressTracker.createNew(WordId.fromString('word1'), learnerId),
      ProgressTracker.createNew(WordId.fromString('word2'), learnerId)
    ];
    
    // Simulate mastery
    masteredTrackers.forEach(tracker => {
      tracker.recordAttempt(true);
      tracker.recordAttempt(true); // progress = 2 (mastered)
    });

    vi.mocked(mockProgressRepository.findMasteredByLearnerAndSubject)
      .mockResolvedValue(masteredTrackers);
    vi.mocked(mockWordRepository.getWordCount).mockResolvedValue(3); // 3 total words in level

    // Act
    const shouldProgress = await sessionService.shouldProgressToNextLevel(
      learnerId,
      'math',
      1
    );

    // Assert - Business rule: progress when 80% mastered (2/3 = 66.7% < 80%)
    expect(shouldProgress).toBe(false);
    expect(mockProgressRepository.findMasteredByLearnerAndSubject)
      .toHaveBeenCalledWith(learnerId, 'math');
    expect(mockWordRepository.getWordCount).toHaveBeenCalledWith('math', 1);
  });

  test('should get learning statistics through repository', async () => {
    // Arrange - Mock statistics data
    const mockStats = {
      totalWordsAttempted: 15,
      totalWordsMastered: 8,
      masteryPercentage: 53.3,
      averageAttemptsToMastery: 2.4,
      subjectBreakdown: [
        {
          subject: 'math',
          wordsAttempted: 10,
          wordsMastered: 5,
          masteryPercentage: 50,
          averageAccuracy: 75
        }
      ],
      currentStreak: 3,
      longestStreak: 7
    };

    vi.mocked(mockProgressRepository.getStatistics).mockResolvedValue(mockStats);

    // Act
    const stats = await sessionService.getLearningStatistics(learnerId);

    // Assert - Repository interface provides rich learning data
    expect(stats.totalWordsMastered).toBe(8);
    expect(stats.masteryPercentage).toBe(53.3);
    expect(stats.subjectBreakdown).toHaveLength(1);
    expect(stats.subjectBreakdown[0].subject).toBe('math');
    expect(mockProgressRepository.getStatistics).toHaveBeenCalledWith(learnerId);
  });

  test('should handle empty repository responses gracefully', async () => {
    // Arrange - Empty repository responses
    vi.mocked(mockWordRepository.findBySubjectAndLevel).mockResolvedValue([]);
    vi.mocked(mockProgressRepository.findByWordsAndLearner).mockResolvedValue(new Map());

    const requirements: EnhancedSessionRequirements = {
      learnerId,
      subject: 'nonexistent',
      complexityLevel: 99,
      maxSessionSize: 5
    };

    // Act
    const session = await sessionService.generateSessionFromRepositories(requirements);

    // Assert - Graceful handling of empty data
    expect(session.selectedWordIds).toHaveLength(0);
    expect(session.sessionType).toBe('learning');
    expect(session.reasoning).toContain('No words available');
    expect(session.estimatedDuration).toBe(0);
  });
});

/**
 * 🎓 LEARNING MOMENT: Repository Pattern Benefits
 * 
 * Compare to the OLD tightly-coupled approach:
 * 
 * // ❌ OLD: Domain service directly accessing Redux store
 * class PracticeSessionService {
 *   generateSession() {
 *     const words = store.getState().words.items; // Tight coupling!
 *     const progress = store.getState().progress.trackers; // Infrastructure leak!
 *   }
 * }
 * 
 * // ✅ NEW: Domain service uses repository interfaces
 * class EnhancedPracticeSessionService {
 *   constructor(wordRepo: WordRepository, progressRepo: ProgressRepository) {}
 *   
 *   async generateSession() {
 *     const words = await this.wordRepository.findBySubjectAndLevel(...);
 *     const progress = await this.progressRepository.findByWordsAndLearner(...);
 *   }
 * }
 * 
 * Key Benefits:
 * 
 * 1. **Dependency Inversion**: Domain depends on abstractions, not concrete implementations
 * 2. **Testability**: Easy to mock repositories for unit testing
 * 3. **Flexibility**: Can swap implementations (Redux → Database → API) without changing domain
 * 4. **Domain Focus**: Repository interfaces express domain needs, not infrastructure capabilities
 * 5. **Clean Architecture**: Clear separation between domain and infrastructure layers
 * 6. **Async Support**: Repository interfaces naturally support async data access
 * 
 * Infrastructure Layer Responsibilities:
 * - Implement repository interfaces
 * - Handle data persistence details (Redux, localStorage, API calls)
 * - Map between domain objects and storage formats
 * - Manage transactions and connections
 * 
 * Domain Layer Responsibilities:
 * - Define what data access operations are needed
 * - Implement business logic using repository data
 * - Generate domain events for business processes
 * - Maintain domain integrity rules
 */