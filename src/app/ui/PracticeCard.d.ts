export interface PracticeCardProps {
  mainWord: string;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
  choices: Array<{ id: string; label: string; progress: number }>;
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
}

export default function PracticeCard(props: PracticeCardProps): JSX.Element;
