#!/usr/bin/env python3
"""
Convert image sequence frames to high-efficiency WebP format and rename
to the requested specification:
- 1 to 99: frame01.webp, frame02.webp ... frame99.webp
- 100+:   frame100.webp ... frame240.webp
"""

import os
import sys
import glob
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

QUALITY = 82

DIRECTORIES = [
    ("public/frame", 240),
    ("public/laser", 96),
    ("public/hide_robot", 96),
]


def format_frame_name(num: int) -> str:
    """
    Format frame name according to user specification:
    1 -> frame01.webp
    99 -> frame99.webp
    100 -> frame100.webp
    121 -> frame121.webp
    """
    if num < 100:
        return f"frame{num:02d}.webp"
    return f"frame{num}.webp"


def convert_single_frame(args):
    src_path, dst_path = args
    try:
        with Image.open(src_path) as img:
            # Convert to RGB (in case of RGBA/palette modes)
            rgb_img = img.convert("RGB")
            # Save as WebP with optimized method=4, quality=QUALITY
            rgb_img.save(dst_path, "WEBP", quality=QUALITY, method=4)
        return True, src_path, dst_path, os.path.getsize(dst_path)
    except Exception as e:
        return False, src_path, dst_path, str(e)


def process_directory(base_path: str, expected_count: int, project_root: Path):
    target_dir = project_root / base_path
    if not target_dir.exists():
        print(f"[SKIP] Directory {target_dir} does not exist.")
        return

    print(f"\n📂 Processing {base_path}...")

    # Find all jpg files
    jpg_files = sorted(glob.glob(str(target_dir / "*.jpg")))
    if not jpg_files:
        # Check if already converted to webp
        webp_files = sorted(glob.glob(str(target_dir / "*.webp")))
        if len(webp_files) >= expected_count:
            print(f"  ✅ Already converted: {len(webp_files)} WebP files found.")
            return
        print(f"  ⚠️ No JPG files found in {target_dir}")
        return

    print(f"  Found {len(jpg_files)} JPG frames (expected: {expected_count})")

    tasks = []
    initial_total_size = 0
    for idx, jpg_path in enumerate(jpg_files, start=1):
        initial_total_size += os.path.getsize(jpg_path)
        new_name = format_frame_name(idx)
        dst_path = target_dir / new_name
        tasks.append((jpg_path, str(dst_path)))

    # Execute conversions in parallel
    completed = 0
    new_total_size = 0
    errors = []

    with ThreadPoolExecutor(max_workers=8) as executor:
        for success, src, dst, result in executor.map(convert_single_frame, tasks):
            if success:
                completed += 1
                new_total_size += result
                pct = (completed / len(tasks)) * 100
                print(f"\r  Progress: [{completed}/{len(tasks)}] ({pct:.1f}%)", end="", flush=True)
            else:
                errors.append((src, result))

    print()
    if errors:
        print(f"  ❌ Conversion encountered {len(errors)} errors:")
        for src, err in errors[:5]:
            print(f"    - {src}: {err}")
        sys.exit(1)

    print(f"  ✅ Converted {completed} frames successfully!")
    print(f"  Initial JPG size: {initial_total_size / (1024*1024):.2f} MB")
    print(f"  New WebP size:    {new_total_size / (1024*1024):.2f} MB")
    saved_pct = (1 - (new_total_size / initial_total_size)) * 100
    print(f"  Payload reduction: {saved_pct:.1f}% saved! 🚀")

    # Verify every destination file exists and is valid
    verification_passed = True
    for idx in range(1, len(tasks) + 1):
        expected_file = target_dir / format_frame_name(idx)
        if not expected_file.exists() or expected_file.stat().st_size == 0:
            print(f"  ❌ Verification failed for {expected_file.name}")
            verification_passed = False

    if verification_passed:
        print("  🧹 Removing old JPG files...")
        for jpg_path in jpg_files:
            try:
                os.remove(jpg_path)
            except Exception as e:
                print(f"  Failed to remove {jpg_path}: {e}")
        print("  ✨ Old JPG files cleaned up.")


def main():
    project_root = Path(__file__).resolve().parent.parent
    print(f"🚀 Starting Frame Optimization Pipeline at: {project_root}")

    for rel_dir, count in DIRECTORIES:
        process_directory(rel_dir, count, project_root)

    print("\n🏁 All directories successfully processed and verified!")


if __name__ == "__main__":
    main()
