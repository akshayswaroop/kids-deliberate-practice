
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, addUser, setLanguagePreferences, addSession, attempt, nextCard, setMode as setModeAction } from './features/game/slice';
import HomePage from './app/ui/HomePage';
import ReactJson from '@microlink/react-json-view';
import { selectCurrentWord, selectWordsByLanguage, selectMasteryPercent, selectCurrentLanguagePreferences } from './features/game/selectors';
import { selectSessionWords } from './features/game/sessionGen';

import type { RootState } from './features/game/state';

interface DiagnosticsPanelProps {
  rootState: RootState;
}

function DiagnosticsPanel({ rootState }: DiagnosticsPanelProps) {
  const dispatch = useDispatch();
  const users = rootState.users || {};
  const userIds = Object.keys(users);
  const currentUserId = rootState.currentUserId;
  const userState = users[currentUserId] || { words: {}, sessions: {}, settings: { languages: ['english'] } };
  const [newUserId, setNewUserId] = useState('');
  const [selectedMode, setSelectedMode] = useState(userState.settings.languages[0] || 'english');

  const clearLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const startSession = () => {
    // Simple session: pick first N words from user's words
    const words = userState.words || {};
    const ids = Object.keys(words).slice(0, 12);
    const sessionId = 'session_' + Date.now();
    const session = {
      wordIds: ids,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: Date.now(),
      settings: { selectionWeights: userState.settings.selectionWeights, sessionSize: ids.length, languages: userState.settings.languages },
    };
    dispatch(addSession({ sessionId, session } as any));
  };

  const handleAttempt = (wordId: string, result: 'correct' | 'wrong') => {
    // find active session id: pick the first session if exists
    const sessions = userState.sessions || {};
    const sessionId = Object.keys(sessions)[0];
    if (!sessionId) return;
    dispatch(attempt({ sessionId, wordId, result } as any));
  };

  const handleNext = () => {
    const sessions = userState.sessions || {};
    const sessionId = Object.keys(sessions)[0];
    if (!sessionId) return;
    dispatch(nextCard({ sessionId } as any));
  };
  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', background: '#18181b', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ marginBottom: 24 }}>Diagnostics & Practice Dashboard</h1>
      <div style={{ background: '#232326', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px #0002', maxHeight: 400, overflow: 'auto' }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Live State Viewer</h2>
        <ReactJson src={rootState} theme="monokai" collapsed={2} enableClipboard={true} displayDataTypes={false} name={false} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#cbd5e1' }}>User:</label>
        <select value={currentUserId} onChange={e => dispatch(selectUser({ userId: e.target.value }))} style={{ padding: '6px 8px', borderRadius: 6 }}>
          {userIds.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
        <input placeholder="new user id" value={newUserId} onChange={e => setNewUserId(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6 }} />
        <button onClick={() => { if (newUserId.trim()) { dispatch(addUser({ userId: newUserId.trim() })); setNewUserId(''); } }} style={{ padding: '6px 10px', borderRadius: 6, background: '#4f46e5', color: '#fff' }}>Add User</button>

        <label style={{ color: '#cbd5e1' }}>Mode:</label>
        <select value={selectedMode} onChange={e => { setSelectedMode(e.target.value); dispatch(setLanguagePreferences({ languages: [e.target.value] })); }} style={{ padding: '6px 8px', borderRadius: 6 }}>
          <option value="english">English</option>
          <option value="kannada">Kannada</option>
        </select>

        <button onClick={clearLocalStorage} style={{ padding: '6px 10px', borderRadius: 6, background: '#ef4444', color: '#fff' }}>Clear LocalStorage</button>
        <button onClick={startSession} style={{ padding: '6px 10px', borderRadius: 6, background: '#2563eb', color: '#fff' }}>Start Session</button>
        <button onClick={handleNext} style={{ padding: '6px 10px', borderRadius: 6, background: '#f59e0b', color: '#fff' }}>Next Card</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Quick Attempts</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.keys(userState.words || {}).slice(0, 6).map(wid => (
            <div key={wid} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#cbd5e1' }}>{wid}</span>
              <button onClick={() => handleAttempt(wid, 'correct')} style={{ background: '#22c55e', color: '#fff', borderRadius: 6, padding: '4px 8px' }}>Correct</button>
              <button onClick={() => handleAttempt(wid, 'wrong')} style={{ background: '#ef4444', color: '#fff', borderRadius: 6, padding: '4px 8px' }}>Wrong</button>
            </div>
          ))}
        </div>
      </div>
      <a href="#home" style={{ color: '#fff', fontWeight: 600, fontSize: 18, textDecoration: 'underline', background: 'rgba(0,0,0,0.1)', borderRadius: 8, padding: '8px 16px', display: 'inline-block', marginTop: 18 }}>Back to Home</a>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const rootState = useSelector((state: { game: any }) => state.game);
  const users = rootState.users;
  const currentUserId = rootState.currentUserId;
  const userState = users[currentUserId] || { words: {}, sessions: {}, settings: { languages: ['english'] } };
  const [mode, setMode] = useState(userState.settings.languages[0] || 'english');
  // Removed unused setShowDiagnostics

  // Handlers
  const handleCreateUser = (username: string) => {
    dispatch({ type: 'game/addUser', payload: { userId: username } });
  };
  const handleSwitchUser = (userId: string) => {
    dispatch({ type: 'game/selectUser', payload: { userId } });
  };
  const handleSetMode = (newMode: string) => {
    dispatch({ type: 'game/setLanguagePreferences', payload: { languages: [newMode] } });
    setMode(newMode);
  };

  // PracticePanel props (stubbed for now)
  // Determine language preferences and available words
  const currentLanguages = selectCurrentLanguagePreferences(rootState as any);
  const availableWords = selectWordsByLanguage(rootState as any, currentLanguages as any);

  // Find or create a session for current mode
  const userSessions = userState.sessions || {};
  const activeSessions = userState.activeSessions || {};
  let sessionId = activeSessions[mode];
  if (!sessionId) {
    // Create a session using sessionGen (fallback simple pick if empty)
    const allWordsArr = Object.values(availableWords || {});
      if (allWordsArr.length > 0) {
        const ids = selectSessionWords(allWordsArr, userState.settings.selectionWeights || { struggle: 0.5, new: 0.4, mastered: 0.1 }, userState.settings.sessionSize || 12, Math.random as any);
        sessionId = 'session_' + Date.now();
        const session = {
          wordIds: ids,
          currentIndex: 0,
          revealed: false,
          mode: 'practice',
          createdAt: Date.now(),
          settings: userState.settings,
        };
        dispatch(addSession({ sessionId, session } as any));
        // Record this session as the active session for the current mode so we don't recreate it repeatedly
        dispatch(setModeAction({ mode, sessionId } as any));
      }
  }

  // Current word and choices derived from session
  let mainWord = '...';
  let transliteration: string | undefined = undefined;
  let choices: Array<{ id: string; label: string; progress: number }> = [];
  if (sessionId && userSessions[sessionId]) {
    try {
      const word = selectCurrentWord(rootState as any, sessionId as any);
      mainWord = word.text || word.id;
      transliteration = (word.transliteration) || undefined;
      const session = userSessions[sessionId];
      choices = session.wordIds.map((wid: string) => {
        const w = userState.words[wid];
        return { id: wid, label: w ? (w.text || wid) : wid, progress: selectMasteryPercent(rootState as any, wid as any) };
      });
    } catch (e) {
      // fallback to first available words
      const arr = Object.values(availableWords || {});
      if (arr.length > 0) {
        mainWord = arr[0].text;
        choices = arr.slice(0, 4).map(w => ({ id: w.id, label: w.text, progress: selectMasteryPercent(rootState as any, w.id) }));
      }
    }
  } else {
    const arr = Object.values(availableWords || {});
    if (arr.length > 0) {
      mainWord = arr[0].text;
      choices = arr.slice(0, 4).map(w => ({ id: w.id, label: w.text, progress: selectMasteryPercent(rootState as any, w.id) }));
    }
  }

  const onCorrect = () => {
    if (!sessionId) return;
    // attempt on current word
    const session = (userSessions && userSessions[sessionId]) || null;
    if (!session) return;
    const wordId = session.wordIds[session.currentIndex];
    dispatch(attempt({ sessionId, wordId, result: 'correct' } as any));
  };

  const onWrong = () => {
    if (!sessionId) return;
    const session = (userSessions && userSessions[sessionId]) || null;
    if (!session) return;
    const wordId = session.wordIds[session.currentIndex];
    dispatch(attempt({ sessionId, wordId, result: 'wrong' } as any));
  };

  // Navigation: track location.hash in component state so anchor links re-render the app
  const [hash, setHash] = useState<string>(typeof window !== 'undefined' ? window.location.hash : '');

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '');
    // Listen for hash changes (user clicking anchors, history.back, etc.)
    window.addEventListener('hashchange', onHashChange);
    // Also handle the case where the app initially loaded with a hash
    onHashChange();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (hash === '#diagnostics') {
    return <DiagnosticsPanel rootState={rootState} />;
  }
  return (
    <HomePage
      users={users}
      currentUserId={currentUserId}
      onCreateUser={handleCreateUser}
      onSwitchUser={handleSwitchUser}
      onSetMode={handleSetMode}
      mode={mode}
      mainWord={mainWord}
      transliteration={transliteration}
      choices={choices}
      onCorrect={onCorrect}
      onWrong={onWrong}
      layout="topbar"
    />
  );
}

export default App;
