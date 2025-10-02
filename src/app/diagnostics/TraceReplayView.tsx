import { memo } from 'react';
import Onboarding from '../ui/Onboarding';
import EnhancedPracticePanel from '../ui/EnhancedPracticePanel';
import { PracticeServiceProvider } from '../providers/PracticeServiceProvider';
import type { PracticeAppViewModel } from '../presenters/practicePresenter';

const noop = () => {};

function ReplayContent({ viewModel }: { viewModel: PracticeAppViewModel }) {
  if (viewModel.showOnboarding) {
    return (
      <div style={{ padding: 16 }}>
        <Onboarding onCreate={noop} />
      </div>
    );
  }

  if (!viewModel.home) {
    return <div style={{ fontStyle: 'italic', padding: 16 }}>No home view available for this entry.</div>;
  }

  const home = viewModel.home;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        border: '1px solid var(--border-muted, rgba(0,0,0,0.08))',
        padding: 16,
        maxWidth: 960,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Mode</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{home.mode}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          User: {home.currentUserId ?? '—'} · Columns: {home.columns}
        </div>
      </header>

      <div style={{ pointerEvents: 'none', opacity: 0.96 }}>
        <PracticeServiceProvider>
          <EnhancedPracticePanel
            practice={home.practice}
            mode={home.mode}
            onCorrect={noop}
            onWrong={noop}
            onNext={noop}
            onRevealAnswer={noop}
            currentUserId={home.currentUserId ?? undefined}
          />
        </PracticeServiceProvider>
      </div>
    </div>
  );
}

const TraceReplayView = memo(ReplayContent);

export default TraceReplayView;
