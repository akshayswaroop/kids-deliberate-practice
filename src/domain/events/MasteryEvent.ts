/**
 * Domain Event: MasteryEvent
 * 
 * Represents important business events related to mastery changes.
 * Events are how aggregates communicate changes to the outside world.
 */

import { WordId } from '../value-objects/WordId';
import { LearnerId } from '../value-objects/LearnerId';

export class MasteryEvent {
  private eventType: 'mastery-achieved' | 'mastery-lost';
  private wordId: WordId;
  private learnerId: LearnerId;
  private newProgress: number;
  private timestamp: Date;

  private constructor(
    eventType: 'mastery-achieved' | 'mastery-lost',
    wordId: WordId,
    learnerId: LearnerId,
    newProgress: number,
    timestamp: Date = new Date()
  ) {
    this.eventType = eventType;
    this.wordId = wordId;
    this.learnerId = learnerId;
    this.newProgress = newProgress;
    this.timestamp = timestamp;
  }

  static masteryAchieved(wordId: WordId, learnerId: LearnerId, progress: number): MasteryEvent {
    return new MasteryEvent('mastery-achieved', wordId, learnerId, progress);
  }

  static masteryLost(wordId: WordId, learnerId: LearnerId, progress: number): MasteryEvent {
    return new MasteryEvent('mastery-lost', wordId, learnerId, progress);
  }

  getEventType(): 'mastery-achieved' | 'mastery-lost' {
    return this.eventType;
  }

  getWordId(): WordId {
    return this.wordId;
  }

  getLearnerId(): LearnerId {
    return this.learnerId;
  }

  getNewProgress(): number {
    return this.newProgress;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }
}