/**
 * 🎯 Enhanced Practice Panel with DDD Architecture and Session Framing
 * 
 * This component uses Domain-Driven Design services for practice functionality
 * while maintaining backwards compatibility with Redux state management.
 * Now includes session start/end cards and progress tracking.
 */

import { useState, useCallback } from 'react';
// @ts-ignore
import PracticeCard from './PracticeCard.jsx';
import SessionStartCard from './SessionStartCard';
import SessionEndCard from './SessionEndCard';
import UnifiedParentBanner from './UnifiedParentBanner';
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
  const { card, currentWordId, sessionFraming } = practice;
  
  // Local state for session framing
  const [showSessionStart, setShowSessionStart] = useState(sessionFraming.showSessionStart);
  const [showSessionEnd, setShowSessionEnd] = useState(sessionFraming.showSessionEnd);
  const [showRepeatBanner, setShowRepeatBanner] = useState(sessionFraming.showRepeatExplanation);
  
  // 🎯 DDD Services (when enabled)
  const practiceService = usePracticeApplicationService();
  const [domainEventMessage, setDomainEventMessage] = useState<string | null>(null);

  // Session framing handlers
  const handleSessionStart = () => {
    setShowSessionStart(false);
  };

  const handleSessionContinue = () => {
    setShowSessionEnd(false);
    // This would typically trigger creation of a new session
    onNext();
  };

  const handleRepeatBannerDismiss = () => {
    setShowRepeatBanner(false);
    if (onWhyRepeatAcknowledged) {
      onWhyRepeatAcknowledged();
    }
  };

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
      {/* Session Start Card */}
      {showSessionStart && (
        <SessionStartCard
          totalQuestions={sessionFraming.sessionProgress.total}
          onStart={handleSessionStart}
        />
      )}

      {/* Session End Card */}
      {showSessionEnd && sessionFraming.sessionStats && (
        <SessionEndCard
          masteredInSession={sessionFraming.sessionStats.masteredInSession}
          practicedInSession={sessionFraming.sessionStats.practicedInSession}
          yetToTry={sessionFraming.sessionStats.yetToTry}
          onContinue={handleSessionContinue}
          showMasteryAnimation={sessionFraming.sessionStats.masteredInSession > 0}
        />
      )}

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

      {/* Unified Parent Banner - combines guidance and repeat explanation */}
      {card.currentWord && (
        <UnifiedParentBanner
          currentWord={card.currentWord}
          showRepeatExplanation={showRepeatBanner}
          revealCount={card.whyRepeat?.revealCount}
          onDismiss={showRepeatBanner ? handleRepeatBannerDismiss : undefined}
        />
      )}

      {/* Main Practice Card - always rendered so tests can find the practice root; overlays will sit on top */}
      <PracticeCard
          mainWord={card.mainWord}
          transliteration={card.transliteration}
          transliterationHi={card.transliterationHi}
          answer={card.answer}
          notes={card.notes}
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
          sessionProgress={card.sessionProgress}
        />
    </div>
  );
}
