#!/usr/bin/env python3
"""Render a silent MORVS directory walkthrough from a recorded session and live MCP metadata."""

from __future__ import annotations

import json
import re
import subprocess
import urllib.request
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SESSION = ROOT / "submission/demo/codex-session-2026-10-09.json"
LOGO = ROOT / "plugins/morvs/assets/logo-512.png"
OUT = ROOT / "dist/morvs-plugin-demo-2026-10-09.mp4"
FRAMES = ROOT / "dist/frames"
MCP_URL = "https://api.morvs.ai/mcp"

WIDTH, HEIGHT, FPS = 1280, 720, 24
DURATIONS = (5, 10, 45, 10, 8)
BG = "#050607"
TEXT = "#EDF1F2"
MUTED = "#8A9499"
ACCENT = "#4FA3FF"
PANEL = "#101315"
BORDER = "#2A3034"


def font(size: int, mono: bool = False) -> ImageFont.FreeTypeFont:
    paths = (
        ["/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/Supplemental/Courier New.ttf"]
        if mono
        else ["/System/Library/Fonts/SFNS.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"]
    )
    paths += ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf" if mono else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


FONTS = {size: font(size) for size in (26, 27, 28, 30, 32, 38, 46, 56, 94)}
MONO = {size: font(size, mono=True) for size in (20, 22, 24, 26, 28)}
LOGO_IMAGE = Image.open(LOGO).convert("RGBA")


