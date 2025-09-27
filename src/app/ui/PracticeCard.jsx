import React from 'react';
import ProgressBubble from './ProgressBubble';
import './PracticeCard.css';

function MasteryTile({ label, progress, isActive }) {
  // Slightly darker, more saturated rainbow for better contrast
  // Bolder, saturated rainbow ramp for strong visual impact
  const rainbowGradient = 'linear-gradient(90deg, #d7263d 0%, #ff6f1a 20%, #ffd400 40%, #00b159 60%, #0077c8 80%, #6a00ff 100%)';
  // Vivid ROYGBIV gradient for the active tile (clear saturated stops)
  const activeGradient = 'linear-gradient(90deg, #ff0000 0%, #ff7f00 16.66%, #ffd700 33.33%, #00c853 50%, #0091ea 66.66%, #3f51b5 83.33%, #8e24aa 100%)';
  const fillWidth = Math.min(100, Math.max(0, progress));

  // Dynamic sizing for tile label to allow longer text to fit inside the tiles
  const labelText = String(label || '');
  const labelLen = labelText.length;
  let tileFontSize = 'clamp(22px, 3vw, 32px)';
  let tileLineClamp = 2;
  if (labelLen > 28) { tileFontSize = 'clamp(12px, 2.2vw, 14px)'; tileLineClamp = 4; }
  else if (labelLen > 20) { tileFontSize = 'clamp(14px, 2.4vw, 18px)'; tileLineClamp = 3; }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 96,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12, // Increased from 6 to 12 for generous padding
      boxSizing: 'border-box',
      borderRadius: 12,
      background: '#fff',
      border: isActive ? '3px solid #4f46e5' : '1px solid rgba(2,6,23,0.06)', // Stronger border for active tile
      boxShadow: isActive ? '0 18px 40px rgba(79,70,229,0.25), 0 0 0 4px rgba(79,70,229,0.15)' : '0 8px 24px rgba(2,6,23,0.06)', // Glow effect for active
      position: 'relative',
      overflow: 'hidden',
      transform: isActive ? 'scale(1.06)' : 'scale(1)', // Slightly bigger scale
      transition: 'transform 260ms ease, box-shadow 260ms ease, border 260ms ease'
    }}>
      {/* gradient fill */}
      <div aria-hidden className={isActive ? 'rainbow-anim' : 'rainbow-anim-slow'} style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${fillWidth}%`,
        background: isActive ? activeGradient : rainbowGradient,
        transformOrigin: 'left center',
        /* Reduce saturation by ~15% to make rainbow friendlier and less harsh */
        filter: 'saturate(0.85)',
        /* Slightly reduce opacity so the effect is playful but not overpowering */
        opacity: isActive ? 0.86 : 0.8,
        transition: 'width 420ms cubic-bezier(.2,.9,.2,1), background 260ms ease',
        
      }} />

      {/* subtle inner shading (reduced white overlay so gradient stays vivid) */}
      <div aria-hidden style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        // very light darkening to help text without washing out the rainbow
        background: 'linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.02))',
        mixBlendMode: 'normal',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 2,
        fontSize: tileFontSize,
        fontWeight: 900, // Even bolder for early readers
        textAlign: 'center',
        color: isActive ? '#4f46e5' : '#0b1220', // Distinct color for active word
        padding: '8px 12px', // Increased padding
        textShadow: isActive ? '0 2px 4px rgba(79,70,229,0.3)' : '0 1px 0 rgba(255,255,255,0.6)',
        // Allow wrapping and multiple lines for long labels
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        display: '-webkit-box',
        WebkitLineClamp: tileLineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>{label}</div>
    </div>
  );
}

export default function PracticeCard({ mainWord, transliteration, transliterationHi, answer, notes, choices, onCorrect, onWrong, onNext, columns = 6, mode }) {
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
            let fontSize = 'clamp(40px, 7vw, 96px)';
            let lineHeight = 0.98;
            let padding = '12px 20px';
            if (len > 60) {
              fontSize = 'clamp(16px, 3.6vw, 28px)';
              lineHeight = 1.08;
              padding = '8px 12px';
            } else if (len > 40) {
              fontSize = 'clamp(20px, 4.5vw, 36px)';
              lineHeight = 1.04;
              padding = '10px 14px';
            } else if (len > 28) {
              fontSize = 'clamp(28px, 5.5vw, 48px)';
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
                background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(139,92,246,0.03))',
                borderRadius: '16px',
                padding,
                border: '2px solid rgba(79,70,229,0.12)',
                boxShadow: '0 4px 18px rgba(79,70,229,0.12)',
                // Allow wrapping and multiple lines for long questions
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                position: 'relative',
                overflow: 'hidden'
              }}>{mainWord}</div>
            );
          })()}
        {(transliteration || transliterationHi) && (
          <div style={{
            fontSize: 'clamp(16px, 3vw, 22px)', // Slightly larger
            color: '#6366f1',
            fontStyle: 'italic',
            fontWeight: 600,
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center'
          }}>
            {transliteration && (
              // For Math Tables mode show a distinct phrasing like "Answer : 4?"
              mode === 'mathtables' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#4b5563' }}>Answer :</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#0b1220' }}>{transliteration}?</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563' }}>English:</span>
                  <span>{transliteration}</span>
                </div>
              )
            )}
            {transliterationHi && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#4b5563' }}>Hindi:</span>
                <span>{transliterationHi}</span>
              </div>
            )}
          </div>
        )}
        {/* Human Body and India Geography modes: Show answer and notes when revealed */}
        {(mode === 'humanbody' || mode === 'indiageography') && (answer || notes) && (
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            background: mode === 'indiageography' 
              ? 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))'
              : 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))',
            borderRadius: '12px',
            border: mode === 'indiageography' 
              ? '2px solid rgba(59,130,246,0.2)'
              : '2px solid rgba(34,197,94,0.2)',
            boxShadow: mode === 'indiageography' 
              ? '0 4px 12px rgba(59,130,246,0.1)'
              : '0 4px 12px rgba(34,197,94,0.1)',
            maxWidth: '100%'
          }}>
            {answer && (
              <div style={{
                fontSize: 'clamp(18px, 4vw, 24px)',
                fontWeight: 700,
                color: mode === 'indiageography' ? '#1e40af' : '#065f46',
                marginBottom: notes ? '8px' : '0',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 500, color: '#4b5563' }}>Answer: </span>
                {answer}
              </div>
            )}
            {notes && (
              <div style={{
                fontSize: 'clamp(14px, 3vw, 16px)',
                color: '#374151',
                lineHeight: 1.5,
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4x3 rectangular grid of mastery tiles */}
      <div key={mainWord} className="grid-fade" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: 'minmax(96px, 1fr)',
        gap: 14, // Increased from 10 to 14 for better separation for kids' eyes
        width: '100%',
        padding: '0 12px', // Increased padding
        maxWidth: '100%',
        boxSizing: 'border-box',
        flex: 1,
        alignContent: 'center',
        marginBottom: '24px' // Add breathing room below tiles
      }}>
        {choices.slice(0, 12).map((choice) => (
          <div key={choice.id} style={{ width: '100%', height: '100%' }}>
            <div className={`mastery-tile ${choice.label === mainWord ? 'active' : ''}`}>
              <MasteryTile label={choice.label} progress={choice.progress} isActive={choice.label === mainWord} />
            </div>
          </div>
        ))}
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
        minWidth: 280
      }}>
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