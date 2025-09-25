import React from 'react';
import ProgressBubble from './ProgressBubble';

function MasteryTile({ label, progress, isActive }) {
  // Slightly darker, more saturated rainbow for better contrast
  // Bolder, saturated rainbow ramp for strong visual impact
  const rainbowGradient = 'linear-gradient(90deg, #d7263d 0%, #ff6f1a 20%, #ffd400 40%, #00b159 60%, #0077c8 80%, #6a00ff 100%)';
  // Vivid ROYGBIV gradient for the active tile (clear saturated stops)
  const activeGradient = 'linear-gradient(90deg, #ff0000 0%, #ff7f00 16.66%, #ffd700 33.33%, #00c853 50%, #0091ea 66.66%, #3f51b5 83.33%, #8e24aa 100%)';
  const fillWidth = Math.min(100, Math.max(0, progress));

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 96,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      boxSizing: 'border-box',
      borderRadius: 12,
      background: '#fff',
      border: isActive ? '2px solid rgba(15,23,42,0.12)' : '1px solid rgba(2,6,23,0.06)',
      boxShadow: isActive ? '0 18px 40px rgba(15,23,42,0.18)' : '0 8px 24px rgba(2,6,23,0.06)',
      position: 'relative',
      overflow: 'hidden',
      transform: isActive ? 'scale(1.04)' : 'scale(1)',
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
        transition: 'width 420ms cubic-bezier(.2,.9,.2,1), background 260ms ease',
        opacity: isActive ? 0.98 : 0.92
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
        fontSize: 'clamp(18px, 2.4vw, 26px)',
        fontWeight: 800,
        textAlign: 'center',
        color: '#0b1220',
        padding: '6px 10px',
        textShadow: '0 1px 0 rgba(255,255,255,0.6)',
        // Prevent breaking words mid-syllable: allow wrapping only at whitespace, clamp to 2 lines
        whiteSpace: 'normal',
        wordBreak: 'normal',
        overflowWrap: 'normal',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>{label}</div>
    </div>
  );
}

export default function PracticeCard({ mainWord, transliteration, choices, onCorrect, onWrong, onNext }) {
  const [columns, setColumns] = React.useState(6);
  const isDebug = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production'));

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

  React.useEffect(() => {
    function updateCols() {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
      if (w < 520) setColumns(2);
      else if (w < 900) setColumns(3);
      else setColumns(6);
    }
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

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
      {/* Global component styles and animations injected locally */}
      <style>{`
        .mastery-tile{cursor:pointer;}
        .mastery-tile{transition:transform 220ms ease, box-shadow 220ms ease, opacity 320ms ease}
        .mastery-tile:hover{transform:translateY(-4px) scale(1.02); box-shadow:0 14px 36px rgba(2,6,23,0.12)}
        .mastery-tile.active{animation:pulseGlow 2000ms infinite ease-in-out;}
        .rainbow-anim{background-size:300% 100%; animation:rainShift 2200ms linear infinite}
        .rainbow-anim-slow{background-size:200% 100%; animation:rainShift 5200ms linear infinite}
        @keyframes pulseGlow{0%{filter:brightness(1)}50%{filter:brightness(1.06)}100%{filter:brightness(1)}}
        @keyframes rainShift{0%{background-position:0% 50%}100%{background-position:100% 50%}}
        @keyframes sheen{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .mastery-sheen{background:linear-gradient(90deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.18) 100%); background-size:200% 100%; mix-blend-mode:overlay; animation:sheen 2400ms linear infinite}
        .mastery-tile .label{transition:opacity 200ms ease}
        .grid-fade{animation:fadeIn 320ms ease}
        @keyframes fadeIn{from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:translateY(0)}}
        .tile-inner{box-shadow:inset 0 -6px 18px rgba(0,0,0,0.04)}

        /* Footer button feedback */
        .mastery-footer-button{border:0; outline:0; cursor:pointer; border-radius:10px; transition:transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease}
        .mastery-footer-button:hover{transform:translateY(-3px) scale(1.02)}
        .mastery-footer-button:active{transform:translateY(0) scale(.995)}
        .mastery-footer-button:focus-visible{box-shadow:0 0 0 4px rgba(2,6,23,0.06);}
        .mastery-footer-button.primary:focus-visible{box-shadow:0 0 0 6px rgba(16,185,129,0.14)}
        .mastery-footer-button.secondary:focus-visible{box-shadow:0 0 0 6px rgba(239,68,68,0.12)}
      `}</style>

      <div style={{
        textAlign: 'center',
        color: '#2c3e50',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
          <div style={{ 
            fontSize: 'clamp(40px, 7vw, 96px)',
            fontWeight: 900,
            marginTop: 0,
            marginBottom: transliteration ? '6px' : '0px',
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
            maxWidth: '100%',
            // Allow wrapping at whitespace for long phrases; avoid breaking inside words
            whiteSpace: 'normal',
            wordBreak: 'normal'
          }}>
          {mainWord}
        </div>
        {transliteration && (
          <div style={{
            fontSize: 'clamp(14px, 2.8vw, 20px)',
            color: '#7f8c8d',
            fontStyle: 'italic',
            marginTop: '4px'
          }}>
            {transliteration}
          </div>
        )}
      </div>

      {/* 4x3 rectangular grid of mastery tiles */}
      <div key={mainWord} className="grid-fade" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: 'minmax(96px, 1fr)',
        gap: 10,
        width: '100%',
        padding: '0 8px',
        maxWidth: '100%',
        boxSizing: 'border-box',
        flex: 1,
        alignContent: 'center'
      }}>
        {choices.slice(0, 12).map((choice) => (
          <div key={choice.id} style={{ width: '100%', height: '100%' }}>
            <div className={`mastery-tile ${choice.label === mainWord ? 'active' : ''}`}>
              <MasteryTile label={choice.label} progress={choice.progress} isActive={choice.label === mainWord} />
            </div>
          </div>
        ))}
      </div>
      {/* spacer so grid has breathing room above sticky bar */}
      <div style={{ height: 18 }} />

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
          onClick={() => { if (isDebug) { console.debug('[PracticeCard] onCorrect clicked', mainWord); } onCorrect && onCorrect(); }}
          aria-label="Mark as read — great job"
          className="mastery-footer-button primary"
          style={{
            backgroundColor: '#10b981',
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
            boxShadow: '0 8px 20px rgba(16,185,129,0.14)'
          }}
        >
          <span style={{fontSize:18}}>🎉</span>
          <span>Read it well!</span>
        </button>
        <button
          onClick={() => { if (isDebug) { console.debug('[PracticeCard] onWrong clicked', mainWord); } onWrong && onWrong(); }}
          aria-label="Try again later — would you like to repeat this?"
          className="mastery-footer-button secondary"
          style={{
            backgroundColor: '#ef4444',
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
            boxShadow: '0 8px 20px rgba(239,68,68,0.12)'
          }}
        >
          <span style={{fontSize:18}}>🔁</span>
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