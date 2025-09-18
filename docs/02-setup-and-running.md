# Setup & Running (Quick Start)

## Prerequisites

- Node.js (>= 18 recommended; 20/22/24 OK with Vite)
- Python 3.10+ (project pins >= 3.13, but tools are simple)

## Install & Run Frontend (Web)

```
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (e.g., `http://localhost:5173`).

The UI is mobile-first: use the top-right hamburger to switch between practice filters, Fragebogen simulation, and statistics. Progress is stored locally so you can reload without losing your place.

## Use Enriched Questions

- The app imports `./src/questions_with_tips_and_explanations.json` by default.
- To refresh content from the official catalog:
  1) Generate base JSON: `python tools/parser.py` → creates `questions.json`
  2) Enrich with tips/explanations: `python tools/explanation_giver.py` → creates `questions_with_tips_and_explanations.json`
  3) Copy into the app: `cp questions_with_tips_and_explanations.json frontend/src/questions_with_tips_and_explanations.json`

## Run Python Tests

```
python -m unittest discover -s tests -v
```
