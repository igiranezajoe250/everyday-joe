"""Synthesize speech from text using Kokoro TTS.

Usage: python synthesize_kokoro.py <out_wav_path> <text...>

Streams chunks through Kokoro's pipeline, concatenates them, writes a single
24 kHz mono WAV. Voice and language are env-configurable so a Kinyarwanda
voice (when available in your local Kokoro install) can be selected without
touching this script.
"""

import os
import sys


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: synthesize_kokoro.py <out.wav> <text...>", file=sys.stderr)
        return 2

    out_path = sys.argv[1]
    text = " ".join(sys.argv[2:]).strip()
    if not text:
        print("empty text", file=sys.stderr)
        return 2

    lang_code = os.environ.get("KOKORO_TTS_LANG", "a")  # 'a' American English
    voice = os.environ.get("KOKORO_TTS_VOICE", "af_heart")
    try:
        speed = float(os.environ.get("KOKORO_TTS_SPEED", "1.0"))
    except ValueError:
        speed = 1.0

    try:
        import numpy as np
        import soundfile as sf
        from kokoro import KPipeline
    except Exception as exc:
        print(f"missing Python dependency for Kokoro TTS: {exc}", file=sys.stderr)
        return 3

    pipeline = KPipeline(lang_code=lang_code)
    chunks = []
    for _, _, audio in pipeline(text, voice=voice, speed=speed):
        chunks.append(np.asarray(audio, dtype="float32"))
    if not chunks:
        print("kokoro produced no audio", file=sys.stderr)
        return 4

    audio = np.concatenate(chunks)
    sf.write(out_path, audio, 24000)
    print(out_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
