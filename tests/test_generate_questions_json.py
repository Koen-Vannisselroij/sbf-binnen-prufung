import json
import tempfile
from pathlib import Path
import unittest

from sbf_tools.generate_questions_json import generate_questions_json


class TestGenerateQuestionsJson(unittest.TestCase):
    def test_generate_writes_expected_json(self):
        text = (
            "1. Frage A?\n"
            "a. A1\n"
            "b. A2\n"
            "c. A3\n"
            "d. A4\n"
        )
        with tempfile.TemporaryDirectory() as tmp:
            in_path = Path(tmp) / "in.txt"
            out_path = Path(tmp) / "out.json"
            in_path.write_text(text, encoding="utf-8")

            generate_questions_json(str(in_path), str(out_path))

            data = json.loads(out_path.read_text(encoding="utf-8"))
            self.assertIsInstance(data, list)
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["id"], 1)
            self.assertEqual(data[0]["options"], ["A1", "A2", "A3", "A4"])
            self.assertEqual(data[0]["answer"], 0)


if __name__ == "__main__":
    unittest.main()
