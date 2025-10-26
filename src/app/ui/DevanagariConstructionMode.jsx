import React from 'react';
import ConfettiCelebration from './ConfettiCelebration';
import ConstructionHint from './ConstructionHint';
import { completeConstructionWord } from '../../infrastructure/state/gameActions';

// Module-level map to prevent duplicate completion dispatches across component
// instances and quick remounts. Keyed by `${mode}::${answer}` with timestamp.
const recentCompletionMap = new Map();

/**
 * DevanagariConstructionMode - Interactive component for building Devanagari words
 * 
 * Kids construct Hindi/Devanagari words by selecting individual components
 * (base consonants + matras) in sequence. This teaches the actual structure
 * of Devanagari script through constructive recall.
 * 
 * Example: राम = र + ा + म
 * 
 * ARCHITECTURE: Follows trace-driven design - dispatches actions instead of calling callbacks
 */
export default function DevanagariConstructionMode({
  answer,
  dispatch,
  mode,
  disabled = false
}) {
  const [constructedWord, setConstructedWord] = React.useState([]);
  const [availableComponents, setAvailableComponents] = React.useState([]);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [expectedState, setExpectedState] = React.useState({ answerKey: '', components: [] });
  // Removed hasCalledOnCorrect ref - no longer needed with proper Redux dispatch
  const celebrateTimeoutRef = React.useRef(null);
  // Prevent duplicate completion dispatches when the component re-renders or Redux updates
  // Stores the last scheduled key ("${mode}::${answer}") for this instance
  const completionGuardRef = React.useRef(null);

  // Helper: Parse Devanagari text into components (base chars + matras)
  const parseDevanagariComponents = React.useCallback((text) => {
    if (!text) return [];
    
    // Decompose independent vowels to base + matra for teaching
    // This teaches that आ = अ + ा, ई = इ + ी, etc.
    const vowelDecomposition = {
      // Basic vowels
      'अ': ['अ'],       // A (base, no decomposition)
      'आ': ['अ', 'ा'],  // AA = A + AA-matra
      'इ': ['इ'],       // I (base, no decomposition)
      'ई': ['इ', 'ी'],  // II = I + II-matra
      'उ': ['उ'],       // U (base, no decomposition)
      'ऊ': ['उ', 'ू'],  // UU = U + UU-matra
      'ऋ': ['ऋ'],       // RI (base, keep as-is for simplicity)
      'ॠ': ['ऋ', 'ॄ'],  // RII = RI + RII-matra (rare)
      'ऌ': ['ऌ'],       // LI (rare, keep as base)
      'ॡ': ['ऌ', 'ॣ'],  // LII (very rare)
      
      // Compound vowels
      'ए': ['अ', 'े'],  // E = A + E-matra
      'ऐ': ['अ', 'ै'],  // AI = A + AI-matra
      'ओ': ['अ', 'ो'],  // O = A + O-matra
      'औ': ['अ', 'ौ'],  // AU = A + AU-matra
      
      // Vowels with modifiers (if they appear as independent chars)
      'अं': ['अ', 'ं'],  // AM = A + anusvara
      'अः': ['अ', 'ः'],  // AH = A + visarga
    };
    
    const chars = Array.from(text);
    const components = [];
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const nextChar = chars[i + 1];
      
      // Check for vowel + modifier combinations (e.g., अ followed by ं or ः)
      if (char === 'अ' && (nextChar === 'ं' || nextChar === 'ः')) {
        components.push('अ', nextChar);
        i++; // Skip next character as we've processed it
      } else if (vowelDecomposition[char]) {
        // Decompose independent vowels
        components.push(...vowelDecomposition[char]);
      } else {
        // Keep consonants, matras, halant, and modifiers as-is
        // This includes: क, ख, ग, etc. (consonants)
        //                ा, ि, ी, ु, ू, etc. (matras)
        //                ् (halant)
        //                ं (anusvara when attached to consonant)
        //                ः (visarga when attached to consonant)
        components.push(char);
      }
    }
    
    return components;
  }, []);

  // Initialize components when answer changes
  React.useEffect(() => {
    const normalizedAnswer = String(answer ?? '').trim();
    if (!normalizedAnswer) {
      setExpectedState({ answerKey: '', components: [] });
      setConstructedWord([]);
      setAvailableComponents([]);
      setShowHint(false);
      setShowCelebration(false);
      completionGuardRef.current = false;
      if (celebrateTimeoutRef.current !== null) {
        window.clearTimeout(celebrateTimeoutRef.current);
        celebrateTimeoutRef.current = null;
      }
      return;
    }
    
    // Parse answer into grapheme components (base + matras)
    const components = parseDevanagariComponents(normalizedAnswer);
    setExpectedState({ answerKey: normalizedAnswer, components }); // Store for hints
    
    // Add some distractor components (common Hindi letters/matras)
    const commonDistractors = ['क', 'ख', 'त', 'प', 'ब', 'ा', 'ि', 'ी', 'ु', 'े'];
    const distractors = commonDistractors
      .filter(d => !components.includes(d))
      .slice(0, Math.min(3, Math.ceil(components.length / 2)));
    
    // Combine and shuffle
    const displayOrder = [...components, ...distractors];
    const allComponents = displayOrder
      .map((comp, idx) => ({ 
        id: `comp-${idx}-${Math.random()}`, 
        component: comp,
        used: false 
      }))
      .sort((a, b) => displayOrder.indexOf(a.component) - displayOrder.indexOf(b.component));
    
    setAvailableComponents(allComponents);
    setConstructedWord([]);
    setShowHint(false);
    setShowCelebration(false);
    // Reset completion guard when a new answer arrives
    completionGuardRef.current = false;
    if (celebrateTimeoutRef.current !== null) {
      window.clearTimeout(celebrateTimeoutRef.current);
      celebrateTimeoutRef.current = null;
    }
  }, [answer, parseDevanagariComponents]);

  React.useEffect(() => {
    return () => {
      if (celebrateTimeoutRef.current !== null) {
        window.clearTimeout(celebrateTimeoutRef.current);
        celebrateTimeoutRef.current = null;
      }
    };
  }, []);

  // Validate constructed word in real-time
  React.useEffect(() => {
    if (constructedWord.length === 0 || !answer) {
      setShowHint(false);
      return;
    }

    const constructedComponents = constructedWord.map(item => item.component);
    const normalizedAnswer = String(answer ?? '').trim();
    const expectedComps = expectedState.answerKey === normalizedAnswer
      ? expectedState.components
      : parseDevanagariComponents(normalizedAnswer);
    
    // Check if complete
    if (constructedComponents.length === expectedComps.length) {
      const isCorrect = constructedComponents.every((comp, idx) => comp === expectedComps[idx]);
      
      if (isCorrect) {
        // Compute schedule key for this completion (capture current mode+answer)
        const scheduleKey = `${mode}::${String(answer)}`;
        // If we've already scheduled or completed dispatch for this construction key, skip
        if (completionGuardRef.current === scheduleKey) {
          // eslint-disable-next-line no-console
          console.debug('[DevanagariConstructionMode] completion already in progress for key - skipping re-schedule', { scheduleKey, ts: Date.now() });
          return;
        }
        // Mark guard with scheduleKey so we don't schedule another completion while one is pending
        completionGuardRef.current = scheduleKey;
        // Show celebration!
        // Diagnostic log
        // eslint-disable-next-line no-console
        console.debug('[DevanagariConstructionMode] correct - constructed=', constructedComponents, 'expected=', expectedComps, 'ts=', Date.now());
        setShowCelebration(true);
        setShowHint(false);
        
        // Auto-advance after celebration using trace-driven architecture
        if (celebrateTimeoutRef.current !== null) {
          window.clearTimeout(celebrateTimeoutRef.current);
        }
        // Capture current answer/mode for the timeout closure so changes to props
        // won't cause us to dispatch for a different answer.
        const capturedKey = scheduleKey;
        const capturedAnswer = String(answer);
        const capturedMode = mode;
        celebrateTimeoutRef.current = window.setTimeout(() => {
          setShowCelebration(false);
          // Dispatch proper Redux action instead of calling callback
          if (dispatch && capturedMode) {
            const key = capturedKey;
            const now = Date.now();
            const recentTs = recentCompletionMap.get(key) || 0;
            // If we've dispatched for this (mode,answer) within the last 2500ms, skip duplicate
            if (now - recentTs < 2500) {
              // eslint-disable-next-line no-console
              console.debug('[DevanagariConstructionMode] skipping duplicate dispatch due to recentCompletionMap', { key, recentTs, now });
            } else {
              recentCompletionMap.set(key, now);
              // Clean up old entries occasionally
              try {
                // eslint-disable-next-line no-console
                console.debug('[DevanagariConstructionMode] dispatching completeConstructionWord', { mode: capturedMode, answer: capturedAnswer, ts: Date.now() });
                dispatch(completeConstructionWord({ mode: capturedMode }));
                // eslint-disable-next-line no-console
                console.debug('[DevanagariConstructionMode] dispatched completeConstructionWord OK', { mode: capturedMode, answer: capturedAnswer, ts: Date.now() });
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error('[DevanagariConstructionMode] dispatch error', err);
              }
              // prune entries older than 10s to avoid memory growth
              for (const [k, t] of recentCompletionMap.entries()) {
                if (now - t > 10000) recentCompletionMap.delete(k);
              }
            }
          }
          // Keep guard set to capturedKey until a new answer resets it (prevents immediate re-scheduling)
          // Note: do not clear completionGuardRef here; it will be reset when a new answer arrives
          celebrateTimeoutRef.current = null;
        }, 1200); // Give time for confetti to show
      } else {
        // Wrong answer - show hint
        setShowHint(true);
      }
    } else if (constructedComponents.length > expectedComps.length) {
      // Too many components - show hint
      setShowHint(true);
    } else {
      // Still building - hide hint until attempt is complete
      setShowHint(false);
    }
  }, [constructedWord, answer, expectedState, parseDevanagariComponents, dispatch, mode]); // Added dispatch and mode to dependencies

  const handleAddComponent = (item) => {
    if (item.used || disabled) return;
    
    // Add to constructed word
    // eslint-disable-next-line no-console
    console.debug('[DevanagariConstructionMode] handleAddComponent', { component: item.component, id: item.id, ts: Date.now() });
    setConstructedWord(prev => [...prev, item]);
    setAvailableComponents(prev => 
      prev.map(comp => 
        comp.id === item.id ? { ...comp, used: true } : comp
      )
    );
  };

  const handleRemoveComponent = (idx) => {
    if (disabled) return;
    
    const removedItem = constructedWord[idx];
    
    // eslint-disable-next-line no-console
    console.debug('[DevanagariConstructionMode] handleRemoveComponent', { removed: removedItem && removedItem.component, idx, ts: Date.now() });
    // Remove from constructed and return to available
    setConstructedWord(prev => prev.filter((_, i) => i !== idx));
    setAvailableComponents(prev => 
      prev.map(comp => 
        comp.id === removedItem.id ? { ...comp, used: false } : comp
      )
    );
  };

  const handleReset = () => {
    if (disabled) return;
    
    setConstructedWord([]);
    setAvailableComponents(prev => 
      prev.map(comp => ({ ...comp, used: false }))
    );
  };

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 20,
      padding: 20,
      background: 'rgba(79,70,229,0.03)',
      borderRadius: 16,
      border: '2px solid rgba(79,70,229,0.15)'
    }}>
      {/* Construction Area - Where components are added */}
      <div style={{ width: '100%' }}>
        <div
          data-testid="construction-target-label"
          style={{ 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          color: 'var(--text-secondary)', 
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Build the word here:
        </div>
        <div
          style={{
            minHeight: 80,
            background: 'white',
            borderRadius: 12,
            border: '2px dashed rgba(79,70,229,0.3)',
            padding: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {constructedWord.length === 0 ? (
            <div style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.9rem',
              fontStyle: 'italic' 
            }}>
              Tap letters below to build...
            </div>
          ) : (
            constructedWord.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleRemoveComponent(idx)}
                data-testid="construction-built-tile"
                data-component={item.component}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  borderRadius: 10,
                  fontSize: '2rem',
                  fontWeight: 700,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 150ms ease',
                  fontFamily: '"Noto Sans Devanagari", "Noto Sans Kannada", sans-serif',
                  opacity: disabled ? 0.6 : 1
                }}
              >
                {item.component}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Components Pool */}
      <div style={{ width: '100%' }}>
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          color: 'var(--text-secondary)', 
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Tap to add:
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          padding: 12,
          background: 'rgba(148, 163, 184, 0.05)',
          borderRadius: 12
        }}>
          {availableComponents.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddComponent(item)}
              disabled={item.used || disabled}
              data-testid="construction-component"
              data-component={item.component}
              style={{
                padding: '12px 16px',
                background: item.used ? 'rgba(148, 163, 184, 0.2)' : 'white',
                color: item.used ? 'var(--text-secondary)' : 'var(--text-primary)',
                border: '2px solid rgba(79,70,229,0.2)',
                borderRadius: 10,
                fontSize: '2rem',
                fontWeight: 700,
                cursor: (item.used || disabled) ? 'not-allowed' : 'pointer',
                boxShadow: item.used ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.1)',
                opacity: (item.used || disabled) ? 0.4 : 1,
                transition: 'all 150ms ease',
                fontFamily: '"Noto Sans Devanagari", "Noto Sans Kannada", sans-serif'
              }}
            >
              {item.component}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        width: '100%', 
        justifyContent: 'center' 
      }}>
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            transition: 'all 150ms ease',
            opacity: disabled ? 0.6 : 1
          }}
        >
          ↺ Reset
        </button>
      </div>

      <div style={{ 
        fontSize: '0.8rem', 
        color: 'var(--text-secondary)',
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        Tap letters to build, tap again to remove
      </div>

      {/* Smart Hints - Show when construction is wrong */}
      {showHint && (
        <ConstructionHint 
          constructed={constructedWord}
          expected={expectedState.components}
          show={showHint}
        />
      )}

      {/* Celebration Animation */}
      <ConfettiCelebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
