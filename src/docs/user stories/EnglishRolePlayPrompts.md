# English Mode: Role-Play Prompts

**As a** parent/teacher  
**I want** English practice mode to show playful role-play instructions instead of translations  
**So that** kids engage with English sentences through creative expression rather than passive translation

## Acceptance Criteria

✅ English mode displays role-play prompts (e.g., "Say it like a robot 🤖", "Whisper it like a secret 🤫")  
✅ Prompts are always visible without needing to click reveal button  
✅ Prompts are varied across 40+ options to keep practice engaging  
✅ No back-to-back duplicate prompts  
✅ Configuration-based: adding similar modes requires minimal code changes

## Technical Implementation

- Added `ALWAYS_SHOW_ANSWER_MODES` array to `ModeConfiguration` domain class
- Infrastructure selector checks `shouldAlwaysShowAnswer(mode)` for answer display logic
- UI always renders answer field for configured modes (bypasses reveal mechanism)
- Replaced 500 Hindi translations with randomized role-play prompts in `english_questions_bank.json`

## Examples

**Before:** "Mina feels happy." → [Reveal] → "Mina खुश है।"  
**After:** "Mina feels happy." → "Say it like you're confused 🤔" (always visible)
