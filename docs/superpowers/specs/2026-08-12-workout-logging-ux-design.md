# Workout Logging UX/UI Optimization Design

## Context
The current workout logging flow requires too much scrolling and context switching, especially for advanced users in the gym setting. The goal of this design is to optimize the UX/UI of the Workout Session to maximize data entry speed and provide a better overview of the workout.

## Architecture & Data Flow
- **Component**: Updates to `components/workout/exercise-log-card.tsx` (or extracting a new `workout-grid-logger.tsx`).
- **State Management**: Existing `useWorkoutStore` will handle state changes. Data will automatically persist to `idb-storage` just like before. 
- **Data Source**: The `Previous History` data will be fetched at the beginning of the workout from `workout_logs` joined with previous `workouts`.

## UX/UI Design: History-inline Grid
The main interaction paradigm is shifting from a long scrolling list to a dense, Excel-like Grid (Compact Grid).

### Key Features
1. **Compact Grid Layout**
   - Each exercise is displayed as a section containing a data grid.
   - Rows represent Sets. Columns represent: Set Number, Previous History (read-only), Weight (kg/lbs input), Reps (input), and Completion Toggle (✓).
   - The UI should condense padding to maximize the number of exercises visible simultaneously without scrolling.

2. **Inline History References**
   - Instead of hiding historical performance behind a tab or modal, the previous workout's performance for that exact set will be displayed lightly in gray immediately below or next to the active input fields.
   - E.g., `(Prev: 60kg x 10)`

3. **Smart Numpad & Auto-advance**
   - Utilizing a custom or optimized number keyboard (e.g., `inputmode="decimal"`).
   - When a user enters Weight and hits "Next" on the keyboard, focus automatically jumps to the Reps input.
   - Hitting "Next" from Reps can optionally mark the set as complete and jump to the Weight input of the *next* set.

## Error Handling & Edge Cases
- **Missing History**: If there is no previous history for a specific exercise/set, the inline hint will simply remain hidden to avoid clutter.
- **Screen Size Constraints**: Ensure the grid is optimized for mobile screens. Use precise flex/grid percentages to prevent horizontal overflow on smaller devices.

## Testing
- Unit tests for the focus auto-advance logic.
- Manual UX testing on mobile devices to ensure the touch targets for the "Complete Set" button and inputs remain sufficiently large despite the compact layout.
