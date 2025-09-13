import json
from pathlib import Path
from typing import Any


def write_json_file(path: str, data: Any, encoding: str = "utf-8") -> None:
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding=encoding)
