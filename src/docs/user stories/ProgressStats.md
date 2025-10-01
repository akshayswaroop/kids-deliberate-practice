# 📊 Progress Stats - Turnarounds & Streak

## User Story
As a **parent or child**, I want to see **simple growth metrics** in the app header, so I can track progress without overwhelming detail.

## Metrics Tracked

### 1. � Turnarounds (Global)
- **Definition**: Items that went from wrong (at least one incorrect attempt) to mastered (step ≥ 2)
- **Purpose**: Celebrates persistence and growth mindset
- **Display**: Only shown when count > 0
- **Message**: "X item(s) conquered from wrong to mastered!"

### 2. 🔥 Streak (Global)
- **Definition**: Consecutive days of practice (any subject)
- **Calculation**: Based on attempt timestamps, checks for consecutive calendar days
- **Purpose**: Encourages daily practice habit
- **Display**: Only shown when streak > 0
- **Message**: "X day(s) practice streak!"

### 3. 📝 Today's Attempts (Subject-Specific)
- **Definition**: Number of questions attempted today in current subject
- **Calculation**: Filters attempts by today's date (YYYY-MM-DD) and current subject
- **Purpose**: Encourages daily practice goals ("How many questions did I do today?")
- **Display**: Always visible
- **Message**: "X question(s) attempted today in [subject name]"
- **Reset**: Counter starts at 0 each day

## UI Behavior

### Badge Display
- **Location**: App header, right side of profile selector
- **Style**: Compact colored badges with emoji icons
- **Interaction**: Hover shows detailed tooltip
- **Animation**: Bounce + glow effect when values increase

### Animations
- **Trigger**: When badge value changes (new attempt, turnaround, or streak)
- **Effect**: 
  - Bounce: Scale 1.0 → 1.3 → 1.4 → 1.3 → 1.0 with rotation
  - Glow: Pulsing golden shadow effect
- **Duration**: 0.6 seconds with cubic-bezier easing
- **Purpose**: Draw user's eyes to progress updates

### Tooltips
- **Style**: Dark rounded bubble above badge with arrow pointer
- **Content**: Clear explanation of metric with current value
- **Trigger**: Hover over badge

## Architecture

### Domain Layer
- **Entity**: `ProgressTracker` with `isTurnaround()` method
- **Repository**: `ProgressRepository.getStatistics()` returns `LearningStatistics`
- **Business Logic**: Turnaround detection in domain entity

### Infrastructure Layer
- **Implementation**: `ReduxProgressRepository.calculateTurnarounds()`
- **Streak Calculation**: Date-based consecutive day tracking in `ReduxRepositoryFactory`
- **Subject Filtering**: Applied at repository level using `subjectBreakdown`

### Application Layer
- **Hook**: `useProgressStats({ userId, subject })`
- **Purpose**: Abstracts repository access, provides reactive updates, calculates today's attempts
- **Benefits**: Clean separation, testable, reusable
- **Today's Logic**: Filters attempts by current date (YYYY-MM-DD) and subject

### UI Layer
- **Component**: `ProgressStatsDisplay`
- **Props**: `currentUserId`, `compact`, `subject`
- **State**: Tracks previous stats for animation detection
- **Rendering**: Compact badges or detailed panel

## Business Rules

1. **Turnarounds are global**: Count all subjects combined
2. **Streaks are global**: Practice in any subject counts
3. **Today's attempts are subject-specific**: Scoped to current mode and today's date only
4. **Turnaround criteria**: 
   - Item must be mastered (step ≥ 2)
   - Item must have at least one wrong attempt in history
5. **Streak calculation**:
   - Uses calendar dates (YYYY-MM-DD)
   - Counts backward from today
   - Breaks if gap > 1 day
6. **Today's attempts calculation**:
   - Uses calendar date matching (YYYY-MM-DD)
   - Only counts attempts where timestamp matches today
   - Resets to 0 at midnight

## Edge Cases

### No Stats Yet
- **Turnarounds**: Hidden (count = 0)
- **Streak**: Hidden (count = 0)
- **Today's Attempts**: Shows 0 (always visible)

### New Day
- Today's attempts resets to 0 at midnight
- Streak continues if practiced yesterday
- Turnarounds persist (cumulative)

### Subject Switch
- Today's attempts counter updates to show subject-specific count for today
- Turnarounds and streak remain unchanged (global)
- Tooltip updates to mention current subject
- Each subject tracks its own daily count independently

### First Practice
- All badges animate on first attempt
- Streak starts at 1 day
- Today's attempts shows 1

## Testing

Comprehensive test suite in `TurnaroundAndStreak.test.ts`:
- ✅ Turnaround detection (wrong → mastered)
- ✅ Not a turnaround (correct → mastered)
- ✅ Daily streak calculation
- ✅ Streak breaks after gap
- ✅ Multiple words same day = same streak
- ✅ Subject-specific attempt counting
- ✅ Statistics integration

## Design Rationale

**Why these 3 metrics?**
- **Turnarounds (🏆)**: Growth mindset - mistakes lead to mastery, celebrates victories
- **Streak (🔥)**: Habit formation - daily practice compounds
- **Today's Attempts (📝)**: Daily goals - "How many questions did I do today?"

**Why animated badges?**
- Immediate feedback on progress
- Eye-catching without being disruptive
- Feels rewarding and playful
- Better UX than modal overlays

**Why today's attempts instead of total?**
- More actionable - encourages daily practice goals
- Kids can track "today's progress" rather than overwhelming total numbers
- Resets daily to provide fresh start and motivation
- Parents can easily see if child practiced today
- Aligns with daily habit formation (like streak)

**Why subject-specific attempts?**
- Kids practice one subject at a time
- Parents want to see depth in current area today
- Global count would be less meaningful during practice
- Each subject can have its own daily goal

**Why global turnarounds/streak?**
- Turnarounds celebrate overall persistence across all learning
- Streaks encourage daily habit across all subjects
- These are long-term motivators, not practice-specific

## Future Enhancements
- Longest streak history
- Weekly/monthly turnaround trends
- Celebrate milestone streaks (7, 30, 100 days)
- Achievement badges for turnarounds
