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

	// Build section agents and an ID → agent lookup map for Bounty dispatch
	agents := AllSectionAgents()
	agentMap := make(map[string]*SectionAgent, len(agents))
	for _, a := range agents {
		agentMap[a.ID] = a
	}

	mux := http.NewServeMux()

	// ── Health ────────────────────────────────────────────────────────────────
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// ── Voice (transcribe + synthesize) ──────────────────────────────────────
	mux.HandleFunc("/api/voice/transcribe", withCORS(cfg, handleTranscribe(cfg)))
	mux.HandleFunc("/api/voice/synthesize", withCORS(cfg, handleSynthesize(cfg)))

	// ── Bounty orchestrator (A2A coordinator) ─────────────────────────────────
	mux.HandleFunc("/api/agent/chat", withCORS(cfg, handleAgentChat(cfg, agentMap)))

	// ── Per-section MCP servers, A2A endpoints, and agent cards ───────────────
	for _, agent := range agents {
		a := agent // capture for closure
		mux.HandleFunc("/mcp/"+a.ID, withCORS(cfg, handleMCP(cfg, a)))
		mux.HandleFunc("/a2a/"+a.ID, withCORS(cfg, handleA2A(cfg, a)))
		mux.HandleFunc("/.well-known/"+a.ID+"-agent.json", handleAgentCard(cfg, a))

		log.Printf("  section %-8s  MCP → /mcp/%s   A2A → /a2a/%s   card → /.well-known/%s-agent.json",
			a.ID, a.ID, a.ID, a.ID)
	}

	log.Printf("Everyday local voice service listening on http://%s", cfg.Addr)
	log.Fatal(http.ListenAndServe(cfg.Addr, mux))
}

func withCORS(cfg Config, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if cfg.allowsOrigin(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
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
