from .base_question import BaseQuestion


def build_tip_prompt(q: BaseQuestion) -> str:
    return (
        "Du bist ein Lehrer für den Sportbootführerschein-Binnen (SBF Binnen). "
        "Gib einen kurzen, hilfreichen Tipp oder eine Merkhilfe für die folgende Prüfungsfrage, "
        "der den Lernenden unterstützt, das Thema zu verstehen oder sich die richtige Antwort selbst herzuleiten. "
        "Vermeide es, die richtige Antwort zu nennen oder zu erklären, warum sie richtig ist.\n"
        f"Frage: {q['question']}\n"
        f"Antwortmöglichkeiten: {', '.join(q['options'])}\n"
        "Tipp:"
    )
