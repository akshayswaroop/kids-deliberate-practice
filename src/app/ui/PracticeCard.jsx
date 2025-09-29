import React from 'react';
import './PracticeCard.css';
import { isTransliterationMode } from '../../features/game/modeConfig';
import GradientText from './GradientText.jsx';

import FlyingUnicorn from './FlyingUnicorn.jsx';
import SadBalloonAnimation from './SadBalloonAnimation.jsx';

export default function PracticeCard({ mainWord, transliteration, transliterationHi, answer, notes, choices, onCorrect, onWrong, onNext, onRevealAnswer, columns = 6, mode, isAnswerRevealed, isEnglishMode }) {
  const isDebug = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production'));

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

  React.useEffect(() => {
    if (isDebug) {
      // eslint-disable-next-line no-console
      console.debug('[PracticeCard] mount mainWord=', mainWord, 'choicesCount=', choices ? choices.length : 0);
    }
  }, []);

  React.useEffect(() => {
    if (isDebug) {
      // eslint-disable-next-line no-console
      console.debug('[PracticeCard] mainWord changed ->', mainWord);
    }
  }, [mainWord]);

  // Unicorn animation state
  const [showUnicorn, setShowUnicorn] = React.useState(false);
  // Sad balloon animation state
  const [showSadBalloon, setShowSadBalloon] = React.useState(false);
  // Hide unicorn and sad balloon when mainWord changes (new card)
  React.useEffect(() => { setShowUnicorn(false); setShowSadBalloon(false); }, [mainWord]);
  // Handler for unicorn animation end
  const handleUnicornEnd = React.useCallback(() => setShowUnicorn(false), []);
  // Handler for sad balloon animation end
  const handleSadBalloonEnd = React.useCallback(() => setShowSadBalloon(false), []);
  // Determine current active choice progress to render rainbow fill for the main question
  const activeChoice = (choices || []).find(c => String(c.label) === String(mainWord));
  const activeProgress = Math.min(100, Math.max(0, (activeChoice && (typeof activeChoice.progress === 'number' ? activeChoice.progress : Number(activeChoice && activeChoice.progress))) || 0));
  const isMastered = activeProgress >= 100;



  return (
    <div style={{
      backgroundColor: 'transparent',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      gap: 0,
      width: '100%',
      height: 'auto',
      maxWidth: '100vw',
      maxHeight: '100vh',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflow: 'visible',
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
      {/* Sad balloon animation overlay for wrong answers */}
      <SadBalloonAnimation
        visible={showSadBalloon}
        onAnimationEnd={handleSadBalloonEnd}
      />
      {/* Compact main word section */}
      {/* Global component styles moved to PracticeCard.css */}

      <div style={{
        textAlign: 'center',
        color: 'var(--text-primary)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        marginTop: '12px',
        marginBottom: '20px',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 0
      }}>
          {(() => {
            const text = String(mainWord || '');
            const len = text.length;
            // Make font size more responsive to card width for all lengths
            let fontSize = 'clamp(32px, 7vw, 84px)';
            let lineHeight = 1.08;
            let padding = '12px 20px';
            if (len > 60) {
              fontSize = 'clamp(24px, 5vw, 64px)';
              lineHeight = 1.10;
              padding = '8px 12px';
            } else if (len > 40) {
              fontSize = 'clamp(28px, 6vw, 72px)';
              lineHeight = 1.09;
              padding = '10px 14px';
            } else if (len > 28) {
              fontSize = 'clamp(32px, 7vw, 84px)';
              lineHeight = 1.08;
              padding = '10px 16px';
            }

              return (
              <div className="target-word-glow" style={{ 
                  fontSize,
                  fontWeight: 900,
                  marginTop: 0,
                  marginBottom: transliteration ? '6px' : '0px',
                  lineHeight,
                  letterSpacing: '-0.02em',
                  maxWidth: '100%',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(139,92,246,0.02))',
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
                  flex: '1 1 auto'
                }}>
                  {/* Use GradientText component for rainbow progress fill */}
                  <GradientText 
                    progress={Math.max(5, activeProgress)}
                    gradientColors="red, orange, yellow, green, blue, indigo, violet"
                    neutralColor="var(--text-tertiary)"
                    style={{ textAlign: 'center', width: '100%' }}
                  >
                    {mainWord}
                  </GradientText>

                  {/* percent indicator and mastered badge */}
                  <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Progress number badge removed as requested */}
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

                  {/* aria-live region for assistive tech */}
                  <div aria-live="polite" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>{isMastered ? 'Mastered' : ``}</div>

              </div>
            );
          })()}
        {/* Inline transliteration/answer banner removed — answers are shown only in the details panel now */}
        {/* Answer modes: removed here to avoid duplication — answers are shown in the details panel below */}
      </div>

      {/* Details panel: use the space previously reserved for tiles to show answer, notes, and meta */}
      <div key={mainWord} className="details-panel" style={{
        width: '100%',
        padding: '24px 18px',
        boxSizing: 'border-box',
        marginBottom: '32px',
        display: 'block',
        borderRadius: '16px',
        background: 'var(--bg-secondary)',
        boxShadow: '0 2px 18px rgba(79,70,229,0.04)'
      }}>
        {/* Main answer/notes area - now full width (progress panel removed) */}
        <div className="answer-panel" style={{ width: '100%', minHeight: 140, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Title removed - showing answer/notes directly */}
          {isAnswerRevealed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              {answer && (
                <div className="answer-panel__headline" style={{ maxWidth: '820px' }}>{answer}</div>
              )}
              {notes && (
                <div className="answer-panel__notes" style={{ maxWidth: '820px' }}>{notes}</div>
              )}
              {!answer && !notes && (
                <div className="answer-panel__empty">No answer or notes available for this item.</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', maxWidth: '820px' }}>Use the Reveal Answer button to show answer.</div>
              {answer && (
                <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Hint: {String(answer).slice(0, Math.max(3, Math.floor(String(answer).length * 0.25))) }…</div>
              )}
            </div>
          )}
        </div>

      </div>
      {/* Increased spacer - 1.5x the gap for better button separation */}
  <div style={{ height: 48 }} />

      {/* Footer action bar: visually fixed but contained by extra bottom padding (prevents overlap) */}
      <div style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 24,
        display: 'flex',
        gap: 24,
        padding: '18px 24px',
        background: 'var(--bg-accent)',
        borderRadius: 999,
        boxShadow: 'var(--shadow-strong)',
        zIndex: 1200,
        alignItems: 'center',
        minWidth: isEnglishMode ? 320 : 400, // Wider for non-English modes to fit reveal button
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-secondary)'
      }}>
        {/* Reveal Answer button - only for non-English modes */}
        {!isEnglishMode && (
          <button
            onClick={() => { 
              if (isDebug) { console.debug('[PracticeCard] onRevealAnswer clicked', mainWord, 'current revealed:', isAnswerRevealed); } 
              onRevealAnswer && onRevealAnswer(!isAnswerRevealed); 
            }}
            aria-label={isAnswerRevealed ? "Hide Answer" : "Reveal Answer"}
            className="mastery-footer-button reveal"
            style={{
              backgroundColor: 'var(--color-warning)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
              boxShadow: '0 8px 20px rgba(245,158,11,0.12)'
            }}
          >
            <span style={{fontSize:16}}>{isAnswerRevealed ? '🙈' : '👁️'}</span>
            <span>{isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer'}</span>
          </button>
        )}
        <button
          onClick={() => {
            if (isDebug) { console.debug('[PracticeCard] onCorrect clicked', mainWord); }
            // Create confetti burst effect
            createConfettiBurst();
            // Trigger unicorn animation
            setShowUnicorn(true);
            // Play yippu sound effect
            try {
              const audio = new window.Audio('/happy-logo-167474.mp3');
              audio.volume = 0.7;
              audio.play();
            } catch (e) {
              if (isDebug) console.warn('Sound failed:', e);
            }
            onCorrect && onCorrect();
            // Auto-progress to next word after confetti animation duration (2500ms)
            if (onNext) setTimeout(() => { if (isDebug) { console.debug('[PracticeCard] auto onNext after correct', mainWord); } onNext(); }, 2500);
          }}
          aria-label="Mark as read — great job"
          className="mastery-footer-button primary"
          style={{
            backgroundColor: 'var(--button-primary-bg)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 10,
            padding: '12px 16px', // Slightly larger padding
            fontSize: 16, // Slightly larger font
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            boxShadow: '0 8px 20px rgba(16,185,129,0.14)'
          }}
        >
          <span style={{fontSize:20}}>🎉</span>
          <span>Read it well!</span>
        </button>
        <button
          onClick={() => {
            if (isDebug) { console.debug('[PracticeCard] onWrong clicked', mainWord); }
            // Add bounce animation to wrong choices
            triggerBounceAnimation();
            // Show sad balloon animation
            setShowSadBalloon(true);
            // Play brass fail sound effect and delay next word until both sound and animation end
            let soundPlayed = false;
            let soundEnded = false;
            let animationEnded = false;
            const maybeNext = () => {
              if (soundEnded && animationEnded && onNext) {
                if (isDebug) { console.debug('[PracticeCard] auto onNext after brass fail sound AND sad balloon animation ended', mainWord); }
                onNext();
              }
            };
            try {
              const audio = new window.Audio('/brass-fail-8-b-207131.mp3');
              audio.volume = 0.7;
              audio.play();
              soundPlayed = true;
              audio.onended = () => {
                soundEnded = true;
                maybeNext();
              };
            } catch (e) {
              if (isDebug) console.warn('Brass fail sound failed:', e);
              soundEnded = true;
            }
            onWrong && onWrong();
            // Listen for sad balloon animation end
            setTimeout(() => {
              animationEnded = true;
              maybeNext();
            }, 2500); // matches SadBalloonAnimation duration and sound
            // If sound fails, fallback to previous delay
            if (!soundPlayed) setTimeout(() => { if (isDebug) { console.debug('[PracticeCard] auto onNext after wrong (fallback)', mainWord); } onNext && onNext(); }, 2500);
          }}
          aria-label="Try again later — would you like to repeat this?"
          className="mastery-footer-button secondary"
          style={{
            backgroundColor: 'var(--button-secondary-bg)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 10,
            padding: '12px 16px', // Slightly larger padding
            fontSize: 16, // Slightly larger font
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            boxShadow: '0 8px 20px rgba(239,68,68,0.12)'
          }}
        >
          <span style={{fontSize:20}}>🔁</span>
          <span>Try again later</span>
        </button>
        {/* Next button removed: progression will auto-trigger after actions */}
      </div>
    </div>
  );
}