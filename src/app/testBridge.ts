// Test-only bridge to seed and read Redux state from Playwright.
// This file should be imported from the app entrypoint guarded by test mode.
import { store } from '../infrastructure/store';

declare global {
  interface Window {
    __seedState?: (state: any) => void;
    __readState?: () => any;
  }
}

export function installTestBridge() {
  if (typeof window === 'undefined') return;
  if (window.__seedState && window.__readState) return; // idempotent

  window.__seedState = (state: any) => {
    // Replace full game slice state in a controlled way.
    store.dispatch({ type: 'game/__replaceAll', payload: state });
  };
  window.__readState = () => store.getState();
}

