import React from 'react';
import './PracticeCard.css';
import { isTransliterationMode } from '../../features/game/modeConfig';

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

  // Determine current active choice progress to render rainbow fill for the main question
  const activeChoice = (choices || []).find(c => String(c.label) === String(mainWord));
  const activeProgress = Math.min(100, Math.max(0, (activeChoice && (typeof activeChoice.progress === 'number' ? activeChoice.progress : Number(activeChoice && activeChoice.progress))) || 0));
  const isMastered = activeProgress >= 100;



  return (
    <div style={{
      backgroundColor: 'transparent',
      borderRadius: '16px',
      padding: '10px 12px 140px', // extra bottom padding so fixed footer doesn't overlap
      background: 'linear-gradient(180deg, rgba(247,250,252,0.92), rgba(255,255,255,0.96))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Compact main word section */}
      {/* Global component styles moved to PracticeCard.css */}

      <div style={{
        textAlign: 'center',
        color: '#2c3e50',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        marginTop: '8px', // Reduced from default to bring word closer to top
        marginBottom: '16px' // Add breathing room below
      }}>
          {(() => {
            const text = String(mainWord || '');
            const len = text.length;
            // Default clamp for short questions; reduce for longer ones so they fit
            // Slightly reduce maximum font-size for Kannada to avoid glyph clipping on large characters
            let fontSize = mode === 'kannada' ? 'clamp(36px, 6.2vw, 84px)' : 'clamp(40px, 6vw, 6px)';
            let lineHeight = 0.98;
            let padding = '12px 20px';
            if (len > 60) {
              fontSize = mode === 'kannada' ? 'clamp(14px, 3.2vw, 24px)' : 'clamp(16px, 3.6vw, 28px)';
              lineHeight = 1.08;
              padding = '8px 12px';
            } else if (len > 40) {
              fontSize = mode === 'kannada' ? 'clamp(18px, 4.1vw, 32px)' : 'clamp(20px, 4.5vw, 36px)';
              lineHeight = 1.04;
              padding = '10px 14px';
            } else if (len > 28) {
              fontSize = mode === 'kannada' ? 'clamp(26px, 5.1vw, 44px)' : 'clamp(28px, 5.5vw, 48px)';
              lineHeight = 1.02;
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
                  // Make target word visually distinct
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(139,92,246,0.02))',
                  borderRadius: '16px',
                  // Give the question panel an explicit minHeight so tall glyphs have room
                  // Reduced by ~5% from 120px to 114px per request
                  minHeight: '90px',
                  // Slightly larger padding for additional vertical room
                  padding: typeof padding === 'string' ? padding.replace(/(\d+)px/, (m, p) => `${Math.max(14, Number(p))}px`) : padding,
                  border: '2px solid rgba(79,70,229,0.08)',
                  boxShadow: '0 6px 30px rgba(79,70,229,0.08)',
                  // Allow wrapping and multiple lines for long questions
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Rainbow fill behind the question - horizontal left->right fill */}
                  <div aria-hidden style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${activeProgress}%`,
                    borderTopLeftRadius: 14,
                    borderBottomLeftRadius: 14,
                    borderTopRightRadius: activeProgress === 100 ? 14 : 0,
                    borderBottomRightRadius: activeProgress === 100 ? 14 : 0,
                    background: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 16.66%, #ffd700 33.33%, #00c853 50%, #0091ea 66.66%, #3f51b5 83.33%, #8e24aa 100%)',
                    opacity: 0.9,
                    transition: 'width 420ms cubic-bezier(.2,.9,.2,1), border-radius 180ms ease'
                  }} />

                  {/* subtle overlay to keep text legible */}
                  <div aria-hidden style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    pointerEvents: 'none'
                  }} />

                  {/* main word text */}
                  <div style={{ position: 'relative', zIndex: 2 }}>{mainWord}</div>

                  {/* percent indicator and mastered badge */}
                  <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div aria-hidden style={{
                      background: 'rgba(255,255,255,0.9)',
                      color: '#0b1220',
                      fontWeight: 800,
                      padding: '4px 8px',
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: '0 6px 18px rgba(2,6,23,0.06)'
                    }}>{`${Math.round(activeProgress)}%`}</div>
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
                  <div aria-live="polite" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>{isMastered ? 'Mastered' : `${Math.round(activeProgress)}% mastery`}</div>

              </div>
            );
          })()}
        {/* Inline transliteration/answer banner removed — answers are shown only in the details panel now */}
        {/* Answer modes: removed here to avoid duplication — answers are shown in the details panel below */}
      </div>

      {/* Details panel: use the space previously reserved for tiles to show answer, notes, and meta */}
      <div key={mainWord} className="details-panel" style={{
        width: '100%',
        padding: '12px',
        boxSizing: 'border-box',
        marginBottom: '24px',
        display: 'block'
      }}>
        {/* Main answer/notes area - now full width (progress panel removed) */}
        <div className="answer-panel" style={{ width: '100%', minHeight: 140, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="answer-panel__title">Answer & Notes</div>
          {isAnswerRevealed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {answer && (
                <div className="answer-panel__headline">{answer}</div>
              )}
              {notes && (
                <div className="answer-panel__notes">{notes}</div>
              )}
              {!answer && !notes && (
                <div className="answer-panel__empty">No answer or notes available for this item.</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ color: '#6b7280' }}>Answer hidden. Use the Reveal Answer button to show the translation or answer for this word.</div>
              {answer && (
                <div style={{ fontSize: 14, color: '#9ca3af' }}>Hint: {String(answer).slice(0, Math.max(3, Math.floor(String(answer).length * 0.25))) }…</div>
              )}
            </div>
          )}
        </div>

      </div>
      {/* Increased spacer - 1.5x the gap for better button separation */}
      <div style={{ height: 36 }} />

      {/* Footer action bar: visually fixed but contained by extra bottom padding (prevents overlap) */}
      <div style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 18,
        display: 'flex',
        gap: 18,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 999,
        boxShadow: '0 18px 48px rgba(2,6,23,0.12)',
        zIndex: 1200,
        alignItems: 'center',
        minWidth: isEnglishMode ? 280 : 360 // Wider for non-English modes to fit reveal button
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
              backgroundColor: '#f59e0b',
              color: 'white',
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
            onCorrect && onCorrect(); 
          }}
          aria-label="Mark as read — great job"
          className="mastery-footer-button primary"
          style={{
            backgroundColor: '#10b981',
            color: 'white',
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
            onWrong && onWrong(); 
          }}
          aria-label="Try again later — would you like to repeat this?"
          className="mastery-footer-button secondary"
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
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
        <button
          onClick={() => { if (isDebug) { console.debug('[PracticeCard] onNext clicked', mainWord); } onNext && onNext(); }}
          aria-label="Next word"
          className="mastery-footer-button"
          style={{
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            boxShadow: '0 8px 20px rgba(99,102,241,0.12)'
          }}
        >
          <span style={{fontSize:18}}>⏭️</span>
          <span>Next</span>
        </button>
      </div>
    </div>
  );
}