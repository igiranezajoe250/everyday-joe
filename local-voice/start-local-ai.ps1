# start-local-ai.ps1 — One command to bring up the local Bounty brain.
#
#   1. Ensures `ollama serve` is running (starts it hidden if not)
#   2. Ensures the Qwen model is pulled (default qwen3:8b)
#   3. Builds and launches the Go agent service on :8787 (foreground, with logs)
#
# Usage:
#   ./start-local-ai.ps1                 # qwen3:8b (best quality)
#   ./start-local-ai.ps1 -Model qwen3:4b # smaller + much faster on a CPU laptop
#
# The frontend (npm run dev in next-pwa) reaches this at 127.0.0.1:8787 by
# default — no extra config needed for local testing.

param(
  [string]$Model = ""   # empty = auto-pick: qwen3:8b > qwen3:4b > gemma3:4b
)

$ErrorActionPreference = "Stop"
$svcDir = Join-Path $PSScriptRoot "service"

# Pick the best already-installed model unless one was named. Prefers Qwen (the
# default brain); falls back to Gemma so Bounty always has something to run.
function Resolve-Model([string]$requested) {
  if ($requested) { return $requested }
  $installed = (& ollama list 2>$null | Out-String)
  foreach ($m in @("qwen3:8b", "qwen3:4b", "gemma3:4b")) {
    if ($installed -match [regex]::Escape($m)) { return $m }
  }
  return "qwen3:4b"  # nothing installed yet — we'll pull this
}

function Info($m) { Write-Host "  $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "  $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  $m" -ForegroundColor Yellow }

Write-Host "`nEveryday — local AI bringup" -ForegroundColor White

# ── 1. Ollama ────────────────────────────────────────────────────────────────
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  Warn "Ollama is not installed. Get it at https://ollama.com/download then re-run."
  exit 1
}

$ollamaUp = $false
try {
  Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/version" -TimeoutSec 2 | Out-Null
  $ollamaUp = $true
} catch { $ollamaUp = $false }

if (-not $ollamaUp) {
  Info "Starting ollama serve (background)..."
  Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 500
    try { Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/version" -TimeoutSec 2 | Out-Null; $ollamaUp = $true; break } catch {}
  }
  if (-not $ollamaUp) { Warn "Ollama did not come up. Start it manually and re-run."; exit 1 }
}
Ok "Ollama is running."

# ── 2. Model ─────────────────────────────────────────────────────────────────
$Model = Resolve-Model $Model
Info "Using model: $Model"
$have = (& ollama list) -match [regex]::Escape($Model)
if (-not $have) {
  Info "Pulling $Model (one-time download, several GB)..."
  & ollama pull $Model
}
Ok "Model $Model is ready."

# ── 3. Agent service ─────────────────────────────────────────────────────────
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
  Warn "Go is not installed. Get it at https://go.dev/dl then re-run."
  exit 1
}

Info "Building agent service..."
Push-Location $svcDir
try {
  & go build -o "local-voice.exe" .
  Ok "Built. Launching on http://127.0.0.1:8787  (Ctrl+C to stop)`n"

  # Qwen is the local default; Gemma 3 (if GOOGLE_AI_KEY is set) stays as fallback.
  $env:BOUNTY_LLM_MODEL  = $Model
  $env:BOUNTY_LLM_URL    = "http://127.0.0.1:11434/api/chat"
  if (-not $env:EVERYDAY_API_BASE) { $env:EVERYDAY_API_BASE = "http://localhost:3000" }

  # CORS — allow local dev AND the deployed Vercel frontend so the browser can
  # call 127.0.0.1:8787 from either origin without a preflight block.
  if (-not $env:ALLOWED_ORIGINS) {
    $env:ALLOWED_ORIGINS = "https://everyday-joe.vercel.app,https://everyday-joe-joseph-igiranezas-projects.vercel.app"
  }

  & ".\local-voice.exe"
}
finally {
  Pop-Location
}
