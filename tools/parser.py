from sbf_tools.generate_questions_json import generate_questions_json


def main() -> None:
    generate_questions_json("fragenkatalog.txt", "questions.json")


if __name__ == "__main__":
    main()
