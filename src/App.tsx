
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import HomePage from './app/ui/HomePage';
import ReactJson from '@microlink/react-json-view';

import type { RootState } from './features/game/state';

interface DiagnosticsPanelProps {
  rootState: RootState;
}

function DiagnosticsPanel({ rootState }: DiagnosticsPanelProps) {
  return (
    <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', background: '#18181b', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ marginBottom: 24 }}>Diagnostics & Practice Dashboard</h1>
      <div style={{ background: '#232326', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px #0002', maxHeight: 400, overflow: 'auto' }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Live State Viewer</h2>
        <ReactJson src={rootState} theme="monokai" collapsed={2} enableClipboard={true} displayDataTypes={false} name={false} />
      </div>
      <a href="#home" style={{ color: '#fff', fontWeight: 600, fontSize: 18, textDecoration: 'underline', background: 'rgba(0,0,0,0.1)', borderRadius: 8, padding: '8px 16px' }}>Back to Home</a>
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
  const mainWord = 'cat';
  const choices = [
    { id: '1', label: 'cat', progress: 100 },
    { id: '2', label: 'dog', progress: 60 },
    { id: '3', label: 'sun', progress: 0 },
    { id: '4', label: 'run', progress: 80 },
  ];
  const onCorrect = () => {};
  const onWrong = () => {};

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
      choices={choices}
      onCorrect={onCorrect}
      onWrong={onWrong}
      layout="topbar"
    />
  );
}

export default App;
