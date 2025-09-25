// @ts-ignore
import PracticeCard from './PracticeCard';

interface PracticePanelProps {
  mainWord: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  onCorrect: () => void;
  onWrong: () => void;
}

export default function PracticePanel({ mainWord, choices, onCorrect, onWrong }: PracticePanelProps) {
  return (
    <div style={{ width: '100%' }}>
      <PracticeCard
        mainWord={mainWord}
        choices={choices}
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    </div>
  );
}
