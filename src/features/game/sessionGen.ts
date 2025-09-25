import type { Word } from './state';
import { selectMasteryPercent } from './selectors';

export function selectSessionWords(
  allWords: Word[],
  weights: { struggle: number; new: number; mastered: number },
  size: number,
  rng: () => number
): string[] {
  // Buckets
  const now = Date.now();
  const struggle: Word[] = [];
  const newWords: Word[] = [];
  const mastered: Word[] = [];

  for (const word of allWords) {
    const mastery = selectMasteryPercent({ words: { [word.id]: word }, sessions: {}, activeSessions: {}, settings: { selectionWeights: weights, sessionSize: size } }, word.id);
    if (word.attempts.length === 0) {
      newWords.push(word);
    } else if (mastery < 60) {
      struggle.push(word);
    } else if (mastery === 100 && word.nextReviewAt !== undefined && now >= word.nextReviewAt) {
      mastered.push(word);
    }
  }

  // Proportional sampling
  const totalWeight = weights.struggle + weights.new + weights.mastered;
  const struggleCount = Math.round((weights.struggle / totalWeight) * size);
  const newCount = Math.round((weights.new / totalWeight) * size);
  const masteredCount = size - struggleCount - newCount;

  function sample(words: Word[], count: number): string[] {
    const ids = new Set<string>();
    while (ids.size < count && words.length > 0) {
      const idx = Math.floor(rng() * words.length);
      ids.add(words[idx].id);
      words.splice(idx, 1);
    }
    return Array.from(ids);
  }

  // Sample from each bucket
  const selected: string[] = [];
  selected.push(...sample([...struggle], struggleCount));
  selected.push(...sample([...newWords], newCount));
  selected.push(...sample([...mastered], masteredCount));

  // If not enough, fill from remaining words (no duplicates)
  const allIds = new Set(selected);
  const remaining = allWords.filter(w => !allIds.has(w.id));
  while (selected.length < size && remaining.length > 0) {
    const idx = Math.floor(rng() * remaining.length);
    selected.push(remaining[idx].id);
    remaining.splice(idx, 1);
  }

  return selected.slice(0, size);
}
