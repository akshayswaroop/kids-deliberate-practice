/**
 * Sarvam API key management for UI-only usage.
 * - Primary source: user-provided key stored in localStorage under STORAGE_KEY
 * - Fallback: VITE_SARVAM_API_KEY from build-time env
 *
 * Note: This is not secure (keys are visible to the user). Suitable for personal/testing flows on GitHub Pages.
 */

const STORAGE_KEY = 'kdp:sarvam-api-key';

export function getSarvamApiKey(): string | undefined {
  // Prefer user-provided key from localStorage (if running in a browser)
  try {
    if (typeof window !== 'undefined' && window?.localStorage) {
      const fromStorage = window.localStorage.getItem(STORAGE_KEY) || '';
      if (fromStorage && fromStorage.trim()) return fromStorage.trim();
    }
  } catch {
    // ignore storage access issues and fall back to env
  }

  // Fall back to build-time env (if available)
  const envKey = (import.meta as any)?.env?.VITE_SARVAM_API_KEY as string | undefined;
  return envKey && String(envKey).trim() ? String(envKey).trim() : undefined;
}

export function setSarvamApiKey(key: string | null | undefined): void {
  try {
    if (typeof window === 'undefined' || !window?.localStorage) return;
    if (key && key.trim()) {
      window.localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function hasUserSarvamApiKey(): boolean {
  try {
    if (typeof window === 'undefined' || !window?.localStorage) return false;
    return !!window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export function clearSarvamApiKey(): void {
  setSarvamApiKey(null);
}

export const SARVAM_API_STORAGE_KEY = STORAGE_KEY;
