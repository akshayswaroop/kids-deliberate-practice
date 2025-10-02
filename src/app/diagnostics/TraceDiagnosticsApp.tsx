import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { TraceEntry, TraceSession } from '../tracing/traceSchema';
import { computeDiff, type DiffEntry } from './diffUtils';
import { buildPracticeAppViewModel } from '../presenters/practicePresenter';
import type { PracticeAppViewModel } from '../presenters/practicePresenter';
import type { RootState as GameState } from '../../infrastructure/state/gameState';
import TraceReplayView from './TraceReplayView';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontFamily: 'system-ui, sans-serif',
};

const sidebarStyle: React.CSSProperties = {
  width: '320px',
  borderRight: '1px solid var(--border-muted, rgba(0,0,0,0.1))',
  overflowY: 'auto',
  padding: '16px',
  boxSizing: 'border-box',
  background: 'var(--bg-secondary)',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  boxSizing: 'border-box',
};

function parseTraceSession(text: string): TraceSession {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.entries)) {
    throw new Error('Invalid trace session payload');
  }
  return parsed as TraceSession;
}

function formatTimestamp(timestamp: number): string {
  try {
    return new Date(timestamp).toISOString();
  } catch {
    return String(timestamp);
  }
}

function resolveModeFromEntry(entry: TraceEntry, recordedView?: PracticeAppViewModel): string {
  if (recordedView?.home?.mode) {
    return recordedView.home.mode;
  }
  const payload = (entry.intent && typeof entry.intent.payload === 'object') ? entry.intent.payload as Record<string, unknown> : undefined;
  if (payload) {
    const modeCandidate = payload.mode ?? payload.language;
    if (typeof modeCandidate === 'string') {
      return modeCandidate;
    }
  }
  if (entry.gameStateAfter?.currentUserId) {
    const user = entry.gameStateAfter.users[entry.gameStateAfter.currentUserId];
    if (user?.currentMode) {
      return user.currentMode;
    }
  }
  return 'english';
}

function recomputeViewModel(entry: TraceEntry, recordedView?: PracticeAppViewModel, windowWidth = 1280) {
  if (!entry.gameStateAfter) {
    return null;
  }
  const mode = resolveModeFromEntry(entry, recordedView);
  return buildPracticeAppViewModel({
    state: entry.gameStateAfter as GameState,
    mode,
    windowWidth,
  });
}

