import { describe, it, expect } from 'vitest';
import reducer, { addUser, setLanguagePreferences } from '../slice';
import type { RootState } from '../state';

function makeInitial(): RootState {
  return {
    users: {},
    currentUserId: '',
  };
}

describe('HomePage flows', () => {
  it('creates a new user profile', () => {
    let state = makeInitial();
    state = reducer(state, addUser({ userId: 'rainbow' }));
    expect(state.users['rainbow']).toBeDefined();
    expect(state.currentUserId).toBe('rainbow');
  });

  it('switches mode between Kannada and English', () => {
    let state = makeInitial();
    state = reducer(state, addUser({ userId: 'rainbow' }));
    state = reducer(state, setLanguagePreferences({ languages: ['kannada'] }));
    expect(state.users['rainbow'].settings.languages).toEqual(['kannada']);
    state = reducer(state, setLanguagePreferences({ languages: ['english'] }));
    expect(state.users['rainbow'].settings.languages).toEqual(['english']);
  });

  // Add more tests for practice panel, switching users, and diagnostics navigation as UI is implemented
});
