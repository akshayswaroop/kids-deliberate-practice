
import UnifiedParentBanner from '../UnifiedParentBanner';
import type { Word } from '../../../infrastructure/state/gameState';
import type { ParentGuidance } from '../../../domain/entities/ProgressTracker';

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
  language: 'english',
  complexityLevel: 1,
  attempts: [],
  step: 1,
  cooldownSessionsLeft: 0,
  revealCount: 0,
};

function makeAttempts(results: Array<'correct' | 'wrong'>): Word['attempts'] {
  return results.map((result, i) => ({ result, timestamp: now - i * 10000 }));
}

const defaultGuidance: ParentGuidance = {
  message: 'First try. Have them read it again.',
  urgency: 'info',
  context: 'initial'
};

const successGuidance: ParentGuidance = {
  message: 'Great! First correct — try once more to lock it in',
  urgency: 'success',
  context: 'first-success'
};

const masteredGuidance: ParentGuidance = {
  message: 'Mastered — celebrate and move on',
  urgency: 'success',
  context: 'mastered'
};

export const Default = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: [] }}
    mode="kannadaalphabets"
    sessionProgress={{ current: 2, total: 12 }}
    parentGuidance={defaultGuidance}
  />
);

export const NeedsPractice = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['wrong','wrong','wrong','wrong']) }}
    mode="kannadaalphabets"
    sessionProgress={{ current: 2, total: 12 }}
    parentGuidance={defaultGuidance}
  />
);

export const MixedAttempts = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['wrong','wrong','correct','wrong','correct']) }}
    mode="mathtables"
    sessionProgress={{ current: 5, total: 12 }}
    parentGuidance={successGuidance}
  />
);

export const AllCorrect = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['correct','correct','correct','correct']) }}
    mode="mathtables"
    sessionProgress={{ current: 8, total: 12 }}
    parentGuidance={masteredGuidance}
  />
);

export const TrickyWord = () => (
  <UnifiedParentBanner
    currentWord={{ ...baseWord, attempts: makeAttempts(['wrong','wrong','wrong','wrong']), revealCount: 4 }}
    mode="kannadaalphabets"
    sessionProgress={{ current: 3, total: 12 }}
    parentGuidance={defaultGuidance}
    showRepeatExplanation={true}
  />
);
