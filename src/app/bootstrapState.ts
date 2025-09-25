import wordsList from '../assets/words.en.json';
import type { Word } from '../features/game/state';
import { createKannadaWords } from '../features/game/kannadaWords';

export function getInitialWords(): Record<string, Word> {
  // English words from JSON
  const englishWords = (wordsList as string[]).reduce((acc, text) => {
    acc[text] = {
      id: text,
      text,
      language: 'english', // Use full language name for consistency
      attempts: [],
    };
    return acc;
  }, {} as Record<string, Word>);
  
  // Kannada words from the rich dataset
  const kannadaWords = createKannadaWords();
  
  // Combine both language word sets
  return { ...englishWords, ...kannadaWords };
}
