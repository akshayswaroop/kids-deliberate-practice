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
  needsNewSession?: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  columns?: number;
  // layout prop removed — single canonical topbar layout is used
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
  needsNewSession,
  onCorrect,
  onWrong,
  onNext,
  columns = 6,
}: HomePageProps) {
  // Form state for ProfileForm (moved from component to container)
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Trace export state
  const [showTraceExport, setShowTraceExport] = useState(false);
  
  // Rainbow gradient for header/sidebar only
  const rainbowBg = 'linear-gradient(135deg, #ff4d4d 0%, #ff8a3d 20%, #ffd24d 40%, #4dd08a 60%, #5db3ff 80%, #b98bff 100%)';

  // Top Bar Layout (single canonical layout kept)
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
        {needsNewSession ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            width: '100%'
          }}>
            <div style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              marginBottom: '20px'
            }}>🎉</div>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              color: '#1f2937',
              marginBottom: '16px',
              fontWeight: 700
            }}>Amazing! You've mastered all questions!</h2>
            <p style={{
              fontSize: 'clamp(16px, 3vw, 20px)',
              color: '#6b7280',
              marginBottom: '24px',
              maxWidth: '500px',
              lineHeight: 1.5
            }}>
              🌟 You've completed all available questions in <strong>{mode}</strong> mode. 
              Add more questions to continue your learning journey! 📚✨
            </p>
            <button
              onClick={onNext}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
            >
              Check for New Questions
            </button>
          </div>
        ) : (
          <PracticePanel mainWord={mainWord} transliteration={transliteration} transliterationHi={transliterationHi} answer={answer} notes={notes} choices={choices} onCorrect={onCorrect} onWrong={onWrong} onNext={onNext} columns={columns} mode={mode} />
        )}
      </div>
      <TraceExport isVisible={showTraceExport} onClose={() => setShowTraceExport(false)} />
    </div>
  );
}
