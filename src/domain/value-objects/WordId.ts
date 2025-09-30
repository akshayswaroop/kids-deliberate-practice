/**
 * Value Object: WordId
 * 
 * A value object that ensures type safety for word identifiers.
 * This prevents bugs like accidentally passing a user ID where a word ID is expected.
 */

export class WordId {
  private value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('WordId cannot be empty');
    }
    this.value = value;
  }

  static fromString(value: string): WordId {
    return new WordId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: WordId): boolean {
    return this.value === other.value;
  }
}