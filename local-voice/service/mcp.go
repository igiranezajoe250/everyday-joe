package main

// MCP (Model Context Protocol) server — JSON-RPC 2.0 over HTTP.
// Protocol version: 2024-11-05
//
// Each section exposes:
//   POST /mcp/{section}  — tools/list, tools/call, initialize

import (
	"encoding/json"
	"io"
	"net/http"
)

// ── JSON-RPC envelope ─────────────────────────────────────────────────────────

type mcpEnvelope struct {
	JSONRPC string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	ID      any             `json:"id"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type mcpReply struct {
	JSONRPC string  `json:"jsonrpc"`
	ID      any     `json:"id"`
	Result  any     `json:"result,omitempty"`
	Error   *mcpErr `json:"error,omitempty"`
}

type mcpErr struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// ── Tool types ────────────────────────────────────────────────────────────────

type mcpToolsList struct {
	Tools []mcpTool `json:"tools"`
}

type mcpTool struct {
	Name        string          `json:"name"`
	Description string          `json:"description"`
	InputSchema json.RawMessage `json:"inputSchema"`
}

type mcpCallParams struct {
	Name      string          `json:"name"`
	Arguments json.RawMessage `json:"arguments,omitempty"`
}

type mcpCallResult struct {
	Content []mcpContent `json:"content"`
	IsError bool         `json:"isError"`
}

type mcpContent struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

// ── HTTP handler ──────────────────────────────────────────────────────────────

// handleMCP returns an HTTP handler for the MCP server of a section agent.
func handleMCP(cfg Config, agent *SectionAgent) http.HandlerFunc {
	// Pre-build the tool list once
	toolList := mcpToolsList{}
	for _, t := range agent.Tools {
		toolList.Tools = append(toolList.Tools, mcpTool{
			Name:        t.Name,
			Description: t.Description,
			InputSchema: json.RawMessage(t.Schema),
		})
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, voiceError{Error: "method not allowed"})
			return
		}
		defer r.Body.Close()

		var env mcpEnvelope
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&env); err != nil {
			writeJSON(w, http.StatusBadRequest, mcpReply{
				JSONRPC: "2.0",
				Error:   &mcpErr{Code: -32700, Message: "parse error"},
			})
			return
		}

		switch env.Method {
		case "initialize":
			writeJSON(w, http.StatusOK, mcpReply{
				JSONRPC: "2.0", ID: env.ID,
				Result: map[string]any{
					"protocolVersion": "2024-11-05",
					"serverInfo": map[string]string{
						"name":    agent.ID + "-mcp",
						"version": "1.0.0",
					},
					"capabilities": map[string]any{"tools": map[string]any{}},
				},
			})

		case "tools/list":
			writeJSON(w, http.StatusOK, mcpReply{JSONRPC: "2.0", ID: env.ID, Result: toolList})

		case "tools/call":
			var params mcpCallParams
			if err := json.Unmarshal(env.Params, &params); err != nil {
				writeJSON(w, http.StatusOK, mcpReply{
					JSONRPC: "2.0", ID: env.ID,
					Error: &mcpErr{Code: -32602, Message: "invalid params"},
				})
				return
			}
			// Forward Authorization header as token if present
			token := ""
			if auth := r.Header.Get("Authorization"); len(auth) > 7 {
				token = auth[7:] // strip "Bearer "
			}
			for _, t := range agent.Tools {
				if t.Name == params.Name {
					result, err := t.Handler(cfg, params.Arguments, token)
					if err != nil {
						writeJSON(w, http.StatusOK, mcpReply{
							JSONRPC: "2.0", ID: env.ID,
							Result: mcpCallResult{
								Content: []mcpContent{{Type: "text", Text: "error: " + err.Error()}},
								IsError: true,
							},
						})
						return
					}
					writeJSON(w, http.StatusOK, mcpReply{
						JSONRPC: "2.0", ID: env.ID,
						Result: mcpCallResult{
							Content: []mcpContent{{Type: "text", Text: result}},
							IsError: false,
						},
					})
					return
				}
			}
			writeJSON(w, http.StatusOK, mcpReply{
				JSONRPC: "2.0", ID: env.ID,
				Error: &mcpErr{Code: -32601, Message: "tool not found: " + params.Name},
			})

		default:
			writeJSON(w, http.StatusOK, mcpReply{
				JSONRPC: "2.0", ID: env.ID,
				Error: &mcpErr{Code: -32601, Message: "method not found: " + env.Method},
			})
		}
	}
}
