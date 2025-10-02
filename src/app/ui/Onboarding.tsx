import { useState } from 'react';

interface OnboardingProps {
  onCreate: (userId: string, displayName?: string) => void;
}

export default function Onboarding({ onCreate }: OnboardingProps) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  // Brand gradient used on HomePage header
  const rainbowBg = 'linear-gradient(135deg, #ff4d4d 0%, #ff8a3d 20%, #ffd24d 40%, #4dd08a 60%, #5db3ff 80%, #b98bff 100%)';

  function handleCreate() {
    setCreating(true);
    const id = `user_${Date.now()}`;
    // allow empty displayName (optional)
    const displayName = name.trim() || undefined;
    onCreate(id, displayName);
  }

  return (
    <div data-testid="onboarding-container" style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 600, borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', background: '#fff', overflow: 'hidden' }}>
        <div style={{ width: '100%', background: rainbowBg, padding: '22px 32px 18px 32px', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 800 }}>Kids Practice</h1>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.95)', fontWeight: 600, opacity: 1 }}>Gentle daily practice that sticks</div>
        </div>
        <div style={{ padding: '32px 32px 28px 32px' }}>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24, fontWeight: 800, color: '#1e293b' }}>Kids master tricky concepts in just minutes a day.</h2>
          <p style={{ marginTop: 0, color: '#4b5563', fontSize: 17 }}>Short, calm sessions. Real memory. No cramming.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
            <input
              data-testid="onboarding-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Display name (optional)"
              style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
            />
            <button
              data-testid="onboarding-create-button"
              onClick={handleCreate}
              disabled={creating}
              style={{ padding: '10px 20px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16 }}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
          <ul style={{ marginTop: 22, marginBottom: 0, paddingLeft: 20, color: '#334155', fontSize: 15, lineHeight: 1.7 }}>
            <li>See progress daily</li>
            <li>Review only what’s hard</li>
            <li>Build lasting confidence</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
