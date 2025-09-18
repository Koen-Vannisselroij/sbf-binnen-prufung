SBF Binnen Prüfung — Learning App
=================================

An open‑source learning app for the Sportbootführerschein Binnen (SBF Binnen). It lets you practice multiple‑choice questions, shows instant feedback, reveals the correct answer when you make a mistake, and can include tips and explanations to help you understand the “why”.

### Highlights

- Practice all 300 questions or focus on mistakes without losing your place
- Simulate the original Fragebogen (Motor, Segeln, Kombi, Segel‑Ergänzung)
- View per‑Fragebogen statistics and best scores in a dedicated menu
- Full offline support: all progress stays on the device (localStorage)
- Mobile‑first layout with large tap targets and a quick “hamburger” menu

I was mainly annoyed by the fact that there is an app available which costs 30 euro's where the only usable feature is that it gives tips to the end user if a question is wrong. I generated tips using LLM's and created my own version. It does not have images yet.
I used a non-polished version of this to pass the exam myself.

What’s inside
- React + Vite frontend in `frontend/` (web app; can be wrapped for Android with Capacitor)
- Python tools in `sbf_tools/` and CLI scripts in `tools/` to parse the official catalog and optionally enrich questions using an LLM
- Basic Python unit tests in `tests/`

Features
- Practice all questions or focus on mistakes (1x or 2x wrong)
- Saves progress locally (localStorage)
- Shows the correct answer when you’re wrong
- Optional tips and explanations per question

Tech Stack
- Frontend: React 19 + Vite 5
- Mobile: Capacitor 7 (Android project under `frontend/android`)
- Tooling: Python 3.10+ with `openai` (v1 SDK) and `python-dotenv`

Repository Structure
- `frontend/` — Vite + React app (web, Android wrapper via Capacitor)
- `sbf_tools/` — Python library (one function/class per file)
- `tools/` — Python CLIs to parse/enrich questions
- `tests/` — Python unit tests for the parsing pipeline
- `docs/` — Additional documentation

Quick Start (Web)
1) Prerequisites
   - Node.js 18+ (20/22/24 OK)
   - Python 3.10+

2) Install and run the web app
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - Open the printed URL (e.g., `http://localhost:5173`)

3) Use included questions
   - By default, the app imports `src/questions_with_tips_and_explanations.json` which is included in the repo.

Refreshing Questions (Optional)
You can regenerate base questions and optionally enrich them with tips/explanations.

1) Python environment
- Create `.env` from the example: `cp .env.example .env`
- If you want to enrich with tips/explanations, add your `OPENAI_API_KEY` to `.env`.

2) Install Python dependencies
- Using pipx/virtualenv or your preferred tool, from repo root run:
  - `python -m pip install -U pip`
  - `python -m pip install -e .`  (uses `pyproject.toml`)

3) Generate base questions JSON
- Ensure the input file `fragenkatalog.txt` (official question catalog text) exists at the repo root, then run:
- `python tools/parser.py`  → writes `questions.json` at repo root
- Data source: The official SBF question catalog (Fragenkatalog) is published by the German waterways authority on ELWIS (Elektronisches Wasserstraßen‑Informationssystem). See https://www.elwis.de (navigate: Freizeitschifffahrt → Sportbootführerscheine → Fragenkataloge). Ensure you comply with their terms and use the current version.

4) Enrich with tips/explanations (optional)
- `python tools/explanation_giver.py`  → writes `questions_with_tips_and_explanations.json`

5) Use in the app
- Copy whichever file you prefer into the frontend:
  - `cp questions_with_tips_and_explanations.json frontend/src/questions_with_tips_and_explanations.json`
  - or `cp questions.json frontend/src/questions.json` and adjust imports if needed

Android (Capacitor)
The Android project under `frontend/android` is already set up for Capacitor 7.

Common commands from `frontend/`:
- Build web assets: `npm run build`
- Copy web assets to native project: `npm run cap:copy`
- Open Android Studio: `npm run cap:open:android`
- Doctor check: `npm run cap:doctor`

If you prefer to exclude the native project from the repo, you can delete `frontend/android` locally and regenerate with `npx cap add android` (the `.gitignore` already excludes build/signing artifacts).

Local Data & Keys
- `sbf-mistakes` — question‑id → incorrect count
- `sbf-practice-mode` / `sbf-mode` — last selected practice filter or overall session mode
- `sbf-practice-idx` / `sbf-practice-progress` — saved position in the practice sets
- `sbf-exam-mode`, `sbf-selected-form`, `sbf-selected-supplement` — current Fragebogen selections
- `sbf-exam-progress` — resume point per Fragebogen
- `sbf-exam-stats` — per‑form attempt history (best/last scores)

Testing
- Python tests: `python -m unittest discover -s tests -v`
- There are currently no JavaScript unit tests included.

Environment Variables
- `OPENAI_API_KEY` (optional) — required only for generating tips/explanations with the Python tools. Place it in `.env`.

Contributing
- Issues and PRs welcome. Please avoid committing secrets or local build artifacts. The CI runs Python tests and a Node build.

Attribution & Disclaimer
- Questions are derived from the official SBF question catalog published on ELWIS. This is an unofficial educational project and is not affiliated with BMDV/ELWIS. All rights remain with their respective owners. If you represent the rights holder and want content removed, please open an issue in this repository and it will be addressed promptly.

License
This project is licensed under the MIT License — see `LICENSE` for details.
