import type { Word } from './state';

export function selectSessionWords(
  allWords: Word[],
  weights: { struggle: number; new: number; mastered: number },
  size: number,
  rng: () => number,
  _now: number = Date.now() // Injected for determinism but not used yet
): string[] {
  // Buckets based on new step-based system
  const struggle: Word[] = []; // Active words: 1 ≤ step ≤ 4
  const newWords: Word[] = []; // New words: step = 0, attempts.length = 0
  const mastered: Word[] = []; // Revision words: step = 5, cooldownSessionsLeft = 0

  for (const word of allWords) {
    if (word.step === 0 && word.attempts.length === 0) {
      newWords.push(word);
    } else if (word.step >= 1 && word.step <= 4) {
      struggle.push(word);
    } else if (word.step === 5 && word.cooldownSessionsLeft === 0) {
      mastered.push(word);
    }
  }

  // Sort buckets by priority (oldest first for better spaced repetition)
  struggle.sort((a, b) => (a.lastPracticedAt || 0) - (b.lastPracticedAt || 0));
  mastered.sort((a, b) => (a.lastRevisedAt || 0) - (b.lastRevisedAt || 0));

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

  // Fill shortages: Active → New → Revision (never duplicate words)
  const allIds = new Set(selected);
  if (selected.length < size) {
    // Try filling from Active first
    const remainingStruggle = struggle.filter(w => !allIds.has(w.id));
    while (selected.length < size && remainingStruggle.length > 0) {
      const idx = Math.floor(rng() * remainingStruggle.length);
      selected.push(remainingStruggle[idx].id);
      allIds.add(remainingStruggle[idx].id);
      remainingStruggle.splice(idx, 1);
    }
    
    // Then fill from New
    const remainingNew = newWords.filter(w => !allIds.has(w.id));
    while (selected.length < size && remainingNew.length > 0) {
      const idx = Math.floor(rng() * remainingNew.length);
      selected.push(remainingNew[idx].id);
      allIds.add(remainingNew[idx].id);
      remainingNew.splice(idx, 1);
    }
    
    // Finally fill from Revision
    const remainingMastered = mastered.filter(w => !allIds.has(w.id));
    while (selected.length < size && remainingMastered.length > 0) {
      const idx = Math.floor(rng() * remainingMastered.length);
      selected.push(remainingMastered[idx].id);
      allIds.add(remainingMastered[idx].id);
      remainingMastered.splice(idx, 1);
    }
    
    // Emergency fallback: if still not enough words, include mastered words with cooldowns
    if (selected.length < size) {
      const masteredWithCooldowns = allWords.filter(w => 
        w.step === 5 && w.cooldownSessionsLeft > 0 && !allIds.has(w.id)
      );
      while (selected.length < size && masteredWithCooldowns.length > 0) {
        const idx = Math.floor(rng() * masteredWithCooldowns.length);
        selected.push(masteredWithCooldowns[idx].id);
        allIds.add(masteredWithCooldowns[idx].id);
        masteredWithCooldowns.splice(idx, 1);
      }
    }
  }

  return selected.slice(0, size);
}
