import { describe, it, expect } from 'vitest';
import reducer, { addUser, addSession, attempt } from '../slice';
import type { RootState, Session } from '../state';

const wordsList = [
  "an", "at", "am", "as", "be", "by", "do", "go", "he", "hi", "if", "in", "is", "it", "me", "my", "no", "of", "on", "or", "so", "to", "up", "us", "we",
  "bat", "cat", "dog", "egg", "fan", "hat", "jam", "kid", "log", "man", "nap", "owl", "pan", "rat", "sun", "tap", "van", "win", "zip", "box", "bus", "cup", "dot", "fox", "gum", "hen", "jar", "kit", "lap", "map", "net", "pen", "red", "sad", "ten", "vet", "wax", "yak", "zip", "big", "bug", "cut", "dig", "fit", "got", "hot", "jet", "let", "mix", "not", "pit", "run", "sit", "top", "wet", "yes", "zig", "hop", "mat", "pat", "rag", "sip", "tag", "wig"
];

function getInitialWords(): Record<string, any> {
  return (wordsList as string[]).reduce((acc, text) => {
    acc[text] = {
      id: text,
      text,
      language: 'en',
      attempts: [],
    };
    return acc;
  }, {} as Record<string, any>);
}

function makeInitial(): RootState {
  return {
    users: {
      user1: {
        words: getInitialWords(),
        sessions: {},
        activeSessions: {},
  settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 6 }, languages: ['english'] },
      },
    },
    currentUserId: 'user1',
  };
}

describe('multi-user session persistence', () => {
  it('tracks independent session progress for two users with random words', () => {
    let state = makeInitial();
    // User1: create session with 12 random words
    const user1WordIds = Object.keys(state.users.user1.words);
    const session1Words = user1WordIds.slice(0, 12);
    const session1: Session = {
      wordIds: session1Words,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: 0,
  settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 6 }, languages: ['english'] },
    };
    state = reducer(state, addSession({ sessionId: 's1', session: session1 }));
    // User1: attempt first 3 words
    for (let i = 0; i < 3; i++) {
      state = reducer(state, attempt({ sessionId: 's1', wordId: session1Words[i], result: 'correct' }));
    }
    // Add user2 and switch
    state = reducer(state, addUser({ userId: 'user2' }));
    state = reducer(state, { type: 'game/selectUser', payload: { userId: 'user2' } });
    // User2: create session with 12 random words
    const user2WordIds = Object.keys(state.users.user2.words);
    const session2Words = user2WordIds.slice(12, 24);
    const session2: Session = {
      wordIds: session2Words,
      currentIndex: 0,
      revealed: false,
      mode: 'practice',
      createdAt: 1,
  settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSizes: { english: 6 }, languages: ['english'] },
    };
    state = reducer(state, addSession({ sessionId: 's2', session: session2 }));
    // User2: attempt first 5 words
    for (let i = 0; i < 5; i++) {
      state = reducer(state, attempt({ sessionId: 's2', wordId: session2Words[i], result: 'wrong' }));
    }
    // Switch back to user1 and check progress
    state = reducer(state, { type: 'game/selectUser', payload: { userId: 'user1' } });
    expect(state.users.user1.sessions.s1.wordIds).toEqual(session1Words);
    for (let i = 0; i < 3; i++) {
      expect(state.users.user1.words[session1Words[i]].attempts[0].result).toBe('correct');
    }
    // Switch to user2 and check progress
    state = reducer(state, { type: 'game/selectUser', payload: { userId: 'user2' } });
    expect(state.users.user2.sessions.s2.wordIds).toEqual(session2Words);
    for (let i = 0; i < 5; i++) {
      expect(state.users.user2.words[session2Words[i]].attempts[0].result).toBe('wrong');
    }
  });
});
