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
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 900 }}>
        <div style={{ width: '100%', background: rainbowBg, padding: '20px 28px', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 800 }}>Kids Deliberate Practice</h1>
          <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.9)', fontWeight: 600, opacity: 0.95 }}>Build vocabulary with spaced repetition and gentle practice.</div>
        </div>

        <div style={{ background: '#fff', padding: 28, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Get started</h2>
          <p style={{ marginTop: 0, color: '#4b5563' }}>Create a profile so progress can be saved. You can change your name later in settings.</p>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Display name (optional)"
              style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
            />
            <button onClick={handleCreate} disabled={creating} style={{ padding: '10px 16px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 700 }}>{creating ? 'Creating…' : 'Create'}</button>
          </div>

          <div style={{ marginTop: 14, color: '#6b7280', fontSize: 13 }}>
            Tip: You can add multiple profiles for different learners. Progress is stored per profile.
          </div>
        </div>
      </div>
    </div>
  );
}
