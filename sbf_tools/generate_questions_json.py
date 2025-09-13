from .parse_questions import parse_questions
from .read_text_file import read_text_file
from .write_json_file import write_json_file


def generate_questions_json(text_path: str, out_path: str) -> None:
    text = read_text_file(text_path)
    questions = parse_questions(text)
    write_json_file(out_path, questions)
