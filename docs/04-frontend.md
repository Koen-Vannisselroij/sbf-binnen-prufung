# Frontend (Web)

## Stack

- React + Vite (mobile-first layout)
- LocalStorage to track mistakes, practice positions, exam progress, and per-form statistics

## Data

- Default import: `src/questions_with_tips_and_explanations.json`
- Shape: `{ id, question, options[4], answer, tip?, explanation? }`

## UI Flow

- Hamburger (top-right) opens the global menu (practice filters, Fragebogen, statistics, about)
- Pick an option → immediate feedback
- If wrong → correct option revealed in green, tip/explanation show
- Click “Weiter” to proceed (no auto‑advance)
- “Fortschritt löschen” prompts for confirmation and resets the current session to question 1

## Components

- `src/App.jsx` — app shell, practice modes, progress bar, cards
- `src/Question.jsx` — question rendering and interaction
- `src/utils/shuffleOptions.js` — shuffles and remaps correct index
- `src/App.css` — nautical theme and styles

## Practice Modes

- All questions
- Wrong (answered wrong ≥ 1 time)
- Wrong twice (answered wrong ≥ 2 times)

Progress in each filter is persisted separately and restored when you switch back.

## Exam Modes

- Motor (AM) Fragebogen 1–15
- Segeln (S) Fragebogen 1–15
- Kombi (AMS) motor + supplement (auto-paired)
- Supplement (Segel-Ergänzung) Fragebogen 1–15

Per-form progress and statistics are stored so the user can resume and review results in the statistics view.

## Tips for Content Updates

- Keep importing the enriched JSON into `src/` for bundling, or
- Switch to runtime fetch from `public/questions.json` to update content without rebuilds.
