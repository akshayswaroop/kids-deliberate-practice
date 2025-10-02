/**
 * Value Object: Attempt
 * 
 * Represents a single learning attempt with timestamp and result.
 */

export class Attempt {
  private timestamp: number;
  private result: 'correct' | 'wrong';

  private constructor(result: 'correct' | 'wrong', timestamp: number) {
    this.result = result;
    this.timestamp = timestamp;
  }

  static create(correct: boolean, timestamp: number): Attempt {
    return new Attempt(correct ? 'correct' : 'wrong', timestamp);
  }

  static fromData(data: { timestamp: number; result: 'correct' | 'wrong' }): Attempt {
    return new Attempt(data.result, data.timestamp);
  }

  isCorrect(): boolean {
    return this.result === 'correct';
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  getResult(): 'correct' | 'wrong' {
    return this.result;
  }

  toData(): { timestamp: number; result: 'correct' | 'wrong' } {
    return {
      timestamp: this.timestamp,
      result: this.result,
    };
  }
}
