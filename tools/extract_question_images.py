"""Extract question illustrations from the official Fragenkatalog PDF.

The heuristic assumes that each question in the PDF starts with a label like
"Frage 123" and that any images appearing below that label belong to the same
question until the next "Frage" label on the page.

Requires:
    PyMuPDF (``pip install pymupdf``)
    Pillow (``pip install pillow``) – only if you enable PNG re-encoding.

Usage::

    python tools/extract_question_images.py \
        Fragenkatalog-Binnen-August-2023.pdf \
        frontend/src/assets/question-images

See ``--help`` for optional arguments and knobs you can tune.
"""

from __future__ import annotations

import argparse
import dataclasses
import io
import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

try:
    import fitz  # PyMuPDF
except ImportError as exc:  # pragma: no cover - handled at runtime
    raise SystemExit(
        "PyMuPDF (pymupdf) is required. Install it with `pip install pymupdf`."
    ) from exc

try:
    from PIL import Image  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    Image = None  # Pillow only needed for optional PNG conversion

QUESTION_PATTERN = re.compile(r"^(?:Frage\s+)?(\d{1,3})[\s\.)]", re.IGNORECASE)


@dataclasses.dataclass(slots=True)
class QuestionAnchor:
    question_id: int
    y_top: float
    page_number: int


@dataclasses.dataclass(slots=True)
class PageImage:
    xref: int
    rect: fitz.Rect
    width: int
    height: int
    page_number: int

    @property
    def area(self) -> float:
        return self.rect.get_area()

    @property
    def vertical_center(self) -> float:
        return (self.rect.y0 + self.rect.y1) / 2


def extract_question_anchors(page: fitz.Page) -> List[QuestionAnchor]:
    anchors: List[QuestionAnchor] = []
    seen_ids: set[int] = set()
    text_dict = page.get_text("dict")
    for block in text_dict.get("blocks", []):
        for line in block.get("lines", []):
            if not line.get("spans"):
                continue
            line_text = "".join(span.get("text", "") for span in line["spans"]).strip()
            if not line_text:
                continue
            match = QUESTION_PATTERN.match(line_text)
            if not match:
                continue
            question_id = int(match.group(1))
            if question_id in seen_ids:
                continue
            y0 = line["bbox"][1]
            anchors.append(QuestionAnchor(question_id, y0, page.number))
            seen_ids.add(question_id)
    anchors.sort(key=lambda a: a.y_top)
    return anchors


def extract_images_on_page(page: fitz.Page, min_area: float) -> List[PageImage]:
    images: List[PageImage] = []
    seen: set[int] = set()
    for image in page.get_images(full=True):
        xref = image[0]
        if xref in seen:
            continue
        seen.add(xref)

        rects = page.get_image_rects(xref)
        if not rects:
            continue

        # When the same image is drawn multiple times we keep one entry per rect
        for rect in rects:
            candidate = PageImage(xref=xref, rect=rect, width=image[2], height=image[3], page_number=page.number)
            if candidate.area >= min_area:
                images.append(candidate)
    images.sort(key=lambda img: (img.vertical_center, -img.area))
    return images


def assign_images_to_questions(
    anchors: Sequence[QuestionAnchor], images: Sequence[PageImage]
) -> Dict[int, List[PageImage]]:
    if not anchors:
        return {}

    assignments: Dict[int, List[PageImage]] = defaultdict(list)
    boundaries: List[float] = [anchor.y_top for anchor in anchors]
    boundaries.append(math.inf)

    for img in images:
        y_center = img.vertical_center
        assigned = False
        for idx, anchor in enumerate(anchors):
            lower = boundaries[idx]
            upper = boundaries[idx + 1]
            if lower <= y_center < upper:
                assignments[anchor.question_id].append(img)
                assigned = True
                break
        if not assigned and len(anchors) == 1:
            # Fallback: if a single question on page, attach everything to it
            assignments[anchors[0].question_id].append(img)
    return assignments


