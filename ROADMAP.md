# Learn Kannada - Product Roadmap

## Vision
Transform from parent-assisted practice tool → autonomous playful learning experience that kids can use independently while parents coach.

---

## ✅ Completed (Oct 2025)

### App Rebranding
- ✅ Changed from "Kids Practice" → "Learn Kannada"
- ✅ Updated onboarding to reflect Kannada learning focus
- ✅ Simplified to single subject (removed multi-subject infrastructure)
- ✅ Updated intro tour with Kannada-specific messaging

### Construction Mode Foundation
- ✅ Created `DevanagariConstructionMode` component
- ✅ Matra-level decomposition (vowels → base + matra)
- ✅ Tap-to-add/remove UI with shuffled components
- ✅ Real-time validation (component array comparison)
- ✅ Auto-progression on correct construction

### Content Refinement
- ✅ Merged Kannada Alphabets + Kannada Words banks (547 total entries)
- ✅ Fixed alphabet entries with proper Devanagari mappings
- ✅ Corrected complexity levels:
  - Level 1: Vowels (27 letters)
  - Level 2: Consonants (64 letters)
  - Level 3: Matras (12 matras)
  - Level 4: Barakhadi + Simple words (425 entries)
  - Level 5: Medium words (4 entries)
  - Level 6: Complex words (15 entries)

---

## 🚀 Priority 1: Auto-Validation & Immediate Feedback

**Goal**: Enable independent practice by automating correctness validation

### Tasks
- [ ] **Auto-validation system**
  - [ ] Integrate existing construction mode validator into main practice flow
  - [ ] Compare constructed answer to correct Devanagari transliteration
  - [ ] Handle edge cases (spacing, zero-width characters, optional matras)
  
- [ ] **Immediate feedback UI**
  - [ ] Success state: ✅ icon + brief celebration
  - [ ] Error state: ❌ icon + constructive hint
  - [ ] Auto-advance on success (after 1-2 second celebration)
  
- [ ] **Smart hints system**
  - [ ] Analyze gap between constructed vs correct answer
  - [ ] Generate contextual hints: "Try adding the 'ा' matra next"
  - [ ] Show missing/extra components visually
  
- [ ] **Parent toggle refinement**
  - [ ] Make parent buttons optional/secondary for construction mode
  - [ ] Keep toggle for letter/sound practice (non-construction)
  - [ ] Add "override" option if auto-validation is wrong

**Impact**: 🔥 High - Enables autonomous practice, reduces parent burden
**Effort**: Medium - Validator exists, needs integration + hint logic
**Timeline**: 1-2 weeks

---

## 🎯 Priority 2: Progress Visualization

**Goal**: Make progress tangible and expectations clear

### Tasks
- [ ] **Per-word progress meter**
  - [ ] Circular indicator showing "1/2 correct" for mastery
  - [ ] Color-coded: gray → yellow → green
  - [ ] Display prominently on practice card
  
- [ ] **Session progress bar**
  - [ ] Show "3 of 12 mastered" at top of practice view
  - [ ] Animate on each mastery milestone
  - [ ] Pulse/glow when all words mastered
  
- [ ] **Streak counter**
  - [ ] Fire icon 🔥 with number
  - [ ] Resets on wrong answer (not on reveal)
  - [ ] Celebrate milestones (5, 10, 25, 50)
  
- [ ] **Session summary dashboard**
  - [ ] Show at end of practice session
  - [ ] Display: words mastered, total progress, streak status
  - [ ] Option to continue or review weak words

**Impact**: 🔥 High - Clear feedback increases motivation
**Effort**: Low-Medium - UI components + state management
**Timeline**: 1 week

---

## 🎮 Priority 3: Gamification

**Goal**: Add delight through badges, animations, and progression

### Tasks
- [ ] **Badge system**
  - [ ] Define badge types (see product.md for full list)
  - [ ] Design badge icons (simple, colorful)
  - [ ] Award logic: Check milestones after each session
  - [ ] Badge collection view in settings
  - [ ] "New badge!" notification animation
  
- [ ] **Celebration animations**
  - [ ] Confetti burst for word mastery (< 1 second)
  - [ ] Star burst for streak milestones
  - [ ] Keep lightweight (canvas/CSS, not Lottie)
  - [ ] Disable option for reduced-motion preference
  
- [ ] **Complexity ladder visualization**
  - [ ] Visual progression map: Vowels → Consonants → Matras → Words
  - [ ] Highlight current level
  - [ ] Show completion % per level
  - [ ] Unlock next level when previous mastered
  
- [ ] **Sound effects (optional)**
  - [ ] Success chime (brief, pleasant)
  - [ ] Badge earned sound
  - [ ] Mute toggle in settings

