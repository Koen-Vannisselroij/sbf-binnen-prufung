import openai
from typing import Final


async def get_completion(prompt: str, client: openai.AsyncOpenAI, model: str) -> str:
    response = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=256,
    )
    return response.choices[0].message.content.strip()
