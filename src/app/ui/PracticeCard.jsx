import React from 'react';
import './PracticeCard.css';
import GradientText from './GradientText.jsx';
import { getScriptFontClass, getScriptLineHeight } from '../../utils/scriptDetector';
import { getSubjectPromptLabel, getSubjectParentInstruction } from '../../infrastructure/repositories/subjectLoader.ts';

import FlyingUnicorn from './FlyingUnicorn.jsx';
import PracticeActionBarPortal from './PracticeActionBarPortal.jsx';
import PracticeActionBar from './PracticeActionBar.jsx';
import PracticeActionButton from './PracticeActionButton.jsx';

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

export default function PracticeCard({ mainWord, transliteration, transliterationHi, answer, notes, choices, onCorrect, onWrong, onNext, onRevealAnswer, columns = 6, mode, isAnswerRevealed, isEnglishMode, currentUserId, whyRepeat = null, onWhyRepeatAcknowledged, attemptStats = null, sessionProgress = null, onStatusChange }) {
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
  // 'idle' = ready for input, 'animating' = correct/wrong animation, 'waiting' = waiting for next question
  const [status, setStatus] = React.useState('idle');
  // Animation states
  const [showUnicorn, setShowUnicorn] = React.useState(false);
  const [whyRepeatDismissed, setWhyRepeatDismissed] = React.useState(false);
  const [lastAnswer, setLastAnswer] = React.useState(null); // Track last answer for banner feedback: 'correct' | 'wrong' | null

  // Notify parent of status/answer changes for banner updates
  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange({ status, lastAnswer });
    }
  }, [status, lastAnswer, onStatusChange]);


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
    setLastAnswer(null);
  }, [mainWord, answer]);


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



  const interactionLocked = status !== 'idle';
  const hasDetails = Boolean(answer || notes || (whyRepeat && !whyRepeatDismissed));

  return (
      <div data-testid="practice-root" className="practice-root" style={{ backgroundColor: 'transparent' }}>
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

          {/* Only render the details panel when there is content to show */}
          {showAnswerPanel && hasDetails && (
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

        {/* Show correct/wrong buttons only when idle, hide when waiting for Next */}
        {status !== 'waiting' && (
          <>
            <PracticeActionButton
              data-testid="btn-correct"
              variant="primary"
              onClick={() => {
                if (status !== 'idle') return;
                if (isTestMode) {
                  onCorrect && onCorrect();
                  handleProgression();
                  return;
                }
                setStatus('animating');
                setLastAnswer('correct');
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
                // Next button will appear after animation completes
              }}
              disabled={interactionLocked}
              aria-label="Kid answered correctly"
              style={{
                opacity: interactionLocked ? 0.6 : 1,
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
                if (status !== 'idle') return;
                if (isTestMode) {
                  onWrong && onWrong();
                  handleProgression();
                  return;
                }
                setStatus('animating');
                setLastAnswer('wrong');
                triggerBounceAnimation();
                onWrong && onWrong();
                // After bounce animation, transition to 'waiting' to show Next button
                setTimeout(() => {
                  setStatus('waiting');
                }, 700); // bounce animation duration + buffer
                // Next button will appear after animation completes
              }}
              disabled={interactionLocked}
              aria-label="Kid needs another try"
              style={{
                opacity: interactionLocked ? 0.6 : 1,
                cursor: interactionLocked ? 'not-allowed' : 'pointer'
              }}
            >
              <span role="img" aria-label="try again">↺</span>
              Needs another try
            </PracticeActionButton>
          </>
        )}
        
        {/* Show Next button when waiting for progression */}
        {status === 'waiting' && (
          <PracticeActionButton
            data-testid="btn-next"
            variant="primary"
            onClick={handleProgression}
            aria-label="Move to next question"
          >
            <span role="img" aria-label="next">→</span>
            Next
          </PracticeActionButton>
        )}
        </PracticeActionBar>
      </PracticeActionBarPortal>
    </div>
  );
}
