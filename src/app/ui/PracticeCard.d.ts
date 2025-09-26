export interface PracticeCardProps {
  mainWord: string;
  transliteration?: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  columns?: number;
}

export default function PracticeCard(props: PracticeCardProps): JSX.Element;