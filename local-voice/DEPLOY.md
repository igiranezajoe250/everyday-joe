# Deploying the Everyday agent service

There are two container images, by need:

| Image | File | Contains | Use when |
|-------|------|----------|----------|
| **Chat (lean)** | `service/Dockerfile` | Go agent only | Text chat / Bounty / Save expert. First testers. |
| **Voice (full)** | `Dockerfile.voice` | Go agent + Python ASR/TTS (Whisper + Kokoro) | Testers need the microphone. |

The chat image is small and starts fast. The voice image is large (Torch + Whisper)
and is the heavier path — only build it when voice is actually needed.

## Chat image (recommended first)

Render Blueprint (`service/render.yaml`) or manually:

```bash
cd local-voice/service
docker build -t everyday-agent .
docker run -p 8787:8787 \
  -e GEMINI_API_KEY=<google-ai-studio-key> \
  -e GEMINI_MODEL=gemini-3.5-flash \
  -e LLM_OPENAI_BASE_URL=https://<hosted-qwen>/v1 \
  -e LLM_OPENAI_MODEL=Qwen/Qwen3-8B \
  -e LLM_OPENAI_KEY=sk-... \
  -e GOOGLE_GEMMA_MODEL=gemma-3-4b-it \
  -e EVERYDAY_API_BASE=https://<your-app>.vercel.app \
  -e ALLOWED_ORIGINS=https://<your-app>.vercel.app \
  everyday-agent
```

## Voice image (microphone)

```bash
cd local-voice
docker build -f Dockerfile.voice -t everyday-agent-voice .
docker run -p 8787:8787 \
  -e GEMINI_API_KEY=... -e GEMINI_MODEL=gemini-3.5-flash \
  -e LLM_OPENAI_BASE_URL=... -e LLM_OPENAI_MODEL=... -e LLM_OPENAI_KEY=... \
  -e GOOGLE_GEMMA_MODEL=gemma-3-4b-it \
  -e EVERYDAY_API_BASE=... -e ALLOWED_ORIGINS=... \
  everyday-agent-voice
```

The model chain is Gemini API primary, Qwen fallback, then Gemma fallback. Keep
`GEMINI_API_KEY` / `GOOGLE_API_KEY` on the service only; do not expose it through
the static frontend or mobile app.

**Resources:** Whisper-small + Torch (CPU) need ~3–4 GB RAM. This OOMs on tiny
instances (e.g. Render starter) — use a ≥4 GB host, or a GPU box for real-time
latency. Models download on first request into `HF_HOME` (`/app/hf-cache`);
the first transcription/synthesis after a cold start is slow while they fetch.
Kinyarwanda (Digital Umuganda) is optional — set `DIGITAL_UMUGANDA_MODEL` to a
HF ASR id to enable it.

## Frontend wiring

The static legacy frontend reaches the agent via `window.__EVERYDAY_VOICE_BASE__`.
Share the app link once with `?voiceBase=https://<agent-host>` — it persists to
`localStorage`, so testers don't need the param on later visits.
