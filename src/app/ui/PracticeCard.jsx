import React from 'react';
import './PracticeCard.css';
import GradientText from './GradientText.jsx';
import { getScriptFontClass, getScriptLineHeight } from '../../utils/scriptDetector';
import { getSubjectPromptLabel, getSubjectParentInstruction } from '../../infrastructure/repositories/subjectLoader.ts';

import FlyingUnicorn from './FlyingUnicorn.jsx';
import SadBalloonAnimation from './SadBalloonAnimation.jsx';

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

export default function PracticeCard({ mainWord, transliteration, transliterationHi, answer, notes, choices, onCorrect, onWrong, onNext, onRevealAnswer, columns = 6, mode, isAnswerRevealed, isEnglishMode, currentUserId, whyRepeat = null, onWhyRepeatAcknowledged, attemptStats = null, sessionProgress = null }) {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? { MODE: process.env?.NODE_ENV } : {});
  const isTestMode = env?.MODE === 'test';
  const normalizedAttemptStats = attemptStats || { total: 0, correct: 0, incorrect: 0 };
  const promptLabel = getSubjectPromptLabel(mode);
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
  // 'idle' = ready for input, 'animating' = correct/wrong animation, 'waiting' = waiting for next question
  const [status, setStatus] = React.useState('idle');
  // Animation states
  const [showUnicorn, setShowUnicorn] = React.useState(false);
  const [showSadBalloon, setShowSadBalloon] = React.useState(false);
  const [whyRepeatDismissed, setWhyRepeatDismissed] = React.useState(false);


  // --- Centralized progression logic ---
  // For wrong answer, coordinate sound and animation using Promise.all
  const handleProgression = React.useCallback(() => {
    if (onNext) onNext();
    setStatus('idle');
  }, [onNext]);
  

  // Reset all state on new question
  React.useEffect(() => {
    setShowUnicorn(false);
    setShowSadBalloon(false);
    setStatus('idle');
    setWhyRepeatDismissed(false);
  }, [mainWord, answer]);


  // No safety fallback needed with unified status


  // Handler for unicorn animation end
  const handleUnicornEnd = React.useCallback(() => {
    setShowUnicorn(false);
    setStatus('waiting');
    setTimeout(() => handleProgression(), PROGRESSION_DELAY_MS);
  }, [handleProgression]);

  // Handler for encouragement overlay end
  const handleSadBalloonEnd = React.useCallback(() => {
    setShowSadBalloon(false);
    setStatus('waiting');
    setTimeout(() => handleProgression(), PROGRESSION_DELAY_MS);
  }, [handleProgression]);
  // Determine current active choice progress to render rainbow fill for the main question
  const activeChoice = (choices || []).find(c => String(c.label) === String(mainWord));
  const activeProgress = Math.min(100, Math.max(0, (activeChoice && (typeof activeChoice.progress === 'number' ? activeChoice.progress : Number(activeChoice && activeChoice.progress))) || 0));
  const isMastered = activeProgress >= 100;



  const interactionLocked = status !== 'idle';
  const hasDetails = Boolean(answer || notes || (whyRepeat && !whyRepeatDismissed));

  return (
    <div data-testid="practice-root" style={{
      backgroundColor: 'transparent',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      gap: 0,
      width: '100%',
      minHeight: 'auto',
      maxWidth: '100vw',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflow: 'visible', // allow natural page flow and scrolling
      position: 'relative'
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
      {/* Encouragement overlay for wrong answers */}
      <SadBalloonAnimation
        visible={showSadBalloon}
        onAnimationEnd={handleSadBalloonEnd}
      />

      {/* Question Area - Flexible space for readability */}
      <div style={{
        textAlign: 'center',
        color: 'var(--text-primary)',
        width: '100%',
        boxSizing: 'border-box',
        flex: '0 0 auto',
        minHeight: '6rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '12px 12px 0',
        overflow: 'visible',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        gap: 8
      }}>
        {/* Subtle prompt label with session progress */}
        {mode && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            {/* Session progress - small text above prompt */}
            {sessionProgress && sessionProgress.total > 0 && (
              <div style={{
                fontSize: '0.65rem',
                fontWeight: '500',
                color: 'rgba(15,23,42,0.5)',
                letterSpacing: '0.02em'
              }}>
                {sessionProgress.current} of {sessionProgress.total}
              </div>
            )}
            
            {/* Main prompt label */}
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'rgba(15,23,42,0.6)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              {promptLabel}
            </div>
          </div>
        )}

        {(() => {
          const text = String(mainWord || '');
          const len = text.length;
          // Responsive typography within the 30vh Question Area
          // Enhanced readability for long text (especially story comprehension)
          let fontSize = 'clamp(20px, min(5.2vw, 7vh), 56px)';
          let lineHeight = getScriptLineHeight(text); // Use script-aware line height
          let padding = '8px 16px';

          // Better scaling for long text comprehension questions
          if (len > 100) {
            // Very long text (story comprehension questions)
            fontSize = 'clamp(16px, min(3vw, 3.5vh), 24px)';
            lineHeight = Math.max(getScriptLineHeight(text), 1.5); // Ensure minimum 1.5 for very long text
            padding = '12px 20px';
          } else if (len > 80) {
            // Long story questions
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
            <div className="target-word-glow" data-testid="target-word" style={{
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2,
              minHeight: 0,
              flex: '0 0 auto',
              textAlign: 'center' // Ensure centered text alignment
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
                {isMastered && (
                  <div aria-hidden style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'linear-gradient(90deg,#10b981,#34d399)',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: 999,
                    fontWeight: 900,
                    fontSize: 12,
                    boxShadow: '0 8px 20px rgba(16,185,129,0.12)'
                  }}>
                    ✅ Mastered
                  </div>
                )}
              </div>

              <div aria-live="polite" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>{isMastered ? 'Mastered' : ``}</div>
            </div>
          );
        })()}

        {/* Attempt badges completely removed for mobile optimization */}

        {/* Parent instruction now handled by unified banner above */}

        {/* Only render the details panel when there is content to show */}
        {showAnswerPanel && hasDetails && (
          <div key={mainWord} className="details-panel" data-testid="details-panel" style={{
            width: '100%',
            flex: '0 0 auto',
            minHeight: 0,
            maxHeight: '40vh',
            padding: '8px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            borderTopLeftRadius: '0px',
            borderTopRightRadius: '0px',
            borderRadius: '16px',
            background: 'var(--bg-secondary)',
            boxShadow: '0 2px 18px rgba(79,70,229,0.04)',
            overflow: 'auto',
            marginTop: '8px',
            marginBottom: '8px'
          }}>
            <div className="answer-panel" data-testid="answer-panel" style={{
              width: '100%',
              maxWidth: '100%',
              flex: '1 1 auto',
              borderRadius: 12,
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflow: 'auto',
              boxSizing: 'border-box'
            }}>
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
              {whyRepeat && !whyRepeatDismissed && (
                <div style={{
                  width: '100%',
                  background: 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  textAlign: 'left',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.95rem' }}>Why repeat this card?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setWhyRepeatDismissed(true);
                        onWhyRepeatAcknowledged && onWhyRepeatAcknowledged();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#1d4ed8',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Got it
                    </button>
                  </div>
                  <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    We have revealed this answer {whyRepeat.revealCount} times. Repeating it right now helps the memory stick—ask your child to say the answer aloud before moving on.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Action Buttons Area */}
      <div className="practice-action-bar" style={{
        flex: '0 0 auto',
        width: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: '16px',
        padding: '12px 12px 14px',
        margin: '0 12px 8px',
        background: 'var(--bg-accent)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-strong)',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-secondary)',
        boxSizing: 'border-box',
        flexShrink: 0,
        position: 'sticky',
        bottom: '16px'
      }}>
        {!isEnglishMode && (
          <button
            data-testid="btn-reveal"
            onClick={() => { 
              if (interactionLocked) return;
              onRevealAnswer && onRevealAnswer(!isAnswerRevealed); 
            }}
            disabled={interactionLocked}
            aria-label={isAnswerRevealed ? 'Hide coaching hint' : 'Show coaching hint'}
            className="mastery-footer-button reveal"
            style={{
              backgroundColor: interactionLocked ? 'var(--bg-tertiary, #cbd5e1)' : 'transparent',
              color: interactionLocked ? 'var(--text-tertiary, #94a3b8)' : 'var(--button-primary-bg, #2563eb)',
              border: interactionLocked ? '2px solid var(--bg-tertiary, #cbd5e1)' : '2px solid var(--button-primary-bg, #2563eb)',
              borderRadius: 10,
              padding: 'clamp(3px, 0.6vh, 6px) clamp(12px, 2vw, 16px)',
              fontSize: 'clamp(13px, 2.2vw, 16px)',
              fontWeight: 700,
              cursor: interactionLocked ? 'not-allowed' : 'pointer',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
              boxShadow: interactionLocked ? 'none' : '0 4px 12px rgba(37,99,235,0.10)',
              minHeight: 'clamp(28px, 4.5vh, 36px)',
              flex: '1 1 auto',
              maxWidth: '130px',
              opacity: interactionLocked ? 0.6 : 1
            }}
          >
            <span style={{fontSize: 'clamp(14px, 3vw, 18px)'}}>{isAnswerRevealed ? '🙈' : '🔍'}</span>
            <span>{isAnswerRevealed ? 'Hide coach hint' : 'Show coach hint'}</span>
          </button>
        )}

        <button
          data-testid="btn-correct"
          onClick={() => {
            if (status !== 'idle') return;
            if (isTestMode) {
              onCorrect && onCorrect();
              handleProgression();
              return;
            }
            setStatus('animating');
            createConfettiBurst();
            setShowUnicorn(true);
            try {
              const audio = new window.Audio(buildSoundUrl('happy-logo-167474.mp3'));
              audio.volume = 0.7;
              audio.play()?.catch(() => {});
            } catch (e) {
              // Ignore playback errors
            }
            onCorrect && onCorrect();
            // Progression will be handled by unicorn animation end
          }}
          disabled={interactionLocked}
          aria-label="Kid answered correctly"
          className="mastery-footer-button primary"
          style={{
            backgroundColor: interactionLocked ? 'var(--bg-tertiary, #cbd5e1)' : 'var(--button-primary-bg, #2563eb)',
            color: interactionLocked ? 'var(--text-tertiary, #94a3b8)' : 'var(--text-inverse, #fff)',
            border: 'none',
            borderRadius: 10,
            padding: 'clamp(4px, 0.8vh, 8px) clamp(14px, 2.5vw, 18px)',
            fontSize: 'clamp(13px, 2.2vw, 16px)',
            fontWeight: 700,
            cursor: interactionLocked ? 'not-allowed' : 'pointer',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, color 180ms ease',
            boxShadow: interactionLocked ? 'none' : '0 4px 12px rgba(37,99,235,0.10)',
            minHeight: 'clamp(30px, 5vh, 38px)',
            flex: '1 1 auto',
            maxWidth: '140px',
            opacity: interactionLocked ? 0.6 : 1
          }}
        >
          <span style={{fontSize: 'clamp(18px, 4vw, 24px)'}}>👍</span>
          <span>Kid got it</span>
        </button>

        <button
          data-testid="btn-wrong"
          onClick={() => {
            if (status !== 'idle') return;
            if (isTestMode) {
              onWrong && onWrong();
              handleProgression();
              return;
            }
            setStatus('animating');
            triggerBounceAnimation();
            setShowSadBalloon(true);
            onWrong && onWrong();
            // Progression will be handled by encouragement overlay end
          }}
          disabled={interactionLocked}
          aria-label="Kid needs another try"
          className="mastery-footer-button secondary"
          style={{
            backgroundColor: interactionLocked ? 'var(--bg-tertiary, #cbd5e1)' : 'var(--button-secondary-bg, #64748b)',
            color: interactionLocked ? 'var(--text-tertiary, #94a3b8)' : 'var(--text-inverse, #fff)',
            border: 'none',
            borderRadius: 10,
            padding: 'clamp(4px, 0.8vh, 8px) clamp(14px, 2.5vw, 18px)',
            fontSize: 'clamp(13px, 2.2vw, 16px)',
            fontWeight: 700,
            cursor: interactionLocked ? 'not-allowed' : 'pointer',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, color 180ms ease',
            boxShadow: interactionLocked ? 'none' : '0 4px 12px rgba(100,116,139,0.10)',
            minHeight: 'clamp(30px, 5vh, 38px)',
            flex: '1 1 auto',
            maxWidth: '140px',
            opacity: interactionLocked ? 0.6 : 1
          }}
        >
          <span style={{fontSize: 'clamp(18px, 4vw, 24px)'}}>↺</span>
          <span>Needs another try</span>
        </button>
        {/* Next button removed: progression will auto-trigger after actions */}
      </div>
    </div>
  );
}
