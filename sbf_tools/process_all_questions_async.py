import asyncio
import json
from typing import List, Any

from .process_question_async import process_question
from .enriched_question import EnrichedQuestion


async def process_all_questions(
    input_file: str,
    output_file: str,
    client: Any,
    model: str,
    concurrency: int = 3,
    regenerate_tip: bool = False,
    regenerate_explanation: bool = False
) -> None:
    with open(input_file, "r", encoding="utf-8") as f:
        questions: List[EnrichedQuestion] = json.load(f)

    total = len(questions)
    semaphore = asyncio.Semaphore(concurrency)

    async def sem_task(i, q):
        async with semaphore:
            return await process_question(
                i,
                q,
                total,
                client,
                model,
                regenerate_tip,
                regenerate_explanation
            )

    tasks = [sem_task(i, q) for i, q in enumerate(questions)]
    questions = await asyncio.gather(*tasks)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
