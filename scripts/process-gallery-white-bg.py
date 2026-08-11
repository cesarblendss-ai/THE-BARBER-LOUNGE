"""Remove backgrounds and place signature haircut photos on bone (#F2EFEA) square canvases."""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

ASSETS = Path(
    r"C:\Users\Cesar\.cursor\projects\c-Users-Cesar-OneDrive-Desktop\assets"
)
OUTPUT = Path(__file__).resolve().parent.parent / "public" / "gallery"

CANVAS_SIZE = 1200
PADDING_RATIO = 0.04
BONE_BG = (242, 239, 234)  # #F2EFEA — matches site bone color
BONE_ARR = np.array(BONE_BG, dtype=np.float32)

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


@dataclass(frozen=True)
class ProcessConfig:
    model: str = "isnet-general-use"
    alpha_matting: bool = True
    alpha_matting_foreground_threshold: int = 240
    alpha_matting_background_threshold: int = 10
    alpha_matting_erode_size: int = 10
    post_process_mask: bool = True
    keep_largest: bool = True
    open_px: int = 1
    erode_px: int = 1
    dilate_px: int = 0
    feather_px: float = 1.0
    defringe: bool = True
    alpha_floor: int = 16
    alpha_ceiling: int = 255
    spill_tolerance: float = 42.0
    source_crop: tuple[float, float, float, float] | None = None
    cutout_height_ratio: float | None = None
    cutout_top_skip_ratio: float = 0.0
    cutout_inset_x: float = 0.0
    force_wall_removal: bool = True


IMAGE_CONFIGS: dict[str, ProcessConfig] = {
    "skin-fade-closeup.png": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        alpha_matting_erode_size=12,
        open_px=1,
        erode_px=1,
        feather_px=1.0,
        spill_tolerance=44.0,
        source_crop=(0.08, 0.04, 0.92, 0.90),
        cutout_height_ratio=0.90,
    ),
    "signature-haircut-02.jpg": ProcessConfig(
        model="u2net_human_seg",
        alpha_matting=True,
        open_px=0,
        erode_px=1,
        feather_px=0.9,
        spill_tolerance=42.0,
        cutout_height_ratio=0.84,
    ),
    "signature-haircut-03.jpg": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        alpha_matting_erode_size=12,
        open_px=1,
        erode_px=1,
        feather_px=1.0,
        spill_tolerance=44.0,
        source_crop=(0.06, 0.02, 0.94, 0.86),
        cutout_height_ratio=0.72,
        cutout_inset_x=0.03,
    ),
    "signature-haircut-04.jpg": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        open_px=1,
        erode_px=1,
        feather_px=0.9,
        spill_tolerance=42.0,
        cutout_height_ratio=0.80,
    ),
    "signature-haircut-05.jpg": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        open_px=1,
        erode_px=1,
        feather_px=0.9,
        spill_tolerance=42.0,
        cutout_height_ratio=0.86,
    ),
    "signature-haircut-06.jpg": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        alpha_matting_erode_size=12,
        open_px=2,
        erode_px=1,
        feather_px=1.0,
        spill_tolerance=46.0,
        source_crop=(0.10, 0.02, 0.90, 0.80),
        cutout_height_ratio=0.66,
        cutout_inset_x=0.05,
    ),
    "signature-haircut-07.jpg": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        alpha_matting_erode_size=12,
        open_px=2,
        erode_px=1,
        feather_px=1.1,
        spill_tolerance=48.0,
        source_crop=(0.0, 0.14, 0.72, 0.78),
        cutout_height_ratio=0.70,
        cutout_top_skip_ratio=0.08,
        cutout_inset_x=0.0,
        force_wall_removal=True,
    ),
    "signature-haircut-08.jpg": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        alpha_matting_erode_size=12,
        open_px=2,
        erode_px=2,
        feather_px=0.8,
        spill_tolerance=46.0,
        cutout_height_ratio=0.74,
        cutout_top_skip_ratio=0.08,
    ),
    "signature-haircut-09.jpg": ProcessConfig(
        model="isnet-general-use",
        alpha_matting=True,
        alpha_matting_erode_size=12,
        open_px=2,
        erode_px=2,
        feather_px=1.2,
        spill_tolerance=50.0,
        source_crop=(0.06, 0.04, 0.94, 0.86),
        cutout_height_ratio=0.70,
        cutout_inset_x=0.03,
    ),
}

