📝 Spec: Session Framing & Progress Feedback

Context

Our Kids Deliberate Practice app uses spaced repetition, rising complexity, and session loops. Currently, kids and parents are confused:
	•	Kids don’t understand why questions repeat.
	•	Progress feels fragmented with per-question badges.
	•	Session scope (how many Qs in a round) is invisible.

We want a minimal, motivating design: kids should feel progress, parents should see clarity, without overbuilding gamification.

⸻

User Story

As a child learner, I want to clearly see my progress in a round and understand why a question is repeating, so I stay motivated and don’t feel the app is broken.

As a parent coach, I want to see a simple summary of what my child mastered vs. practiced, so I know they’re learning and not just clicking.

⸻

Proposed UX Flow
	1.	Session Start
	•	Show a small intro card: “This round has 12 questions → Let’s fill the stars!”
	•	Clearly state session scope (X of Y).
	2.	During Session
		•	Replace per-question badges with a compact text progress and a single unified parent banner.
		•	Show compact session progress (e.g. “7 of 12”) above the question prompt.
		•	If a question repeats, the unified banner explains: “Smart practice: This comes back until mastered.”
	3.	Session End
	•	Show a simple recap card:
	•	“Mastered: 3 ⭐ | Practiced: 4 🔄 | Yet to try: 5 🕒”
	•	Optional: small animation (trophy/star burst) if mastery threshold is crossed.

⸻


Acceptance Criteria
	•	✅ Each session must show X of Y questions completed (compact text above the prompt).
	•	✅ Per-question badges are removed and no longer shown anywhere in the practice card.
	•	✅ When a repeat occurs, the unified banner explains it in 1 short line.
	•	✅ End-of-session recap shows 3 clear numbers: mastered, practiced, untouched.
	•	✅ All feedback must be kid-friendly, non-punitive, encouraging.
	•	✅ Layout must remain consistent across modes (Kannada, English, etc.).

⸻

Out of Scope (for now)
	•	No leaderboard, no global streaks.
	•	No per-question badges.
	•	No saving across devices (local only).