function DiffList({ diffs, emptyMessage }: { diffs: DiffEntry[]; emptyMessage: string }) {
  if (!diffs.length) {
    return <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{emptyMessage}</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {diffs.map(diff => (
        <div
          key={diff.path}
          style={{
            border: '1px solid var(--border-muted, rgba(0,0,0,0.1))',
            borderRadius: 8,
            padding: 12,
            background: 'var(--bg-muted, rgba(0,0,0,0.02))',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{diff.path}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Before</div>
          <pre style={{ overflowX: 'auto', margin: 0 }}>{JSON.stringify(diff.before, null, 2)}</pre>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>After</div>
          <pre style={{ overflowX: 'auto', margin: 0 }}>{JSON.stringify(diff.after, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

function PracticeSnapshot({ practiceApp }: { practiceApp: PracticeAppViewModel }) {
  if (practiceApp.showOnboarding) {
    return <div style={{ padding: 16 }}>Onboarding flow was displayed.</div>;
  }
  if (!practiceApp.home) {
    return <div style={{ padding: 16 }}>No home view captured for this entry.</div>;
  }
  const { home } = practiceApp;
  const practice = home.practice;
  const card = practice.card;

  return (
    <div style={{
      border: '1px solid var(--border-muted, rgba(0,0,0,0.1))',
      borderRadius: 12,
      padding: 16,
      background: 'white',
      color: '#111827',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 480,
    }}>
      <div style={{ fontSize: 14, color: '#6B7280' }}>Mode: <strong>{home.mode}</strong></div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{card.mainWord}</div>
      {card.transliteration && (
        <div style={{ color: '#6B7280' }}>Transliteration: {card.transliteration}</div>
      )}
      {card.transliterationHi && (
        <div style={{ color: '#6B7280' }}>Hindi Transliteration: {card.transliterationHi}</div>
      )}
      {(card.answer || card.notes) && (
        <div style={{ background: '#F3F4F6', padding: 12, borderRadius: 8 }}>
          {card.answer && <div><strong>Answer:</strong> {card.answer}</div>}
          {card.notes && <div style={{ marginTop: 4 }}><strong>Notes:</strong> {card.notes}</div>}
        </div>
      )}
      <div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Choices</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {card.choices.map(choice => (
            <div
              key={choice.id}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                background: '#E5E7EB',
                fontSize: 12,
              }}
            >
              {choice.label} ({choice.progress}%)
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6B7280' }}>
        Session ID: {practice.sessionId ?? '—'} · Current Word ID: {practice.currentWordId ?? '—'}
      </div>
    </div>
  );
}

function TraceEntryDetails({ entry }: { entry: TraceEntry }) {
  const recordedView = (entry.viewModel?.practiceApp as PracticeAppViewModel | undefined);
  const recomputedView = useMemo(() => recomputeViewModel(entry, recordedView), [entry, recordedView]);
  const stateDiffs = useMemo(() => computeDiff(entry.stateBefore, entry.stateAfter), [entry.stateBefore, entry.stateAfter]);
  const recomputeDiffs = useMemo(() => {
    if (!recordedView || !recomputedView) return [];
    return computeDiff(recordedView, recomputedView);
  }, [recordedView, recomputedView]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ margin: '8px 0' }}>Intent</h2>
        <div style={{
          border: '1px solid var(--border-muted, rgba(0,0,0,0.1))',
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontWeight: 600 }}>{entry.intent?.type}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {formatTimestamp(entry.timestamp)} · Session {entry.sessionId}
          </div>
          <pre style={{ marginTop: 12, overflowX: 'auto' }}>{JSON.stringify(entry.intent?.payload, null, 2)}</pre>
        </div>
      </div>

      <div>
        <h2 style={{ margin: '8px 0' }}>Domain Context</h2>
        <pre style={{
          border: '1px solid var(--border-muted, rgba(0,0,0,0.1))',
          borderRadius: 12,
          padding: 16,
          overflowX: 'auto',
        }}>{JSON.stringify(entry.domainContext, null, 2)}</pre>
      </div>

      <div>
        <h2 style={{ margin: '8px 0' }}>State Delta</h2>
        <DiffList diffs={stateDiffs} emptyMessage="No differences detected between stateBefore and stateAfter." />
      </div>

      <div>
        <h2 style={{ margin: '8px 0' }}>Recorded View</h2>
        {recordedView ? (
          <PracticeSnapshot practiceApp={recordedView} />
        ) : (
          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No view model captured for this entry.</div>
        )}
      </div>

      <div>
        <h2 style={{ margin: '8px 0' }}>Live UI Replay</h2>
        {recomputedView ? (
          <TraceReplayView viewModel={recomputedView} />
        ) : recordedView ? (
          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            Unable to recompute view from state snapshot; falling back to recorded card above.
          </div>
        ) : (
          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            No state snapshot available to render the UI.
          </div>
        )}
      </div>

      <div>
        <h2 style={{ margin: '8px 0' }}>Deterministic Rehydration Check</h2>
        {recomputedView ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              The view model was recomputed using the captured post-action game state.
            </div>
            <DiffList
              diffs={recomputeDiffs}
              emptyMessage="Recomputed view matches the recorded view (selectors deterministic)."
            />
          </div>
        ) : (
          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            No gameState snapshot found for this entry; replay unavailable.
          </div>
        )}
      </div>
    </div>
  );
}

export default function TraceDiagnosticsApp() {
  const [session, setSession] = useState<TraceSession | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const entries = session?.entries ?? [];
  const selectedEntry = entries[selectedIndex];

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseTraceSession(text);
    setSession(parsed);
    setSelectedIndex(0);
  };

  const handleTextPaste = () => {
    const raw = window.prompt('Paste trace JSON here');
    if (!raw) return;
    const parsed = parseTraceSession(raw);
    setSession(parsed);
    setSelectedIndex(0);
  };

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}>
        <h1 style={{ marginBottom: 8 }}>Trace Diagnostics</h1>
        <p style={{ maxWidth: 460, color: 'var(--text-secondary)' }}>
          Load a trace JSON exported from the Kids Deliberate Practice app to replay the learner experience,
          inspect state transitions, and validate selector determinism.
        </p>
        <label
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: 'var(--color-primary, #4F46E5)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Select Trace File
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleFile} />
        </label>
        <button
          type="button"
          onClick={handleTextPaste}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--border-muted, rgba(0,0,0,0.1))',
            background: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          Paste JSON
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <h2 style={{ marginTop: 0 }}>Entries ({entries.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-muted, rgba(0,0,0,0.1))',
                background: index === selectedIndex ? 'var(--color-primary, #4F46E5)' : 'white',
                color: index === selectedIndex ? 'white' : 'inherit',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 600 }}>{entry.intent?.type ?? entry.action?.type}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{formatTimestamp(entry.timestamp)}</div>
            </button>
          ))}
        </div>
      </aside>
      <main style={mainStyle}>
        {selectedEntry ? (
          <TraceEntryDetails entry={selectedEntry} />
        ) : (
          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Select an entry to inspect details.</div>
        )}
      </main>
    </div>
  );
}
