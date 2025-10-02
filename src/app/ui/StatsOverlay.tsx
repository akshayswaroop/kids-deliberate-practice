/**
 * 🌱 Stats Overlay Component
 * 
 * Shows turnarounds and streak stats during celebration animations
 * Appears prominently to reinforce growth story
 */

import { useState, useEffect } from 'react';
import { store } from '../../infrastructure/store';
import { ReduxRepositoryFactory } from '../../infrastructure/repositories/ReduxRepositoryFactory';
import { LearnerId } from '../../domain/value-objects/LearnerId';
import type { LearningStatistics } from '../../domain/repositories/ProgressRepository';

interface StatsOverlayProps {
  currentUserId: string;
  visible: boolean;
  isCorrect: boolean; // Show different messaging based on correct/wrong
}

export function StatsOverlay({ currentUserId, visible, isCorrect }: StatsOverlayProps) {
  const [stats, setStats] = useState<LearningStatistics | null>(null);
  
  useEffect(() => {
    if (!visible || !currentUserId) return;
    
    const loadStats = async () => {
      try {
        const factory = new ReduxRepositoryFactory(
          () => store.getState().game,
          store.dispatch
        );
        const progressRepo = factory.createProgressRepository();
        const learnerId = LearnerId.fromString(currentUserId);
        const statistics = await progressRepo.getStatistics(learnerId);
        setStats(statistics);
      } catch {
        setStats(null);
      }
    };
    
    loadStats();
  }, [visible, currentUserId]);
  
  if (!visible || !stats) return null;
  
  const { turnaroundCount, currentStreak } = stats;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      padding: '32px',
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      minWidth: '320px',
      maxWidth: '400px',
      animation: 'statsSlideIn 0.5s ease-out',
      backdropFilter: 'blur(10px)'
    }}>
      <style>{`
        @keyframes statsSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
        fontSize: '2rem'
      }}>
        {isCorrect ? '🎉' : '💪'}
      </div>
      
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: '1.3rem',
        fontWeight: 700,
        textAlign: 'center',
        color: '#1f2937'
      }}>
        {isCorrect ? 'Great Progress!' : 'Keep Going!'}
      </h3>
      
      {/* Turnarounds */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: turnaroundCount > 0 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.15))'
          : 'rgba(243, 244, 246, 0.5)',
        borderRadius: '12px',
        marginBottom: '12px',
        border: '2px solid',
        borderColor: turnaroundCount > 0 ? '#10b981' : '#e5e7eb'
      }}>
        <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🌱</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Turnarounds
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            lineHeight: 1.4
          }}>
            {turnaroundCount === 0 
              ? "Keep going, you'll conquer tricky words soon!" 
              : `${turnaroundCount} tricky word${turnaroundCount === 1 ? '' : 's'} conquered! 🎯`}
          </div>
        </div>
      </div>
      
      {/* Streak */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: currentStreak > 0 
          ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(251, 146, 60, 0.15))'
          : 'rgba(243, 244, 246, 0.5)',
        borderRadius: '12px',
        border: '2px solid',
        borderColor: currentStreak > 0 ? '#f97316' : '#e5e7eb'
      }}>
        <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>🔥</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#374151',
            marginBottom: '4px'
          }}>
            Streak
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            lineHeight: 1.4
          }}>
            {currentStreak === 0
              ? "Start a new streak today! 💫"
              : `${currentStreak} day${currentStreak === 1 ? '' : 's'} in a row! 🚀`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsOverlay;
