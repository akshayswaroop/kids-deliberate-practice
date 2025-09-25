// @ts-ignore
import ProfileForm from './ProfileForm';
// @ts-ignore
import ModeSelector from './ModeSelector';
// @ts-ignore
import PracticePanel from './PracticePanel';

import type { UserState } from '../../features/game/state';

interface HomePageProps {
  users: Record<string, UserState>;
  currentUserId: string;
  onCreateUser: (username: string) => void;
  onSwitchUser: (userId: string) => void;
  onSetMode: (mode: string) => void;
  mode: string;
  mainWord: string;
  choices: Array<{ id: string; label: string; progress: number }>;
  transliteration?: string;
  onCorrect: () => void;
  onWrong: () => void;
  layout?: 'topbar' | 'sidebar' | 'center';
}

export default function HomePage({
  users,
  currentUserId,
  onCreateUser,
  onSwitchUser,
  onSetMode,
  mode,
  mainWord,
  choices,
  transliteration,
  onCorrect,
  onWrong,
  layout = 'topbar',
}: HomePageProps) {
  // Rainbow gradient for header/sidebar only
  const rainbowBg = 'linear-gradient(135deg, #ff4d4d 0%, #ff8a3d 20%, #ffd24d 40%, #4dd08a 60%, #5db3ff 80%, #b98bff 100%)';

  // Top Bar Layout
  if (layout === 'topbar') {
    return (
      <div style={{ height: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', background: rainbowBg, padding: '12px 48px 12px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, maxWidth: '100%', overflow: 'hidden', paddingRight: '48px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>Kids Deliberate Practice</h1>
            <a href="#diagnostics" style={{ color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.5)', whiteSpace: 'nowrap', flexShrink: 0 }}>Diagnostics</a>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '10px 48px 10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', maxWidth: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <ProfileForm compact users={users} currentUserId={currentUserId} onCreateUser={onCreateUser} onSwitchUser={onSwitchUser} />
            </div>
            <div style={{ flexShrink: 0 }}>
              <ModeSelector compact mode={mode} onSetMode={onSetMode} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', background: '#fff', margin: '4px', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <PracticePanel mainWord={mainWord} transliteration={transliteration} choices={choices} onCorrect={onCorrect} onWrong={onWrong} />
        </div>
      </div>
    );
  }

  // Sidebar Layout
  if (layout === 'sidebar') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex' }}>
  <div style={{ width: 280, background: rainbowBg, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 24, textAlign: 'center' }}>Kids<br />Deliberate<br />Practice</h1>
          <ProfileForm compact users={users} currentUserId={currentUserId} onCreateUser={onCreateUser} onSwitchUser={onSwitchUser} />
          <ModeSelector compact mode={mode} onSetMode={onSetMode} />
          <a href="#diagnostics" style={{ position: 'absolute', right: 12, top: 12, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'underline', background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '6px 10px' }}>Diagnostics</a>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', background: '#fff', margin: '4px', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
          <PracticePanel mainWord={mainWord} transliteration={transliteration} choices={choices} onCorrect={onCorrect} onWrong={onWrong} />
        </div>
      </div>
    );
  }

  // Compact Center Layout
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#b98bff', marginBottom: 24, textAlign: 'center' }}>Kids Deliberate Practice</h1>
      <div style={{ width: '100%', maxWidth: 'calc(100vw - 24px)', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
          <ProfileForm compact users={users} currentUserId={currentUserId} onCreateUser={onCreateUser} onSwitchUser={onSwitchUser} />
          <ModeSelector compact mode={mode} onSetMode={onSetMode} />
        </div>
        <PracticePanel mainWord={mainWord} transliteration={transliteration} choices={choices} onCorrect={onCorrect} onWrong={onWrong} />
      </div>
    </div>
  );
}
