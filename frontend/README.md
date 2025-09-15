SBF Binnen Trainer — Frontend (Vite + React)
===========================================

This is the web frontend for the SBF Binnen learning app. It renders multiple‑choice questions, tracks progress locally, and shows tips/explanations when you answer incorrectly.

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
- Local progress is stored in `localStorage` (keys: `sbf-mistakes`, `sbf-mode`, `sbf-idx`).
- The UI reveals the correct answer after a mistake and can show a tip/explanation if available.

Attribution & Disclaimer
- Questions are derived from the official SBF question catalog published on ELWIS. This is an unofficial educational project and is not affiliated with BMDV/ELWIS. All rights remain with their respective owners. If you represent the rights holder and want content removed, please open an issue in the repository and it will be addressed promptly.
