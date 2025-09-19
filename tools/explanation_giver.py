import os
import argparse
import asyncio
from dotenv import load_dotenv
import openai

from sbf_tools.process_all_questions_async import process_all_questions


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generiert Tipps und Hintergründe für den Fragenkatalog")
    parser.add_argument("--input", default="questions.json", help="Pfad zur Eingabedatei (default: questions.json)")
    parser.add_argument("--output", default="questions_with_tips_and_explanations.json", help="Pfad zur Ausgabedatei")
    parser.add_argument("--force-tip", action="store_true", help="Tipps auch dann neu erzeugen, wenn bereits vorhanden")
    parser.add_argument("--force-explanation", action="store_true", help="Hintergründe neu erzeugen, auch wenn schon vorhanden")
    parser.add_argument("--concurrency", type=int, default=3, help="Parallel laufende Requests (default: 3)")
    parser.add_argument("--model", default="gpt-4o-mini", help="OpenAI Modell-ID (default: gpt-4o-mini)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Load API key from .env file
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY nicht gesetzt. Bitte .env prüfen.")

    client = openai.AsyncOpenAI(api_key=api_key)

    asyncio.run(
        process_all_questions(
            input_file=args.input,
            output_file=args.output,
            client=client,
            model=args.model,
            concurrency=args.concurrency,
            regenerate_tip=args.force_tip,
            regenerate_explanation=args.force_explanation,
        )
    )


if __name__ == "__main__":
    main()
