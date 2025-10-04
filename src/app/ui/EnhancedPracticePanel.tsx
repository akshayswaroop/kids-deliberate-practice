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
  
  // Local state for PracticeCard status/answer (for unified banner)
  const [cardState, setCardState] = useState<{ status: string; lastAnswer: 'correct' | 'wrong' | null }>({ 
    status: 'idle', 
    lastAnswer: null 
  });
  
  // 🎯 DDD Services (when enabled)
  const practiceService = usePracticeApplicationService();

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
          onCorrect();
          return;
        }
      } catch {
        // Optionally handle error silently
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
          onWrong();
          return;
        }
      } catch {
        // Optionally handle error silently
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

      {/* 🎯 Domain Event Messages - banner removed as requested */}

      {/* Unified Parent Banner - combines guidance and repeat explanation */}
      {card.currentWord && (
        <UnifiedParentBanner
          currentWord={card.currentWord}
          showRepeatExplanation={showRepeatBanner}
          revealCount={card.whyRepeat?.revealCount}
          onDismiss={showRepeatBanner ? handleRepeatBannerDismiss : undefined}
          mode={mode}
          lastAnswer={cardState.lastAnswer}
          sessionProgress={card.sessionProgress}
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
          {...({ onStatusChange: setCardState } as any)}
        />
    </div>
  );
}
