/**
 * Value Object: LearnerId
 */

export class LearnerId {
  private value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('LearnerId cannot be empty');
    }
    this.value = value;
  }

  static fromString(value: string): LearnerId {
    return new LearnerId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: LearnerId): boolean {
    return this.value === other.value;
  }
}