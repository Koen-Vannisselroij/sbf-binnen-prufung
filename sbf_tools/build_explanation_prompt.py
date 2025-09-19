from .base_question import BaseQuestion


def build_explanation_prompt(q: BaseQuestion) -> str:
    options_formatted = " | ".join(q["options"])
    return (
        "Du bist Ausbilder für den Sportbootführerschein Binnen. "
        "Formuliere für die folgende Prüfungsfrage eine verständliche "
        "Erklärung in 2–3 ganzen Sätzen. Sprich den Prüfling direkt an "
        "und ordne die richtige Antwort fachlich ein. Nenne die "
        "Schlüsselbegriffe, die man sich merken muss, und erwähne "
        "falls sinnvoll die Situation auf dem Wasser (z. B. Wind, "
        "Strömung, Gesetz). Vermeide Aufzählungen und stelle keine "
        "neuen Fragen.\n"
        f"Frage: {q['question']}\n"
        f"Antwortmöglichkeiten: {options_formatted}\n"
        f"Korrekte Antwort: {q['options'][q['answer']]}\n"
        "Erklärung:"
    )
