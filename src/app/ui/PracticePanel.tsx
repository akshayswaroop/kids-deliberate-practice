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
  sessionId?: string;
}

export default function PracticePanel({ mainWord: mainWordProp, transliteration: transliterationProp, choices: choicesProp, onCorrect, onWrong, sessionId }: PracticePanelProps) {

  // Debug flag: prefer Vite's import.meta.env.DEV, fallback to NODE_ENV
  const isDebug = (typeof import.meta !== 'undefined' && ((import.meta as any).env ? (import.meta as any).env.DEV : false)) || (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

  const dispatch = useDispatch();

  // If sessionId prop isn't provided (stories/tests), try to read an active session from state.
  const sessionIdFromState = useSelector((s: any) => {
    try {
      const user = s.game && s.game.users && s.game.users[s.game.currentUserId];
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
      // eslint-disable-next-line no-console
      console.log('[PracticePanel] currentWord selector - s.game.users:', !!(s.game && s.game.users), 's.game.currentUserId:', s.game && s.game.currentUserId, 'userExists:', !!(s.game && s.game.users && s.game.users[s.game.currentUserId]));
      
      const user = s.game && s.game.users && s.game.users[s.game.currentUserId];
      if (!user) {
        // eslint-disable-next-line no-console
        console.log('[PracticePanel] selectCurrentWord debug - user not found for currentUserId:', s.game && s.game.currentUserId);
        return undefined;
      }
      
      const session = user.sessions[effectiveSessionId];
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.debug('[PracticePanel] selectCurrentWord debug - user exists:', !!user, 'session exists:', !!session, 'session.currentIndex:', session?.currentIndex, 'session.wordIds length:', session?.wordIds?.length);
        if (session && session.wordIds) {
          const currentWordId = session.wordIds[session.currentIndex];
          const wordExists = user.words[currentWordId];
          // eslint-disable-next-line no-console
          console.debug('[PracticePanel] currentWordId:', currentWordId, 'word exists:', !!wordExists);
        }
      }
      return selectCurrentWord(s.game, effectiveSessionId);
    } catch (e) {
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.debug('[PracticePanel] selectCurrentWord error:', e);
      }
      return undefined;
    }
  }) : undefined;

  // Always log key debug info (use console.log instead of console.debug)
  // eslint-disable-next-line no-console
  console.log('[PracticePanel] DEBUG - isDebug=', isDebug, 'sessionId(prop)=', sessionId, 'sessionIdFromState=', sessionIdFromState, 'effectiveSessionId=', effectiveSessionId, 'currentWord=', currentWord, 'choicesPropCount=', choicesProp ? choicesProp.length : 0);

  const mainWord = currentWord ? (currentWord.wordKannada || currentWord.text || '') : mainWordProp;
  const transliteration = currentWord ? (currentWord.transliteration || transliterationProp) : transliterationProp;

  const choices = effectiveSessionId ? useSelector((s: any) => {
    try {
      // eslint-disable-next-line no-console
      console.log('[PracticePanel] choices selector - s.game.users:', !!(s.game && s.game.users), 's.game.currentUserId:', s.game && s.game.currentUserId, 'userExists:', !!(s.game && s.game.users && s.game.users[s.game.currentUserId]));
      
      const user = s.game && s.game.users && s.game.users[s.game.currentUserId];
      if (!user) {
        // eslint-disable-next-line no-console
        console.log('[PracticePanel] choices debug - user not found for currentUserId:', s.game && s.game.currentUserId);
        return choicesProp || [];
      }
      
      const session = user.sessions[effectiveSessionId];
      if (!session) {
        if (isDebug) {
          // eslint-disable-next-line no-console
          console.debug('[PracticePanel] choices debug - session not found for:', effectiveSessionId);
        }
        return choicesProp || [];
      }
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.debug('[PracticePanel] choices debug - building choices from session.wordIds:', session.wordIds);
      }
      return session.wordIds.map((id: string) => {
        const word = user.words[id];
        if (!word) {
          // eslint-disable-next-line no-console
          console.log('[PracticePanel] Warning: word not found for id:', id);
          return { id, label: id, progress: 0 };
        }
        return { id, label: word.wordKannada || word.text || id, progress: selectMasteryPercent(s.game, id) };
      });
    } catch (e) {
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.debug('[PracticePanel] choices error:', e);
      }
      return choicesProp || [];
    }
  }) : (choicesProp || []);

  const handleNext = () => {
    if (!effectiveSessionId) {
      // eslint-disable-next-line no-console
      console.log('[PracticePanel] handleNext called but no effectiveSessionId found');
      return;
    }
    // eslint-disable-next-line no-console
    console.log('[PracticePanel] dispatching nextCard for effectiveSessionId=', effectiveSessionId);
    dispatch(nextCard({ sessionId: effectiveSessionId }));
    
    // eslint-disable-next-line no-console
    console.log('[PracticePanel] nextCard dispatched, currentWord before was:', currentWord);
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