def ensure_output_dir(path: Path, force: bool) -> None:
    if path.exists():
        if not path.is_dir():
            raise SystemExit(f"Output path {path} exists and is not a directory.")
        if not force and any(path.iterdir()):
            raise SystemExit(
                f"Output directory {path} is not empty. Use --force to allow writing into it."
            )
    else:
        path.mkdir(parents=True, exist_ok=True)


def save_image(
    doc: fitz.Document,
    img: PageImage,
    output_dir: Path,
    question_id: int,
    index: int,
    preferred_ext: str | None,
) -> Path:
    info = doc.extract_image(img.xref)
    image_bytes: bytes = info["image"]
    ext = info.get("ext", "png").lower()

    if preferred_ext and Image is not None:
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            ext = preferred_ext.lower().lstrip(".")
            fmt = "PNG" if ext == "png" else ext.upper()
            output_path = output_dir / f"{question_id}_{index}.{ext}"
            pil_image.save(output_path, format=fmt)
            return output_path
        except Exception:  # pragma: no cover - best effort fallback
            pass

    output_path = output_dir / f"{question_id}_{index}.{ext}"
    output_path.write_bytes(image_bytes)
    return output_path


def process_pdf(
    pdf_path: Path,
    output_dir: Path,
    *,
    min_area: float,
    preferred_ext: str | None,
    dry_run: bool,
    force: bool,
    map_file: Path | None,
) -> None:
    ensure_output_dir(output_dir, force=force)

    doc = fitz.open(pdf_path)
    mapping: Dict[int, List[str]] = defaultdict(list)

    for page in doc:
        anchors = extract_question_anchors(page)
        if not anchors:
            continue
        images = extract_images_on_page(page, min_area=min_area)
        assignments = assign_images_to_questions(anchors, images)

        for question_id, question_images in assignments.items():
            for idx, image in enumerate(question_images, start=1):
                target = output_dir / f"{question_id}_{idx}.png"
                if dry_run:
                    print(f"[DRY RUN] would extract question {question_id} image from page {image.page_number + 1}")
                    mapping[question_id].append(str(target))
                    continue
                saved_path = save_image(
                    doc,
                    image,
                    output_dir,
                    question_id,
                    idx,
                    preferred_ext,
                )
                print(f"Saved question {question_id} → {saved_path}")
                mapping[question_id].append(str(saved_path.relative_to(output_dir)))

    if map_file:
        payload = {str(qid): paths for qid, paths in sorted(mapping.items())}
        if dry_run:
            print(f"[DRY RUN] would write mapping JSON to {map_file}")
        else:
            map_file.parent.mkdir(parents=True, exist_ok=True)
            map_file.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
            print(f"Wrote mapping JSON to {map_file}")


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path, help="Path to the Fragenkatalog PDF")
    parser.add_argument("output", type=Path, help="Directory to store extracted images")
    parser.add_argument(
        "--min-area",
        type=float,
        default=1_000.0,
        help="Minimum image area in PDF units (points²) to keep (default: 1k).",
    )
    parser.add_argument(
        "--ext",
        dest="preferred_ext",
        choices={"png", "jpg"},
        help="Re-encode extracted images to this format (requires Pillow).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Do not write files, just report what would happen.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Allow writing into a non-empty output directory.",
    )
    parser.add_argument(
        "--map-file",
        type=Path,
        help="Optional JSON file to write the question→images mapping.",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> None:
    args = parse_args(argv or sys.argv[1:])
    pdf_path: Path = args.pdf
    output_dir: Path = args.output

    if not pdf_path.exists():
        raise SystemExit(f" PDF file not found: {pdf_path}")

    process_pdf(
        pdf_path,
        output_dir,
        min_area=args.min_area,
        preferred_ext=args.preferred_ext,
        dry_run=args.dry_run,
        force=args.force,
        map_file=args.map_file,
    )


if __name__ == "__main__":
    main()
