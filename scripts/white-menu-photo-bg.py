#!/usr/bin/env python3
"""메뉴 사진 가장자리 검은 배경을 흰색으로 치환 (flood fill)."""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MENUS_DIR = ROOT / "assets" / "menus"
THRESH = 32


def is_dark_bg(px: tuple[int, ...]) -> bool:
    if len(px) == 4 and px[3] < 12:
        return True
    return px[0] <= THRESH and px[1] <= THRESH and px[2] <= THRESH


def corner_is_dark(im: Image.Image) -> bool:
    w, h = im.size
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    dark = sum(1 for c in corners if is_dark_bg(im.getpixel(c)))
    return dark >= 3


def replace_dark_bg(im: Image.Image) -> tuple[Image.Image, int]:
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    seen: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        if is_dark_bg(px[x, y]):
            seen.add((x, y))
            q.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    replaced = 0
    while q:
        x, y = q.popleft()
        px[x, y] = (255, 255, 255, 255)
        replaced += 1
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and is_dark_bg(px[nx, ny]):
                seen.add((nx, ny))
                q.append((nx, ny))

    out = Image.new("RGB", (w, h), (255, 255, 255))
    out.paste(rgba, mask=rgba.split()[3])
    return out, replaced


def main() -> int:
    paths = sorted(MENUS_DIR.rglob("*.jpg"))
    changed = []
    for path in paths:
        im = Image.open(path)
        if not corner_is_dark(im):
            continue
        out, n = replace_dark_bg(im)
        if n < 50:
            continue
        out.save(path, "JPEG", quality=92, optimize=True)
        changed.append((str(path.relative_to(ROOT)), n))

    for rel, n in changed:
        print(f"  {rel} ({n}px)")
    print(f"Done — {len(changed)} / {len(paths)} images")
    return 0


if __name__ == "__main__":
    sys.exit(main())
