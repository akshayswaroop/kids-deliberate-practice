import React from 'react';
import './PracticeCard.css';
import GradientText from './GradientText.jsx';
import { getScriptFontClass, getScriptLineHeight } from '../../utils/scriptDetector';
import { getSubjectPromptLabel, getSubjectParentInstruction } from '../../infrastructure/repositories/subjectLoader.ts';

import FlyingUnicorn from './FlyingUnicorn.jsx';
import PracticeActionBarPortal from './PracticeActionBarPortal.jsx';
import PracticeActionBar from './PracticeActionBar.jsx';
import { synthesizeSpeech } from '../../infrastructure/services/tts/sarvamTtsService';
import PracticeActionButton from './PracticeActionButton.jsx';
import { transliterateText } from '../../infrastructure/services/transliterate/sarvamTransliterateService';
import { transliterateKannadaToHindi } from '../../infrastructure/services/transliterate/aksharamukhaTransliterateService';

const PROGRESSION_DELAY_MS = 120;

const rawBaseUrl = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
  ? import.meta.env.BASE_URL
  : '/';
const ensureTrailingSlash = value => (value.endsWith('/') ? value : `${value}/`);
const ensureLeadingSlash = value => (value.startsWith('/') ? value : `/${value}`);
const normalizedBaseUrl = ensureLeadingSlash(ensureTrailingSlash(rawBaseUrl));
const buildSoundUrl = filename => `${normalizedBaseUrl}${filename.replace(/^\/+/, '')}`;

function AttemptBadge({ label, value, accentRGB, info }) {
  const accentColor = `rgb(${accentRGB})`;
  const accentBackground = `rgba(${accentRGB}, ${value > 0 ? 0.18 : 0.12})`;
  const accentBorder = `1px solid rgba(${accentRGB}, 0.3)`;
  const tooltipId = React.useId();
  const [showTooltip, setShowTooltip] = React.useState(false);
  const hasInfo = typeof info === 'string' && info.trim().length > 0;

  const handleEnter = () => {
    if (hasInfo) setShowTooltip(true);
  };

  const handleLeave = () => setShowTooltip(false);

  const handleClick = () => {
    if (hasInfo) setShowTooltip(prev => !prev);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: 10,
        background: accentBackground,
        border: accentBorder,
        minWidth: 72,
        minHeight: 48,
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
        position: 'relative',
      }}
      onMouseLeave={handleLeave}
    >
      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: accentColor }}>{value}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {hasInfo && (
          <button
            type="button"
            aria-label={`About ${label}`}
            aria-describedby={showTooltip ? tooltipId : undefined}
            onMouseEnter={handleEnter}
            onBlur={handleLeave}
            onClick={handleClick}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden focusable="false" style={{ display: 'block' }}>
              <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.18" />
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" fill="white" />
              <text x="8" y="11" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">i</text>
            </svg>
            {/* AUDIT: Inline SVG uses hard-coded width/height (14px). Suggestion: use CSS-controlled size or set width/height to 1em and control via font-size so the icon scales with surrounding text, e.g., width="1em" height="1em" or style={{width: '14px', height: '14px', maxWidth: '1.2em'}}. */}
          </button>
        )}
      </span>
      {hasInfo && showTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15,23,42,0.95)',
            color: '#e2e8f0',
            padding: '10px 12px',
            borderRadius: 10,
            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)',
            width: 220,
            fontSize: '0.75rem',
            lineHeight: 1.4,
            zIndex: 50,
          }}
        >
          {info}
        </div>
      )}
    </div>
  );
}

