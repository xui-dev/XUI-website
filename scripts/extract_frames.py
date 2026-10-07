#!/usr/bin/env python3
"""
XUI Frame Extractor — High Quality
===================================
يستخرج اطارات عالية الجودة من فيديو اصلي ويحفظها في public/frame/

الاستخدام:
    python3 scripts/extract_frames.py path/to/video.mp4

الخيارات:
    --count    عدد الاطارات المطلوبة (افتراضي: 240)
    --quality  جودة JPEG 1-100 (افتراضي: 95)
    --width    عرض الاخراج (افتراضي: 1920)
    --height   ارتفاع الاخراج (افتراضي: 1080)
    --start    ثانية البداية (افتراضي: 0)
    --end      ثانية النهاية (افتراضي: نهاية الفيديو)
    --output   مجلد الاخراج (افتراضي: public/frame)
"""

import cv2
import os
import sys
import argparse
from pathlib import Path


def extract_frames(
    video_path,
    output_dir,
    target_count=240,
    quality=95,
    out_width=1920,
    out_height=1080,
    start_sec=0.0,
    end_sec=None,
):
    if not os.path.exists(video_path):
        print(f"ERROR: الملف غير موجود: {video_path}")
        sys.exit(1)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"ERROR: تعذر فتح الفيديو: {video_path}")
        sys.exit(1)

    native_fps   = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration     = total_frames / native_fps if native_fps > 0 else 0
    vid_w        = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    vid_h        = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"\n  الفيديو : {os.path.basename(video_path)}")
    print(f"  الحجم   : {vid_w}x{vid_h}  |  {native_fps:.2f} fps  |  {duration:.1f}s  |  {total_frames} اطار")

    t_start = max(0.0, start_sec)
    t_end   = min(duration, end_sec) if end_sec is not None else duration
    span    = t_end - t_start

    if span <= 0:
        print("ERROR: النطاق الزمني غير صالح")
        sys.exit(1)

    # توزيع الاطارات بالتساوي على طول النطاق
    timestamps = [t_start + (i / max(target_count - 1, 1)) * span for i in range(target_count)]

    os.makedirs(output_dir, exist_ok=True)

    print(f"\n  استخراج {target_count} اطار  ->  {out_width}x{out_height}  |  JPEG quality={quality}%")
    print(f"  النطاق: {t_start:.1f}s -> {t_end:.1f}s\n")

    encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
    extracted = 0

    for idx, ts in enumerate(timestamps):
        frame_num = idx + 1
        cap.set(cv2.CAP_PROP_POS_MSEC, ts * 1000)
        ret, frame = cap.read()

        if not ret:
            print(f"\n  WARNING: تعذر قراءة الاطار عند {ts:.2f}s")
            continue

        # تغيير الحجم بـ Lanczos4 (افضل جودة)
        if frame.shape[1] != out_width or frame.shape[0] != out_height:
            frame = cv2.resize(frame, (out_width, out_height), interpolation=cv2.INTER_LANCZOS4)

        name_str = f"frame{frame_num:02d}.webp" if frame_num < 100 else f"frame{frame_num}.webp"
        out_path = os.path.join(output_dir, name_str)
        # Save as WebP if .webp or JPEG if .jpg
        if name_str.endswith(".webp"):
            encode_params = [cv2.IMWRITE_WEBP_QUALITY, quality]
        else:
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
        cv2.imwrite(out_path, frame, encode_params)
        extracted += 1

        pct = extracted / target_count * 100
        bar = "#" * int(pct // 2) + "-" * (50 - int(pct // 2))
        print(f"\r  [{bar}] {pct:.0f}%  ({extracted}/{target_count})", end="", flush=True)

    cap.release()
    print(f"\n\n  OK: {extracted} اطار محفوظ في: {output_dir}")

    # التحقق من جودة الاطار الاوسط
    mid_num = target_count // 2
    mid_name = f"frame{mid_num:02d}.webp" if mid_num < 100 else f"frame{mid_num}.webp"
    mid_path = os.path.join(output_dir, mid_name)
    if os.path.exists(mid_path):
        try:
            from PIL import Image
            img  = Image.open(mid_path).convert("RGB")
            w, h = img.size
            crop = img.crop((w // 4, h // 4, 3 * w // 4, 3 * h // 4))
            unique = len(set(crop.getdata()))
            print(f"\n  فحص الجودة (الاطار {target_count // 2}):")
            print(f"  الالوان الفريدة: {unique:,}")
            if unique > 100_000:
                print("  PASS: جودة ممتازة — لا مشكلة الوان")
            elif unique > 20_000:
                print("  WARN: جودة متوسطة — تحقق من مصدر الفيديو")
            else:
                print("  FAIL: الجودة منخفضة — الفيديو المصدر به مشكلة")
        except ImportError:
            print("  (تثبيت PIL لتفعيل فحص الجودة: pip3 install Pillow)")


def main():
    parser = argparse.ArgumentParser(description="XUI Frame Extractor")
    parser.add_argument("video",              help="مسار الفيديو المصدر")
    parser.add_argument("--count",   type=int,   default=240)
    parser.add_argument("--quality", type=int,   default=95)
    parser.add_argument("--width",   type=int,   default=1920)
    parser.add_argument("--height",  type=int,   default=1080)
    parser.add_argument("--start",   type=float, default=0.0)
    parser.add_argument("--end",     type=float, default=None)
    parser.add_argument("--output",  type=str,   default=None)

    args = parser.parse_args()

    if args.output is None:
        project_root = Path(__file__).parent.parent
        output_dir   = str(project_root / "public" / "frame")
    else:
        output_dir = args.output

    extract_frames(
        video_path   = args.video,
        output_dir   = output_dir,
        target_count = args.count,
        quality      = args.quality,
        out_width    = args.width,
        out_height   = args.height,
        start_sec    = args.start,
        end_sec      = args.end,
    )


if __name__ == "__main__":
    main()