def mcp_call(method: str, params: dict, request_id: int) -> dict:
    request = urllib.request.Request(
        MCP_URL,
        data=json.dumps({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}).encode(),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "User-Agent": "curl/8.7.1",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        payload = response.read().decode("utf-8")
    if payload.startswith("data:"):
        payload = next(line[5:].strip() for line in payload.splitlines() if line.startswith("data:"))
    result = json.loads(payload)
    if "error" in result:
        raise RuntimeError(f"MCP {method} failed: {result['error']}")
    return result["result"]


def live_safety_data() -> tuple[int, list[str], str | None]:
    tools = mcp_call("tools/list", {}, 1)["tools"]
    read_only_count = sum(tool.get("annotations", {}).get("readOnlyHint") is True for tool in tools)
    if not tools or read_only_count != len(tools):
        raise RuntimeError(f"Cannot claim all tools are read-only: {read_only_count}/{len(tools)}")
    title_names = (
        "resolve",
        "company_profile",
        "fda_firm_dossier",
        "sanctions_check",
        "debarments_check",
        "dataset_freshness",
        "short_interest_search",
        "search",
    )
    by_name = {tool["name"]: tool for tool in tools}
    titles = []
    for name in title_names:
        tool = by_name[name]
        titles.append(tool.get("title") or tool["annotations"]["title"])

    bad_call = mcp_call("tools/call", {"name": "cluster_buys", "arguments": {"days": "not-a-number"}}, 2)
    error_text = None
    if bad_call.get("isError") is True:
        error_text = "\n".join(item["text"] for item in bad_call.get("content", []) if item.get("type") == "text")
        if not error_text:
            raise RuntimeError("Invalid call reported isError but supplied no response text")
    return read_only_count, titles, error_text


def recorded_data() -> tuple[dict, list[dict], list[list[str]], list[list[str]], list[str]]:
    session = json.loads(SESSION.read_text())
    calls = [step for step in session["steps"] if step["kind"] == "tool"]
    if len(calls) != 4 or any(step["server"] != "morvs" or step["status"] != "completed" for step in calls):
        raise RuntimeError("The recorded session no longer has four completed MORVS calls")
    wanted = {
        "resolve": ("canonical_name", "cik", "ticker"),
        "sanctions_check": ("name", "hit", "primary_matches"),
        "debarments_check": ("name", "hit", "sam_federal_contractor_ban"),
        "fda_firm_dossier": ("window_days", "recalls", "clearances"),
    }
    excerpts = []
    for step in calls:
        lines = step["result_excerpt"].splitlines()
        selected = []
        for key in wanted[step["tool"]]:
            selected.append(next(line for line in lines if line.strip().startswith(f'"{key}":')))
        excerpts.append(selected)

    answer = session["steps"][-1]["text"]
    table_lines = [line for line in answer.splitlines() if line.startswith("|")]
    clean = lambda cell: re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", cell).replace("**", "").strip()
    table = [[clean(cell) for cell in line.strip("|").split("|")] for line in table_lines]
    if len(table) != 6 or len(table[0]) != 3 or len(table[2:]) != 4:
        raise RuntimeError("The recorded final answer table has changed")
    caveat = [line.strip().replace("**", "") for line in answer.splitlines() if line.startswith("The indexes")]
    if len(caveat) != 1:
        raise RuntimeError("The recorded final answer caveat is missing")
    return session, calls, excerpts, table[0:1] + table[2:], caveat


def new_frame() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGB", (WIDTH, HEIGHT), BG)
    return image, ImageDraw.Draw(image)


def line(draw: ImageDraw.ImageDraw, y: int) -> None:
    draw.line((70, y, 1210, y), fill=BORDER, width=2)


def panel(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    draw.rounded_rectangle(box, radius=20, fill=PANEL, outline=BORDER, width=2)


def wrap(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    if not words:
        return [""]
    result = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        if draw.textlength(trial, font=face) <= max_width:
            current = trial
        else:
            result.append(current)
            current = word
    result.append(current)
    if any(draw.textlength(value, font=face) > max_width for value in result):
        raise RuntimeError(f"Text exceeds its layout column: {text}")
    return result


def text_lines(draw: ImageDraw.ImageDraw, xy: tuple[int, int], lines: list[str], face: ImageFont.FreeTypeFont, fill: str, leading: int) -> None:
    x, y = xy
    for value in lines:
        draw.text((x, y), value, font=face, fill=fill)
        y += leading


def brand(image: Image.Image, xy: tuple[int, int], size: int) -> None:
    logo = LOGO_IMAGE.resize((size, size), Image.Resampling.LANCZOS)
    image.paste(logo, xy, logo)


def heading(draw: ImageDraw.ImageDraw, eyebrow: str, title: str) -> None:
    draw.rectangle((70, 38, 75, 88), fill=ACCENT)
    draw.text((92, 36), eyebrow, font=FONTS[26], fill=MUTED)
    draw.text((70, 78), title, font=FONTS[46], fill=TEXT)


def session_footer(draw: ImageDraw.ImageDraw) -> None:
    line(draw, 602)
    draw.text((70, 615), "Real Codex session recorded 2026-10-09 against", font=FONTS[26], fill=MUTED)
    draw.text((70, 651), "https://api.morvs.ai/mcp · tool results unedited", font=FONTS[26], fill=MUTED)


def title_frame() -> Image.Image:
    image, draw = new_frame()
    brand(image, (80, 226), 174)
    draw.text((296, 227), "MORVS for Claude and Codex", font=FONTS[56], fill=TEXT)
    draw.text((298, 322), "Source-linked US public records · read-only · no API key", font=FONTS[30], fill=MUTED)
    draw.rectangle((298, 393, 454, 398), fill=ACCENT)
    line(draw, 620)
    draw.text((80, 647), "A recorded public-record research walkthrough", font=FONTS[26], fill=MUTED)
    return image


def install_frame() -> Image.Image:
    image, draw = new_frame()
    heading(draw, "01 / INSTALL", "Connect MORVS")
    panel(draw, (70, 154, 1210, 587))
    draw.text((101, 178), "Claude Code", font=FONTS[30], fill=TEXT)
    draw.text((102, 217), "/plugin marketplace add morvs-ai/morvs-plugins", font=MONO[24], fill=ACCENT)
    draw.text((102, 252), "/plugin install morvs@morvs", font=MONO[24], fill=ACCENT)
    line(draw, 302)
    draw.text((101, 320), "Codex", font=FONTS[30], fill=TEXT)
    draw.text((102, 359), "codex plugin marketplace add morvs-ai/morvs-plugins", font=MONO[24], fill=ACCENT)
    draw.text((102, 394), "codex plugin add morvs@morvs", font=MONO[24], fill=ACCENT)
    line(draw, 442)
    draw.text((101, 460), "ChatGPT / Claude apps / any MCP client", font=FONTS[28], fill=TEXT)
    draw.text((102, 504), MCP_URL, font=MONO[26], fill=ACCENT)
    draw.text((70, 638), "Public HTTPS endpoint · no API key", font=FONTS[27], fill=MUTED)
    return image


def prompt_frame(prompt: str) -> Image.Image:
    image, draw = new_frame()
    heading(draw, "02 / RECORDED SESSION", "The prompt")
    panel(draw, (70, 155, 1210, 572))
    draw.text((102, 180), "codex exec", font=MONO[26], fill=ACCENT)
    line(draw, 224)
    lines = wrap(draw, prompt, FONTS[30], 1075)
    text_lines(draw, (103, 255), lines, FONTS[30], TEXT, 44)
    session_footer(draw)
    return image


def tool_frame(step: dict, excerpt: list[str], number: int) -> Image.Image:
    image, draw = new_frame()
    heading(draw, "02 / RECORDED SESSION", f"MORVS tool call {number} / 4")
    panel(draw, (70, 155, 1210, 572))
    call = f"morvs.{step['tool']} {json.dumps(step['arguments'], ensure_ascii=False, separators=(',', ':'))}"
    draw.text((102, 197), call, font=MONO[26], fill=ACCENT)
    line(draw, 273)
    draw.text((103, 300), "Result excerpt · selected original lines", font=FONTS[27], fill=MUTED)
    text_lines(draw, (102, 361), excerpt, MONO[26], TEXT, 49)
    session_footer(draw)
    return image


def answer_frame(table: list[list[str]], caveat: list[str]) -> Image.Image:
    image, draw = new_frame()
    heading(draw, "02 / RECORDED SESSION", "Final answer")
    left, top = 70, 150
    widths = (270, 610, 260)
    row_heights = (49, 71, 123, 78, 78)
    x_positions = (left, left + widths[0], left + widths[0] + widths[1], left + sum(widths))
    y = top
    for row_index, row in enumerate(table):
        height = row_heights[row_index]
        fill = PANEL if row_index % 2 == 0 else BG
        draw.rectangle((left, y, x_positions[-1], y + height), fill=fill)
        for column, value in enumerate(row):
            face = FONTS[26]
            lines = wrap(draw, value, face, widths[column] - 25)
            if len(lines) * 32 > height - 7:
                raise RuntimeError(f"Recorded answer does not fit table row {row_index}: {value}")
            text_lines(draw, (x_positions[column] + 12, y + 8), lines, face, MUTED if row_index == 0 else TEXT, 32)
        y += height
        draw.line((left, y, x_positions[-1], y), fill=BORDER, width=1)
    for x in x_positions[1:-1]:
        draw.line((x, top, x, y), fill=BORDER, width=1)
    caveat_lines = wrap(draw, caveat[0], FONTS[27], 1120)
    text_lines(draw, (75, 563), caveat_lines, FONTS[27], TEXT, 34)
    session_footer(draw)
    return image


def safety_frame(count: int, titles: list[str], error_text: str | None, show_error: bool) -> Image.Image:
    image, draw = new_frame()
    heading(draw, "03 / LIVE MCP CHECK", "Read-only tool inventory")
    draw.text((70, 154), str(count), font=FONTS[94], fill=ACCENT)
    draw.text((228, 207), "tools · all read-only", font=FONTS[38], fill=TEXT)
    draw.text((70, 288), "Live tool titles", font=FONTS[30], fill=MUTED)
    for index, title in enumerate(titles):
        x = 70 if index % 2 == 0 else 658
        y = 337 + (index // 2) * 51
        draw.rectangle((x, y + 7, x + 5, y + 36), fill=ACCENT)
        draw.text((x + 20, y), title, font=FONTS[27], fill=TEXT)
    if show_error and error_text:
        panel(draw, (70, 544, 1210, 653))
        draw.text((102, 551), "Bad input gets a clear error", font=FONTS[27], fill=TEXT)
        # The response's first original line fits the four-second error hold.
        lines = wrap(draw, error_text.splitlines()[0], MONO[20], 1065)
        if len(lines) > 3:
            raise RuntimeError("Live MCP error line is too long to display")
        text_lines(draw, (103, 584), lines, MONO[20], TEXT, 22)
    line(draw, 661)
    draw.text((70, 676), MCP_URL, font=FONTS[26], fill=MUTED)
    return image


def close_frame() -> Image.Image:
    image, draw = new_frame()
    brand(image, (70, 64), 103)
    draw.text((207, 90), "AI Analytics LLC · MORVS", font=FONTS[46], fill=TEXT)
    draw.rectangle((70, 203, 220, 208), fill=ACCENT)
    draw.text((70, 253), "Privacy", font=FONTS[28], fill=MUTED)
    draw.text((70, 292), "morvs.ai/privacy", font=FONTS[32], fill=TEXT)
    draw.text((650, 253), "Terms", font=FONTS[28], fill=MUTED)
    draw.text((650, 292), "morvs.ai/terms", font=FONTS[32], fill=TEXT)
    draw.text((70, 405), "Docs", font=FONTS[28], fill=MUTED)
    draw.text((70, 444), "morvs.ai/api/mcp", font=FONTS[32], fill=TEXT)
    draw.text((650, 405), "Support", font=FONTS[28], fill=MUTED)
    draw.text((650, 444), "info@morvs.ai", font=FONTS[32], fill=TEXT)
    line(draw, 606)
    draw.text((70, 639), "Source-linked US public records", font=FONTS[28], fill=MUTED)
    return image


def main() -> None:
    session, calls, excerpts, table, caveat = recorded_data()
    count, titles, error_text = live_safety_data()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    FRAMES.mkdir(parents=True, exist_ok=True)

    static = {
        "title": title_frame(),
        "install": install_frame(),
        "answer": answer_frame(table, caveat),
        "safety": safety_frame(count, titles, error_text, False),
        "close": close_frame(),
    }
    tool_images = [tool_frame(step, excerpt, i + 1) for i, (step, excerpt) in enumerate(zip(calls, excerpts))]
    error_image = safety_frame(count, titles, error_text, True) if error_text else None
    prompt = session["prompt"]
    blank = Image.new("RGB", (WIDTH, HEIGHT), BG)

    def frame_at(scene: int, elapsed: float) -> Image.Image:
        if scene == 0:
            return static["title"]
        if scene == 1:
            return static["install"]
        if scene == 2:
            if elapsed < 13:
                char_count = min(len(prompt), int(elapsed / 3.5 * len(prompt)))
                return prompt_frame(prompt[:char_count])
            if elapsed < 25:
                return tool_images[int((elapsed - 13) // 3)]
            return static["answer"]
        if scene == 3:
            return error_image if error_image is not None and elapsed >= 6 else static["safety"]
        return static["close"]

    for number, (scene, elapsed) in enumerate(((0, 2.5), (1, 5), (2, 34), (3, 4), (4, 4)), 1):
        frame_at(scene, elapsed).save(FRAMES / f"scene-{number}.png")

    command = [
        imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error",
        "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", f"{WIDTH}x{HEIGHT}",
        "-framerate", str(FPS), "-i", "-", "-an", "-c:v", "libx264",
        "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(OUT),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        for scene, duration in enumerate(DURATIONS):
            for index in range(duration * FPS):
                elapsed = index / FPS
                opacity = min(1.0, elapsed / 0.28, (duration - elapsed) / 0.28)
                image = frame_at(scene, elapsed)
                if opacity < 1:
                    image = Image.blend(blank, image, max(0, opacity))
                process.stdin.write(image.tobytes())
        process.stdin.close()
        stderr = process.stderr.read().decode("utf-8", errors="replace")
        if process.wait() != 0:
            raise RuntimeError(f"ffmpeg failed: {stderr[-1000:]}")
    except Exception:
        process.kill()
        process.wait()
        raise
    size = OUT.stat().st_size
    if size >= 8_000_000:
        raise RuntimeError(f"Video exceeds the 8 MB target: {size} bytes")
    print(f"Live MCP: {count}/{count} tools annotated read-only; invalid-call isError={str(error_text is not None).lower()}")
    print(f"Wrote {OUT.relative_to(ROOT)} ({size} bytes, {sum(DURATIONS)} s, {FPS} fps)")
    print("Wrote dist/frames/scene-1.png through scene-5.png")


if __name__ == "__main__":
    main()
