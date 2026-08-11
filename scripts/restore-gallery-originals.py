"""Copy raw original shop photos into gallery slots (no rembg, no bone compositing)."""

from __future__ import annotations

import json
import shutil
import time
from pathlib import Path

from PIL import Image

ASSETS = Path(
    r"C:\Users\Cesar\.cursor\projects\c-Users-Cesar-OneDrive-Desktop\assets"
)
GALLERY = Path(__file__).resolve().parent.parent / "public" / "gallery"
VERSION_FILE = GALLERY / "gallery-version.json"

# Same mapping as process-gallery-white-bg.py SOURCES
SOURCES: list[tuple[str, str]] = [
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__4_-acd47249-162e-44b4-8017-6534a4953ebd.png",
        "skin-fade-closeup.png",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__5_-b4a45b6b-2edc-41aa-bbbe-555de606c450.png",
        "signature-haircut-02.jpg",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__2_-fdaa36bb-3494-4b2f-81ac-080bafa6fc92.png",
        "signature-haircut-03.jpg",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__3_-8e56d9e2-4cb5-4b6d-8557-253f944558f9.png",
        "signature-haircut-04.jpg",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__7_-3af677c7-2f69-4dfb-b13c-bd213d457178.png",
        "signature-haircut-05.jpg",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h-8137e7c7-ec77-4fd2-a990-e761317f612d.png",
        "signature-haircut-06.jpg",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__10_-6bfa3323-4a82-4475-a765-8c9ca147eed0.png",
        "signature-haircut-07.jpg",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__9_-99be280c-d9e0-46d9-ad14-305f3bbd0d61.png",
        "signature-haircut-08.jpg",
    ),
    (
        "c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_h__8_-3ff0b49e-ef03-472b-b2ff-59d1bd03a38c.png",
        "signature-haircut-09.jpg",
    ),
]


def save_original(source_path: Path, output_path: Path) -> tuple[int, int]:
    image = Image.open(source_path).convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if output_path.suffix.lower() == ".png":
        image.save(output_path, "PNG", optimize=True)
    else:
        image.save(output_path, "JPEG", quality=93, optimize=True, subsampling=0)

    return image.size


BONE = (242, 239, 234)

# Keep non-white user uploads in these slots (already full shop photos).
SKIP_IF_ORIGINAL = {"signature-haircut-03.jpg", "signature-haircut-04.jpg"}


def has_flat_bone_bg(path: Path) -> bool:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    if w == h == 1200:
        px = im.load()
        corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
        return all(
            abs(r - BONE[0]) <= 18 and abs(g - BONE[1]) <= 18 and abs(b - BONE[2]) <= 18
            for r, g, b in corners
        )
    return False


def main() -> None:
    version_data: dict = {"files": {}}
    if VERSION_FILE.exists():
        version_data = json.loads(VERSION_FILE.read_text(encoding="utf-8"))
    files_version = dict(version_data.get("files", {}))
    now = int(time.time() * 1000)

    replaced: list[str] = []
    skipped: list[str] = []
    for source_name, output_name in SOURCES:
        source_path = ASSETS / source_name
        output_path = GALLERY / output_name

        if not source_path.exists():
            raise FileNotFoundError(f"Missing source: {source_path}")

        if output_name in SKIP_IF_ORIGINAL and output_path.exists() and not has_flat_bone_bg(output_path):
            skipped.append(output_name)
            print(f"SKIP {output_name}  (keeping existing non-white upload)")
            continue

        size = save_original(source_path, output_path)
        files_version[output_name] = now
        replaced.append(output_name)
        print(f"OK  {output_name}  {size[0]}x{size[1]}  <-  {source_name[:56]}...")

    version_data["files"] = files_version
    VERSION_FILE.write_text(json.dumps(version_data), encoding="utf-8")
    if skipped:
        print(f"\nSkipped (kept user uploads): {', '.join(skipped)}")
    print(f"\nUpdated {VERSION_FILE.name} for {len(replaced)} files.")


if __name__ == "__main__":
    main()
