package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type synthesizeRequest struct {
	Text     string `json:"text"`
	Language string `json:"language"`
}

// handleSynthesize runs Kokoro TTS over the supplied text and streams the
// resulting WAV back. Kokoro doesn't (yet) ship a Kinyarwanda voice, so when
// language=rw we still attempt synthesis with the configured voice — the
// caller can swap KOKORO_TTS_VOICE/KOKORO_TTS_LANG in env when a Kinyarwanda
// voice model is installed.
func handleSynthesize(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, voiceError{Error: "method not allowed"})
			return
		}
		defer r.Body.Close()

		var req synthesizeRequest
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, voiceError{Error: "read json: " + err.Error()})
			return
		}
		text := strings.TrimSpace(req.Text)
		if text == "" {
			writeJSON(w, http.StatusBadRequest, voiceError{Error: "missing text"})
			return
		}

		outPath := filepath.Join(cfg.TempDir, "tts_"+strconv.FormatInt(time.Now().UnixNano(), 10)+".wav")
		ctx, cancel := context.WithTimeout(r.Context(), 60*time.Second)
		defer cancel()
		cmd := exec.CommandContext(ctx, cfg.PythonBin, cfg.SynthesizeScript, outPath, text)
		cmd.Env = append(os.Environ(),
			"HF_HOME="+cfg.HFHome,
			"PYTHONUNBUFFERED=1",
			"KOKORO_TTS_SPEED="+env("KOKORO_TTS_SPEED", "1.16"),
		)
		out, err := cmd.CombinedOutput()
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, voiceError{Error: "kokoro tts: " + err.Error() + " — " + strings.TrimSpace(string(out))})
			return
		}
		f, err := os.Open(outPath)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, voiceError{Error: "open synthesized wav: " + err.Error()})
			return
		}
		defer func() {
			_ = f.Close()
			_ = os.Remove(outPath)
		}()
		info, err := f.Stat()
		if err == nil && info.Size() == 0 {
			writeJSON(w, http.StatusInternalServerError, voiceError{Error: "synthesized wav is empty"})
			return
		}
		w.Header().Set("Content-Type", "audio/wav")
		w.Header().Set("Cache-Control", "no-store")
		if info != nil {
			w.Header().Set("Content-Length", strconv.FormatInt(info.Size(), 10))
		}
		if _, err := io.Copy(w, f); err != nil && !errors.Is(err, context.Canceled) {
			// can't change status mid-stream; log via stderr
			_, _ = os.Stderr.WriteString("tts stream: " + err.Error() + "\n")
		}
	}
}
