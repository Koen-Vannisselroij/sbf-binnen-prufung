import os
import asyncio
from dotenv import load_dotenv
import openai

from sbf_tools.process_all_questions_async import process_all_questions


def main() -> None:
    # Load API key from .env file
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    model = "gpt-4o-mini"
    client = openai.AsyncOpenAI(api_key=api_key)

    input_file = "questions.json"
    output_file = "questions_with_tips_and_explanations.json"

    asyncio.run(process_all_questions(input_file, output_file, client, model, concurrency=3))


if __name__ == "__main__":
    main()
