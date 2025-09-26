import { describe, it, expect } from "vitest";
import {
  selectMasteryPercent,
  selectCurrentWord,
  selectSessionProgress,
} from "../selectors";
import type { RootState, Word, Session } from "../state";

describe("selectMasteryPercent", () => {
  it("calculates mastery using +20/−20 clamp rule", () => {
    const word: Word = {
      id: "w1",
      text: "test",
      language: "en",
      attempts: [
        { timestamp: 1, result: "correct" }, // +20
        { timestamp: 2, result: "wrong" },   // −20 → 0
        { timestamp: 3, result: "correct" }, // +20
        { timestamp: 4, result: "correct" }, // +20 → 40
      ],
    };

    const state: RootState = {
      users: {
        user1: {
          words: { w1: word },
          sessions: {},
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 6, languages: ["english"] },
        },
      },
      currentUserId: 'user1',
    };
    expect(selectMasteryPercent(state, "w1")).toBe(40);
  });

  it("clamps mastery between 0 and 100", () => {
    const word: Word = {
      id: "w2",
      text: "test2",
      language: "en",
      attempts: Array(10).fill({ timestamp: 1, result: "correct" }), // would exceed 100
    };

    const state: RootState = {
      users: {
        user1: {
          words: { w2: word },
          sessions: {},
          activeSessions: {},
          settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 6, languages: ["english"] },
        },
      },
      currentUserId: 'user1',
    };
    expect(selectMasteryPercent(state, "w2")).toBe(100);
  });
});

describe("selectCurrentWord", () => {
  it("returns the current word from session", () => {
    const words: Record<string, Word> = {
      w1: { id: "w1", text: "one", language: "en", attempts: [] },
      w2: { id: "w2", text: "two", language: "en", attempts: [] },
    };
    const session: Session = {
      wordIds: ["w1", "w2"],
      currentIndex: 1,
      revealed: false,
      mode: "practice",
      createdAt: 0,
      settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 2, languages: ["english"] },
    };
    const state: RootState = {
      users: {
        user1: {
          words,
          sessions: { s1: session },
          activeSessions: { practice: "s1" },
          settings: session.settings,
        },
      },
      currentUserId: 'user1',
    };
    const currentWord = selectCurrentWord(state, "s1");
    expect(currentWord).toBe(words["w2"]);
  });
});

describe("selectSessionProgress", () => {
  it("returns current and total progress for session", () => {
    const session: Session = {
      wordIds: ["w1", "w2"],
      currentIndex: 1,
      revealed: false,
      mode: "practice",
      createdAt: 0,
      settings: { selectionWeights: { struggle: 1, new: 1, mastered: 1 }, sessionSize: 2, languages: ["english"] },
    };
    const state: RootState = {
      users: {
        user1: {
          words: {},
          sessions: { s1: session },
          activeSessions: { practice: "s1" },
          settings: session.settings,
        },
      },
      currentUserId: 'user1',
    };
    const progress = selectSessionProgress(state, "s1");
    expect(progress).toEqual({ current: 2, total: 2 });
  });
});