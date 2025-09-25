export interface PracticePanelProps {
  mainWord: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  onCorrect: () => void;
  onWrong: () => void;
  sessionId?: string;
}