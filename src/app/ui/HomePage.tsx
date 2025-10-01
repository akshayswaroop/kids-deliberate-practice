// @ts-ignore
import ProfileForm from './ProfileForm';
// @ts-ignore
import ModeSelector from './ModeSelector';
import EnhancedPracticePanel from './EnhancedPracticePanel';
import ThemeToggle from './ThemeToggle';
import ProgressStatsDisplay from './ProgressStatsDisplay';
import { useState } from 'react';
// Trace export UI removed

import type { UserState } from '../../infrastructure/state/gameState';

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
  onRevealAnswer?: (revealed: boolean) => void;
  columns?: number;
  isAnswerRevealed?: boolean;
  isEnglishMode?: boolean;
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
  onRevealAnswer,
  columns = 6,
  isAnswerRevealed,
  isEnglishMode,
}: HomePageProps) {
  // Form state for ProfileForm (moved from component to container)
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Trace export UI removed
  
  // Top Bar Layout (single canonical layout kept)
  return (
    <div style={{ height: '100vh', background: 'var(--bg-primary)', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', background: 'var(--gradient-rainbow)', padding: '12px 48px 12px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12, maxWidth: '100%', overflow: 'hidden', paddingRight: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span role="img" aria-label="sparkle" style={{ fontSize: 22 }}>✨</span>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-inverse)', margin: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>Kids Deliberate Practice</h1>
          </div>
        </div>
        <div style={{ background: 'var(--bg-accent)', borderRadius: 12, padding: '10px 48px 10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', maxWidth: '100%', justifyContent: 'space-between' }}>
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
            <ProgressStatsDisplay currentUserId={currentUserId} compact subject={mode} />
            <ModeSelector compact mode={mode} onSetMode={onSetMode} />
            <ThemeToggle />
            {/* Trace export button removed from UI */}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: 'var(--bg-secondary)', margin: '4px', borderRadius: 12, boxShadow: 'var(--shadow-soft)' }}>
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
              color: 'var(--text-primary)',
              marginBottom: '16px',
              fontWeight: 700
            }}>Amazing! You've mastered all questions!</h2>
            <p style={{
              fontSize: 'clamp(16px, 3vw, 20px)',
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              maxWidth: '500px',
              lineHeight: 1.5
            }}>
              🌟 You've completed all available questions in <strong>{mode}</strong> mode. 
              Add more questions to continue your learning journey! 📚✨
            </p>
            
            {/* Show Growth Story */}
            <div style={{ width: '100%', maxWidth: '600px', marginBottom: '24px' }}>
              <ProgressStatsDisplay currentUserId={currentUserId} />
            </div>
            
            <button
              onClick={onNext}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-inverse)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-medium)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
            >
              Check for New Questions
            </button>
          </div>
        ) : (
          // 🎯 DDD-Enhanced Practice Panel
          <EnhancedPracticePanel 
            mainWord={mainWord} 
            transliteration={transliteration} 
            transliterationHi={transliterationHi} 
            answer={answer} 
            notes={notes} 
            choices={choices} 
            onCorrect={onCorrect} 
            onWrong={onWrong} 
            onNext={onNext} 
            onRevealAnswer={onRevealAnswer} 
            columns={columns} 
            mode={mode} 
            isAnswerRevealed={isAnswerRevealed} 
            isEnglishMode={isEnglishMode}
            currentUserId={currentUserId || 'demo-user'}
            currentWord={mainWord || choices[0]?.id || 'unknown'}
          />
        )}
      </div>
  {/* TraceExport component removed */}
    </div>
  );
}
