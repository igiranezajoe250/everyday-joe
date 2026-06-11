import os
import sys


def main() -> int:
    if len(sys.argv) < 2:
        print("missing audio path", file=sys.stderr)
        return 2

    audio_path = sys.argv[1]
    model_id = os.environ.get("KOKORO_ASR_MODEL", "openai/whisper-small.en")

    try:
        import torch
        from transformers import pipeline
    except Exception as exc:
        print(f"missing Python dependency for Kokoro bridge: {exc}", file=sys.stderr)
        return 3

    device = 0 if torch.cuda.is_available() else -1
    transcriber = pipeline(
        "automatic-speech-recognition",
        model=model_id,
        device=device,
    )
    result = transcriber(audio_path)
    text = result.get("text", "") if isinstance(result, dict) else str(result)
    print(" ".join(text.split()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
