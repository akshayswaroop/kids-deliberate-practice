export interface PracticeCardProps {
  mainWord: string;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
  choices?: Array<{ id: string; label: string; progress: number }>; // Made optional - no longer used for per-question badges
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  onRevealAnswer?: (revealed: boolean) => void;
  columns?: number;
  mode?: string;
  isAnswerRevealed?: boolean;
  isEnglishMode?: boolean;
  currentUserId?: string;
  whyRepeat?: { revealCount: number } | null;
  onWhyRepeatAcknowledged?: () => void;
  attemptStats?: {
    total: number;
    correct: number;
    incorrect: number;
  } | null;
  attemptHistory?: Array<{ timestamp: number; result: 'correct' | 'wrong' }>;
  sessionProgress?: {
    current: number;
    total: number;
  };
  sessionGuidance?: {
    message: string;
    urgency: string;
    context: string;
  } | null;
  animationDurationMs?: number;
}

export default function PracticeCard(props: PracticeCardProps): JSX.Element;
