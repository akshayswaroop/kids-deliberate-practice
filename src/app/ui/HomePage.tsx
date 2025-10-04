// @ts-ignore
import ProfileForm from './ProfileForm';
// @ts-ignore
import ModeSelector from './ModeSelector';
import EnhancedPracticePanel from './EnhancedPracticePanel';
import ThemeToggle from './ThemeToggle';
import ProgressStatsDisplay from './ProgressStatsDisplay';
import RevisionPanel from './RevisionPanel';
import { useState, useEffect, useCallback } from 'react';
import { traceAPI } from '../tracing/traceMiddleware';
import PracticeIntro from './PracticeIntro';
import Coachmark from './Coachmark';
import ParentGuideSheet from './ParentGuideSheet';
import SubjectPickerModal from './SubjectPickerModal';
// Trace export UI removed

import type { PracticeHomeViewModel } from '../presenters/practicePresenter';

interface HomePageProps {
  ui: PracticeHomeViewModel;
  onCreateUser: (userId: string, displayName?: string) => void;
  onSwitchUser: (userId: string) => void;
  onSetMode: (mode: string) => void;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  onRevealAnswer?: (revealed: boolean) => void;
  onDismissIntro: () => void;
  onCoachmarkSeen: (coachmark: 'streak' | 'profiles') => void;
  onParentGuideAcknowledged: () => void;
  onWhyRepeatAcknowledged?: () => void;
}