export default function PracticeCard({
  mainWord,
  transliteration,
  transliterationHi,
  answer,
  notes,
  choices,
  onCorrect,
  onWrong,
  onNext,
  onRevealAnswer,
  columns = 6,
  mode,
  isAnswerRevealed,
  isEnglishMode,
  currentUserId,
  whyRepeat = null,
  onWhyRepeatAcknowledged,
  attemptStats = null,
  sessionProgress = null,
  attemptHistory = [],
  animationDurationMs = 2500,
  sessionGuidance = null,
  onStatusChange,
}) {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? { MODE: process.env?.NODE_ENV } : {});
  const isTestMode = env?.MODE === 'test';
  const normalizedAttemptStats = attemptStats || { total: 0, correct: 0, incorrect: 0 };
  // We prefer showing the parent instruction (guidance for the caregiver)
  // in the practice header instead of the short prompt label.
  const parentInstruction = getSubjectParentInstruction(mode);
  const showAnswerPanel = isAnswerRevealed;

  // Animation helper functions
  const createConfettiBurst = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'];
    
    // Find the main word element to center confetti on it
    const targetWordElement = document.querySelector('.target-word-glow');
    const rect = targetWordElement ? targetWordElement.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight * 0.2, width: 200, height: 80 };
    
    const container = document.createElement('div');
    container.className = 'confetti-burst';
    container.style.left = `${rect.left + rect.width / 2}px`;
    container.style.top = `${rect.top + rect.height / 2}px`;
    container.style.transform = 'translate(-50%, -50%)';
  // AUDIT: confetti container uses fixed 300px size which can overflow or clip on narrow screens.
  // Suggestion: use responsive sizing like: container.style.width = `${Math.min(300, window.innerWidth * 0.9)}px`; container.style.height likewise or use clamp() equivalent in JS.
  container.style.width = '300px';
  container.style.height = '300px';
    document.body.appendChild(container);

    // Increased quantity from 20 to 40 particles
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Spread particles in a circle around the main word
      const angle = (i / 40) * Math.PI * 2;
      const radius = Math.random() * 80 + 20; // Random radius between 20-100px
      const startX = Math.cos(angle) * radius;
      const startY = Math.sin(angle) * radius;
      
      particle.style.left = `${150 + startX}px`; // Center of 300px container
      particle.style.top = `${150 + startY}px`;
      particle.style.animationDelay = `${Math.random() * 300}ms`;
      particle.style.animationDuration = `${1200 + Math.random() * 800}ms`;
      container.appendChild(particle);
    }

    setTimeout(() => document.body.removeChild(container), 2500);
  };

  const triggerBounceAnimation = () => {
    // Add bounce class to all non-active tiles
    const tiles = document.querySelectorAll('.mastery-tile:not(.active)');
    tiles.forEach(tile => {
      tile.classList.add('bounce');
      setTimeout(() => tile.classList.remove('bounce'), 600);
    });
  };


  // --- Unified status state ---
  // 'idle' = ready for input, 'pending' = waiting for state update, 'animating' = animating feedback, 'waiting' = waiting for next question
  const [status, setStatus] = React.useState('idle');
  // Animation states
  const [showUnicorn, setShowUnicorn] = React.useState(false);
  const [whyRepeatDismissed, setWhyRepeatDismissed] = React.useState(false);
  const [shakeButtons, setShakeButtons] = React.useState(false); // Shake animation for wrong answer

  const safeAttemptHistory = Array.isArray(attemptHistory) ? attemptHistory : [];
  const attemptCount = safeAttemptHistory.length;
  const lastAttempt = attemptCount > 0 ? safeAttemptHistory[attemptCount - 1] : null;
  const previousAttemptCountRef = React.useRef(attemptCount);
  const animationTimeoutRef = React.useRef(null);
  const shakeTimeoutRef = React.useRef(null);

  // onStatusChange removed - banner now reads directly from Redux (trace-based architecture)


  // --- Centralized progression logic ---
  // For wrong answer, coordinate sound and animation using Promise.all
  const handleProgression = React.useCallback(() => {
    if (onNext) onNext();
    setStatus('idle');
  }, [onNext]);
  

  // Reset all state on new question
  React.useEffect(() => {
    setShowUnicorn(false);
    setStatus('idle');
    setWhyRepeatDismissed(false);
    previousAttemptCountRef.current = attemptCount;
  }, [mainWord]);

  React.useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      if (shakeTimeoutRef.current !== null) {
        window.clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    const previousCount = previousAttemptCountRef.current ?? 0;
    if (attemptCount > previousCount && lastAttempt) {
      const result = lastAttempt.result === 'correct' ? 'correct' : 'wrong';
      setStatus('animating');

      if (result === 'correct') {
        createConfettiBurst();
        try {
          const audio = new window.Audio(buildSoundUrl('happy-logo-167474.mp3'));
          audio.volume = 0.7;
          audio.play()?.catch(() => {});
        } catch (e) {
          // Ignore playback errors
        }
        setShakeButtons(false);
      } else {
        triggerBounceAnimation();
        setShakeButtons(true);
        const shakeDuration = Math.min(500, animationDurationMs);
        if (shakeTimeoutRef.current !== null) {
          window.clearTimeout(shakeTimeoutRef.current);
        }
        shakeTimeoutRef.current = window.setTimeout(() => {
          setShakeButtons(false);
          shakeTimeoutRef.current = null;
        }, shakeDuration);
      }

      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = window.setTimeout(() => {
        setStatus('waiting');
        animationTimeoutRef.current = null;
      }, animationDurationMs);
    }

    previousAttemptCountRef.current = attemptCount;
  }, [attemptCount, lastAttempt?.result]);


  // No safety fallback needed with unified status


  // Handler for unicorn animation end
  const handleUnicornEnd = React.useCallback(() => {
    setShowUnicorn(false);
    setStatus('waiting');
    // No auto-advance - parent must click Next button
  }, []);

  // Determine current active choice progress to render rainbow fill for the main question
  const activeChoice = (choices || []).find(c => String(c.label) === String(mainWord));
  const activeProgress = Math.min(100, Math.max(0, (activeChoice && (typeof activeChoice.progress === 'number' ? activeChoice.progress : Number(activeChoice && activeChoice.progress))) || 0));
  const isMastered = activeProgress >= 100;
  const isSessionComplete = sessionGuidance?.context === 'completion';
  const [speaking, setSpeaking] = React.useState(false);
  const [ttsOpen, setTtsOpen] = React.useState(false);
  const [ttsPace, setTtsPace] = React.useState(() => {
    if (typeof window === 'undefined') return 1;
    const v = Number(window.localStorage.getItem('kdp:tts:pace') || '1');
    return Number.isFinite(v) ? v : 1;
  });
  const [ttsSpeaker, setTtsSpeaker] = React.useState(() => {
    if (typeof window === 'undefined') return 'anushka';
    const raw = window.localStorage.getItem('kdp:tts:speaker') || 'anushka';
    return String(raw).toLowerCase();
  });
  // Transliteration UI state (Kannada → Hindi)
  const [trlOpen, setTrlOpen] = React.useState(false);
  const [trlBusy, setTrlBusy] = React.useState(false);
  const [trlSpoken, setTrlSpoken] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    return (window.localStorage.getItem('kdp:trl:spoken') || 'true') === 'true';
  });
  const [trlNumerals, setTrlNumerals] = React.useState(() => {
    if (typeof window === 'undefined') return 'international';
    return window.localStorage.getItem('kdp:trl:numerals') || 'international';
  });
  const [trlOutput, setTrlOutput] = React.useState('');

  const saveTtsPrefs = React.useCallback((pace, speaker) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kdp:tts:pace', String(pace));
        window.localStorage.setItem('kdp:tts:speaker', String((speaker || '').toLowerCase()));
      }
    } catch {}
  }, []);

  const saveTrlPrefs = React.useCallback((spoken, numerals) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kdp:trl:spoken', String(!!spoken));
        window.localStorage.setItem('kdp:trl:numerals', String(numerals || 'international'));
      }
    } catch {}
  }, []);

  const handleSpeak = React.useCallback(async () => {
    try {
      if (!mainWord) return;
      setSpeaking(true);
      const { audioUrl } = await synthesizeSpeech(String(mainWord), {
        target_language_code: 'kn-IN',
        enable_preprocessing: true,
        pace: Math.min(3, Math.max(0.3, Number(ttsPace) || 1)),
        speaker: (ttsSpeaker ? String(ttsSpeaker).toLowerCase() : undefined),
      });
      const audio = new window.Audio(audioUrl);
      audio.onended = () => {
        try { URL.revokeObjectURL(audioUrl); } catch {}
      };
      await audio.play().catch(() => {});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('TTS speak error:', e);
    } finally {
      setSpeaking(false);
    }
  }, [mainWord, ttsPace, ttsSpeaker]);



  const interactionLocked = status !== 'idle' || isMastered || isSessionComplete;
  const hasDetails = Boolean(answer || notes || (whyRepeat && !whyRepeatDismissed));

  return (
      <div data-testid="practice-root" className="practice-root" style={{ 
        backgroundColor: 'transparent',
        animation: shakeButtons ? 'shakeWrong 500ms ease-in-out' : 'none'
      }}>
        {/* Flying unicorn animation overlay */}
        <FlyingUnicorn
          visible={showUnicorn}
          onAnimationEnd={handleUnicornEnd}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2000
          }}
        />

        {/* Main content area: question, answer/notes, and action bar only */}
        <div className="practice-question-area" style={{ color: 'var(--text-primary)' }}>

          {/* Main question */}
          {(() => {
            const text = String(mainWord || '');
            const len = text.length;
            let fontSize = 'clamp(20px, min(5.2vw, 7vh), 56px)';
            let lineHeight = getScriptLineHeight(text);
            let padding = '8px 16px';
            if (len > 100) {
              fontSize = 'clamp(16px, min(3vw, 3.5vh), 24px)';
              lineHeight = Math.max(getScriptLineHeight(text), 1.5);
              padding = '12px 20px';
            } else if (len > 80) {
              fontSize = 'clamp(17px, min(3.2vw, 4vh), 28px)';
              lineHeight = Math.max(getScriptLineHeight(text), 1.4);
              padding = '10px 18px';
            } else if (len > 60) {
              fontSize = 'clamp(18px, min(4vw, 5vh), 48px)';
              lineHeight = Math.max(getScriptLineHeight(text), 1.2);
              padding = '6px 12px';
            } else if (len > 40) {
              fontSize = 'clamp(20px, min(5vw, 6vh), 56px)';
              lineHeight = Math.max(getScriptLineHeight(text), 1.15);
              padding = '6px 14px';
            } else if (len > 28) {
              fontSize = 'clamp(22px, min(5.5vw, 7vh), 64px)';
              lineHeight = getScriptLineHeight(text);
              padding = '8px 16px';
            }
            return (
              <div className="target-word-glow practice-main-target" data-testid="target-word" style={{
                fontSize,
                fontWeight: 900,
                marginTop: 0,
                marginBottom: transliteration ? '6px' : '0px',
                lineHeight,
                letterSpacing: '-0.02em',
                maxWidth: '100%',
                background: 'linear-gradient(135deg, rgba(79,70,229,0.035), rgba(139,92,246,0.015))',
                borderRadius: '20px',
                padding,
                border: '2px solid rgba(79,70,229,0.08)',
                boxShadow: '0 6px 30px rgba(79,70,229,0.08)',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                overflow: 'visible',
                position: 'relative',
                zIndex: 2,
                minHeight: 0,
                textAlign: 'center'
              }}>
                <GradientText
                  progress={activeProgress}
                  gradientColors="red, orange, yellow, green, blue, indigo, violet"
                  neutralColor="var(--text-tertiary)"
                  style={{ textAlign: 'center', width: '100%' }}
                  className={getScriptFontClass(mainWord || '')}
                >
                  {mainWord}
                </GradientText>
                <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
                  {String(mode || '').toLowerCase().includes('kannada') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setTrlOpen(v => !v)}
                        aria-haspopup="dialog"
                        aria-expanded={trlOpen}
                        aria-label="Transliterate to English"
                        title="Transliterate to English"
                        style={{
                          border: '1px solid rgba(79,70,229,0.3)',
                          background: 'white',
                          color: 'var(--text-primary)',
                          borderRadius: 10,
                          padding: '6px 8px',
                          cursor: 'pointer',
                          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)'
                        }}
                      >
                        ಅ→A
                      </button>
                      <button
                        type="button"
                        onClick={handleSpeak}
                        disabled={speaking}
                        aria-label="Speak word"
                        title="Speak word"
                        style={{
                          border: '1px solid rgba(79,70,229,0.3)',
                          background: 'white',
                          color: 'var(--text-primary)',
                          borderRadius: 10,
                          padding: '6px 8px',
                          cursor: speaking ? 'not-allowed' : 'pointer',
                          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)'
                        }}
                      >
                        {speaking ? '🔉' : '🔊'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTtsOpen(v => !v)}
                        aria-haspopup="dialog"
                        aria-expanded={ttsOpen}
                        aria-label="TTS options"
                        title="TTS options"
                        style={{
                          border: '1px solid rgba(79,70,229,0.3)',
                          background: 'white',
                          color: 'var(--text-primary)',
                          borderRadius: 10,
                          padding: '6px 8px',
                          cursor: 'pointer',
                          boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)'
                        }}
                      >
                        ⚙️
                      </button>
                      {ttsOpen && (
                        <div
                          role="dialog"
                          aria-label="Text-to-Speech options"
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 8px)',
                            background: 'white',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(15,23,42,0.12)',
                            borderRadius: 12,
                            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)',
                            padding: 12,
                            width: 280,
                            zIndex: 10,
                            // Reset inherited giant font-size from the big target word container
                            fontSize: 14,
                            lineHeight: 1.4
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 8, marginBottom: 8 }}>
                            <label htmlFor="tts-voice" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Voice</label>
                            <select
                              id="tts-voice"
                              value={ttsSpeaker}
                              onChange={e => { const v = String(e.target.value).toLowerCase(); setTtsSpeaker(v); saveTtsPrefs(ttsPace, v); }}
                              style={{ fontSize: 14, padding: '6px 8px', borderRadius: 8, width: '100%' }}
                            >
                              {[
                                'anushka','abhilash','manisha','vidya','arya','karun','hitesh',
                                'aditya','isha','ritu','chirag','harsh','sakshi','priya','neha','rahul',
                                'pooja','rohan','simran','kavya','anjali','sneha','kiran','vikram','rajesh',
                                'sunita','tara','anirudh','kriti','ishaan'
                              ].map(v => (
                                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <label htmlFor="tts-pace" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pace</label>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{(Number(ttsPace) || 1).toFixed(2)}×</span>
                          </div>
                          <input
                            id="tts-pace"
                            type="range"
                            min={0.5}
                            max={1.5}
                            step={0.05}
                            value={Number(ttsPace) || 1}
                            onChange={e => { const v = Number(e.target.value) || 1; setTtsPace(v); saveTtsPrefs(v, ttsSpeaker); }}
                            style={{ width: '100%', marginTop: 6 }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                            <button
                              type="button"
                              onClick={() => setTtsOpen(false)}
                              style={{ border: '1px solid rgba(15,23,42,0.12)', background: 'white', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 80 }}
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              onClick={handleSpeak}
                              disabled={speaking}
                              style={{ border: 'none', background: 'linear-gradient(135deg,#60a5fa,#38bdf8)', color: '#0f172a', borderRadius: 8, padding: '6px 10px', cursor: speaking ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', minWidth: 80 }}
                            >
                              {speaking ? 'Speaking…' : 'Test'}
                            </button>
                          </div>
                          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Tip: Pace range 0.3–3 is supported by the API. UI slider shows a conservative 0.5–1.5.
                          </div>
                        </div>
                      )}
                      {trlOpen && (
                        <div
                          role="dialog"
                          aria-label="Transliterate options"
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 8px)',
                            background: 'white',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(15,23,42,0.12)',
                            borderRadius: 12,
                            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)',
                            padding: 12,
                            width: 320,
                            zIndex: 10,
                            fontSize: 14,
                            lineHeight: 1.4
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontWeight: 600 }}>Kannada →</div>
                            <button type="button" onClick={() => setTrlOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label="Close">✕</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
                            {/* Target selection */}
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="radio"
                                  name="trl-target"
                                  value="en"
                                  defaultChecked
                                  onChange={() => { /* default English */ }}
                                /> English (Latin)
                              </label>
                              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="radio"
                                  name="trl-target"
                                  value="hi"
                                  onChange={(e) => { /* handled on click by reading DOM */ }}
                                /> Hindi (देवनागरी)
                              </label>
                            </div>
                            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              <input type="checkbox" checked={trlSpoken} onChange={e => { setTrlSpoken(e.target.checked); saveTrlPrefs(e.target.checked, trlNumerals); }} />
                              <span style={{ marginLeft: 6 }}>Spoken form</span>
                            </label>
                            <select
                              value={trlNumerals}
                              onChange={e => { setTrlNumerals(e.target.value); saveTrlPrefs(trlSpoken, e.target.value); }}
                              style={{ fontSize: 13, padding: '4px 6px', borderRadius: 8 }}
                            >
                              <option value="international">International numerals</option>
                              <option value="native">Native numerals</option>
                            </select>
                          </div>
                          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  if (!mainWord) return;
                                  setTrlBusy(true);
                                  // Determine target selection (read from radios)
                                  const target = (() => {
                                    const radios = document.getElementsByName('trl-target');
                                    for (let i = 0; i < radios.length; i++) {
                                      const el = radios[i];
                                      // In JS runtime, these are input elements
                                      if (el && el.checked) return el.value;
                                    }
                                    return 'en';
                                  })();

                                  if (target === 'hi') {
                                    // Kannada → Hindi (Devanagari) via Aksharamukha (no API key required)
                                    const { transliterated_text } = await transliterateKannadaToHindi(String(mainWord));
                                    setTrlOutput(transliterated_text);
                                  } else {
                                    // Kannada → English (Latin) via Sarvam
                                    const { transliterated_text } = await transliterateText(String(mainWord), {
                                      source_language_code: 'kn-IN',
                                      target_language_code: 'en-IN',
                                      spoken_form: !!trlSpoken,
                                      numerals_format: trlNumerals,
                                      spoken_form_numerals_language: 'english',
                                    });
                                    setTrlOutput(transliterated_text);
                                  }
                                } catch (e) {
                                  console.error('Transliterate error:', e);
                                  setTrlOutput('Oops — transliteration failed. Check API key or input.');
                                } finally {
                                  setTrlBusy(false);
                                }
                              }}
                              disabled={trlBusy}
                              style={{ border: 'none', background: 'linear-gradient(135deg,#60a5fa,#38bdf8)', color: '#0f172a', borderRadius: 8, padding: '6px 10px', cursor: trlBusy ? 'not-allowed' : 'pointer', minWidth: 100 }}
                            >
                              {trlBusy ? 'Working…' : 'Transliterate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => { try { navigator.clipboard.writeText(trlOutput || ''); } catch {} }}
                              disabled={!trlOutput}
                              style={{ border: '1px solid rgba(15,23,42,0.12)', background: 'white', borderRadius: 8, padding: '6px 10px', cursor: !trlOutput ? 'not-allowed' : 'pointer' }}
                            >
                              Copy
                            </button>
                          </div>
                          <div style={{ marginTop: 8, background: '#f8fafc', border: '1px dashed rgba(15,23,42,0.15)', borderRadius: 8, padding: 10, maxHeight: 140, overflow: 'auto' }} aria-live="polite">
                            {trlOutput ? (
                              <div className={getScriptFontClass(trlOutput)} style={{ fontSize: 16 }}>{trlOutput}</div>
                            ) : (
                              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Output will appear here</div>
                            )}
                          </div>
                          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                            English (Latin) uses Sarvam (requires API key via Settings or VITE_SARVAM_API_KEY). Hindi (Devanagari) uses Aksharamukha (no key required).
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {isMastered && (
                      <div aria-hidden className="mastered-badge">
                        ✅ Mastered
                      </div>
                    )}
                </div>
                <div aria-live="polite" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>{isMastered ? 'Mastered' : ``}</div>
              </div>
            );
          })()}

          {/* Only render the details panel when there is content to show (not in English mode) */}
          {showAnswerPanel && hasDetails && !isEnglishMode && (
            <div key={mainWord} className="details-panel practice-details" data-testid="details-panel">
              <div className="answer-panel" data-testid="answer-panel" style={{ width: '100%', maxWidth: '100%', flex: '1 1 auto' }}>
                {answer && (
                  <div className={`answer-panel__headline ${getScriptFontClass(answer || '')}`} style={{
                    maxWidth: '100%',
                    fontSize: 'clamp(16px, 3vw, 28px)',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>{answer}</div>
                )}
                {notes && (
                  <div className={`answer-panel__notes ${getScriptFontClass(notes || '')}`} style={{
                    maxWidth: '100%',
                    fontSize: 'clamp(14px, 2.5vw, 22px)',
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>{notes}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Area */}
        <PracticeActionBarPortal>
          <PracticeActionBar>
        {!isEnglishMode && (
          <PracticeActionButton
            data-testid="btn-reveal"
            variant="reveal"
            onClick={() => { 
              if (interactionLocked) return;
              onRevealAnswer && onRevealAnswer(!isAnswerRevealed); 
            }}
            disabled={interactionLocked}
            aria-label={isAnswerRevealed ? 'Hide coaching hint' : 'Show coaching hint'}
            style={{
              opacity: interactionLocked ? 0.6 : 1,
              cursor: interactionLocked ? 'not-allowed' : 'pointer'
            }}
          >
            <span role="img" aria-label={isAnswerRevealed ? 'hide' : 'reveal'}>{isAnswerRevealed ? '🙈' : '🔍'}</span>
            {isAnswerRevealed ? 'Hide coach hint' : 'Show coach hint'}
          </PracticeActionButton>
        )}

        {/* Show all buttons always, but enable/disable appropriately */}
        <PracticeActionButton
          data-testid="btn-correct"
          variant="primary"
          onClick={() => {
            if (interactionLocked) return;
            if (isTestMode) {
              onCorrect && onCorrect();
              handleProgression();
              return;
            }
            setStatus('pending');
            onCorrect && onCorrect();
          }}
          disabled={interactionLocked}
          aria-label="Kid answered correctly"
          style={{
            opacity: interactionLocked ? 0.4 : 1,
            cursor: interactionLocked ? 'not-allowed' : 'pointer'
          }}
        >
          <span role="img" aria-label="thumbs up">👍</span>
          Kid got it
        </PracticeActionButton>

        <PracticeActionButton
          data-testid="btn-wrong"
          variant="secondary"
          onClick={() => {
            if (interactionLocked) return;
            if (isTestMode) {
              onWrong && onWrong();
              handleProgression();
              return;
            }
            setStatus('pending');
            onWrong && onWrong();
          }}
          disabled={interactionLocked}
          aria-label="Kid needs another try"
          style={{
            opacity: interactionLocked ? 0.4 : 1,
            cursor: interactionLocked ? 'not-allowed' : 'pointer'
          }}
        >
          <span role="img" aria-label="try again">↺</span>
          Needs another try
        </PracticeActionButton>

        {/* Show Next button when waiting for progression */}
        <PracticeActionButton
          data-testid="btn-next"
          variant="primary"
          onClick={handleProgression}
          disabled={status !== 'waiting' || isMastered || isSessionComplete}
          aria-label="Move to next question"
          style={{
            opacity: (status !== 'waiting' || isMastered || isSessionComplete) ? 0.4 : 1,
            cursor: (status !== 'waiting' || isMastered || isSessionComplete) ? 'not-allowed' : 'pointer'
          }}
        >
          <span role="img" aria-label="next">→</span>
          Next
        </PracticeActionButton>
        </PracticeActionBar>
      </PracticeActionBarPortal>

    </div>
  );
}
