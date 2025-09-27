// @ts-ignore
import ProfileForm from './ProfileForm';
// @ts-ignore
import ModeSelector from './ModeSelector';
// @ts-ignore
import PracticePanel from './PracticePanel';
import TraceExport from './TraceExport';
import { useState } from 'react';
import './TraceExport.css';

import type { UserState } from '../../features/game/state';

interface HomePageProps {
  users: Record<string, UserState>;
  currentUserId: string | null;
  onCreateUser: (username: string) => void;
  onSwitchUser: (userId: string) => void;
  onSetMode: (mode: string) => void;
  mode: string;
  mainWord: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
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
  mode,
  mainWord,
  choices,
  transliteration,
  transliterationHi,
  answer,
  notes,
  onCorrect,
  onWrong,
  onNext,
  columns = 6,
  layout = 'topbar',
}: HomePageProps) {
  // Form state for ProfileForm (moved from component to container)
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Trace export state
  const [showTraceExport, setShowTraceExport] = useState(false);
  
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
              <button 
                onClick={() => setShowTraceExport(true)}
                style={{
                  background: 'rgba(59, 130, 246, 0.9)',
                  border: 'none',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.9)'}
                title="Export trace data for debugging"
              >
                🔍
              </button>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: '#fff', margin: '4px', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <PracticePanel mainWord={mainWord} transliteration={transliteration} transliterationHi={transliterationHi} answer={answer} notes={notes} choices={choices} onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} columns={columns} mode={mode} />
        </div>
        
        <TraceExport isVisible={showTraceExport} onClose={() => setShowTraceExport(false)} />
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
          
          {/* Development Tools */}
          <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <button 
              onClick={() => setShowTraceExport(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              🔍 Export Traces
            </button>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', background: '#fff', margin: '4px', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
          <PracticePanel mainWord={mainWord} transliteration={transliteration} transliterationHi={transliterationHi} answer={answer} notes={notes} choices={choices} onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} columns={columns} mode={mode} />
        </div>
        
        <TraceExport isVisible={showTraceExport} onClose={() => setShowTraceExport(false)} />
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
          <button 
            onClick={() => setShowTraceExport(true)}
            style={{
              background: 'rgba(59, 130, 246, 0.9)',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.9)'}
            title="Export trace data for debugging"
          >
            🔍
          </button>
        </div>
  <PracticePanel mainWord={mainWord} transliteration={transliteration} transliterationHi={transliterationHi} answer={answer} notes={notes} choices={choices} onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} columns={columns} mode={mode} />
      </div>
      
      <TraceExport isVisible={showTraceExport} onClose={() => setShowTraceExport(false)} />
    </div>
  );
}
