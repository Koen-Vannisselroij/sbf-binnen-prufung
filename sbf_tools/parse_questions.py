import re
from typing import List

from .base_question import BaseQuestion


def parse_questions(input_text: str) -> List[BaseQuestion]:
    # Regex for questions and answers
    question_pattern = re.compile(r"(\d+)\.\s*(.+?)(?=\n[a-d]\.)", re.DOTALL)
    answer_pattern = re.compile(r"\n([a-d])\.\s*(.+)")

    questions: List[BaseQuestion] = []
    for match in question_pattern.finditer(input_text):
        q_number = int(match.group(1))
        q_text = match.group(2).strip()

        # Parse answers for this question block
        answer_matches = list(answer_pattern.finditer(input_text, match.end()))
        answers = [am.group(2).strip() for am in answer_matches[:4]]

        questions.append(
            {
                "id": q_number,
                "question": q_text,
                "options": answers,
                "answer": 0,  # a is always correct
            }
        )

    return questions