**Impact**: Medium-High - Increases engagement and long-term motivation
**Effort**: Medium - Design + animation implementation
**Timeline**: 2 weeks

---

## 🎤 Priority 4: Enhanced Onboarding

**Goal**: Reduce confusion, increase accessibility

### Tasks
- [ ] **Audio narration**
  - [ ] Record Hindi voice-over for intro tour
  - [ ] Add animated icons showing interactions
  - [ ] Optional Kannada narration
  - [ ] Text captions for accessibility
  
- [ ] **Interactive demo round**
  - [ ] Guided practice: Build one word with on-screen cues
  - [ ] Highlight which letter to tap next
  - [ ] Explain matra concept with animation
  - [ ] Skip option for experienced users
  
- [ ] **Control highlights**
  - [ ] Pulse speaker button on first appearance
  - [ ] Briefly enlarge construction area
  - [ ] Tooltip: "Tap letters to build the word"
  - [ ] Show once per feature, then hide
  
- [ ] **Multi-language UI**
  - [ ] Hindi translations for all UI text
  - [ ] Optional Kannada mode
  - [ ] Language toggle in settings
  - [ ] Persist preference per user profile

**Impact**: Medium - Reduces initial confusion, improves accessibility
**Effort**: Medium-High - Recording + translation + UI work
**Timeline**: 2-3 weeks

---

## 🔧 Future Enhancements (Backlog)

### Phase 5: Advanced Features
- [ ] Spaced repetition algorithm refinement
  - [ ] Adjust intervals based on complexity level
  - [ ] Personalize to individual learner patterns
  - [ ] Add "tough words" quick review mode

- [ ] Thematic word sets
  - [ ] Group words: Fruits, Family, Numbers, etc.
  - [ ] Let kids choose themes (optional)
  - [ ] Track progress per theme

- [ ] Parent dashboard
  - [ ] View child's progress over time
  - [ ] Identify struggling patterns
  - [ ] Export progress report
  - [ ] Set practice goals/reminders

### Phase 6: Accessibility & Polish
- [ ] High contrast mode
- [ ] Larger font options (150%, 200%)
- [ ] Keyboard shortcuts for desktop
- [ ] Screen reader optimization
- [ ] Offline-first PWA improvements

### Phase 7: Content Expansion
- [ ] Add more complexity levels (7-10 for compound words)
- [ ] Story-based word sets (Ramayana, Mahabharata)
- [ ] Common phrases/sentences
- [ ] Conversational Kannada basics

---

## Success Metrics

### Engagement
- **Session length**: Increase from avg 5 min → 10 min
- **Return rate**: Kids return within 24 hours (measure via localStorage)
- **Completion rate**: % of sessions where all words attempted

### Learning Outcomes
- **Mastery rate**: % of words mastered after 2 sessions
- **Retention**: % of mastered words still correct after 7 days
- **Progress speed**: Days to complete each complexity level

### Autonomy
- **Independent practice**: % of sessions where parent doesn't override auto-validation
- **Construction mode usage**: % of eligible words practiced in construction mode

---

## Implementation Strategy

### Agile Approach
1. **Sprint 1 (Week 1-2)**: Auto-validation + immediate feedback
2. **Sprint 2 (Week 3)**: Progress visualization
3. **Sprint 3 (Week 4-5)**: Gamification (badges + animations)
4. **Sprint 4 (Week 6-7)**: Enhanced onboarding
5. **Sprint 5+**: Iterate based on user feedback

### Testing Plan
- **Manual testing**: With real kids (target age: 6-10)
- **A/B tests**: Compare engagement with/without gamification
- **Parent feedback**: Survey after 2 weeks of use
- **Performance**: Ensure animations don't slow app

### Documentation
- Update `architecture.md` with new components
- Document badge logic and mastery rules
- Add audio recording guidelines
- Create content contribution guide

---

## Questions to Resolve

1. **Auto-validation strictness**: Exact match or allow minor variations?
2. **Hint granularity**: Generic ("check matras") vs specific ("add ा")?
3. **Badge density**: How many badges is too many? Risk of badge fatigue?
4. **Audio recording**: Professional voice actor or synthesized TTS?
5. **Streak resets**: Should "reveal answer" reset streak like wrong answer?
6. **Celebration timing**: Auto-advance after 1s or wait for tap?

---

## Notes

- Keep animations under 1 second to maintain deliberate pace
- Preserve "no accounts, no cloud" philosophy
- Test with low-end devices (performance budget)
- Ensure all gamification is **intrinsic** (learning-focused), not extrinsic (points/leaderboards)
- Maintain parent's role as coach, not remove them entirely