export default function HomePage({
  ui,
  onCreateUser,
  onSwitchUser,
  onSetMode,
  onCorrect,
  onWrong,
  onNext,
  onRevealAnswer,
  onDismissIntro,
  onCoachmarkSeen,
  onParentGuideAcknowledged,
  onWhyRepeatAcknowledged,
}: HomePageProps) {
  // Form state for ProfileForm (moved from component to container)
  const [username, setUsername] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [showIntroOverlay, setShowIntroOverlay] = useState(ui.guidance.showIntro);
  const [isParentGuideOpen, setParentGuideOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [subjectPickerSeen, setSubjectPickerSeen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('kdp:subject-picker-v1') === 'true';
  });
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);
  const hasRevisionPanel = !!ui.revisionPanel;

  const handleShareFeedback = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const traceCount = traceAPI.getTraceCount();
    if (!traceCount) {
      window.alert('No trace entries recorded yet. Try reproducing the issue before exporting diagnostics.');
      return;
    }

    const session = traceAPI.exportCurrentSession();
    const fileName = `trace-${session.sessionId}.json`;
    const payload = JSON.stringify(session, null, 2);

    try {
      const file = typeof File !== 'undefined' ? new File([payload], fileName, { type: 'application/json' }) : null;
      const navigatorAny = window.navigator as Navigator & { canShare?: (data: any) => boolean; share?: (data: any) => Promise<void> };

      if (file && navigatorAny?.canShare?.({ files: [file] }) && navigatorAny?.share) {
        await navigatorAny.share({
          files: [file],
          title: 'Kids Practice Diagnostics Trace',
          text: 'Trace export from Kids Deliberate Practice',
        });
        return;
      }
    } catch {
      // Ignore and fall through to download + mailto fallback
    }

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);

    const subject = encodeURIComponent('Kids Practice Feedback with Diagnostics Trace');
    const body = encodeURIComponent([
      'Hi Kids Deliberate Practice team,',
      '',
      'I encountered an issue while using the app. The diagnostics trace was downloaded automatically just now.',
      `Please attach the file "${fileName}" to this email before sending it.`,
      '',
      `Trace session id: ${session.sessionId}`,
      '',
      'Issue description:',
      '',
    ].join('\n'));

    window.location.href = `mailto:dilsemonk@gmail.com?subject=${subject}&body=${body}`;
  }, []);

  const handleCreateUser = (displayName?: string) => {
    const id = `user_${Date.now()}`;
    onCreateUser(id, displayName);
    onSwitchUser(id);
  };

  // Close the Kannada revision panel if user switches away from Kannada mode(s)
  useEffect(() => {
    if (!hasRevisionPanel && showRevisionPanel) {
      setShowRevisionPanel(false);
    }
  }, [hasRevisionPanel, showRevisionPanel]);

  useEffect(() => {
    if (ui.guidance.showIntro) {
      setShowIntroOverlay(true);
    }
  }, [ui.guidance.showIntro]);

  useEffect(() => {
    if (showIntroOverlay) {
      return;
    }
    // Don't auto-open the subject picker during automated tests (Playwright/Vitest)
    const isTestEnv = (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');
    if (isTestEnv) return;
    if (!subjectPickerSeen) {
      setSubjectPickerOpen(true);
    }
  }, [showIntroOverlay, subjectPickerSeen]);

  const handleIntroDismiss = () => {
    setShowIntroOverlay(false);
    onDismissIntro();
    handleCoachmarkDismiss('profiles');
    handleCoachmarkDismiss('streak');
  };

  const handleCoachmarkDismiss = (coachmark: 'streak' | 'profiles') => {
    onCoachmarkSeen(coachmark);
  };

  const openParentGuide = () => {
    setParentGuideOpen(true);
    if (ui.guidance.showParentGuideHint) {
      onParentGuideAcknowledged();
    }
  };

  const closeParentGuide = () => {
    setParentGuideOpen(false);
  };

  const rememberSubjectPicker = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('kdp:subject-picker-v1', 'true');
    }
    setSubjectPickerSeen(true);
  }, []);

  const handleSubjectSelect = useCallback((modeValue: string) => {
    onSetMode(modeValue);
    rememberSubjectPicker();
    setSubjectPickerOpen(false);
  }, [onSetMode, rememberSubjectPicker]);

  const handleSubjectPickerDismiss = useCallback(() => {
    rememberSubjectPicker();
    setSubjectPickerOpen(false);
  }, [rememberSubjectPicker]);

  return (
    <div style={{ height: '100vh', background: 'var(--bg-primary)', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', display: 'flex' }}>
      {controlsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 5000
          }}
          onClick={() => setControlsOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(320px, 90vw)',
              background: 'rgba(15,23,42,0.92)',
              borderRadius: '16px 0 0 16px',
              boxShadow: '-8px 0 24px rgba(15, 23, 42, 0.18)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0' }}>Practice settings</h2>
              <button
                type="button"
                onClick={() => setControlsOpen(false)}
                aria-label="Close controls"
                style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#cbd5f5' }}
              >
                ✕
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <ProfileForm 
                compact 
                users={ui.users}
                currentUserId={ui.currentUserId}
                onCreateUser={(displayName?: string) => handleCreateUser(displayName)}
                onSwitchUser={onSwitchUser}
                username={username}
                onUsernameChange={setUsername}
                showCreateForm={showCreateForm}
                onToggleCreateForm={setShowCreateForm}
              />
              {ui.guidance.showProfilesCoachmark && !showIntroOverlay && (
                <div style={{ position: 'absolute', top: '-130%', left: 0 }}>
                  <Coachmark
                    message="Add each child here so everyone keeps their own streaks."
                    onDismiss={() => handleCoachmarkDismiss('profiles')}
                    testId="coachmark-profiles"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={openParentGuide}
              style={{
                position: 'relative',
                padding: '12px 14px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(90deg,#60a5fa,#38bdf8)',
                color: '#0f172a',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              ℹ️ Parent Guide
              {ui.guidance.showParentGuideHint && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#f97316',
                    boxShadow: '0 0 0 8px rgba(249, 115, 22, 0.25)',
                  }}
                />
              )}
            </button>

            {hasRevisionPanel && ui.revisionPanel && (
              <button
                data-testid="btn-revision-panel"
                onClick={() => setShowRevisionPanel(true)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(90deg,#ffd29b,#ff8a8a)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                  color: '#7c2d12'
                }}
              >
                {ui.revisionPanel.buttonLabel}
              </button>
            )}

            <button
              type="button"
              onClick={handleShareFeedback}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(90deg,#8ce0ff,#3b82f6)',
                cursor: 'pointer',
                color: 'var(--text-inverse)',
                fontWeight: 600,
                textAlign: 'left'
              }}
            >
              Share Diagnostics
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: 'rgba(15,23,42,0.65)' }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Dark mode</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          background: 'var(--gradient-rainbow)',
          padding: '14px 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 1fr) minmax(220px, auto) minmax(200px, auto)',
          gap: 16,
          alignItems: 'center',
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-inverse)', minWidth: 180 }}>
            <span role="img" aria-label="sparkle" style={{ fontSize: 22 }}>✨</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, whiteSpace: 'nowrap' }}>Kids Deliberate Practice</h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0, gap: 8, alignItems: 'center' }}>
            {/* Inline Mode selector without large pill container */}
            <div style={{ flex: '0 1 auto', minWidth: 0 }}>
              <ModeSelector compact mode={ui.mode} options={ui.modeOptions} onSetMode={onSetMode} />
            </div>

            {/* Small icon-only button to open subject picker (replaces 'Browse all' text) */}
            <button
              type="button"
              onClick={() => setSubjectPickerOpen(true)}
              aria-label="Browse all subjects"
              title="Browse all subjects"
              style={{
                border: 'none',
                background: 'rgba(15,23,42,0.16)',
                color: 'var(--text-inverse)',
                borderRadius: 10,
                padding: 8,
                width: 36,
                height: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3 5h18M3 12h18M3 19h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {/* Parent guidance chip removed to reduce header clutter on small screens */}
            <div style={{ position: 'relative' }}>
              <ProgressStatsDisplay currentUserId={ui.currentUserId} compact subject={ui.mode} />
              {ui.guidance.showStreakCoachmark && !showIntroOverlay && (
                <div style={{ position: 'absolute', top: '110%', right: 0 }}>
                  <Coachmark
                    message="Daily streaks and attempts climb with every try—show this to keep them motivated."
                    onDismiss={() => handleCoachmarkDismiss('streak')}
                    ctaLabel={ui.guidance.showParentGuideHint ? 'See Parent Guide' : undefined}
                    onCta={openParentGuide}
                    testId="coachmark-streak"
                  />
                </div>
              )}
            </div>
            {hasRevisionPanel && ui.revisionPanel && (
              <button
                type="button"
                data-testid="btn-revision-panel"
                onClick={() => setShowRevisionPanel(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'rgba(15,23,42,0.18)',
                  color: 'var(--text-inverse)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                📚 Revision
              </button>
            )}
            <button
              type="button"
              onClick={() => setControlsOpen(true)}
              aria-label="Open practice settings"
              style={{
                border: 'none',
                background: 'rgba(15,23,42,0.18)',
                borderRadius: 14,
                padding: '8px 16px',
                color: 'var(--text-inverse)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4.5" width="14" height="2" rx="1" fill="currentColor" />
                  <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
                  <rect x="3" y="13.5" width="14" height="2" rx="1" fill="currentColor" />
                </svg>
              </span>
              Settings
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-soft)', position: 'relative', overflow: 'hidden' }}>
        {showRevisionPanel && ui.revisionPanel ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: 16,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
            <RevisionPanel
              title={ui.revisionPanel.title}
              items={ui.revisionPanel.items}
              onClose={() => setShowRevisionPanel(false)}
            />
          </div>
        ) : ui.practice.needsNewSession ? (
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
              🌟 You've completed all available questions in <strong>{ui.mode}</strong> mode. 
              Add more questions to continue your learning journey! 📚✨
            </p>
            
            {/* Show Growth Story */}
            <div style={{ width: '100%', maxWidth: '600px', marginBottom: '24px' }}>
              <ProgressStatsDisplay currentUserId={ui.currentUserId} />
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
            practice={ui.practice}
            onCorrect={onCorrect} 
            onWrong={onWrong} 
            onNext={onNext} 
            onRevealAnswer={onRevealAnswer} 
            mode={ui.mode} 
            currentUserId={ui.currentUserId ?? undefined}
            onWhyRepeatAcknowledged={onWhyRepeatAcknowledged}
          />
        )}
          </div>
        </div>
      </div>

      <ParentGuideSheet open={isParentGuideOpen} onClose={closeParentGuide} onAcknowledge={() => {
        onParentGuideAcknowledged();
      }} />
      <SubjectPickerModal
        open={subjectPickerOpen && !showIntroOverlay}
        selectedMode={ui.mode}
        onSelect={handleSubjectSelect}
        onClose={handleSubjectPickerDismiss}
      />
      {showIntroOverlay && <PracticeIntro onDismiss={handleIntroDismiss} />}
  {/* TraceExport component removed */}
    </div>
  );
}
