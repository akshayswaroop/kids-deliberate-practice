import ReactJson from '@microlink/react-json-view';


import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectMasteryPercent, selectCurrentWord, selectSessionProgress, selectWordsByLanguage } from './features/game/selectors';
import { attempt, nextCard, addSession, selectUser, setLanguagePreferences } from './features/game/slice';
import type { RootState, Word, UserState } from './features/game/state';



function App() {


  // Add user UI state and handler
  const [newUserId, setNewUserId] = useState('');

  // Add user function
  const addUser = () => {
    if (newUserId.trim() && !users[newUserId.trim()]) {
      dispatch({ type: 'game/addUser', payload: { userId: newUserId.trim() } });
      setNewUserId('');
      setSessionId(null);
    }
  };
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

  // Next session: pick 12 not yet mastered (language-aware)
  const startNextSession = () => {
    const languageFilteredWords = selectWordsByLanguage(rootState, currentLanguages);
    const mastered = getMasteredWords(languageFilteredWords);
    const remaining = Object.keys(languageFilteredWords).filter(id => !mastered.has(id));
    const ids = pickRandomWords(Object.fromEntries(remaining.map(id => [id, languageFilteredWords[id]])), 12);
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
        settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 12, languages: currentLanguages },
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
  const users = useSelector((state: { game: RootState }) => state.game.users);
  const currentUserId = useSelector((state: { game: RootState }) => state.game.currentUserId);
  const userIds = Object.keys(users);
  const userState: UserState = users[currentUserId];
  const words = userState.words;
  const sessions = userState.sessions;
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Language preferences
  const currentLanguages = userState.settings.languages || ['english'];
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = e.target.value;
    let newLanguages: string[];
    if (selectedLanguage === 'mixed') {
      newLanguages = ['english', 'kannada'];
    } else {
      newLanguages = [selectedLanguage];
    }
    dispatch(setLanguagePreferences({ languages: newLanguages }));
    setSessionId(null); // reset session when language changes
  };
  // User selection handler
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUserId = e.target.value;
    dispatch(selectUser({ userId: newUserId }));
    setSessionId(null); // reset session view on user switch
  };

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
    const languageFilteredWords = selectWordsByLanguage(rootState, currentLanguages);
    const ids = pickRandomWords(languageFilteredWords, 12);
    const newSessionId = 'session_' + Date.now();
    dispatch(addSession({
      sessionId: newSessionId,
      session: {
        wordIds: ids,
        currentIndex: 0,
        revealed: false,
        mode: 'practice',
        createdAt: Date.now(),
        settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 12, languages: currentLanguages },
      },
    }));
    setSessionId(newSessionId);
  };

  // Current word in session
  let currentWord: Word | undefined;
  let progress: { current: number; total: number } | undefined;
  const rootState = useSelector((state: { game: RootState }) => state.game);
  if (sessionId && sessions[sessionId]) {
    try {
      currentWord = selectCurrentWord(rootState, sessionId);
      progress = selectSessionProgress(rootState, sessionId);
    } catch {}
  }

  return (
  <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', background: '#18181b', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ marginBottom: 24 }}>Diagnostics & Practice Dashboard</h1>
      {/* Diagnostics State Viewer */}
      <div style={{ background: '#232326', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px #0002', maxHeight: 400, overflow: 'auto' }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Live State Viewer</h2>
  <ReactJson src={rootState} theme="monokai" collapsed={2} enableClipboard={true} displayDataTypes={false} name={false} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="user-select" style={{ fontWeight: 500, marginRight: 8 }}>Select User:</label>
        <select id="user-select" value={currentUserId} onChange={handleUserChange} style={{ padding: '6px 12px', borderRadius: 6, marginRight: 12 }}>
          {userIds.map(uid => (
            <option key={uid} value={uid}>{uid}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="New user ID"
          value={newUserId}
          onChange={e => setNewUserId(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, marginRight: 8 }}
        />
        <button
          onClick={addUser}
          style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 500, cursor: 'pointer' }}
          disabled={!newUserId.trim() || !!users[newUserId.trim()]}
        >Add User</button>
      </div>
      
      {/* Language Selection */}
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="language-select" style={{ fontWeight: 500, marginRight: 8 }}>Language Mode:</label>
        <select 
          id="language-select" 
          value={currentLanguages.length === 2 ? 'mixed' : currentLanguages[0]} 
          onChange={handleLanguageChange} 
          style={{ padding: '6px 12px', borderRadius: 6, marginRight: 12 }}
        >
          <option value="english">English Only</option>
          <option value="kannada">Kannada Only</option>
          <option value="mixed">Mixed (Both Languages)</option>
        </select>
        <span style={{ fontSize: 14, color: '#888' }}>
          Current: {currentLanguages.join(' + ')}
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Word List Card */}
        <div style={{ background: '#232326', borderRadius: 12, padding: 24, minWidth: 320, boxShadow: '0 2px 8px #0002' }}>
          <h2 style={{ marginTop: 0 }}>Word List <span style={{ fontWeight: 'normal', fontSize: 16 }}>(Mastery %)</span></h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sessionId && sessions[sessionId]
              ? sessions[sessionId].wordIds.map(id => (
                  <li key={id} style={{ padding: '4px 0', borderBottom: '1px solid #222' }}>
                    <span style={{ fontWeight: 500 }}>
                      {words[id].text}
                      {words[id].language === 'kannada' && (
                        <div style={{ fontSize: 12, color: '#10b981', fontWeight: 300 }}>
                          {words[id].transliteration}
                        </div>
                      )}
                      <span style={{ 
                        fontSize: 12, 
                        color: words[id].language === 'kannada' ? '#fbbf24' : '#60a5fa',
                        marginLeft: 6,
                        fontWeight: 300
                      }}>({words[id].language === 'kannada' ? 'KN' : 'EN'})</span>
                    </span>
                    <span style={{ float: 'right', fontWeight: 400 }}>{selectMasteryPercent(rootState, id)}%</span>
                  </li>
                ))
              : Object.values(words).slice(0, 10).map(word => (
                  <li key={word.id} style={{ padding: '4px 0', borderBottom: '1px solid #222' }}>
                    <span style={{ fontWeight: 500 }}>
                      {word.text}
                      {word.language === 'kannada' && (
                        <div style={{ fontSize: 12, color: '#10b981', fontWeight: 300 }}>
                          {word.transliteration}
                        </div>
                      )}
                      <span style={{ 
                        fontSize: 12, 
                        color: word.language === 'kannada' ? '#fbbf24' : '#60a5fa',
                        marginLeft: 6,
                        fontWeight: 300
                      }}>({word.language === 'kannada' ? 'KN' : 'EN'})</span>
                    </span>
                    <span style={{ float: 'right', fontWeight: 400 }}>{selectMasteryPercent(rootState, word.id)}%</span>
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
              <div style={{ fontSize: 18, marginBottom: 12 }}>
                Current Word: 
                {currentWord.language === 'kannada' ? (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>{currentWord.text}</div>
                    <div style={{ fontSize: 16, color: '#10b981' }}>{currentWord.transliteration}</div>
                    {currentWord.transliterationHi && (
                      <div style={{ fontSize: 14, color: '#8b5cf6' }}>{currentWord.transliterationHi}</div>
                    )}
                  </div>
                ) : (
                  <b style={{ color: '#60a5fa' }}>{currentWord.text}</b>
                )}
              </div>
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
                  (id: string) => selectMasteryPercent(rootState, id) === 100
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
