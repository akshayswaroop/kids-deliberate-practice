import React from 'react';
import './PracticeCard.css';
import { ModeConfiguration } from '../../domain/value-objects/ModeConfiguration';
import GradientText from './GradientText.jsx';
import { getScriptFontClass, getScriptLineHeight } from '../../utils/scriptDetector';

import FlyingUnicorn from './FlyingUnicorn.jsx';
import SadBalloonAnimation from './SadBalloonAnimation.jsx';

export default function PracticeCard({ mainWord, transliteration, transliterationHi, answer, notes, choices, onCorrect, onWrong, onNext, onRevealAnswer, columns = 6, mode, isAnswerRevealed, isEnglishMode, currentUserId }) {
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
  // Button disabled state to prevent multiple clicks
  const [buttonsDisabled, setButtonsDisabled] = React.useState(false);
  // Track if we're in a transition (waiting for next question)
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  // Coordination state for wrong-answer flow (sound + animation must both complete)
  const [wrongAnswerState, setWrongAnswerState] = React.useState({
    active: false,
    soundEnded: false,
    animationEnded: false
  });

  // Centralized coordination: when both sound and animation end, trigger progression
  React.useEffect(() => {
    if (wrongAnswerState.active && 
        wrongAnswerState.soundEnded && 
        wrongAnswerState.animationEnded) {
      if (isDebug) { 
        console.debug('[PracticeCard] Both sound and animation completed, triggering progression', mainWord); 
      }
      if (onNext) {
        onNext();
      } else {
        // No onNext handler - re-enable buttons as fallback
        if (isDebug) { console.warn('[PracticeCard] No onNext handler, re-enabling buttons'); }
        setButtonsDisabled(false);
      }
      // Reset state after handling
      setWrongAnswerState({ active: false, soundEnded: false, animationEnded: false });
    }
  }, [wrongAnswerState, onNext, isDebug, mainWord]);
  
  // Reset animations and buttons when mainWord changes (new question)
  React.useEffect(() => { 
    setShowUnicorn(false); 
    setShowSadBalloon(false); 
    setIsTransitioning(false); // New question arrived, end transition
    setButtonsDisabled(false);
    setWrongAnswerState({ active: false, soundEnded: false, animationEnded: false });
  }, [mainWord]);

  // Safety fallback: if buttons are disabled for more than 4 seconds, force re-enable
  React.useEffect(() => {
    if (buttonsDisabled) {
      const safetyTimer = setTimeout(() => {
        if (isDebug) console.warn('[PracticeCard] Safety fallback: re-enabling buttons after timeout');
        setButtonsDisabled(false);
      }, 4000);
      return () => clearTimeout(safetyTimer);
    }
  }, [buttonsDisabled, isDebug]);

  // Handler for unicorn animation end
  const handleUnicornEnd = React.useCallback(() => {
    setShowUnicorn(false);
  }, []);
  
  // Handler for sad balloon animation end - update coordination state
  const handleSadBalloonEnd = React.useCallback(() => {
    setShowSadBalloon(false);
    if (isDebug) { console.debug('[PracticeCard] Sad animation ended', mainWord); }
    setWrongAnswerState(prev => ({ ...prev, animationEnded: true }));
  }, [isDebug, mainWord]);
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
      justifyContent: 'stretch',
      gap: 0,
      width: '100%',
      minHeight: '100vh', // Minimum full viewport height
      maxWidth: '100vw',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflow: 'hidden', // Prevent scroll, sections should fit within viewport
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
      {/* Stats overlay removed - badges in header animate instead */}
      {/* Question Area - Flexible space for readability */}
      <div style={{
        textAlign: 'center',
        color: 'var(--text-primary)',
        width: '100%',
        boxSizing: 'border-box',
        flex: '0 0 auto', // Size to content, not fixed percentage
        minHeight: '20%', // Minimum 20% of container height
        maxHeight: '40%', // Maximum 40% for very long text
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px 12px 16px 12px', // uniform horizontal padding
        overflow: 'visible', // Allow text to be visible
        borderBottomLeftRadius: '0px', // visually connect to answer panel
        borderBottomRightRadius: '0px',
        borderTopLeftRadius: '16px', // match other panels
        borderTopRightRadius: '16px',
        marginBottom: '-4px' // reduce gap between panels
      }}>
          {(() => {
            const text = String(mainWord || '');
            const len = text.length;
            // Responsive typography within the 30vh Question Area
            // Enhanced readability for long text (especially story comprehension)
            let fontSize = 'clamp(24px, min(6vw, 8vh), 72px)';
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
                  flex: '1 1 auto',
                  textAlign: 'center' // Ensure centered text alignment
                }}>
                  {/* Use GradientText component for rainbow progress fill */}
                  <GradientText 
                    progress={activeProgress}
                    gradientColors="red, orange, yellow, green, blue, indigo, violet"
                    neutralColor="var(--text-tertiary)"
                    style={{ textAlign: 'center', width: '100%' }}
                    className={getScriptFontClass(mainWord || '')}
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

      {/* Answer Area - 35% of vertical space */}
      <div key={mainWord} className="details-panel" style={{
        width: '100%',
        flex: '1 1 auto', // Take remaining space
        minHeight: '160px',
        maxHeight: '30vh',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        borderTopLeftRadius: '0px', // visually connect to question panel
        borderTopRightRadius: '0px',
        borderRadius: '16px',
        background: 'var(--bg-secondary)',
        boxShadow: '0 2px 18px rgba(79,70,229,0.04)',
        overflow: 'auto', // Allow scrolling if content is too long
        marginTop: '-4px', // reduce gap between panels
        marginBottom: '-4px' // reduce gap to button panel
      }}>
        {/* Main answer/notes area - fills available Answer Area space */}
        <div className="answer-panel" style={{ 
          width: '100%', 
          maxWidth: '100%',
          flex: '1 1 auto', // Expand to fill available space
          borderRadius: 12, 
          padding: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          overflow: 'auto', // Handle long content
          boxSizing: 'border-box'
        }}>
          {/* Title removed - showing answer/notes directly */}
          {isAnswerRevealed || isEnglishMode ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              flex: '1 1 auto', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center',
              overflow: 'auto',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {answer && (
                <div className={`answer-panel__headline ${getScriptFontClass(answer || '')}`} style={{ 
                  maxWidth: '100%',
                  fontSize: 'clamp(16px, 3vw, 28px)', // Responsive typography
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>{answer}</div>
              )}
              {notes && (
                <div className={`answer-panel__notes ${getScriptFontClass(notes || '')}`} style={{ 
                  maxWidth: '100%',
                  fontSize: 'clamp(14px, 2.5vw, 22px)', // Responsive typography
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>{notes}</div>
              )}
              {!answer && !notes && (
                <div className="answer-panel__empty" style={{
                  fontSize: 'clamp(14px, 2.5vw, 20px)',
                  color: 'var(--text-secondary)'
                }}>No answer or notes available for this item.</div>
              )}
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px', 
              flex: '1 1 auto', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center' 
            }}>
              <div style={{ 
                color: 'var(--text-secondary)', 
                maxWidth: '100%',
                fontSize: 'clamp(14px, 2.5vw, 20px)',
                lineHeight: 1.4
              }}>Use the Reveal button to show answer.</div>
              {answer && (
                <div style={{ 
                  fontSize: 'clamp(12px, 2vw, 16px)', 
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.3
                }}>Hint: {String(answer).slice(0, Math.max(3, Math.floor(String(answer).length * 0.25))) }…</div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Action Buttons Area - 25% of vertical space, docked at bottom */}
      <div style={{
        flex: '0 0 auto', // Size to content
  minHeight: '140px',
  width: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch', // stretch buttons vertically for balance
  gap: '28px', // slightly increased for optical balance
        padding: '10px 12px', // match answer panel horizontal padding
        marginLeft: '12px', // match answer panel inset
        marginRight: '12px',
        background: 'var(--bg-accent)',
        borderRadius: '16px 16px 0 0',
        boxShadow: 'var(--shadow-strong)',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-secondary)',
        borderBottom: 'none',
        boxSizing: 'border-box',
        flexShrink: 0 // Prevent shrinking
      }}>
        {/* Reveal button - only for non-English modes */}
        {/* Button order: Correct! (primary), Try later (primary), Reveal (secondary) */}
        <button
          onClick={() => {
            if (buttonsDisabled || isTransitioning) return; // Prevent multiple clicks
            setButtonsDisabled(true); // Disable buttons immediately
            setIsTransitioning(true); // Mark as transitioning
            if (isDebug) { console.debug('[PracticeCard] onCorrect clicked', mainWord); }
            createConfettiBurst();
            setShowUnicorn(true);
            try {
              const audio = new window.Audio('/happy-logo-167474.mp3');
              audio.volume = 0.7;
              audio.play();
            } catch (e) {
              if (isDebug) console.warn('Sound failed:', e);
            }
            onCorrect && onCorrect();
            if (onNext) setTimeout(() => { if (isDebug) { console.debug('[PracticeCard] auto onNext after correct', mainWord); } onNext(); }, 2500);
          }}
          disabled={buttonsDisabled || isTransitioning}
          aria-label="Mark as read — great job"
          className="mastery-footer-button primary"
          style={{
            backgroundColor: (buttonsDisabled || isTransitioning) ? 'var(--bg-tertiary, #cbd5e1)' : 'var(--button-primary-bg, #2563eb)', // gray when disabled
            color: (buttonsDisabled || isTransitioning) ? 'var(--text-tertiary, #94a3b8)' : 'var(--text-inverse, #fff)',
            border: 'none',
            borderRadius: 10,
            padding: 'clamp(4px, 0.8vh, 8px) clamp(14px, 2.5vw, 18px)',
            fontSize: 'clamp(13px, 2.2vw, 16px)',
            fontWeight: 700,
            cursor: (buttonsDisabled || isTransitioning) ? 'not-allowed' : 'pointer',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, color 180ms ease',
            boxShadow: (buttonsDisabled || isTransitioning) ? 'none' : '0 4px 12px rgba(37,99,235,0.10)',
            minHeight: 'clamp(30px, 5vh, 38px)',
            flex: '1 1 auto',
            maxWidth: '140px',
            opacity: (buttonsDisabled || isTransitioning) ? 0.6 : 1
          }}
        >
          <span style={{fontSize: 'clamp(16px, 4vw, 22px)'}}>🎉</span>
          <span>Correct</span>
        </button>
        <button
          onClick={() => {
            if (buttonsDisabled || isTransitioning) return; // Prevent multiple clicks
            setButtonsDisabled(true); // Disable buttons immediately
            setIsTransitioning(true); // Mark as transitioning
            if (isDebug) { console.debug('[PracticeCard] onWrong clicked', mainWord); }
            triggerBounceAnimation();
            setShowSadBalloon(true);
            
            // Initialize coordination state - both sound and animation must complete
            setWrongAnswerState({
              active: true,
              soundEnded: false,
              animationEnded: false
            });
            
            // Start audio
            try {
              const audio = new window.Audio('/brass-fail-8-b-207131.mp3');
              audio.volume = 0.7;
              audio.play();
              audio.onended = () => {
                if (isDebug) console.debug('[PracticeCard] Sad sound ended', mainWord);
                setWrongAnswerState(prev => ({ ...prev, soundEnded: true }));
              };
            } catch (e) {
              if (isDebug) console.warn('Brass fail sound failed:', e);
              // If sound fails, mark it as ended immediately
              setWrongAnswerState(prev => ({ ...prev, soundEnded: true }));
            }
            
            onWrong && onWrong();
            // Quick progression after 2.5 seconds (same as correct flow)
            if (onNext) setTimeout(() => { if (isDebug) { console.debug('[PracticeCard] auto onNext after wrong', mainWord); } onNext(); }, 2500);
          }}
          disabled={buttonsDisabled || isTransitioning}
          aria-label="Try later — would you like to repeat this?"
          className="mastery-footer-button secondary"
          style={{
            backgroundColor: (buttonsDisabled || isTransitioning) ? 'var(--bg-tertiary, #cbd5e1)' : 'var(--button-secondary-bg, #64748b)', // gray when disabled
            color: (buttonsDisabled || isTransitioning) ? 'var(--text-tertiary, #94a3b8)' : 'var(--text-inverse, #fff)',
            border: 'none',
            borderRadius: 10,
            padding: 'clamp(4px, 0.8vh, 8px) clamp(14px, 2.5vw, 18px)',
            fontSize: 'clamp(13px, 2.2vw, 16px)',
            fontWeight: 700,
            cursor: (buttonsDisabled || isTransitioning) ? 'not-allowed' : 'pointer',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, color 180ms ease',
            boxShadow: (buttonsDisabled || isTransitioning) ? 'none' : '0 4px 12px rgba(100,116,139,0.10)',
            minHeight: 'clamp(30px, 5vh, 38px)',
            flex: '1 1 auto',
            maxWidth: '140px',
            opacity: (buttonsDisabled || isTransitioning) ? 0.6 : 1
          }}
        >
          <span style={{fontSize: 'clamp(16px, 4vw, 22px)'}}>🔁</span>
          <span>Try later</span>
        </button>
        {!isEnglishMode && (
          <button
            onClick={() => { 
              if (isDebug) { console.debug('[PracticeCard] onRevealAnswer clicked', mainWord, 'current revealed:', isAnswerRevealed); } 
              onRevealAnswer && onRevealAnswer(!isAnswerRevealed); 
            }}
            aria-label={isAnswerRevealed ? "Hide Answer" : "Reveal Answer"}
            className="mastery-footer-button reveal"
            style={{
              backgroundColor: 'transparent', // outlined secondary
              color: 'var(--button-primary-bg, #2563eb)',
              border: '2px solid var(--button-primary-bg, #2563eb)',
              borderRadius: 10,
              padding: 'clamp(3px, 0.6vh, 6px) clamp(12px, 2vw, 16px)',
              fontSize: 'clamp(13px, 2.2vw, 16px)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
              boxShadow: 'none',
              minHeight: 'clamp(28px, 4.5vh, 36px)',
              flex: '1 1 auto',
              maxWidth: '130px'
            }}
          >
            <span style={{fontSize: 'clamp(14px, 3vw, 18px)'}}>{isAnswerRevealed ? '🙈' : '👁️'}</span>
            <span>{isAnswerRevealed ? 'Hide ' : 'Reveal '}</span>
          </button>
        )}
        {/* Next button removed: progression will auto-trigger after actions */}
      </div>
    </div>
  );
}