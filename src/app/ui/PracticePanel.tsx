// @ts-ignore
import PracticeCard from './PracticeCard';


import { useDispatch, useSelector } from 'react-redux';
import { nextCard } from '../../features/game/slice';
import { selectCurrentWord, selectMasteryPercent } from '../../features/game/selectors';

interface PracticePanelProps {
  mainWord: string;
  transliteration?: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  onCorrect: () => void;
  onWrong: () => void;
  sessionId: string;
}

export default function PracticePanel({ mainWord: mainWordProp, transliteration: transliterationProp, choices: choicesProp, onCorrect, onWrong, sessionId }: PracticePanelProps) {

  const dispatch = useDispatch();

  // If sessionId prop isn't provided (stories/tests), try to read an active session from state.
  const sessionIdFromState = useSelector((s: any) => {
    try {
      const user = s.users[s.currentUserId];
      if (!user) return undefined;
      // Prefer explicit 'practice' active session, otherwise pick the first active session available
      if (user.activeSessions && user.activeSessions.practice) return user.activeSessions.practice;
      const vals = Object.values(user.activeSessions || {});
      return vals.length > 0 ? vals[0] : undefined;
    } catch (e) {
      return undefined;
    }
  });

  const effectiveSessionId = sessionId || sessionIdFromState;

  // Derive current word from Redux if an effectiveSessionId is available (keeps UI in sync)
  const currentWord = effectiveSessionId ? useSelector((s: any) => {
    try {
      return selectCurrentWord(s, effectiveSessionId);
    } catch (e) {
      return undefined;
    }
  }) : undefined;

  // Debug flag: prefer Vite's import.meta.env.DEV, fallback to NODE_ENV
  const isDebug = (typeof import.meta !== 'undefined' && ((import.meta as any).env ? (import.meta as any).env.DEV : false)) || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

  if (isDebug) {
    // Log derived values to help trace why UI may not update
    // eslint-disable-next-line no-console
    console.debug('[PracticePanel] sessionId(prop)=', sessionId, 'sessionIdFromState=', sessionIdFromState, 'effectiveSessionId=', effectiveSessionId, 'currentWord=', currentWord, 'choicesPropCount=', choicesProp ? choicesProp.length : 0);
  }

  const mainWord = currentWord ? (currentWord.wordKannada || currentWord.text || '') : mainWordProp;
  const transliteration = currentWord ? (currentWord.transliteration || transliterationProp) : transliterationProp;

  const choices = effectiveSessionId ? useSelector((s: any) => {
    try {
      const user = (s as any).users[(s as any).currentUserId];
      const session = user.sessions[effectiveSessionId];
      if (!session) return choicesProp || [];
      return session.wordIds.map((id: string) => ({ id, label: user.words[id].wordKannada || user.words[id].text || id, progress: selectMasteryPercent(s, id) }));
    } catch (e) {
      return choicesProp || [];
    }
  }) : (choicesProp || []);

  const handleNext = () => {
    if (!effectiveSessionId) {
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.debug('[PracticePanel] handleNext called but no effectiveSessionId found');
      }
      return;
    }
    if (isDebug) {
      // eslint-disable-next-line no-console
      console.debug('[PracticePanel] dispatching nextCard for effectiveSessionId=', effectiveSessionId);
    }
    dispatch(nextCard({ sessionId: effectiveSessionId }));
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PracticeCard
        mainWord={mainWord}
        transliteration={transliteration}
        choices={choices}
        onCorrect={onCorrect}
        onWrong={onWrong}
        onNext={handleNext}
      />
    </div>
  );
}
