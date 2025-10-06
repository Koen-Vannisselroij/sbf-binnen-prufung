SBF Binnen Trainer — Frontend (Vite + React)
===========================================

This is the web frontend for the SBF Binnen learning app. It renders multiple‑choice questions, tracks progress locally, and shows tips/explanations when you answer incorrectly. A mobile‑friendly menu lets you switch between practice filters, simulate official Fragebogen, and view statistics.

Quick Start
- Prerequisites: Node.js 18+
- Install: `npm install`
- Dev server: `npm run dev` → open the printed URL (e.g. `http://localhost:5173`)

Questions Data
- Default data file: `src/questions_with_tips_and_explanations.json`
- To refresh data from the root Python tools:
  - Generate base JSON: `python tools/parser.py`
  - Optional enrich: `python tools/explanation_giver.py`
  - Copy into this app: `cp questions_with_tips_and_explanations.json frontend/src/questions_with_tips_and_explanations.json`

Question Images
- Place assets in `src/assets/question-images/` (subfolders are fine). Filenames must start with the question id, optional `_2`, `_3`, … for follow-up images (e.g. `16.png`, `16_1.png`, `16_2.png`).
- Accepted formats: PNG, JPG/JPEG, WEBP, SVG, GIF.
- The UI automatically stacks all matching images under the question text; no entry in the JSON is required.
- To override or add images manually, you can add `"image": "custom_name"` or `"images": ["custom1", "custom2"]` to the question object. Filenames can be given with or without extension.

Data Source
- The official SBF question catalog (Fragenkatalog) is published on ELWIS (Elektronisches Wasserstraßen‑Informationssystem, operated for the German Federal Ministry). See https://www.elwis.de and navigate: Freizeitschifffahrt → Sportbootführerscheine → Fragenkataloge. Use the current version and follow their terms.

Build & Android (Capacitor)
- Production build: `npm run build` (outputs to `dist/`)
- Copy web assets to native project: `npm run cap:copy`
- Open Android Studio: `npm run cap:open:android`

Scripts
- `dev` — run Vite dev server
- `build` — Vite production build
- `preview` — preview the production build locally
- `cap:*` — Capacitor integration helpers

Notes
- Local progress is stored in `localStorage` (keys include `sbf-mistakes`, `sbf-practice-mode`, `sbf-practice-idx`, `sbf-practice-progress`, `sbf-exam-mode`, `sbf-selected-form`, `sbf-selected-supplement`, `sbf-exam-progress`, `sbf-exam-stats`).
- The UI reveals the correct answer after a mistake, can show a tip/explanation, and offers per‑Fragebogen statistics.

Attribution & Disclaimer
- Questions are derived from the official SBF question catalog published on ELWIS. This is an unofficial educational project and is not affiliated with BMDV/ELWIS. All rights remain with their respective owners. If you represent the rights holder and want content removed, please open an issue in the repository and it will be addressed promptly.
