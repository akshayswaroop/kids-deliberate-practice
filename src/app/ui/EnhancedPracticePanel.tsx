/**
 * 🎯 Enhanced Practice Panel with DDD Architecture and Session Framing
 * 
 * This component uses Domain-Driven Design services for practice functionality
 * while maintaining backwards compatibility with Redux state management.
 * Now includes session start/end cards and progress tracking.
 */

import { useState, useCallback } from 'react';
import { useAppSelector } from '../../infrastructure/hooks/reduxHooks';
// @ts-ignore
import PracticeCard from './PracticeCard.jsx';
import SessionStartCard from './SessionStartCard';
import SessionEndCard from './SessionEndCard';
import UnifiedParentBanner from './UnifiedParentBanner';
import { usePracticeApplicationService } from '../providers/PracticeServiceProvider';
import type { PracticePanelViewModel } from '../presenters/practicePresenter';
import { selectParentGuidance } from '../../infrastructure/state/gameSelectors';

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
  
  // 🎯 DDD-Compliant: Get parent guidance from domain via selector
  // Follows trace-based architecture: reads current Redux state only
  // No temporal coupling, no local state dependencies
  //
  // IMPORTANT: We must subscribe to the actual word state that affects guidance
  // so that useSelector triggers re-render when Redux state changes
  const parentGuidance = useAppSelector(state => {
    if (!currentWordId) {
      return { message: 'First try', urgency: 'info' as const, context: 'initial' as const };
    }
    // This selector will re-run whenever the word's attempts, step, or revealCount changes
    return selectParentGuidance(state.game, currentWordId);
  }, (left, right) => {
    // Custom equality: compare the actual message/context, not object reference
    return left.message === right.message && 
           left.context === right.context && 
           left.urgency === right.urgency;
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
          parentGuidance={parentGuidance}
          showRepeatExplanation={showRepeatBanner}
          onDismiss={showRepeatBanner ? handleRepeatBannerDismiss : undefined}
          mode={mode}
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
          attemptHistory={card.currentWord?.attempts ?? []}
          sessionProgress={card.sessionProgress}
        />
    </div>
  );
}
