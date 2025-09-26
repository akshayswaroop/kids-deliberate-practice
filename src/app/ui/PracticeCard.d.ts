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
  columns?: number;
  mode?: string;
}

export default function PracticeCard(props: PracticeCardProps): JSX.Element;