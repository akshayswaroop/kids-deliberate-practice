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
import type { PracticePanelViewModel } from '../presenters/practicePresenter';

interface EnhancedPracticePanelProps {
  practice: PracticePanelViewModel;
  mode: string;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  onRevealAnswer?: (revealed: boolean) => void;
  currentUserId?: string | null;
  onWhyRepeatAcknowledged?: () => void;
}

export default function EnhancedPracticePanel({
  practice,
  mode,
  onCorrect,
  onWrong,
  onNext,
  onRevealAnswer,
  currentUserId,
  onWhyRepeatAcknowledged,
}: EnhancedPracticePanelProps) {
  const { card, currentWordId } = practice;
  
  // 🎯 DDD Services (when enabled)
  const practiceService = usePracticeApplicationService();
  const [domainEventMessage, setDomainEventMessage] = useState<string | null>(null);

  // 🎯 Enhanced handlers that use domain services
  const handleCorrectWithDomain = useCallback(async () => {
    if (currentUserId && currentWordId) {
      try {
        const result = await practiceService.recordPracticeAttempt(
          currentUserId,
          currentWordId,
          true
        );

        if (result.success) {
          setDomainEventMessage(result.event || '🎉 Great job!');
          setTimeout(() => setDomainEventMessage(null), 2000);
          onCorrect();
          return;
        }
      } catch {
        setDomainEventMessage('⚠️ Unable to reach practice service');
        setTimeout(() => setDomainEventMessage(null), 2000);
      }
    }

    onCorrect();
  }, [currentUserId, currentWordId, practiceService, onCorrect]);

  const handleWrongWithDomain = useCallback(async () => {
    if (currentUserId && currentWordId) {
      try {
        const result = await practiceService.recordPracticeAttempt(
          currentUserId,
          currentWordId,
          false
        );

        if (result.success) {
          setDomainEventMessage(result.event || '📚 Keep practicing!');
          setTimeout(() => setDomainEventMessage(null), 2000);
          onWrong();
          return;
        }
      } catch {
        setDomainEventMessage('⚠️ Unable to reach practice service');
        setTimeout(() => setDomainEventMessage(null), 2000);
      }
    }

    onWrong();
  }, [currentUserId, currentWordId, practiceService, onWrong]);

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
        mainWord={card.mainWord}
        transliteration={card.transliteration}
        transliterationHi={card.transliterationHi}
        answer={card.answer}
        notes={card.notes}
        choices={card.choices}
        onCorrect={handleCorrectWithDomain}
        onWrong={handleWrongWithDomain}
        onNext={onNext}
        onRevealAnswer={onRevealAnswer}
        columns={card.columns}
        mode={mode}
        isAnswerRevealed={card.isAnswerRevealed}
        isEnglishMode={card.isEnglishMode}
        currentUserId={currentUserId ?? undefined}
        whyRepeat={card.whyRepeat}
        onWhyRepeatAcknowledged={onWhyRepeatAcknowledged}
        attemptStats={card.attempts}
      />
    </div>
  );
}
