import wordsList from '../assets/words.en.json';
import type { Word } from '../features/game/state';

export function getInitialWords(): Record<string, Word> {
  // wordsList is imported as string[]
  return (wordsList as string[]).reduce((acc, text) => {
    acc[text] = {
      id: text,
      text,
      language: 'en',
      attempts: [],
    };
    return acc;
  }, {} as Record<string, Word>);
}
