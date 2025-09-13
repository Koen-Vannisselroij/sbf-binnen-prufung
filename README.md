SBF Binnen Prüfung — Repository
===============================

Refactor highlights
- One file per function (Python modules split under `sbf_tools/`).
- Snake_case for Python functions and modules; React code uses camelCase.
- Pure parsing pipeline extracted and covered by unittests.
 - Python CLIs moved under `tools/` for clarity.

Structure
- `sbf_tools/parse_questions.py`: `parse_questions(text)`
- `sbf_tools/generate_questions_json.py`: `generate_questions_json(in_path, out_path)`
- `sbf_tools/read_text_file.py`: `read_text_file(path)`
- `sbf_tools/write_json_file.py`: `write_json_file(path, data)`
- `sbf_tools/build_tip_prompt.py`: `build_tip_prompt(q)`
- `sbf_tools/build_explanation_prompt.py`: `build_explanation_prompt(q)`
- `sbf_tools/get_completion_async.py`: `get_completion(prompt, client, model)` (async)
- `sbf_tools/process_question_async.py`: `process_question(...)` (async)
- `sbf_tools/process_all_questions_async.py`: `process_all_questions(...)` (async)
- `tools/parser.py`: CLI entry calling `generate_questions_json()`
- `tools/explanation_giver.py`: CLI for async enrichment (requires OpenAI credentials)

Run the app
- Generate questions JSON:
  - `python tools/parser.py` → writes `questions.json` at repo root
- Copy JSON into the React app:
  - `cp questions.json frontend/src/questions.json`
- Start frontend:
  - `cd frontend && npm install && npm start`

Optional: enrich with tips/explanations
- Ensure `.env` has `OPENAI_API_KEY`, then run:
  - `python tools/explanation_giver.py`
- Copy enriched file for the UI:
  - `cp questions_with_tips_and_explanations.json frontend/src/questions.json`

Testing
- Python unittests live in `tests/`.
- Run: `python -m unittest discover -s tests -v`

Notes
- The React app imports `./questions.json` inside `src/`, ensure a copy exists there when building the frontend.
