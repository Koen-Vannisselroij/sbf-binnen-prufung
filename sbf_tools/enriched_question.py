from typing import TypedDict

from .base_question import BaseQuestion


class EnrichedQuestion(BaseQuestion, TypedDict, total=False):
    tip: str
    explanation: str
