package main

import (
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	Addr                  string
	PythonBin             string
	KokoroScript          string
	UmugandaScript        string
	TempDir               string
	HFHome                string
	KokoroASRModel        string
	DigitalUmugandaModel  string
	DigitalUmugandaFolder string
	AgentLLMURL           string
	AgentModel            string
}

func LoadConfig() Config {
	root := repoVoiceRoot()
	return Config{
		Addr:                  env("VOICE_SERVICE_ADDR", "127.0.0.1:8787"),
		PythonBin:             env("VOICE_PYTHON", defaultPython()),
		KokoroScript:          env("KOKORO_TRANSCRIBE_SCRIPT", filepath.Join(root, "scripts", "transcribe_kokoro.py")),
		UmugandaScript:        env("UMUGANDA_TRANSCRIBE_SCRIPT", filepath.Join(root, "scripts", "transcribe_umuganda.py")),
		TempDir:               env("VOICE_TEMP_DIR", filepath.Join(root, "tmp")),
		HFHome:                env("HF_HOME", filepath.Join(root, "digital-umuganda", "hf-cache")),
		KokoroASRModel:        env("KOKORO_ASR_MODEL", "openai/whisper-small.en"),
		DigitalUmugandaModel:  env("DIGITAL_UMUGANDA_MODEL", ""),
		DigitalUmugandaFolder: env("DIGITAL_UMUGANDA_MODEL_DIR", filepath.Join(root, "digital-umuganda")),
		AgentLLMURL:           env("BOUNTY_LLM_URL", ""),
		AgentModel:            env("BOUNTY_LLM_MODEL", "local"),
	}
}

func repoVoiceRoot() string {
	if v := os.Getenv("LOCAL_VOICE_ROOT"); strings.TrimSpace(v) != "" {
		return v
	}
	wd, err := os.Getwd()
	if err != nil {
		return ".."
	}
	if filepath.Base(wd) == "service" {
		return filepath.Clean(filepath.Join(wd, ".."))
	}
	return filepath.Join(wd, "local-voice")
}

func defaultPython() string {
	if _, err := os.Stat(`D:\KokoroAI\kokoro-env\Scripts\python.exe`); err == nil {
		return `D:\KokoroAI\kokoro-env\Scripts\python.exe`
	}
	return "python"
}

func env(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func normalizeLanguage(language string) string {
	l := strings.ToLower(strings.TrimSpace(language))
	switch l {
	case "rw", "kinyarwanda", "kin":
		return "rw"
	case "en", "english", "":
		return "en"
	default:
		return "en"
	}
}

func routeModel(language string) (modelName, script string) {
	if normalizeLanguage(language) == "rw" {
		return "digital-umuganda", "umuganda"
	}
	return "kokoro", "kokoro"
}
