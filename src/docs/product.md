# Kids Practice – Deliberate Practice Domain Handbook

### Philosophy
Learning happens when effort meets reflection. The app isn’t about gamification — it’s about rhythm: question, pause, feedback, mastery.

---

## Core Domain Model

```text
Session → Question → Attempt → Outcome → Mastery
```

- **Session**: A bounded set (e.g., 12 questions).  
- **Question**: Carries subject, difficulty, and prompt metadata.  
- **Attempt**: Parent records child’s response — correct, incorrect, or reveal.  
- **Outcome**: Updates streaks, progress, and next‑question scheduling.  
- **Mastery**: Earned after consistent correct streaks (default: 2 consecutive).

---

## Mastery Loop

```text
Attempt → Update Progress → Schedule Repetition → Feedback → Next Question
```

- Correct twice → mark as mastered.  
- Incorrect → streak resets, repeat sooner.  
- Reveal → counts as “neutral” (no streak advance).  
- Once all questions are mastered, a completion prompt appears with options to continue, pause, or return home. If the parent does nothing, the next set auto-loads after a short celebration window.

---

## Parent‑Child Loop

1. Parent reads question aloud.  
2. Child answers verbally or mentally.  
3. Parent logs response (✅ or ↺).  
4. Banner cue updates — e.g., *“This one was tough earlier — try recalling again!”*  
5. Parent can reveal answers, pause, or use the completion prompt to decide on the next action.

This structure preserves deliberate pacing — celebration first, then either a deliberate choice or a gentle auto‑advance to keep momentum.

---

## Feedback System

Cues are dynamic text hints driven by attempt history:

| Pattern | Example Cue |
|----------|--------------|
| First correct | “Nice — that’s the start of a streak.” |
| Repeated correct | “This one’s becoming effortless.” |
| Recent wrongs | “Still tricky — repeat once more for memory.” |
| Revealed often | “Encourage recall before revealing.” |
| Fully mastered | “Perfect streak! Moving this card out.” |

They serve the parent, not the algorithm.

---

## Data Flow (Conceptual)

```text
Parent Action → Domain Event → Updated State → Cue Engine → UI Update
```

- **Domain** decides what changed.  
- **Cue Engine** interprets patterns (e.g., “repeated wrongs”).  
- **UI** reflects cues and mastery visually.

---

## Design Principles

### 1. Deliberate, Not Gamified  
No points or streak anxiety. The win condition is attention.

### 2. Human‑in‑Loop  
Parents remain co‑learners, not spectators. The UI only scaffolds this partnership.

### 3. Reflection over Speed  
A short celebration window appears at completion, encouraging reflection before the next set auto-loads or the parent chooses another path.

### 4. Progressive Disclosure  
Hints, answers, and feedback appear contextually — never overwhelm the screen.

### 5. Private by Default  
Everything runs locally. No accounts, no cloud, no tracking.

### 6. Adaptive Difficulty  
The system repeats only what’s weak, not what’s random.

### 7. Honest Feedback  
The app acknowledges struggle without judgment — “still forming memory,” not “failed.”

### 8. Minimal Motion, Max Clarity  
Stable layout prevents disorientation, especially for small hands on touch devices.

---

### Closing Thought
We don’t teach answers; we teach noticing. Mastery is built one quiet repetition at a time.
