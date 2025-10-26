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

import UnifiedParentBanner from './UnifiedParentBanner';
import { usePracticeApplicationService } from '../providers/PracticeServiceProvider';
import type { PracticePanelViewModel } from '../presenters/practicePresenter';
import { selectParentGuidance, selectSessionGuidance } from '../../infrastructure/state/gameSelectors';

interface EnhancedPracticePanelProps {
  practice: PracticePanelViewModel;
  mode: string;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  onRevealAnswer?: (revealed: boolean) => void;
  currentUserId?: string | null;
  onWhyRepeatAcknowledged?: () => void;
  onReturnHome?: () => void;
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
  onReturnHome,
}: EnhancedPracticePanelProps) {
  const { card, currentWordId, sessionFraming, sessionId } = practice;
  
  // Local state for repeat banner
  const [showRepeatBanner, setShowRepeatBanner] = useState(sessionFraming.showRepeatExplanation);
  
  // 🎯 DDD-Compliant: Get session guidance first, then word guidance
  // Follows trace-based architecture: reads current Redux state only
  // Session guidance takes priority for contextual messages
  const sessionGuidance = useAppSelector(state => {
    if (!sessionId) return null;
    return selectSessionGuidance(state.game, sessionId);
  });
  
  // Word-level guidance as fallback
  const parentGuidance = useAppSelector(state => {
    if (!currentWordId) {
      return { message: 'Ready when you are', urgency: 'info' as const, context: 'initial' as const };
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

  // Repeat banner handler
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

      {/* 🎯 Domain Event Messages - banner removed as requested */}

      {/* Unified Parent Banner - combines session guidance, word guidance and repeat explanation */}
      {card.currentWord && (
        <UnifiedParentBanner
          currentWord={card.currentWord}
          parentGuidance={parentGuidance}
          sessionGuidance={sessionGuidance}
          showRepeatExplanation={showRepeatBanner}
          onDismiss={showRepeatBanner ? handleRepeatBannerDismiss : undefined}
          mode={mode}
          sessionProgress={card.sessionProgress}
          sessionStats={sessionFraming.sessionStats}
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
          sessionGuidance={sessionGuidance}
          sessionStats={sessionFraming.sessionStats}
          onReturnHome={onReturnHome}
        />
    </div>
  );
}
