import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectMasteryPercent, selectCurrentWord, selectSessionProgress } from './features/game/selectors';
import { attempt, nextCard, addSession } from './features/game/slice';
import type { RootState, Word } from './features/game/state';

function App() {
  // Helper to get mastered words
  function getMasteredWords(wordsObj: Record<string, Word>): Set<string> {
    const mastered = new Set<string>();
    for (const word of Object.values(wordsObj)) {
      // 5 correct attempts = 100% mastery
      const correct = word.attempts.filter(a => a.result === 'correct').length;
      if (correct >= 5) mastered.add(word.id);
    }
    return mastered;
  }

  // Next session: pick 12 not yet mastered
  const startNextSession = () => {
    const mastered = getMasteredWords(words);
    const remaining = Object.keys(words).filter(id => !mastered.has(id));
    const ids = pickRandomWords(Object.fromEntries(remaining.map(id => [id, words[id]])), 12);
    if (ids.length === 0) return;
    const newSessionId = 'session_' + Date.now();
    dispatch(addSession({
      sessionId: newSessionId,
      session: {
        wordIds: ids,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: Date.now(),
        settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 12 },
      },
    }));
    setSessionId(newSessionId);
  };

  // Clear localStorage and reload
  const clearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };
  const dispatch = useDispatch();
  const words = useSelector((state: { game: RootState }) => state.game.words);
  const sessions = useSelector((state: { game: RootState }) => state.game.sessions);
  const activeSessions = useSelector((state: { game: RootState }) => state.game.activeSessions);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Start a session with first 5 words
  function pickRandomWords(wordsObj: Record<string, Word>, count: number) {
    const ids = Object.keys(wordsObj);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids.slice(0, count);
  }

  const startSession = () => {
    const ids = pickRandomWords(words, 12);
    const newSessionId = 'session_' + Date.now();
    dispatch(addSession({
      sessionId: newSessionId,
      session: {
        wordIds: ids,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: Date.now(),
        settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 12 },
      },
    }));
    setSessionId(newSessionId);
  };

  // Current word in session
  let currentWord: Word | undefined;
  let progress: { current: number; total: number } | undefined;
  if (sessionId && sessions[sessionId]) {
    try {
      currentWord = selectCurrentWord({ words, sessions, activeSessions, settings: sessions[sessionId].settings }, sessionId);
      progress = selectSessionProgress({ words, sessions, activeSessions, settings: sessions[sessionId].settings }, sessionId);
    } catch {}
  }

  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', background: '#18181b', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ marginBottom: 24 }}>Diagnostics & Practice Dashboard</h1>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Word List Card */}
        <div style={{ background: '#232326', borderRadius: 12, padding: 24, minWidth: 320, boxShadow: '0 2px 8px #0002' }}>
          <h2 style={{ marginTop: 0 }}>Word List <span style={{ fontWeight: 'normal', fontSize: 16 }}>(Mastery %)</span></h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sessionId && sessions[sessionId]
              ? sessions[sessionId].wordIds.map(id => (
                  <li key={id} style={{ padding: '4px 0', borderBottom: '1px solid #222' }}>
                    <span style={{ fontWeight: 500 }}>{words[id].text}</span>
                    <span style={{ float: 'right', fontWeight: 400 }}>{selectMasteryPercent({ words, sessions, activeSessions, settings: sessions[sessionId].settings }, id)}%</span>
                  </li>
                ))
              : Object.values(words).slice(0, 10).map(word => (
                  <li key={word.id} style={{ padding: '4px 0', borderBottom: '1px solid #222' }}>
                    <span style={{ fontWeight: 500 }}>{word.text}</span>
                    <span style={{ float: 'right', fontWeight: 400 }}>{selectMasteryPercent({ words, sessions, activeSessions, settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 5 } }, word.id)}%</span>
                  </li>
                ))}
          </ul>
        </div>

        {/* Session Card */}
        <div style={{ background: '#232326', borderRadius: 12, padding: 24, minWidth: 340, boxShadow: '0 2px 8px #0002' }}>
          <h2 style={{ marginTop: 0 }}>Session</h2>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <button onClick={clearLocalStorage} style={{ background: '#444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Clear Local Storage</button>
            {!sessionId && (
              <button onClick={startSession} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Start Session</button>
            )}
          </div>
          {sessionId && (
            <div style={{ marginBottom: 16 }}>
              <div><b>Session ID:</b> <span style={{ fontFamily: 'monospace' }}>{sessionId}</span></div>
            </div>
          )}
          {currentWord && (
            <div style={{ marginTop: 20, background: '#18181b', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 18, marginBottom: 12 }}>Current Word: <b>{currentWord.text}</b></div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <button
                  onClick={() => sessionId && dispatch(attempt({ sessionId, wordId: currentWord!.id, result: 'correct' }))}
                  style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}
                  disabled={!sessionId}
                >Correct</button>
                <button
                  onClick={() => sessionId && dispatch(attempt({ sessionId, wordId: currentWord!.id, result: 'wrong' }))}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}
                  disabled={!sessionId}
                >Wrong</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => sessionId && dispatch(nextCard({ sessionId }))}
                  disabled={!sessionId || progress?.current === progress?.total}
                  style={{ background: progress?.current === progress?.total ? '#444' : '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 500, cursor: progress?.current === progress?.total ? 'not-allowed' : 'pointer' }}
                >
                  Next Card
                </button>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Progress:</b> {progress?.current} / {progress?.total}
              </div>
              {progress?.current === progress?.total &&
                sessionId &&
                sessions[sessionId]?.wordIds.every(
                  (id: string) => selectMasteryPercent({ words, sessions, activeSessions, settings: sessions[sessionId].settings }, id) === 100
                ) && (
                  <div style={{ marginTop: 20 }}>
                    <button onClick={startNextSession} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 500, cursor: 'pointer' }}>Next Session</button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
