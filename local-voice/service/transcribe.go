package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type voiceResponse struct {
	Language string `json:"language"`
	Model    string `json:"model"`
	Text     string `json:"text"`
}

type voiceError struct {
	Error string `json:"error"`
}

type jsonVoiceRequest struct {
	Audio    string `json:"audio"`
	Language string `json:"language"`
	Filename string `json:"filename"`
}

func handleTranscribe(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, voiceError{Error: "method not allowed"})
			return
		}

		audioPath, language, cleanup, err := saveRequestAudio(cfg, r)
		if cleanup != nil {
			defer cleanup()
		}
		if err != nil {
			writeJSON(w, http.StatusBadRequest, voiceError{Error: err.Error()})
			return
		}

		modelName, scriptKey := routeModel(language)
		scriptPath := cfg.KokoroScript
		if scriptKey == "umuganda" {
			scriptPath = cfg.UmugandaScript
		}

		text, err := runTranscriber(cfg, scriptPath, audioPath, normalizeLanguage(language))
		if err != nil {
			writeJSON(w, http.StatusBadGateway, voiceError{Error: err.Error()})
			return
		}

		writeJSON(w, http.StatusOK, voiceResponse{
			Language: normalizeLanguage(language),
			Model:    modelName,
			Text:     text,
		})
	}
}

func saveRequestAudio(cfg Config, r *http.Request) (string, string, func(), error) {
	ct := r.Header.Get("Content-Type")
	if strings.HasPrefix(ct, "multipart/form-data") {
		return saveMultipartAudio(cfg, r)
	}
	if strings.HasPrefix(ct, "application/json") {
		return saveJSONAudio(cfg, r)
	}
	return "", "", nil, errors.New("send audio as multipart/form-data or JSON base64")
}

func saveMultipartAudio(cfg Config, r *http.Request) (string, string, func(), error) {
	if err := r.ParseMultipartForm(64 << 20); err != nil {
		return "", "", nil, fmt.Errorf("read form: %w", err)
	}
	language := r.FormValue("language")
	file, header, err := r.FormFile("audio")
	if err != nil {
		return "", "", nil, errors.New("missing audio file field named audio")
	}
	defer file.Close()
	path, cleanup, err := writeTempAudio(cfg, file, safeExt(header))
	return path, language, cleanup, err
}

func saveJSONAudio(cfg Config, r *http.Request) (string, string, func(), error) {
	defer r.Body.Close()
	var req jsonVoiceRequest
	if err := json.NewDecoder(io.LimitReader(r.Body, 64<<20)).Decode(&req); err != nil {
		return "", "", nil, fmt.Errorf("read json: %w", err)
	}
	if strings.TrimSpace(req.Audio) == "" {
		return "", "", nil, errors.New("missing audio base64")
	}
	raw := req.Audio
	if i := strings.Index(raw, ","); strings.HasPrefix(raw, "data:") && i >= 0 {
		raw = raw[i+1:]
	}
	data, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return "", "", nil, fmt.Errorf("decode audio: %w", err)
	}
	path, cleanup, err := writeTempAudio(cfg, bytes.NewReader(data), extFromName(req.Filename))
	return path, req.Language, cleanup, err
}

func writeTempAudio(cfg Config, src io.Reader, ext string) (string, func(), error) {
	if err := ensureDir(cfg.TempDir); err != nil {
		return "", nil, err
	}
	if ext == "" {
		ext = ".webm"
	}
	f, err := os.CreateTemp(cfg.TempDir, "voice-*"+ext)
	if err != nil {
		return "", nil, err
	}
	defer f.Close()
	if _, err := io.Copy(f, src); err != nil {
		_ = os.Remove(f.Name())
		return "", nil, err
	}
	return f.Name(), func() { _ = os.Remove(f.Name()) }, nil
}

func runTranscriber(cfg Config, scriptPath, audioPath, language string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 4*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, cfg.PythonBin, scriptPath, audioPath)
	cmd.Env = append(os.Environ(),
		"HF_HOME="+cfg.HFHome,
		"KOKORO_ASR_MODEL="+cfg.KokoroASRModel,
		"DIGITAL_UMUGANDA_MODEL="+cfg.DigitalUmugandaModel,
		"DIGITAL_UMUGANDA_MODEL_DIR="+cfg.DigitalUmugandaFolder,
		"VOICE_LANGUAGE="+language,
	)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if ctx.Err() == context.DeadlineExceeded {
		return "", errors.New("voice transcription timed out")
	}
	if err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg == "" {
			msg = err.Error()
		}
		return "", errors.New(msg)
	}
	text := strings.TrimSpace(string(out))
	if text == "" {
		return "", errors.New("transcription returned empty text")
	}
	return text, nil
}

func ensureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

func safeExt(header *multipart.FileHeader) string {
	if header == nil {
		return ".webm"
	}
	return extFromName(header.Filename)
}

func extFromName(name string) string {
	ext := strings.ToLower(filepath.Ext(name))
	switch ext {
	case ".wav", ".webm", ".ogg", ".mp3", ".m4a":
		return ext
	default:
		return ".webm"
	}
}
