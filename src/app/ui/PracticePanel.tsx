// @ts-ignore
import PracticeCard from './PracticeCard.jsx';

interface PracticePanelProps {
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
}

export default function PracticePanel({ 
  mainWord, 
  transliteration, 
  transliterationHi,
  answer,
  notes,
  choices, 
  onCorrect, 
  onWrong, 
  onNext,
  onRevealAnswer,
  columns = 6,
  mode,
  isAnswerRevealed,
  isEnglishMode
}: PracticePanelProps) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PracticeCard
        mainWord={mainWord}
        transliteration={transliteration}
        transliterationHi={transliterationHi}
        answer={answer}
        notes={notes}
        choices={choices}
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={onNext}
        onRevealAnswer={onRevealAnswer}
        columns={columns}
        mode={mode}
        isAnswerRevealed={isAnswerRevealed}
        isEnglishMode={isEnglishMode}
      />
    </div>
  );
}
