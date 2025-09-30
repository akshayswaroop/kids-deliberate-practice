/**
 * 🎯 Enhanced Practice Panel with DDD Architecture
 * 
 * This component uses Domain-Driven Design services for practice functionality
 * while maintaining backwards compatibility with Redux state management.
 */

import { useState, useCallback } from 'react';
// @ts-ignore
import PracticeCard from './PracticeCard.jsx';
import { usePracticeApplicationService } from '../providers/PracticeServiceProvider';

interface EnhancedPracticePanelProps {
  // Existing props for backwards compatibility
  mainWord: string;
  transliteration?: string;
  transliterationHi?: string;
  answer?: string;
  notes?: string;
  needsNewSession?: boolean;
  choices: Array<{ id: string; label: string; progress: number }>;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  onRevealAnswer?: (revealed: boolean) => void;
  columns?: number;
  mode?: string;
  isAnswerRevealed?: boolean;
  isEnglishMode?: boolean;
  
  // New DDD-specific props
  currentUserId?: string;
  currentWord?: string; // The actual word being practiced (not just ID)
}

export default function EnhancedPracticePanel({ 
  mainWord, 
  transliteration, 
  transliterationHi,
  answer,
  notes,
  needsNewSession: _needsNewSession,
  onCorrect,
  onWrong,
  onNext,
  onRevealAnswer,
  columns,
  mode,
  isAnswerRevealed,
  isEnglishMode,
  choices,
  // DDD props
  currentUserId,
  currentWord
}: EnhancedPracticePanelProps) {
  
  // 🎯 DDD Services (when enabled)
  const practiceService = usePracticeApplicationService();
  const [domainEventMessage, setDomainEventMessage] = useState<string | null>(null);

  // 🎯 Enhanced handlers that use domain services
  const handleCorrectWithDomain = useCallback(async () => {
    if (currentUserId && currentWord) {
      try {
        console.log('🎯 [DDD] Recording correct attempt:', { currentUserId, currentWord });
        // Use domain service to record attempt
        const result = await practiceService.recordPracticeAttempt(
          currentUserId,
          currentWord,
          true
        );
        
        console.log('🎯 [DDD] Attempt result:', result);
        
        if (result.success) {
          // Show domain event message
          setDomainEventMessage(result.event || '🎉 Great job!');
          
          // Clear message after 2 seconds
          setTimeout(() => setDomainEventMessage(null), 2000);
          
          // Call original handler for Redux compatibility
          onCorrect();
        }
      } catch (error) {
        console.error('🚨 [DDD] Domain service error:', error);
        // Fallback to original handler
        onCorrect();
      }
    } else {
      console.log('🔄 [Redux] Using original Redux handler (missing DDD props)');
      // Use original Redux-based handler
      onCorrect();
    }
  }, [currentUserId, currentWord, practiceService, onCorrect]);

  const handleWrongWithDomain = useCallback(async () => {
    if (currentUserId && currentWord) {
      try {
        console.log('🎯 [DDD] Recording wrong attempt:', { currentUserId, currentWord });
        // Use domain service to record attempt
        const result = await practiceService.recordPracticeAttempt(
          currentUserId,
          currentWord,
          false
        );
        
        console.log('🎯 [DDD] Attempt result:', result);
        
        if (result.success) {
          // Show domain event message
          setDomainEventMessage(result.event || '📚 Keep practicing!');
          
          // Clear message after 2 seconds
          setTimeout(() => setDomainEventMessage(null), 2000);
          
          // Call original handler for Redux compatibility
          onWrong();
        }
      } catch (error) {
        console.error('🚨 [DDD] Domain service error:', error);
        // Fallback to original handler
        onWrong();
      }
    } else {
      console.log('🔄 [Redux] Using original Redux handler (missing DDD props)');
      // Use original Redux-based handler
      onWrong();
    }
  }, [currentUserId, currentWord, practiceService, onWrong]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 🎯 Domain Event Messages */}
      {domainEventMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#4CAF50',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {domainEventMessage}
        </div>
      )}

      <PracticeCard
        mainWord={mainWord}
        transliteration={transliteration}
        transliterationHi={transliterationHi}
        answer={answer}
        notes={notes}
        choices={choices}
        onCorrect={handleCorrectWithDomain}
        onWrong={handleWrongWithDomain}
        onNext={onNext}
        onRevealAnswer={onRevealAnswer}
        columns={columns}
        mode={mode}
        isAnswerRevealed={isAnswerRevealed}
        isEnglishMode={isEnglishMode}
      />
    </div>
  );
}