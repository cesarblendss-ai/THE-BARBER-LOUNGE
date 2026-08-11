"""Score gallery images for bone-background blend quality."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

GALLERY = Path(__file__).resolve().parent.parent / "public" / "gallery"
BONE = np.array([242, 239, 234], dtype=np.float32)
THRESHOLD_PASS = 6.0  # max mean delta on outer ring to pass

TARGETS = [
    "skin-fade-closeup.png",
    "signature-haircut-02.jpg",
    "signature-haircut-03.jpg",
    "signature-haircut-04.jpg",
    "signature-haircut-05.jpg",
    "signature-haircut-06.jpg",
    "signature-haircut-07.jpg",
    "signature-haircut-08.jpg",
    "signature-haircut-09.jpg",
]


def score_image(path: Path) -> dict:
    img = np.array(Image.open(path).convert("RGB"), dtype=np.float32)
    h, w = _ = img.shape[:2]
    margin = max(8, min(h, w) // 40)

    # Outer ring should be pure bone on a good composite.
    top = img[:margin, :]
    bottom = img[-margin:, :]
    left = img[:, :margin]
    right = img[:, -margin:]
    border = np.concatenate(
        [top.reshape(-1, 3), bottom.reshape(-1, 3), left.reshape(-1, 3), right.reshape(-1, 3)],
        axis=0,
    )
    border_delta = float(np.mean(np.linalg.norm(border - BONE, axis=-1)))

    # Detect inner neutral rectangles (low-sat bright regions away from border).
    inner = img[margin:-margin, margin:-margin]
    sat = np.max(inner, axis=-1) - np.min(inner, axis=-1)
    lum = inner.mean(axis=-1)
    bone_dist = np.linalg.norm(inner - BONE, axis=-1)
    neutral_blob = ((sat < 20) & (lum > 100) & (bone_dist > 12)).mean() * 100

    # Edge halo: semi-neutral pixels just inside the border band.
    band = img[margin : margin * 3, margin : w - margin]
    band_sat = np.max(band, axis=-1) - np.min(band, axis=-1)
    band_lum = band.mean(axis=-1)
    band_bone = np.linalg.norm(band - BONE, axis=-1)
    halo_pct = ((band_sat < 22) & (band_lum > 95) & (band_bone > 8) & (band_bone < 35)).mean() * 100

    passed = bool(
        border_delta <= THRESHOLD_PASS and neutral_blob < 1.5 and halo_pct < 8.0
    )
    return {
        "file": path.name,
        "border_delta": round(border_delta, 2),
        "neutral_blob_pct": round(neutral_blob, 2),
        "halo_pct": round(halo_pct, 2),
        "passed": passed,
    }


def main() -> None:
    results = [score_image(GALLERY / name) for name in TARGETS]
    passed = sum(1 for r in results if r["passed"])
    print(json.dumps({"passed": passed, "total": len(results), "images": results}, indent=2))


if __name__ == "__main__":
    main()
