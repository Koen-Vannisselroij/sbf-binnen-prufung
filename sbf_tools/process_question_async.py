import asyncio
from typing import Any

from .build_tip_prompt import build_tip_prompt
from .build_explanation_prompt import build_explanation_prompt
from .get_completion_async import get_completion
from .enriched_question import EnrichedQuestion


async def process_question(
    i: int,
    q: EnrichedQuestion,
    total: int,
    client: Any,
    model: str,
    regenerate_tip: bool = False,
    regenerate_explanation: bool = False
) -> EnrichedQuestion:
    print(f"\n[{i+1}/{total}] {q['question'][:60]}...")
    # Generate TIP if missing
    if regenerate_tip or "tip" not in q or not q["tip"]:
        try:
            tip_prompt = build_tip_prompt(q)
            q["tip"] = await get_completion(tip_prompt, client, model)
            print(f" Tipp: {q['tip']}")
        except Exception as e:
            print(f"Fehler bei Tipp: {e}")
            q["tip"] = ""
    # Generate EXPLANATION if missing
    if regenerate_explanation or "explanation" not in q or not q["explanation"]:
        try:
            explanation_prompt = build_explanation_prompt(q)
            q["explanation"] = await get_completion(explanation_prompt, client, model)
            print(f" Erklärung: {q['explanation']}")
        except Exception as e:
            print(f"Fehler bei Erklärung: {e}")
            q["explanation"] = ""
    # Short pause to avoid hitting rate limits (optional)
    await asyncio.sleep(0.1)
    return q
