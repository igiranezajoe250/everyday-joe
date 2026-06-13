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
	SynthesizeScript      string
	TempDir               string
	HFHome                string
	KokoroASRModel        string
	DigitalUmugandaModel  string
	DigitalUmugandaFolder string
	AgentLLMURL           string
	AgentModel            string
	// AgentModelRW lets Kinyarwanda chats route to a different local model.
	// Empty falls back to AgentModel.
	AgentModelRW string
	// OpenAIBaseURL points at the self-hosted GPU box serving Qwen via an
	// OpenAI-compatible API (vLLM / TGI). This is the PRIMARY path. Example:
	// http://gpu-box:8000/v1. Empty disables it.
	OpenAIBaseURL string
	// OpenAIKey authenticates the GPU box (vLLM accepts any non-empty token by
	// default; set a real one if you front it with a gateway).
	OpenAIKey string
	// OpenAIModel is the served model id on the GPU box, e.g. "Qwen/Qwen3-8B".
	OpenAIModel string
	// GoogleAIKey enables online Gemma 3 4B via Google AI Studio — the FALLBACK
	// when neither the GPU box nor Ollama answer.
	GoogleAIKey string
	// APIBase is the base URL of the Everyday Next.js API (for section agent tool calls).
	// Defaults to http://localhost:3000 for local dev; set to your Vercel URL in prod.
	APIBase string
}

func LoadConfig() Config {
	root := repoVoiceRoot()
	return Config{
		Addr:                  env("VOICE_SERVICE_ADDR", "127.0.0.1:8787"),
		PythonBin:             env("VOICE_PYTHON", defaultPython()),
		KokoroScript:          env("KOKORO_TRANSCRIBE_SCRIPT", filepath.Join(root, "scripts", "transcribe_kokoro.py")),
		UmugandaScript:        env("UMUGANDA_TRANSCRIBE_SCRIPT", filepath.Join(root, "scripts", "transcribe_umuganda.py")),
		SynthesizeScript:      env("KOKORO_SYNTHESIZE_SCRIPT", filepath.Join(root, "scripts", "synthesize_kokoro.py")),
		TempDir:               env("VOICE_TEMP_DIR", filepath.Join(root, "tmp")),
		HFHome:                env("HF_HOME", filepath.Join(root, "digital-umuganda", "hf-cache")),
		KokoroASRModel:        env("KOKORO_ASR_MODEL", "openai/whisper-small.en"),
		DigitalUmugandaModel:  env("DIGITAL_UMUGANDA_MODEL", ""),
		DigitalUmugandaFolder: env("DIGITAL_UMUGANDA_MODEL_DIR", filepath.Join(root, "digital-umuganda")),
		AgentLLMURL:           env("BOUNTY_LLM_URL", "http://127.0.0.1:11434/api/chat"),
		AgentModel:            env("BOUNTY_LLM_MODEL", "qwen3:8b"),
		AgentModelRW:          env("BOUNTY_LLM_MODEL_RW", ""),
		OpenAIBaseURL:         env("LLM_OPENAI_BASE_URL", ""),
		OpenAIKey:             env("LLM_OPENAI_KEY", "sk-local"),
		OpenAIModel:           env("LLM_OPENAI_MODEL", "Qwen/Qwen3-8B"),
		GoogleAIKey:           env("GOOGLE_AI_KEY", ""),
		APIBase:               env("EVERYDAY_API_BASE", "http://localhost:3000"),
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
