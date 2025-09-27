import type { Word } from './state';
import hanumanChalisaData from '../../assets/hanuman_chalisa_kids.json';

// Hanuman Chalisa verse type
export interface RawHanumanChalisaVerse {
  id: number;
  text: string;
  answer: string;
  notes: string;
}

// Transform raw verse data to the app's Word format
export function createHanumanChalisaWords(): Record<string, Word> {
  return (hanumanChalisaData as RawHanumanChalisaVerse[]).reduce((acc, verseData) => {
    const word: Word = {
      id: verseData.id.toString(),
      text: verseData.text, // The Sanskrit verse becomes the "word" to be studied
      language: 'hanuman',
      complexityLevel: 1, // All verses start at complexity level 1
      // Hanuman Chalisa specific fields
      answer: verseData.answer, // Kid-friendly English translation
      notes: verseData.notes, // Moral/wisdom explanation
      attempts: [],
      step: 0, // Start at step 0
      cooldownSessionsLeft: 0, // Start with no cooldown
      revealCount: 0, // Initialize reveal tracking
    };
    acc[verseData.id.toString()] = word;
    return acc;
  }, {} as Record<string, Word>);
}

// Export the raw data for any additional processing needs
export { hanumanChalisaData as RAW_HANUMAN_CHALISA_DATA };