
import UnifiedParentBanner from '../UnifiedParentBanner';
import type { Word } from '../../../infrastructure/state/gameState';

export default {
  title: 'App/UnifiedParentBanner',
  component: UnifiedParentBanner,
  parameters: {
    layout: 'centered',
  },
};

const now = Date.now();
const baseWord: Word = {
  id: 'w1',
  text: 'Test',
  language: 'kannada',
  complexityLevel: 1,
  attempts: [],
  step: 1,
  cooldownSessionsLeft: 0,
  revealCount: 0,
};

function makeAttempts(results: Array<'correct' | 'wrong'>): Word['attempts'] {
  return results.map((result, i) => ({ result, timestamp: now - i * 10000 }));
}

export const Default = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: [] }}
    mode="kannadaalphabets"
    sessionProgress={{ current: 2, total: 12 }}
  />
);

export const NeedsPractice = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['wrong','wrong','wrong','wrong']) }}
    mode="kannadaalphabets"
    sessionProgress={{ current: 2, total: 12 }}
  />
);

export const MixedAttempts = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['wrong','wrong','correct','wrong','correct']) }}
    mode="mathtables"
    sessionProgress={{ current: 5, total: 12 }}
  />
);

export const AllCorrect = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['correct','correct','correct','correct']) }}
    mode="mathtables"
    sessionProgress={{ current: 8, total: 12 }}
  />
);

export const TrickyWord = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['wrong','wrong','wrong','wrong']), revealCount: 4 }}
    mode="kannadaalphabets"
    sessionProgress={{ current: 3, total: 12 }}
    showRepeatExplanation={true}
    revealCount={4}
  />
);
