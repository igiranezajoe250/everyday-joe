package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	cfg := LoadConfig()
	if err := ensureDir(cfg.TempDir); err != nil {
		log.Fatalf("voice temp dir: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("/api/voice/transcribe", withCORS(cfg, handleTranscribe(cfg)))
	mux.HandleFunc("/api/agent/chat", withCORS(cfg, handleAgentChat(cfg)))

	log.Printf("Everyday local voice service listening on http://%s", cfg.Addr)
	log.Fatal(http.ListenAndServe(cfg.Addr, mux))
}

func withCORS(cfg Config, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" || origin == "http://localhost:8787" || origin == "http://127.0.0.1:8787" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
