/**
 * 🎯 Domain Events: Enhanced Business Process Events
 * 
 * These events represent important business moments that enable
 * event-driven architecture and business process visibility.
 */

import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

/**
 * Base class for all domain events
 */
export abstract class DomainEvent {
  protected readonly occurredAt: Date;
  protected readonly eventId: string;

  constructor() {
    this.occurredAt = new Date();
    this.eventId = crypto.randomUUID();
  }

  getOccurredAt(): Date {
    return this.occurredAt;
  }

  getEventId(): string {
    return this.eventId;
  }

  abstract getEventType(): string;
  abstract toJson(): Record<string, any>;
}

/**
 * 🎯 Practice Session Started Event
 */
export class PracticeSessionStarted extends DomainEvent {
  private learnerId: LearnerId;
  private sessionId: string;
  private subject: string;
  private complexityLevel: number;
  private wordCount: number;
  private sessionType: 'learning' | 'revision' | 'mixed';

  constructor(
    learnerId: LearnerId,
    sessionId: string,
    subject: string,
    complexityLevel: number,
    wordCount: number,
    sessionType: 'learning' | 'revision' | 'mixed'
  ) {
    super();
    this.learnerId = learnerId;
    this.sessionId = sessionId;
    this.subject = subject;
    this.complexityLevel = complexityLevel;
    this.wordCount = wordCount;
    this.sessionType = sessionType;
  }

  getEventType(): string {
    return 'practice-session-started';
  }

  getLearnerId(): LearnerId {
    return this.learnerId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSubject(): string {
    return this.subject;
  }

  getComplexityLevel(): number {
    return this.complexityLevel;
  }

  getWordCount(): number {
    return this.wordCount;
  }

  getSessionType(): 'learning' | 'revision' | 'mixed' {
    return this.sessionType;
  }

  toJson(): Record<string, any> {
    return {
      eventType: this.getEventType(),
      eventId: this.eventId,
      occurredAt: this.occurredAt.toISOString(),
      learnerId: this.learnerId.toString(),
      sessionId: this.sessionId,
      subject: this.subject,
      complexityLevel: this.complexityLevel,
      wordCount: this.wordCount,
      sessionType: this.sessionType
    };
  }
}

/**
 * 🎯 Practice Session Completed Event
 */
export class PracticeSessionCompleted extends DomainEvent {
  private learnerId: LearnerId;
  private sessionId: string;
  private correctAnswers: number;
  private totalQuestions: number;
  private durationSeconds: number;
  private wordsAdvanced: WordId[];

  constructor(
    learnerId: LearnerId,
    sessionId: string,
    correctAnswers: number,
    totalQuestions: number,
    durationSeconds: number,
    wordsAdvanced: WordId[]
  ) {
    super();
    this.learnerId = learnerId;
    this.sessionId = sessionId;
    this.correctAnswers = correctAnswers;
    this.totalQuestions = totalQuestions;
    this.durationSeconds = durationSeconds;
    this.wordsAdvanced = [...wordsAdvanced];
  }

  getEventType(): string {
    return 'practice-session-completed';
  }

  getAccuracyPercentage(): number {
    return this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
  }

  getLearnerId(): LearnerId {
    return this.learnerId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getCorrectAnswers(): number {
    return this.correctAnswers;
  }

  getTotalQuestions(): number {
    return this.totalQuestions;
  }

  getDurationSeconds(): number {
    return this.durationSeconds;
  }

  getWordsAdvanced(): WordId[] {
    return [...this.wordsAdvanced];
  }

  toJson(): Record<string, any> {
    return {
      eventType: this.getEventType(),
      eventId: this.eventId,
      occurredAt: this.occurredAt.toISOString(),
      learnerId: this.learnerId.toString(),
      sessionId: this.sessionId,
      correctAnswers: this.correctAnswers,
      totalQuestions: this.totalQuestions,
      durationSeconds: this.durationSeconds,
      accuracyPercentage: this.getAccuracyPercentage(),
      wordsAdvanced: this.wordsAdvanced.map(w => w.toString())
    };
  }
}

/**
 * 🎯 Achievement Unlocked Event
 */
export class AchievementUnlocked extends DomainEvent {
  private learnerId: LearnerId;
  private achievementType: 'first-mastery' | 'level-completion' | 'streak-milestone' | 'accuracy-milestone';
  private achievementName: string;
  private description: string;
  private celebrationLevel: 'small' | 'medium' | 'large' | 'epic';

  constructor(
    learnerId: LearnerId,
    achievementType: 'first-mastery' | 'level-completion' | 'streak-milestone' | 'accuracy-milestone',
    achievementName: string,
    description: string,
    celebrationLevel: 'small' | 'medium' | 'large' | 'epic'
  ) {
    super();
    this.learnerId = learnerId;
    this.achievementType = achievementType;
    this.achievementName = achievementName;
    this.description = description;
    this.celebrationLevel = celebrationLevel;
  }

  getEventType(): string {
    return 'achievement-unlocked';
  }

  getLearnerId(): LearnerId {
    return this.learnerId;
  }

  getAchievementType(): 'first-mastery' | 'level-completion' | 'streak-milestone' | 'accuracy-milestone' {
    return this.achievementType;
  }

  getAchievementName(): string {
    return this.achievementName;
  }

  getDescription(): string {
    return this.description;
  }

  getCelebrationLevel(): 'small' | 'medium' | 'large' | 'epic' {
    return this.celebrationLevel;
  }

  toJson(): Record<string, any> {
    return {
      eventType: this.getEventType(),
      eventId: this.eventId,
      occurredAt: this.occurredAt.toISOString(),
      learnerId: this.learnerId.toString(),
      achievementType: this.achievementType,
      achievementName: this.achievementName,
      description: this.description,
      celebrationLevel: this.celebrationLevel
    };
  }
}

/**
 * 🎯 Event Collection for gathering events from domain operations
 */
export type DomainEventCollection = DomainEvent[];

/**
 * 🎯 Event Dispatcher Interface - implemented by infrastructure
 */
export interface DomainEventDispatcher {
  dispatch(event: DomainEvent): void;
  dispatchAll(events: DomainEventCollection): void;
  subscribe(eventType: string, handler: (event: DomainEvent) => void): void;
  unsubscribe(eventType: string, handler: (event: DomainEvent) => void): void;
}

/**
 * 🎯 Event Factory for convenient event creation
 */
export class DomainEventFactory {
  static sessionStarted(
    learnerId: LearnerId,
    sessionId: string,
    subject: string,
    complexityLevel: number,
    wordCount: number,
    sessionType: 'learning' | 'revision' | 'mixed'
  ): PracticeSessionStarted {
    return new PracticeSessionStarted(learnerId, sessionId, subject, complexityLevel, wordCount, sessionType);
  }

  static sessionCompleted(
    learnerId: LearnerId,
    sessionId: string,
    correctAnswers: number,
    totalQuestions: number,
    durationSeconds: number,
    wordsAdvanced: WordId[]
  ): PracticeSessionCompleted {
    return new PracticeSessionCompleted(learnerId, sessionId, correctAnswers, totalQuestions, durationSeconds, wordsAdvanced);
  }

  static achievementUnlocked(
    learnerId: LearnerId,
    achievementType: 'first-mastery' | 'level-completion' | 'streak-milestone' | 'accuracy-milestone',
    achievementName: string,
    description: string,
    celebrationLevel: 'small' | 'medium' | 'large' | 'epic'
  ): AchievementUnlocked {
    return new AchievementUnlocked(learnerId, achievementType, achievementName, description, celebrationLevel);
  }
}