import os
import sys


def main() -> int:
    if len(sys.argv) < 2:
        print("missing audio path", file=sys.stderr)
        return 2

    audio_path = sys.argv[1]
    model_id = os.environ.get("DIGITAL_UMUGANDA_MODEL", "").strip()
    local_model_dir = os.environ.get("DIGITAL_UMUGANDA_MODEL_DIR", "").strip()

    model_ref = model_id or local_model_dir
    if not model_ref:
        print(
            "Digital Umuganda model is not configured. Set DIGITAL_UMUGANDA_MODEL "
            "to a local/Hugging Face ASR model id or DIGITAL_UMUGANDA_MODEL_DIR "
            "to a downloaded model folder.",
            file=sys.stderr,
        )
        return 4

    try:
        import torch
        from transformers import pipeline
    except Exception as exc:
        print(f"missing Python dependency for Digital Umuganda bridge: {exc}", file=sys.stderr)
        return 3

    device = 0 if torch.cuda.is_available() else -1
    transcriber = pipeline(
        "automatic-speech-recognition",
        model=model_ref,
        device=device,
    )
    result = transcriber(audio_path)
    text = result.get("text", "") if isinstance(result, dict) else str(result)
    print(" ".join(text.split()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
