As a parent or teacher, I want the app to mark words as "mastered" quickly when a child demonstrates consistent correct answers so that practice focuses on new or struggling words.

Acceptance criteria (plain language):
- When a child answers the same word correctly twice in a row, that word becomes "mastered" and shows as fully complete in the UI.
- Mastered words show a full progress fill in the word tile or progress bubble so the child and parent can clearly see success.
- Mastered words are deprioritized for active practice and are not included in the pool used to build the next practice session for the current level.
- When all words in the current level are mastered, the app moves the child to the next level and shows fresh, unmastered words.
- Existing progress values are preserved; the app interprets them against the mastery rule rather than changing stored progress values in bulk.

Notes:
- This user story is intentionally short and written for product/UX clarity. The exact threshold and implementation details are configured by the engineering team but should be invisible to end users.
