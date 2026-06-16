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
	// OpenAI-compatible API (vLLM / TGI). This is the Qwen fallback path. Example:
	// http://gpu-box:8000/v1. Empty disables it.
	OpenAIBaseURL string
	// OpenAIKey authenticates the GPU box (vLLM accepts any non-empty token by
	// default; set a real one if you front it with a gateway).
	OpenAIKey string
	// OpenAIModel is the served model id on the GPU box, e.g. "Qwen/Qwen3-8B".
	OpenAIModel string
	// GoogleAIKey enables Google AI Studio / Gemini API calls. Keep this server-side;
	// never expose it in the browser.
	GoogleAIKey string
	// GeminiModel is Bounty's primary online brain through Google AI Studio.
	GeminiModel string
	// GoogleGemmaModel is the Google AI fallback model. Override when your
	// account has access to a newer Gemma model id.
	GoogleGemmaModel string
	// AgentGemmaModel is the local Ollama Gemma fallback.
	AgentGemmaModel string
	// APIBase is the base URL of the Everyday Next.js API (for section agent tool calls).
	// Defaults to http://localhost:3000 for local dev; set to your Vercel URL in prod.
	APIBase string
	// AllowedOrigins is the CORS allow-list for browser callers (the deployed
	// frontend). Comma-separated. localhost dev origins are always allowed.
	AllowedOrigins []string
}

// allowsOrigin reports whether a browser Origin may call the service. Local dev
// origins are always permitted; production origins come from ALLOWED_ORIGINS.
func (c Config) allowsOrigin(origin string) bool {
	if origin == "" {
		return false
	}
	// Any localhost / 127.0.0.1 origin is a dev origin and is always allowed,
	// regardless of port — local dev servers (e.g. the Next preview) often land
	// on an arbitrary high port when the default is taken.
	if origin == "http://localhost" || origin == "http://127.0.0.1" ||
		strings.HasPrefix(origin, "http://localhost:") ||
		strings.HasPrefix(origin, "http://127.0.0.1:") {
		return true
	}
	for _, o := range c.AllowedOrigins {
		if o != "" && origin == o {
			return true
		}
	}
	return false
}

func LoadConfig() Config {
	root := repoVoiceRoot()
	googleAIKey := envFirst([]string{"GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_AI_KEY"}, "")
	if googleAIKey == "" {
		googleAIKey = googleAIKeyFromLocalFile(root)
	}
	return Config{
		Addr:                  listenAddr(),
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
		GoogleAIKey:           googleAIKey,
		GeminiModel:           env("GEMINI_MODEL", "gemini-3.5-flash"),
		GoogleGemmaModel:      envFirst([]string{"GOOGLE_GEMMA_MODEL", "GEMMA_MODEL"}, "gemma-3-4b-it"),
		AgentGemmaModel:       env("BOUNTY_GEMMA_MODEL", "gemma3:4b"),
		APIBase:               env("EVERYDAY_API_BASE", "http://localhost:3000"),
		AllowedOrigins:        splitCSV(env("ALLOWED_ORIGINS", "")),
	}
}

// listenAddr resolves the bind address. Render/Heroku inject $PORT and expect
// the app to listen on 0.0.0.0:$PORT; otherwise honor VOICE_SERVICE_ADDR, then
// fall back to local dev.
func listenAddr() string {
	if p := strings.TrimSpace(os.Getenv("PORT")); p != "" {
		return "0.0.0.0:" + p
	}
	return env("VOICE_SERVICE_ADDR", "127.0.0.1:8787")
}

func splitCSV(s string) []string {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
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

func envFirst(keys []string, fallback string) string {
	for _, key := range keys {
		if v := strings.TrimSpace(os.Getenv(key)); v != "" {
			return v
		}
	}
	return fallback
}

func googleAIKeyFromLocalFile(voiceRoot string) string {
	repoRoot := filepath.Dir(voiceRoot)
	candidates := []string{
		os.Getenv("GEMINI_API_KEY_FILE"),
		os.Getenv("GOOGLE_AI_KEY_FILE"),
		filepath.Join(repoRoot, "key"),
		filepath.Join(repoRoot, "Key"),
		filepath.Join(repoRoot, "keys"),
		filepath.Join(repoRoot, "Keys.txt"),
		filepath.Join(repoRoot, "keys.txt"),
		filepath.Join(repoRoot, "key.txt"),
		filepath.Join(voiceRoot, "key"),
		filepath.Join(voiceRoot, "Keys.txt"),
	}
	if home, err := os.UserHomeDir(); err == nil {
		candidates = append(candidates,
			filepath.Join(home, "OneDrive", "Desktop", "Everyday Joe", "key"),
			filepath.Join(home, "OneDrive", "Desktop", "Everyday Joe", "Keys.txt"),
		)
	}
	for _, candidate := range candidates {
		if key := readGoogleAIKey(candidate); key != "" {
			return key
		}
	}
	return ""
}

func readGoogleAIKey(path string) string {
	path = strings.TrimSpace(path)
	if path == "" {
		return ""
	}
	info, err := os.Stat(path)
	if err != nil {
		return ""
	}
	if info.IsDir() {
		entries, err := os.ReadDir(path)
		if err != nil {
			return ""
		}
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			if key := readGoogleAIKey(filepath.Join(path, entry.Name())); key != "" {
				return key
			}
		}
		return ""
	}
	b, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return parseGoogleAIKey(string(b))
}

func parseGoogleAIKey(raw string) string {
	for _, line := range strings.Split(raw, "\n") {
		line = strings.TrimSpace(strings.TrimPrefix(line, "\ufeff"))
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if i := strings.Index(line, "="); i >= 0 {
			name := strings.ToUpper(strings.TrimSpace(line[:i]))
			value := strings.Trim(strings.TrimSpace(line[i+1:]), `"'`)
			switch name {
			case "GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_AI_KEY", "API_KEY", "KEY":
				return value
			default:
				if strings.HasPrefix(value, "AIza") {
					return value
				}
			}
			continue
		}
		value := strings.Trim(line, `"'`)
		if strings.HasPrefix(value, "AIza") {
			return value
		}
	}
	return ""
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
