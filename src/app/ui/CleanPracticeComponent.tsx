/**
 * 🎯 Application Layer: Clean Practice Component
 * 
 * This component demonstrates how clean React becomes when it only deals
 * with business use cases instead of Redux complexity.
 * 
 * Notice: No Redux actions, no complex selectors, no state management logic.
 * Just pure UI concerns and business use cases.
 */

import { useState } from 'react';
import { usePracticeService, usePracticeState } from '../hooks/usePracticeService';

interface PracticeSessionData {
  success: boolean;
  session?: any;
  message?: string;
  error?: string;
}

interface AttemptResult {
  success: boolean;
  progress?: any;
  event?: string;
  isMastered?: boolean;
  error?: string;
}

/**
 * 🎯 Clean Practice Component
 * 
 * This is what your UI looks like with proper DDD architecture:
 * - Clear business intent (generatePracticeSession, recordPracticeAttempt)
 * - No Redux complexity
 * - Easy to test and understand
 */
export function CleanPracticeComponent() {
  // 🎯 Business Use Cases (not Redux!)
  const {
    generatePracticeSession,
    recordPracticeAttempt,
    generateAdaptiveSession
  } = usePracticeService();

  // 🎯 Domain State (not Redux state!)
  const { learnerProfile, learningProgress } = usePracticeState();

  // Local UI state
  const [currentSession, setCurrentSession] = useState<PracticeSessionData | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🎯 Business Use Case: Start Practice Session
  const handleStartPractice = async (subject: string, complexity: string) => {
    setIsLoading(true);
    try {
      const result = await generatePracticeSession(
        learnerProfile.id,
        subject,
        complexity,
        5 // session size
      );
      
      setCurrentSession(result);
      setCurrentWordIndex(0);
      setAttemptResult(null);
    } catch {
      setAttemptResult({ success: false, event: '⚠️ Unable to start practice session.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 Business Use Case: Start Adaptive Session
  const handleStartAdaptiveSession = async () => {
    setIsLoading(true);
    try {
      const result = await generateAdaptiveSession(learnerProfile.id, 5);
      setCurrentSession(result);
      setCurrentWordIndex(0);
      setAttemptResult(null);
    } catch {
      setAttemptResult({ success: false, event: '⚠️ Unable to start adaptive session.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 Business Use Case: Record Answer
  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentSession?.session?.wordDrills) return;

    const currentWord = currentSession.session.wordDrills[currentWordIndex];
    if (!currentWord) return;

    setIsLoading(true);
    try {
      const result = await recordPracticeAttempt(
        learnerProfile.id,
        currentWord.wordId || currentWord.id,
        isCorrect
      );
      
      setAttemptResult(result);
      
      // Auto-advance after showing result
      setTimeout(() => {
        if (currentWordIndex < currentSession.session.wordDrills.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setAttemptResult(null);
        } else {
          // Session complete
          setCurrentSession(null);
          setCurrentWordIndex(0);
          setAttemptResult(null);
        }
      }, 1500);
    } catch {
      setAttemptResult({ success: false, event: '⚠️ Unable to record attempt.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 Clean UI Rendering
  const renderSessionSelection = () => (
    <div className="practice-selection">
      <h2>Choose Your Practice</h2>
      
      <div className="session-options">
        <button 
          onClick={() => handleStartPractice('english', 'beginner')}
          disabled={isLoading}
          className="practice-button"
        >
          📚 English - Beginner
        </button>
        
        <button 
          onClick={() => handleStartPractice('english', 'intermediate')}
          disabled={isLoading}
          className="practice-button"
        >
          📖 English - Intermediate
        </button>
        
        <button 
          onClick={() => handleStartPractice('math', 'beginner')}
          disabled={isLoading}
          className="practice-button"
        >
          🔢 Math - Beginner
        </button>
        
        <button 
          onClick={handleStartAdaptiveSession}
          disabled={isLoading}
          className="practice-button adaptive"
        >
          🎯 Adaptive Session
        </button>
      </div>

      <div className="learning-progress">
        <h3>Your Progress</h3>
        <p>Words Studied: {learningProgress.totalWordsStudied}</p>
        <p>Mastered: {learningProgress.masteredWords}</p>
        <p>Current Streak: {learningProgress.currentStreak}</p>
        <p>Accuracy: {learningProgress.overallAccuracy}%</p>
      </div>
    </div>
  );

  const renderPracticeSession = () => {
    if (!currentSession?.session?.wordDrills) return null;

    const currentWord = currentSession.session.wordDrills[currentWordIndex];
    const progress = `${currentWordIndex + 1} / ${currentSession.session.wordDrills.length}`;

    return (
      <div className="practice-session">
        <div className="session-header">
          <h2>Practice Session</h2>
          <div className="progress">{progress}</div>
        </div>

        {currentWord && (
          <div className="word-drill">
            <h3>Translate this word:</h3>
            <div className="word-to-translate">
              {currentWord.word || currentWord.text}
            </div>
            
            <div className="options">
              {currentWord.options?.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option === currentWord.correctAnswer)}
                  disabled={isLoading || !!attemptResult}
                  className="option-button"
                >
                  {option}
                </button>
              )) || (
                // Fallback for simplified structure
                <div className="simple-answer">
                  <button
                    onClick={() => handleAnswer(true)}
                    disabled={isLoading || !!attemptResult}
                    className="option-button correct"
                  >
                    ✅ Correct
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    disabled={isLoading || !!attemptResult}
                    className="option-button incorrect"
                  >
                    ❌ Incorrect
                  </button>
                </div>
              )}
            </div>

            {attemptResult && (
              <div className={`result ${attemptResult.success ? 'success' : 'error'}`}>
                {attemptResult.event || (attemptResult.success ? '🎉 Great job!' : '❌ Try again!')}
                {attemptResult.isMastered && <div className="mastery">🌟 Word Mastered!</div>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="clean-practice-component">
      {isLoading && <div className="loading">Loading...</div>}
      
      {!currentSession ? renderSessionSelection() : renderPracticeSession()}
    </div>
  );
}

// 🎯 CSS Styles for Clean Component
export const practiceStyles = `
.practice-selection {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}
/* AUDIT: max-width:600px is reasonable but may be too wide/narrow on some devices.
   Suggestion: use max-width: min(600px, 96vw) or clamp() to provide responsive fallback. */

.session-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.practice-button {
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.practice-button:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.practice-button.adaptive {
  border-color: #28a745;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.practice-session {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}
/* AUDIT: same note as above, prefer responsive cap to avoid forced large containers on small screens. */

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.word-drill {
  text-align: center;
  padding: 2rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: white;
}

.word-to-translate {
  font-size: 2rem;
  font-weight: bold;
  margin: 2rem 0;
  color: #007bff;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.option-button {
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.option-button:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.option-button.correct {
  background: #d4edda;
  border-color: #28a745;
}

.option-button.incorrect {
  background: #f8d7da;
  border-color: #dc3545;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: bold;
}

.result.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}

.result.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
}

.mastery {
  margin-top: 0.5rem;
  font-size: 1.2rem;
  color: #ffc107;
}

.learning-progress {
  margin-top: 3rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  z-index: 1000;
}
/* AUDIT: fixed loading overlay ignores safe-area insets and virtual keyboard. Minimal fix: add padding-bottom: env(safe-area-inset-bottom) and use max-width: 90vw to avoid overflow on small screens. */
`;
