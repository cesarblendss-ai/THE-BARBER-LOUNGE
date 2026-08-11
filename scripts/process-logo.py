"""Extract The Barber Lounge wordmark from white-background photo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageOps

SOURCE = Path(
    r"C:\Users\Cesar\.cursor\projects\c-Users-Cesar-OneDrive-Desktop\assets"
    r"\c__Users_Cesar_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_IMG_0464-6c14c56d-68bb-4d85-b136-cd69d81ff87c.png"
)
OUTPUT = Path(__file__).resolve().parent.parent / "public" / "logo.png"
TARGET_WIDTH = 1000
WHITE_THRESHOLD = 235
DARK_THRESHOLD = 200


def find_content_bbox(img: Image.Image, top_skip: float, bottom_skip: float) -> tuple[int, int, int, int]:
    """Bounding box of dark logo pixels, ignoring phone UI at top/bottom."""
    gray = img.convert("L")
    w, h = gray.size
    pixels = gray.load()

    y_start = int(h * top_skip)
    y_end = int(h * (1 - bottom_skip))

    min_x, min_y = w, h
    max_x, max_y = 0, 0

    for y in range(y_start, y_end):
        for x in range(w):
            if pixels[x, y] < DARK_THRESHOLD:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if max_x <= min_x or max_y <= min_y:
        raise ValueError("No logo content detected")

    pad_x = max(4, int((max_x - min_x) * 0.015))
    pad_y = max(4, int((max_y - min_y) * 0.015))
    return (
        max(0, min_x - pad_x),
        max(0, min_y - pad_y),
        min(w, max_x + pad_x),
        min(h, max_y + pad_y),
    )


def white_to_transparent(img: Image.Image, threshold: int = WHITE_THRESHOLD) -> Image.Image:
    """Convert near-white pixels to transparent, preserve anti-aliased edges."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            brightness = (r + g + b) / 3
            if brightness >= threshold:
                px[x, y] = (r, g, b, 0)
            elif brightness >= threshold - 40:
                fade = int(255 * (threshold - brightness) / 40)
                px[x, y] = (r, g, b, max(0, min(255, fade)))
            else:
                px[x, y] = (r, g, b, 255)

    return img


def trim_transparent(img: Image.Image) -> Image.Image:
    """Trim fully transparent borders."""
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


def scale_to_width(img: Image.Image, target_width: int) -> Image.Image:
    w, h = img.size
    if w == target_width:
        return img
    new_h = max(1, round(h * target_width / w))
    return img.resize((target_width, new_h), Image.Resampling.LANCZOS)


def process_logo() -> tuple[int, int]:
    img = Image.open(SOURCE).convert("RGB")
    print(f"Source: {img.size[0]}x{img.size[1]}")

    # Exclude phone status bar (~12%) and bottom toolbar (~18%)
    bbox = find_content_bbox(img, top_skip=0.12, bottom_skip=0.18)
    cropped = img.crop(bbox)
    print(f"Content crop: {cropped.size[0]}x{cropped.size[1]}")

    rgba = white_to_transparent(cropped)
    rgba = trim_transparent(rgba)

    # Second pass: trim any remaining white fringe via difference from white
    bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    diff = ImageChops.difference(rgba, bg)
    diff_bbox = diff.getbbox()
    if diff_bbox:
        rgba = rgba.crop(diff_bbox)

    rgba = scale_to_width(rgba, TARGET_WIDTH)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(OUTPUT, "PNG", optimize=True)

    w, h = rgba.size
    print(f"Output: {OUTPUT}")
    print(f"Dimensions: {w}x{h}")
    return w, h


if __name__ == "__main__":
    process_logo()
