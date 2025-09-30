/**
 * 🎯 Infrastructure: Redux Word Repository
 * 
 * This implements the WordRepository interface using Redux as the storage layer.
 */

import type { WordRepository, WordDrill } from '../../domain/repositories';
import { WordId } from '../../domain/value-objects/WordId';
import { LearnerId } from '../../domain/value-objects/LearnerId';
import { WordDrillMapper } from '../mappers/DomainMappers';
import type { RootState } from '../state/gameState';

export class ReduxWordRepository implements WordRepository {
  private getState: () => RootState;

  constructor(getState: () => RootState) {
    this.getState = getState;
  }

  async findById(wordId: WordId): Promise<WordDrill | null> {
    const state = this.getState();
    const wordIdStr = wordId.toString();
    
    // Search through all users' words (words are loaded globally)
    for (const user of Object.values(state.users)) {
      const reduxWord = user.words[wordIdStr];
      if (reduxWord) {
        return WordDrillMapper.toDomain(reduxWord);
      }
    }
    
    return null;
  }

  async findBySubjectAndLevel(subject: string, complexityLevel: number): Promise<WordDrill[]> {
    const state = this.getState();
    const matchingWords: WordDrill[] = [];
    
    // Search through all users' words (assuming words are consistent across users)
    const firstUser = Object.values(state.users)[0];
    if (!firstUser) return [];
    
    for (const reduxWord of Object.values(firstUser.words)) {
      if (reduxWord.language === subject && reduxWord.complexityLevel === complexityLevel) {
        matchingWords.push(WordDrillMapper.toDomain(reduxWord));
      }
    }
    
    return matchingWords;
  }

  async findBySubject(subject: string): Promise<WordDrill[]> {
    const state = this.getState();
    const matchingWords: WordDrill[] = [];
    
    const firstUser = Object.values(state.users)[0];
    if (!firstUser) return [];
    
    for (const reduxWord of Object.values(firstUser.words)) {
      if (reduxWord.language === subject) {
        matchingWords.push(WordDrillMapper.toDomain(reduxWord));
      }
    }
    
    return matchingWords;
  }

  async getAvailableSubjects(): Promise<string[]> {
    const state = this.getState();
    const subjects = new Set<string>();
    
    const firstUser = Object.values(state.users)[0];
    if (!firstUser) return [];
    
    for (const reduxWord of Object.values(firstUser.words)) {
      subjects.add(reduxWord.language);
    }
    
    return Array.from(subjects);
  }

  async getComplexityLevels(subject: string): Promise<number[]> {
    const state = this.getState();
    const levels = new Set<number>();
    
    const firstUser = Object.values(state.users)[0];
    if (!firstUser) return [];
    
    for (const reduxWord of Object.values(firstUser.words)) {
      if (reduxWord.language === subject) {
        levels.add(reduxWord.complexityLevel);
      }
    }
    
    return Array.from(levels).sort((a, b) => a - b);
  }

  async searchByText(searchTerm: string, subject?: string): Promise<WordDrill[]> {
    const state = this.getState();
    const matchingWords: WordDrill[] = [];
    const searchLower = searchTerm.toLowerCase();
    
    const firstUser = Object.values(state.users)[0];
    if (!firstUser) return [];
    
    for (const reduxWord of Object.values(firstUser.words)) {
      const matchesSubject = !subject || reduxWord.language === subject;
      const matchesText = reduxWord.text.toLowerCase().includes(searchLower) ||
                         reduxWord.wordKannada?.toLowerCase().includes(searchLower) ||
                         reduxWord.transliteration?.toLowerCase().includes(searchLower);
      
      if (matchesSubject && matchesText) {
        matchingWords.push(WordDrillMapper.toDomain(reduxWord));
      }
    }
    
    return matchingWords;
  }

  async getRecommendedWords(
    _learnerId: LearnerId, 
    subject: string, 
    complexityLevel: number,
    excludeWordIds?: WordId[]
  ): Promise<WordDrill[]> {
    // Get all words for the subject and level
    const allWords = await this.findBySubjectAndLevel(subject, complexityLevel);
    
    // Filter out excluded words
    if (excludeWordIds && excludeWordIds.length > 0) {
      const excludeSet = new Set(excludeWordIds.map(id => id.toString()));
      return allWords.filter(word => !excludeSet.has(word.id));
    }
    
    return allWords;
  }

  async getWordCount(subject: string, complexityLevel?: number): Promise<number> {
    const state = this.getState();
    let count = 0;
    
    const firstUser = Object.values(state.users)[0];
    if (!firstUser) return 0;
    
    for (const reduxWord of Object.values(firstUser.words)) {
      const matchesSubject = reduxWord.language === subject;
      const matchesLevel = complexityLevel === undefined || reduxWord.complexityLevel === complexityLevel;
      
      if (matchesSubject && matchesLevel) {
        count++;
      }
    }
    
    return count;
  }
}