_SESSIONS: dict[str, object] = {}


def get_session(model: str):
    if model not in _SESSIONS:
        _SESSIONS[model] = new_session(model)
    return _SESSIONS[model]


def apply_source_crop(source: Image.Image, crop: tuple[float, float, float, float]) -> Image.Image:
    w, h = source.size
    left = int(crop[0] * w)
    top = int(crop[1] * h)
    right = int(crop[2] * w)
    bottom = int(crop[3] * h)
    return source.crop((left, top, right, bottom))


def sample_edge_background(source: Image.Image, margin: int = 12) -> np.ndarray:
    """Sample wall color — prefer bright neutral top edge (barbershop wall behind subject)."""
    rgb = np.array(source.convert("RGB"), dtype=np.float32)
    h, w = rgb.shape[:2]
    m = max(margin, min(h, w) // 20)

    top = rgb[:m, :].reshape(-1, 3)
    top_sat = np.max(top, axis=1) - np.min(top, axis=1)
    top_neutral = top[top_sat < 22]
    if top_neutral.size >= 16:
        top_bright = top_neutral[top_neutral.mean(axis=1) > 130]
        if top_bright.size >= 12:
            return np.median(top_bright, axis=0)

    strips = (rgb[:m, :], rgb[-m:, :], rgb[:, :m], rgb[:, -m:])
    samples = np.concatenate([s.reshape(-1, 3) for s in strips], axis=0)
    sat = np.max(samples, axis=1) - np.min(samples, axis=1)
    lum = samples.mean(axis=1)
    neutral = samples[(sat < 22) & (lum > 125)]
    if neutral.size >= 20:
        bright = neutral[neutral.mean(axis=1) >= np.percentile(neutral.mean(axis=1), 45)]
        return np.median(bright, axis=0)

    return np.median(samples, axis=0)


def is_wall_pixel(rgb: np.ndarray, bg: np.ndarray, tolerance: float) -> np.ndarray:
    """Conservative wall/floor detector — excludes skin, hair, and colored fabrics."""
    dist = np.linalg.norm(rgb - bg, axis=-1)
    saturation = np.max(rgb, axis=-1) - np.min(rgb, axis=-1)
    luminance = rgb.mean(axis=-1)
    warmth = rgb[..., 0] - rgb[..., 2]
    bone_dist = np.linalg.norm(rgb - BONE_ARR, axis=-1)

    neutral_bright = (saturation < 18) & (luminance > 118) & (warmth < 10)
    near_sampled_bg = dist < tolerance
    near_bone_gray = (bone_dist < 24) & (saturation < 16) & (luminance > 112) & (warmth < 12)

    return (near_sampled_bg & neutral_bright) | near_bone_gray


def is_definite_source_wall(src_rgb: np.ndarray, bg: np.ndarray, tolerance: float) -> np.ndarray:
    """Source pixels that are clearly wall — safe to drop even if rembg kept them."""
    dist = np.linalg.norm(src_rgb - bg, axis=-1)
    saturation = np.max(src_rgb, axis=-1) - np.min(src_rgb, axis=-1)
    luminance = src_rgb.mean(axis=-1)
    warmth = src_rgb[..., 0] - src_rgb[..., 2]
    return (
        (dist < tolerance + 10)
        & (saturation < 24)
        & (luminance > 128)
        & (luminance < 228)
        & (warmth < 14)
    )


def force_remove_source_wall(
    source: Image.Image, alpha: np.ndarray, tolerance: float
) -> np.ndarray:
    """Drop opaque wall-colored source pixels regardless of mask connectivity."""
    src_rgb = np.array(source.convert("RGB"), dtype=np.float32)
    bg = sample_edge_background(source)
    wall = is_definite_source_wall(src_rgb, bg, tolerance)
    out = alpha.copy()
    out[wall] = 0
    return out


def strip_background_spill(
    source: Image.Image, rgba: Image.Image, tolerance: float = 42.0
) -> Image.Image:
    src_rgb = np.array(source.convert("RGB"), dtype=np.float32)
    arr = np.array(rgba, dtype=np.float32)
    alpha = arr[..., 3]
    bg = sample_edge_background(source)

    wall = is_wall_pixel(src_rgb, bg, tolerance)
    structure = ndimage.generate_binary_structure(2, 1)
    subject_core = ndimage.binary_erosion(alpha > 110, structure=structure, iterations=12)
    wall &= ~subject_core

    out_sat = np.max(arr[..., :3], axis=-1) - np.min(arr[..., :3], axis=-1)
    out_lum = arr[..., :3].mean(axis=-1)
    flat_fill = (
        is_wall_pixel(arr[..., :3], bg, tolerance)
        & (out_sat < 20)
        & (out_lum > 110)
        & (alpha > 48)
        & ~subject_core
    )

    alpha[wall | flat_fill] = 0
    arr[..., 3] = alpha
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def keep_largest_foreground(alpha: np.ndarray, threshold: int = 32) -> np.ndarray:
    binary = alpha >= threshold
    labeled, count = ndimage.label(binary)
    if count <= 1:
        return alpha

    sizes = ndimage.sum(binary, labeled, range(1, count + 1))
    largest_label = int(np.argmax(sizes)) + 1
    keep = labeled == largest_label
    return np.where(keep, alpha, 0).astype(np.uint8)


def refine_alpha_mask(alpha: np.ndarray, config: ProcessConfig) -> np.ndarray:
    if config.keep_largest:
        alpha = keep_largest_foreground(alpha)

    mask = alpha.astype(np.float32) / 255.0

    if config.open_px > 0:
        structure = ndimage.generate_binary_structure(2, 1)
        binary = mask >= 0.5
        binary = ndimage.binary_opening(binary, structure=structure, iterations=config.open_px)
        mask = mask * binary.astype(np.float32)

    if config.erode_px > 0:
        structure = ndimage.generate_binary_structure(2, 1)
        binary = mask >= 0.5
        binary = ndimage.binary_erosion(binary, structure=structure, iterations=config.erode_px)
        mask = mask * binary.astype(np.float32)

    if config.dilate_px > 0:
        structure = ndimage.generate_binary_structure(2, 1)
        binary = mask >= 0.5
        binary = ndimage.binary_dilation(binary, structure=structure, iterations=config.dilate_px)
        mask = np.maximum(mask, binary.astype(np.float32))

    mask_u8 = np.clip(mask * 255, 0, 255).astype(np.uint8)
    mask_u8 = ndimage.median_filter(mask_u8, size=3)

    if config.feather_px > 0:
        mask_u8 = np.array(
            Image.fromarray(mask_u8).filter(ImageFilter.GaussianBlur(radius=config.feather_px))
        )

    return np.clip(mask_u8, config.alpha_floor, config.alpha_ceiling)


def harden_wall_alpha(
    source: Image.Image, alpha: np.ndarray, tolerance: float = 42.0
) -> np.ndarray:
    src_rgb = np.array(source.convert("RGB"), dtype=np.float32)
    bg = sample_edge_background(source)
    wall = is_wall_pixel(src_rgb, bg, tolerance)
    structure = ndimage.generate_binary_structure(2, 1)
    subject_core = ndimage.binary_erosion(alpha > 110, structure=structure, iterations=10)
    out = alpha.copy()
    out[wall & ~subject_core & (out < 230)] = 0
    return out


def defringe_rgba(rgba: Image.Image, bg: tuple[int, int, int]) -> Image.Image:
    arr = np.array(rgba, dtype=np.float32)
    rgb = arr[..., :3]
    alpha = arr[..., 3:4] / 255.0
    bg_arr = np.array(bg, dtype=np.float32)

    edge = (alpha[..., 0] > 0.04) & (alpha[..., 0] < 0.96)
    if not edge.any():
        return rgba

    safe_alpha = np.maximum(alpha, 1e-3)
    decontaminated = (rgb - bg_arr * (1.0 - alpha)) / safe_alpha
    decontaminated = np.clip(decontaminated, 0, 255)

    out_rgb = rgb.copy()
    out_rgb[edge] = decontaminated[edge]
    return Image.fromarray(
        np.concatenate([out_rgb, arr[..., 3:4]], axis=-1).astype(np.uint8), "RGBA"
    )


def trim_cutout_bbox(cutout: Image.Image, config: ProcessConfig) -> Image.Image:
    bbox = cutout.getbbox()
    if not bbox:
        return cutout

    left, top, right, bottom = bbox
    width = right - left
    height = bottom - top

    if config.cutout_inset_x > 0:
        inset = int(width * config.cutout_inset_x)
        left += inset
        right -= inset

    if config.cutout_height_ratio is not None:
        keep_h = max(1, int(height * config.cutout_height_ratio))
        bottom = top + keep_h

    if config.cutout_top_skip_ratio > 0:
        top = top + int(height * config.cutout_top_skip_ratio)

    return cutout.crop((left, top, right, bottom))


def remove_background(source: Image.Image, config: ProcessConfig) -> Image.Image:
    session = get_session(config.model)
    source_bytes = io.BytesIO()
    source.save(source_bytes, format="PNG")
    payload = source_bytes.getvalue()

    mask_bytes = remove(
        payload,
        session=session,
        alpha_matting=config.alpha_matting,
        alpha_matting_foreground_threshold=config.alpha_matting_foreground_threshold,
        alpha_matting_background_threshold=config.alpha_matting_background_threshold,
        alpha_matting_erode_size=config.alpha_matting_erode_size,
        post_process_mask=config.post_process_mask,
        only_mask=True,
    )
    mask = Image.open(io.BytesIO(mask_bytes)).convert("L")

    alpha = refine_alpha_mask(np.array(mask), config)
    source_rgb = source.convert("RGB")
    if source_rgb.size != mask.size:
        source_rgb = source_rgb.resize(mask.size, Image.Resampling.LANCZOS)

    cutout = source_rgb.copy()
    cutout.putalpha(Image.fromarray(alpha, mode="L"))
    cutout = strip_background_spill(source_rgb, cutout, config.spill_tolerance)

    alpha = np.array(cutout.split()[3])
    if config.force_wall_removal:
        alpha = force_remove_source_wall(source_rgb, alpha, config.spill_tolerance)
    alpha = harden_wall_alpha(source_rgb, alpha, config.spill_tolerance)
    alpha = refine_alpha_mask(alpha, config)
    cutout.putalpha(Image.fromarray(alpha, mode="L"))

    if config.defringe:
        cutout = defringe_rgba(cutout, BONE_BG)

    # Final crush: no semi-transparent wall fringe
    alpha = np.array(cutout.split()[3])
    if config.force_wall_removal:
        alpha = force_remove_source_wall(source_rgb, alpha, config.spill_tolerance)
    alpha[alpha < 72] = 0
    cutout.putalpha(Image.fromarray(alpha, mode="L"))

    return cutout


def process_one(
    source_path: Path, output_path: Path, config: ProcessConfig | None = None
) -> tuple[int, int]:
    config = config or ProcessConfig()
    source = Image.open(source_path).convert("RGB")
    work_source = (
        apply_source_crop(source, config.source_crop) if config.source_crop else source
    )

    cutout = remove_background(work_source, config)
    cutout = trim_cutout_bbox(cutout, config)

    bbox = cutout.getbbox()
    if bbox:
        cutout = cutout.crop(bbox)

    pad = int(CANVAS_SIZE * PADDING_RATIO)
    max_dim = CANVAS_SIZE - 2 * pad
    width, height = cutout.size
    scale = min(max_dim / width, max_dim / height)
    new_w = max(1, round(width * scale))
    new_h = max(1, round(height * scale))
    cutout = cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", (CANVAS_SIZE, CANVAS_SIZE), BONE_BG)
    offset_x = (CANVAS_SIZE - new_w) // 2
    offset_y = (CANVAS_SIZE - new_h) // 2
    canvas.paste(cutout, (offset_x, offset_y), cutout)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    if output_path.suffix.lower() == ".png":
        canvas.save(output_path, "PNG", optimize=True)
    else:
        canvas.save(output_path, "JPEG", quality=93, optimize=True, subsampling=0)

    return canvas.size


def main() -> None:
    for source_name, output_name in SOURCES:
        source_path = ASSETS / source_name
        output_path = OUTPUT / output_name
        config = IMAGE_CONFIGS.get(output_name, ProcessConfig())

        if not source_path.exists():
            raise FileNotFoundError(f"Missing source: {source_path}")

        size = process_one(source_path, output_path, config)
        print(
            f"OK  {output_name}  ({size[0]}x{size[1]})  "
            f"model={config.model}  <-  {source_name[:48]}..."
        )


if __name__ == "__main__":
    main()
