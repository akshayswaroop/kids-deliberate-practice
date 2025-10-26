// @ts-ignore
import ProfileForm from './ProfileForm';
// @ts-ignore
import ModeSelector from './ModeSelector';
import EnhancedPracticePanel from './EnhancedPracticePanel';
import ThemeToggle from './ThemeToggle';
// ProgressStatsDisplay removed - previously displayed inline stats in header
import { useState, useEffect, useCallback } from 'react';
import { setSarvamApiKey, hasUserSarvamApiKey, clearSarvamApiKey } from '../../utils/sarvamApiKey';
import { traceAPI } from '../tracing/traceMiddleware';
import PracticeIntro from './PracticeIntro';
import Coachmark from './Coachmark';
import ParentGuideSheet from './ParentGuideSheet';
// @ts-ignore
import AppHeader from './AppHeader';
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
  const [showIntroOverlay, setShowIntroOverlay] = useState(ui.guidance.showIntro);
  const [isParentGuideOpen, setParentGuideOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  // Sarvam API key management (user-provided, stored in localStorage)
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => (hasUserSarvamApiKey() ? '********' : ''));
  const [apiKeyMasked, setApiKeyMasked] = useState<boolean>(true);
  const [apiKeyStatus, setApiKeyStatus] = useState<string>(() => {
    const hasUserKey = hasUserSarvamApiKey();
    const hasEnv = !!((import.meta as any)?.env?.VITE_SARVAM_API_KEY);
    if (hasUserKey) return 'Using your key (stored in this browser)';
    if (hasEnv) return 'Using app key (build-time)';
    return 'No API key configured (TTS/Transliteration disabled)';
  });

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
    if (ui.guidance.showIntro) {
      setShowIntroOverlay(true);
    }
  }, [ui.guidance.showIntro]);

  useEffect(() => {
    if (showIntroOverlay) {
      return;
    }
  }, [showIntroOverlay]);

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

  const handleApiKeySave = () => {
    // If the input is masked placeholder, do nothing
    if (apiKeyInput === '********') return;
    const trimmed = (apiKeyInput || '').trim();
    if (!trimmed) {
      clearSarvamApiKey();
    } else {
      setSarvamApiKey(trimmed);
    }
    // Update visible status and mask the input
    const hasUserKey = hasUserSarvamApiKey();
    const hasEnv = !!((import.meta as any)?.env?.VITE_SARVAM_API_KEY);
    setApiKeyStatus(hasUserKey ? 'Using your key (stored in this browser)' : (hasEnv ? 'Using app key (build-time)' : 'No API key configured (TTS/Transliteration disabled)'));
    setApiKeyMasked(true);
    setApiKeyInput(hasUserKey ? '********' : '');
    // Light feedback
    try { if (typeof window !== 'undefined') window.alert('API key saved for this browser.'); } catch {}
  };

  const handleApiKeyClear = () => {
    clearSarvamApiKey();
    const hasEnv = !!((import.meta as any)?.env?.VITE_SARVAM_API_KEY);
    setApiKeyStatus(hasEnv ? 'Using app key (build-time)' : 'No API key configured (TTS/Transliteration disabled)');
    setApiKeyInput('');
    setApiKeyMasked(true);
  };

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

            {/* Sarvam API Key configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(15,23,42,0.65)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#e2e8f0' }}>Sarvam API Key</span>
                <span style={{ fontSize: 12, color: '#cbd5e1' }}>{apiKeyStatus}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type={apiKeyMasked ? 'password' : 'text'}
                  inputMode="text"
                  placeholder="Paste your Sarvam API key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  style={{ flex: 1, borderRadius: 10, border: '1px solid rgba(148,163,184,0.35)', padding: '10px 12px', background: 'rgba(2,6,23,0.35)', color: '#e2e8f0' }}
                />
                <button
                  type="button"
                  onClick={() => setApiKeyMasked(m => !m)}
                  title={apiKeyMasked ? 'Show key' : 'Hide key'}
                  style={{ border: 'none', background: 'rgba(15,23,42,0.35)', color: '#e2e8f0', padding: '10px 12px', borderRadius: 10, cursor: 'pointer' }}
                >
                  {apiKeyMasked ? '👁️' : '🙈'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleApiKeyClear}
                  style={{ border: 'none', background: 'rgba(239,68,68,0.2)', color: '#fecaca', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={handleApiKeySave}
                  style={{ border: 'none', background: 'linear-gradient(90deg,#60a5fa,#38bdf8)', color: '#0f172a', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 800 }}
                >
                  Save
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                Your key is stored only in this browser&apos;s local storage. This is not secure; use for personal/testing.
                To disable, click Remove. When no key is set, the app will use the build-time key if present.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppHeader
          mode={ui.mode}
          modeOptions={ui.modeOptions}
          currentUserId={ui.currentUserId}
          onSetMode={onSetMode}
          onOpenSubjectPicker={() => {}} // No-op - single subject only
          onOpenSettings={() => setControlsOpen(true)}
          statsSlot={null}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 16, boxShadow: 'var(--shadow-soft)', position: 'relative', overflow: 'hidden' }}>
        {ui.practice.needsNewSession ? (
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
              {/* ProgressStatsDisplay removed */}
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
            onReturnHome={() => {}} // No-op - single subject, just continue practicing
          />
        )}
          </div>
        </div>
      </div>

      <ParentGuideSheet open={isParentGuideOpen} onClose={closeParentGuide} onAcknowledge={() => {
        onParentGuideAcknowledged();
      }} />
      {showIntroOverlay && <PracticeIntro onDismiss={handleIntroDismiss} />}
  {/* TraceExport component removed */}
    </div>
  );
}
