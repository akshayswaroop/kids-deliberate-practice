import { useState } from 'react';
import { synthesizeSpeech } from '../../infrastructure/services/tts/sarvamTtsService';

export default function TTSDemo() {
  const [text, setText] = useState<string>('ನಮಸ್ತೆ, ಇದು ಒಂದು ಪರೀಕ್ಷೆ.');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const { audioUrl } = await synthesizeSpeech(text, {
        target_language_code: 'kn-IN',
        enable_preprocessing: true,
        // speaker: 'Anushka', // optional: default per model
      });
      setAudioUrl(audioUrl);
      // Auto-play once created
      new Audio(audioUrl).play().catch(() => {
        /* Some browsers require user gesture; controls shown below */
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
      // eslint-disable-next-line no-console
      console.error('TTS error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h2>Text → Speech (Kannada)</h2>
      <p style={{ color: '#666', marginTop: -8 }}>
        Uses Sarvam TTS directly in UI-only mode. Optionally, set VITE_TTS_PROXY_URL to route via your own proxy.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        style={{ width: '100%', fontSize: 16, padding: 8 }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={handleConvert} disabled={loading || !text.trim()}>
          {loading ? 'Converting…' : 'Convert to Speech'}
        </button>
        <button
          onClick={() => {
            setText('ನಮಸ್ತೆ, ಇದು ಒಂದು ಪರೀಕ್ಷೆ.');
          }}
          disabled={loading}
        >
          Reset sample
        </button>
      </div>
      {error && (
        <div style={{ color: 'crimson', marginTop: 8 }}>
          {error}
        </div>
      )}
      {audioUrl && (
        <audio controls src={audioUrl} style={{ marginTop: 12, width: '100%' }} />
      )}
    </div>
  );
}
