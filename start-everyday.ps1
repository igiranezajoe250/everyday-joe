# start-everyday.ps1 — One command to run the whole stack locally.
#
#   1. Ensures ollama serve is up
#   2. Picks the best installed model (qwen3:8b > qwen3:4b > gemma3:4b)
#   3. Builds + launches the Go agent in the BACKGROUND on :8787
#   4. Runs the Next.js dev server in the FOREGROUND (Ctrl+C stops everything)
#
# The frontend reaches the agent at 127.0.0.1:8787 automatically.
# First time (no model pulled yet)? Run local-voice\start-local-ai.ps1 once to
# download a model, then use this for day-to-day.

$ErrorActionPreference = "Stop"
$root   = $PSScriptRoot
$svcDir = Join-Path $root "local-voice\service"

function Info($m) { Write-Host "  $m" -ForegroundColor Cyan }
function Warn($m) { Write-Host "  $m" -ForegroundColor Yellow }

Write-Host "`nEveryday — full stack`n" -ForegroundColor White

# ── Ollama ────────────────────────────────────────────────────────────────────
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
  Warn "Ollama not installed (https://ollama.com/download). Bounty will fall back to Gemma online if GOOGLE_AI_KEY is set."
} else {
  $up = $false
  try { Invoke-RestMethod "http://127.0.0.1:11434/api/version" -TimeoutSec 2 | Out-Null; $up = $true } catch {}
  if (-not $up) {
    Info "Starting ollama serve..."
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    for ($i = 0; $i -lt 20; $i++) { Start-Sleep -Milliseconds 500; try { Invoke-RestMethod "http://127.0.0.1:11434/api/version" -TimeoutSec 2 | Out-Null; break } catch {} }
  }
}

# Pick the best installed model: Qwen preferred, Gemma fallback.
$model = "gemma3:4b"
try {
  $installed = (& ollama list 2>$null | Out-String)
  foreach ($m in @("qwen3:8b", "qwen3:4b", "gemma3:4b")) {
    if ($installed -match [regex]::Escape($m)) { $model = $m; break }
  }
} catch {}
Info "Agent model: $model"

# ── Agent (background) ────────────────────────────────────────────────────────
Info "Building agent..."
Push-Location $svcDir
try { & go build -o "local-voice.exe" . } finally { Pop-Location }

$agentExe = Join-Path $svcDir "local-voice.exe"
$env:BOUNTY_LLM_MODEL = $model
$env:BOUNTY_LLM_URL   = "http://127.0.0.1:11434/api/chat"
$env:VOICE_SERVICE_ADDR = "127.0.0.1:8787"
$agent = Start-Process -FilePath $agentExe -PassThru -WindowStyle Hidden
Info "Agent running in background (pid $($agent.Id)) on http://127.0.0.1:8787"

# ── Dev server (foreground) ───────────────────────────────────────────────────
Write-Host "`nStarting Next.js dev server (Ctrl+C to stop everything)...`n" -ForegroundColor Green
try {
  & npm --prefix (Join-Path $root "next-pwa") run dev
}
finally {
  # Stop the background agent when the dev server exits.
  if ($agent -and -not $agent.HasExited) {
    Info "Stopping agent (pid $($agent.Id))..."
    Stop-Process -Id $agent.Id -Force -ErrorAction SilentlyContinue
  }
}
