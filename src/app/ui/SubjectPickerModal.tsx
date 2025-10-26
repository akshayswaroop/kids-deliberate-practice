import { getSubjectParentInstruction, SUBJECT_CONFIGS } from '../../infrastructure/repositories/subjectLoader';
import { useEffect } from 'react';
import SubjectCard from './SubjectCard';
import ReadyToPractice from './ReadyToPractice';

interface SubjectPickerModalProps {
  open: boolean;
  selectedMode: string;
  onSelect: (mode: string) => void;
  onClose: () => void;
}

// Only Kannada learning
const subjectCards = SUBJECT_CONFIGS.map(config => ({
  name: config.name,
  label: config.displayLabel,
  icon: config.displayIcon,
  // Show the parent instruction to the caretaker instead of a short prompt
  instruction: getSubjectParentInstruction(config.name),
}));

export default function SubjectPickerModal({ open, selectedMode, onSelect, onClose }: SubjectPickerModalProps) {
  // Add class synchronously when open to ensure action bar is hidden immediately
  if (open && typeof document !== 'undefined' && !document.body.classList.contains('overlay-open')) {
    document.body.classList.add('overlay-open');
  }
  
  // Toggle global overlay class so the bottom action bar is hidden while this modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('overlay-open');
    } else {
      document.body.classList.remove('overlay-open');
    }
    return () => document.body.classList.remove('overlay-open');
  }, [open]);

  // Close on Escape for accessibility and mobile convenience
  // Keep this hook before the early return so hooks are called in the same order
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return; // only close when modal is open
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose practice subject"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        zIndex: 5000,
      }}
    >
      {/* Pinned close button so modal can be dismissed on small screens */}
      <button
        aria-label="Close subject picker"
        onClick={onClose}
        style={{
          position: 'fixed',
          right: 14,
          top: 14,
          zIndex: 5100,
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: 10,
          padding: '6px 10px',
          cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(2,6,23,0.12)',
          fontWeight: 700,
          color: 'var(--text-primary)'
        }}
      >
        ✕
      </button>
      <div
        style={{
          width: 'min(900px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-primary, #f8fafc)',
          borderRadius: 24,
          boxShadow: '0 40px 90px rgba(15, 23, 42, 0.35)',
          padding: '32px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Reusable header component */}
        <ReadyToPractice onClose={onClose} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            width: '100%',
          }}
        >
          {subjectCards.map(subject => (
            <SubjectCard
              key={subject.name}
              icon={subject.icon}
              label={subject.label}
              instruction={subject.instruction}
              isActive={subject.name === selectedMode}
              onClick={() => onSelect(subject.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
