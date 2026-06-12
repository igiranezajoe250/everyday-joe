package main

// A2A (Agent-to-Agent) protocol — JSON-RPC 2.0 over HTTP.
// Spec reference: https://google.github.io/A2A/
//
// Each section exposes:
//   POST /a2a/{section}                — tasks/send endpoint
//   GET  /.well-known/{section}-agent.json  — agent card

import (
	"encoding/json"
	"io"
	"net/http"
)

// ── Agent Card ────────────────────────────────────────────────────────────────

type AgentCard struct {
	Name         string            `json:"name"`
	Description  string            `json:"description"`
	URL          string            `json:"url"`
	Version      string            `json:"version"`
	Capabilities AgentCapabilities `json:"capabilities"`
	Skills       []AgentSkill      `json:"skills"`
}

type AgentCapabilities struct {
	Streaming bool `json:"streaming"`
}

type AgentSkill struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

// ── JSON-RPC envelope ─────────────────────────────────────────────────────────

type a2aEnvelope struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	ID      any             `json:"id"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type a2aReply struct {
	JSONRPC string   `json:"jsonrpc"`
	ID      any      `json:"id"`
	Result  any      `json:"result,omitempty"`
	Error   *a2aErr  `json:"error,omitempty"`
}

type a2aErr struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// ── Task types ────────────────────────────────────────────────────────────────

// a2aTaskSend is the params for the tasks/send method.
type a2aTaskSend struct {
	ID      string          `json:"id"`
	Message a2aMsg          `json:"message"`
	Token   string          `json:"token,omitempty"`   // forwarded user JWT
	Context json.RawMessage `json:"context,omitempty"` // live EverydayStore snapshot
}

type a2aMsg struct {
	Role  string    `json:"role"`
	Parts []a2aPart `json:"parts"`
}

type a2aPart struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

type a2aTask struct {
	ID        string        `json:"id"`
	Status    a2aStatus     `json:"status"`
	Artifacts []a2aArtifact `json:"artifacts,omitempty"`
}

type a2aStatus struct {
	State string `json:"state"` // submitted | working | completed | failed
}

type a2aArtifact struct {
	Index int       `json:"index"`
	Parts []a2aPart `json:"parts"`
}

// ── HTTP handlers ─────────────────────────────────────────────────────────────

// handleA2A returns the A2A JSON-RPC handler for a section agent.
func handleA2A(cfg Config, agent *SectionAgent) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, voiceError{Error: "method not allowed"})
			return
		}
		defer r.Body.Close()

		var env a2aEnvelope
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&env); err != nil {
			writeJSON(w, http.StatusBadRequest, a2aReply{
				JSONRPC: "2.0",
				Error:   &a2aErr{Code: -32700, Message: "parse error"},
			})
			return
		}

		switch env.Method {
		case "tasks/send":
			var params a2aTaskSend
			if err := json.Unmarshal(env.Params, &params); err != nil {
				writeJSON(w, http.StatusOK, a2aReply{
					JSONRPC: "2.0", ID: env.ID,
					Error: &a2aErr{Code: -32602, Message: "invalid params: " + err.Error()},
				})
				return
			}
			task := agent.Handle(cfg, params)
			writeJSON(w, http.StatusOK, a2aReply{JSONRPC: "2.0", ID: env.ID, Result: task})

		case "agent/authenticatedExtendedCard":
			card := agent.Card(cfg)
			writeJSON(w, http.StatusOK, a2aReply{JSONRPC: "2.0", ID: env.ID, Result: card})

		default:
			writeJSON(w, http.StatusOK, a2aReply{
				JSONRPC: "2.0", ID: env.ID,
				Error: &a2aErr{Code: -32601, Message: "method not found: " + env.Method},
			})
		}
	}
}

// handleAgentCard serves the static agent card JSON.
func handleAgentCard(cfg Config, agent *SectionAgent) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		card := agent.Card(cfg)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(card)
	}
}
