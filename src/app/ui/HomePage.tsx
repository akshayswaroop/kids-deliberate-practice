// @ts-ignore
import ProfileForm from './ProfileForm';
// @ts-ignore
import ModeSelector from './ModeSelector';
// @ts-ignore
import PracticePanel from './PracticePanel';
import { useState } from 'react';

import type { UserState } from '../../features/game/state';

interface HomePageProps {
  users: Record<string, UserState>;
  currentUserId: string | null;
  onCreateUser: (username: string) => void;
  onSwitchUser: (userId: string) => void;
  onSetMode: (mode: string) => void;
  sessionSize?: number;
  onSetSessionSize?: (n: number) => void;
  mode: string;
  mainWord: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  transliteration?: string;
  transliterationHi?: string;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  columns?: number;
  layout?: 'topbar' | 'sidebar' | 'center';
}

export default function HomePage({
  users,
  currentUserId,
  onCreateUser,
  onSwitchUser,
  onSetMode,
  sessionSize,
  onSetSessionSize,
  mode,
  mainWord,
  choices,
  transliteration,
  transliterationHi,
  onCorrect,
  onWrong,
  onNext,
  columns = 6,
  layout = 'topbar',
}: HomePageProps) {
  // Form state for ProfileForm (moved from component to container)
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Rainbow gradient for header/sidebar only
  const rainbowBg = 'linear-gradient(135deg, #ff4d4d 0%, #ff8a3d 20%, #ffd24d 40%, #4dd08a 60%, #5db3ff 80%, #b98bff 100%)';

  // Top Bar Layout
  if (layout === 'topbar') {
    return (
      <div style={{ height: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', background: rainbowBg, padding: '12px 48px 12px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12, maxWidth: '100%', overflow: 'hidden', paddingRight: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
              <span role="img" aria-label="sparkle" style={{ fontSize: 22 }}>✨</span>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', margin: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>Kids Deliberate Practice</h1>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '10px 48px 10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', maxWidth: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <ProfileForm 
                compact 
                users={users} 
                currentUserId={currentUserId} 
                onCreateUser={onCreateUser} 
                onSwitchUser={onSwitchUser}
                username={username}
                onUsernameChange={setUsername}
                showCreateForm={showCreateForm}
                onToggleCreateForm={setShowCreateForm}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <ModeSelector compact mode={mode} onSetMode={onSetMode} />
              {/* Session size selector: 3,6,9,12 */}
              <div>
                <select
                  aria-label="session-size"
                  value={sessionSize ?? 6}
                  onChange={e => onSetSessionSize && onSetSessionSize(Number(e.target.value))}
                  style={{ padding: '6px 10px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
                >
                  <option value={3}>3 items</option>
                  <option value={6}>6 items</option>
                  <option value={9}>9 items</option>
                  <option value={12}>12 items</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: '#fff', margin: '4px', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <PracticePanel mainWord={mainWord} transliteration={transliteration} transliterationHi={transliterationHi} choices={choices} onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} columns={columns} mode={mode} />
        </div>
      </div>
    );
  }

  // Sidebar Layout
  if (layout === 'sidebar') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex' }}>
  <div style={{ width: 280, background: rainbowBg, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 24, textAlign: 'center' }}>Kids<br />Deliberate<br />Practice</h1>
          <ProfileForm 
            compact 
            users={users} 
            currentUserId={currentUserId} 
            onCreateUser={onCreateUser} 
            onSwitchUser={onSwitchUser}
            username={username}
            onUsernameChange={setUsername}
            showCreateForm={showCreateForm}
            onToggleCreateForm={setShowCreateForm}
          />
          <ModeSelector compact mode={mode} onSetMode={onSetMode} />
          {/* Diagnostics link removed */}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', background: '#fff', margin: '4px', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
          <PracticePanel mainWord={mainWord} transliteration={transliteration} transliterationHi={transliterationHi} choices={choices} onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} columns={columns} mode={mode} />
        </div>
      </div>
    );
  }

  // Compact Center Layout
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#b98bff', marginBottom: 24, textAlign: 'center' }}>Kids Deliberate Practice</h1>
      <div style={{ width: '100%', maxWidth: 'calc(100vw - 24px)', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
          <ProfileForm 
            compact 
            users={users} 
            currentUserId={currentUserId} 
            onCreateUser={onCreateUser} 
            onSwitchUser={onSwitchUser}
            username={username}
            onUsernameChange={setUsername}
            showCreateForm={showCreateForm}
            onToggleCreateForm={setShowCreateForm}
          />
          <ModeSelector compact mode={mode} onSetMode={onSetMode} />
        </div>
  <PracticePanel mainWord={mainWord} transliteration={transliteration} transliterationHi={transliterationHi} choices={choices} onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} columns={columns} mode={mode} />
      </div>
    </div>
  );
}
