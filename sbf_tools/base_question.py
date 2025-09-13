from typing import List, TypedDict


class BaseQuestion(TypedDict):
    id: int
    question: str
    options: List[str]
    answer: int
