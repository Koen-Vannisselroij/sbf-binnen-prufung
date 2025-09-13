from .base_question import BaseQuestion


def build_explanation_prompt(q: BaseQuestion) -> str:
    return (
        "Du bist ein Lehrer für den Sportbootführerschein-Binnen (SBF Binnen). "
        "Gib eine knappe, präzise Erklärung in gutem Deutsch, warum bei folgender Frage "
        "die korrekte Antwort richtig ist. Sprich den Schüler direkt an, als Feedback nach einer falschen Antwort.\n"
        f"Frage: {q['question']}\n"
        f"Antwortmöglichkeiten: {', '.join(q['options'])}\n"
        f"Korrekte Antwort: {q['options'][q['answer']]}\n"
        "Erklärung:"
    )
