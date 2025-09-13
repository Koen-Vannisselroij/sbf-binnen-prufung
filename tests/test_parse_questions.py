import unittest

from sbf_tools.parse_questions import parse_questions


class TestParseQuestions(unittest.TestCase):
    def test_parses_two_questions(self):
        sample = (
            "1. Was ist rot?\n"
            "a. Tomate\n"
            "b. Banane\n"
            "c. Gurke\n"
            "d. Zwiebel\n\n"
            "2. Was ist 2+2?\n"
            "a. 4\n"
            "b. 3\n"
            "c. 5\n"
            "d. 22\n"
        )

        result = parse_questions(sample)
        self.assertEqual(len(result), 2)

        q1 = result[0]
        self.assertEqual(q1["id"], 1)
        self.assertIn("Was ist rot?", q1["question"])  # text preserved
        self.assertEqual(q1["options"], ["Tomate", "Banane", "Gurke", "Zwiebel"])
        self.assertEqual(q1["answer"], 0)

        q2 = result[1]
        self.assertEqual(q2["id"], 2)
        self.assertIn("Was ist 2+2?", q2["question"])  # text preserved
        self.assertEqual(q2["options"], ["4", "3", "5", "22"])
        self.assertEqual(q2["answer"], 0)


if __name__ == "__main__":
    unittest.main()
