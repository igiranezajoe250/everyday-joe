# Everyday Local Voice

Local voice keeps the app UI unchanged and gives the existing microphone flow a local backend.

> **Status:** ffmpeg + Kokoro/Whisper (English STT) + Ollama (phi3:mini) are wired and verified
> on this machine. The frontend calls `127.0.0.1:8787` directly; on a Vercel deploy the calls
> will gracefully fall back to a "Local voice is offline" message. To expose the local service
> publicly, run an ngrok tunnel and set `NEXT_PUBLIC_VOICE_BASE` in Vercel project env.

## Routing

The frontend reads the Profile language setting and sends it with each recording:

- English (`en`) routes to `kokoro`
- Kinyarwanda (`rw`) routes to `digital-umuganda`
- Missing or unknown language falls back to English/Kokoro

The Go service exposes:

```txt
POST http://127.0.0.1:8787/api/voice/transcribe
POST http://127.0.0.1:8787/api/agent/chat
```

Send `multipart/form-data` with:

- `audio`: recorded audio blob
- `language`: `en` or `rw`

Response:

```json
{
  "language": "rw",
  "model": "digital-umuganda",
  "text": "transcribed text here"
}
```

## Folder Layout

```txt
local-voice/
  kokoro/
  digital-umuganda/
  service/
    main.go
    transcribe.go
    config.go
  scripts/
    transcribe_kokoro.py
    transcribe_umuganda.py
  README.md
```

Runtime temp files are written to `local-voice/tmp/` and ignored by git.

## Python Environment

This machine already has a working Kokoro/PyTorch CUDA environment at:

```txt
D:\KokoroAI\kokoro-env
```

The Go service uses that Python automatically when it exists. Override it with:

```powershell
$env:VOICE_PYTHON="D:\KokoroAI\kokoro-env\Scripts\python.exe"
```

Install bridge dependencies in that environment:

```powershell
D:\KokoroAI\kokoro-env\Scripts\python.exe -m pip install torch torchaudio transformers soundfile kokoro
```

For browser `webm` recordings, install FFmpeg and make sure `ffmpeg.exe` is on `PATH`.

## Kokoro / English

Kokoro is installed locally for English voice work. Kokoro itself is a voice generation model, so English speech-to-text is handled by a configurable local ASR bridge while the app route remains `kokoro`.

Default English ASR model:

```powershell
$env:KOKORO_ASR_MODEL="openai/whisper-small.en"
```

Use another local or Hugging Face ASR model by changing `KOKORO_ASR_MODEL`.

## Digital Umuganda / Kinyarwanda

Kinyarwanda voice is routed to the Digital Umuganda bridge. Put the downloaded model files under:

```txt
local-voice/digital-umuganda/
```

Then set either:

```powershell
$env:DIGITAL_UMUGANDA_MODEL_DIR="C:\Users\M16-R2\OneDrive\Desktop\Everyday Joe\local-voice\digital-umuganda"
```

or:

```powershell
$env:DIGITAL_UMUGANDA_MODEL="your-digital-umuganda-asr-model-id"
```

The Go service passes the selected audio file to `scripts/transcribe_umuganda.py`, which loads that model locally through `transformers`.

## Run The Go Backend

```powershell
cd "C:\Users\M16-R2\OneDrive\Desktop\Everyday Joe\local-voice\service"
$env:GOTELEMETRY="off"
go run .
```

The service listens on:

```txt
http://127.0.0.1:8787
```

## Run The App

```powershell
cd "C:\Users\M16-R2\OneDrive\Desktop\Everyday Joe\next-pwa"
npm run dev
```

Open:

```txt
http://localhost:3000/legacy/Poketee.html?app=1
```

## Test English Voice

1. Open Profile.
2. Set Language to English.
3. Go to Plan or choose Voice from Home.
4. Record and save.
5. The frontend sends `language=en`; the backend returns `model=kokoro`.

## Test Kinyarwanda Voice

1. Open Profile.
2. Set Language to Kinyarwanda.
3. Go to Plan or choose Voice from Home.
4. Record and save.
5. The frontend sends `language=rw`; the backend returns `model=digital-umuganda`.

If the Digital Umuganda model is not configured, the backend returns a clear JSON error and the app keeps the recording flow open instead of saving a fake transcript.

## Bounty Agent

Bounty is the app-wide conversational entry point. The button stays pinned in the left corner and uses the same local service:

- Typed messages go to `POST /api/agent/chat`
- Microphone messages are transcribed through `/api/voice/transcribe`, then sent to `/api/agent/chat`
- Profile language still controls English vs Kinyarwanda transcription
- The agent response can include an app route such as `shop`, `commute`, `pay`, `capital`, `plan`, or `listen`

By default, Bounty uses deterministic local routing so the app remains testable without a running LLM. To connect a local LLM, point the service at an Ollama-compatible chat endpoint:

```powershell
$env:BOUNTY_LLM_URL="http://127.0.0.1:11434/api/chat"
$env:BOUNTY_LLM_MODEL="llama3.1"
go run .
```

Examples:

- "Find me a moto to Kigali Heights" returns a Moto/Commute action.
- "I want to buy a phone" returns a Shop action.
- "Help me pay school fees" returns a Pay action.
