package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type agentMessage struct {
	Role string `json:"role"`
	Text string `json:"text"`
}

type agentRequest struct {
	Message  string         `json:"message"`
	Language string         `json:"language"`
	History  []agentMessage `json:"history"`
	// Context is an opaque snapshot of the user's live app state forwarded from EverydayStore.
	Context json.RawMessage `json:"context,omitempty"`
}

type agentResponse struct {
	Language string      `json:"language"`
	Model    string      `json:"model"`
	Text     string      `json:"text"`
	Route    string      `json:"route,omitempty"`
	Action   string      `json:"action,omitempty"`
	Calls    []agentCall `json:"calls,omitempty"`
	Plan     *bountyPlan `json:"plan,omitempty"`
}

type agentCall struct {
	Name  string         `json:"name"`
	Label string         `json:"label"`
	Args  map[string]any `json:"args,omitempty"`
}

// ── Ollama types ──────────────────────────────────────────────────────────────

type ollamaRequest struct {
	Model    string          `json:"model"`
	Messages []ollamaMessage `json:"messages"`
	Stream   bool            `json:"stream"`
}

type ollamaMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ollamaResponse struct {
	Message ollamaMessage `json:"message"`
}

// ── Google AI Studio types ────────────────────────────────────────────────────

type googlePart struct {
	Text string `json:"text"`
}

type googleContent struct {
	Role  string       `json:"role"`
	Parts []googlePart `json:"parts"`
}

type googleRequest struct {
	SystemInstruction *googleContent  `json:"system_instruction,omitempty"`
	Contents          []googleContent `json:"contents"`
}

type googleCandidate struct {
	Content googleContent `json:"content"`
}

type googleResponse struct {
	Candidates []googleCandidate `json:"candidates"`
}

// ── Bounty orchestrator ───────────────────────────────────────────────────────

func handleAgentChat(cfg Config, agents map[string]*SectionAgent) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, voiceError{Error: "method not allowed"})
			return
		}
		defer r.Body.Close()

		var req agentRequest
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, voiceError{Error: "read json: " + err.Error()})
			return
		}
		msg := strings.TrimSpace(req.Message)
		if msg == "" {
			writeJSON(w, http.StatusBadRequest, voiceError{Error: "missing message"})
			return
		}

		lang := normalizeLanguage(req.Language)
		token := bearerToken(r)
		route, action, fallback := inferBountyIntent(msg, lang)
		text, model := fallback, "bounty-local"
		var plan *bountyPlan

		// Plan-first: ask the model to decompose the goal into a cross-section
		// plan. A clean plan block supersedes single-section routing; a plain
		// answer (no block) is reused as the reply so questions still work.
		p, clean, plannerReply, plannerModel := runPlanner(cfg, req, lang)
		if p != nil {
			plan, model = p, plannerModel
			route, action = "", "" // a plan replaces the single Open-X button
			if text = clean; text == "" {
				text = "Here's a plan to get this done."
			}
		}

		// No plan: delegate to the section agent when intent is clear (keeps the
		// Save propose→confirm flow), else use the planner's plain answer.
		if plan == nil {
			if route != "" {
				if agent, ok := agents[route]; ok {
					task := agent.Handle(cfg, a2aTaskSend{
						ID:      fmt.Sprintf("bounty-%d", time.Now().UnixMilli()),
						Message: a2aMsg{Role: "user", Parts: []a2aPart{{Type: "text", Text: msg}}},
						Token:   token,
						Context: req.Context,
					})
					if len(task.Artifacts) > 0 && len(task.Artifacts[0].Parts) > 0 {
						text = task.Artifacts[0].Parts[0].Text
						model = "gemma3-" + route
					}
				}
			} else if plannerReply != "" {
				text, model = plannerReply, plannerModel
			}
		}

		writeJSON(w, http.StatusOK, agentResponse{
			Language: lang,
			Model:    model,
			Text:     text,
			Route:    route,
			Action:   action,
			Calls:    buildAgentCalls(route, action, plan),
			Plan:     plan,
		})
	}
}

func bearerToken(r *http.Request) string {
	auth := strings.TrimSpace(r.Header.Get("Authorization"))
	if len(auth) > 7 && strings.EqualFold(auth[:7], "Bearer ") {
		return strings.TrimSpace(auth[7:])
	}
	return ""
}

func buildAgentCalls(route, action string, plan *bountyPlan) []agentCall {
	var calls []agentCall
	if route != "" {
		label := action
		if label == "" {
			label = "Open " + routeLabel(route)
		}
		calls = append(calls, agentCall{
			Name:  "open_section",
			Label: label,
			Args:  map[string]any{"route": route},
		})
	}
	if plan != nil {
		seen := map[string]bool{}
		for _, step := range plan.Steps {
			section := strings.TrimSpace(step.Section)
			if section == "" || seen[section] {
				continue
			}
			seen[section] = true
			calls = append(calls, agentCall{
				Name:  "open_section",
				Label: "Open " + routeLabel(section),
				Args:  map[string]any{"route": section},
			})
		}
		calls = append(calls, agentCall{
			Name:  "save_plan",
			Label: "Save to Plan",
			Args:  map[string]any{},
		})
	}
	return calls
}

func routeLabel(route string) string {
	switch route {
	case "save", "capital":
		return "Save"
	case "pay":
		return "Pay"
	case "shop":
		return "Shop"
	case "commute", "moto":
		return "Commute"
	case "plan":
		return "Plan"
	case "listen":
		return "Listen"
	default:
		if route == "" {
			return "Everyday"
		}
		return strings.ToUpper(route[:1]) + route[1:]
	}
}

// ── Intent routing (deterministic fallback) ───────────────────────────────────

func inferBountyIntent(message, language string) (route, action, text string) {
	m := strings.ToLower(message)
	switch {
	case hasAny(m, "moto", "ride", "taxi", "driver", "commute", "where to", "airport", "bus"):
		route, action = "commute", "Open Moto"
		text = "I can help with that. I found the Moto and commute flow, so you can compare the route and book a vetted ride from there."
	case hasAny(m, "buy", "shop", "store", "market", "product", "groceries", "laptop", "phone", "price"):
		route, action = "shop", "Open Shop"
		text = "I can help you shop. I found the Shop flow, where trusted stores and product searches live."
	case hasAny(m, "pay", "send money", "transfer", "bill", "invoice", "school fees"):
		route, action = "pay", "Open Pay"
		text = "I can help with the payment. The Pay flow is ready for transfers, bills, and scheduled payments."
	case hasAny(m, "save", "saving", "savings", "budget", "goal", "borrow", "credit"):
		route, action = "save", "Open Save"
		text = "I can help you work through the money side. The Save area has savings, credit, wallet, and growth tools."
	case hasAny(m, "plan", "note", "remind", "todo", "task", "schedule", "write"):
		route, action = "plan", "Open Plan"
		text = "I can help organize that. The Plan workspace is the best place to turn this into notes or next steps."
	case hasAny(m, "listen", "podcast", "audio", "episode", "music"):
		route, action = "listen", "Open Listen"
		text = "I can help you find something to hear. The Listen flow has your audio and episodes."
	default:
		text = "Tell me what you want to do, and I can help route it to Shop, Moto, Pay, Save, Plan, or Listen."
	}
	if language == "rw" {
		text = text + " I will keep using your Kinyarwanda voice setting for microphone input."
	}
	return route, action, text
}

// ── System prompts ────────────────────────────────────────────────────────────

func buildBountyPrompt(req agentRequest, lang string) string {
	system := "You are Bounty, Everyday's concise orchestrator agent for Rwanda. Help the user complete tasks in the app. When a request belongs to Shop, Pay, Save, Plan, Listen, or Commute, say which area to use. Keep replies short and practical. Never invent data."
	if lang == "rw" {
		system += " The user prefers Kinyarwanda. Reply in Kinyarwanda when possible, otherwise reply in English with a short Kinyarwanda greeting."
	}
	if len(req.Context) > 2 {
		system += "\n\nLive user context (wallet balances in RWF, transactions dated):\n" + string(req.Context) + "\n\nGround every numeric claim in this context. If it is not in context, say so."
	}
	return system
}

// ── Google AI Studio (online) ─────────────────────────────────────────────────

func askGoogleAI(cfg Config, req agentRequest, route string) (string, error) {
	system := buildBountyPrompt(req, normalizeLanguage(req.Language))
	userMsg := req.Message
	if route != "" {
		userMsg += "\nLikely app route: " + route
	}
	return callGoogleAIModel(cfg, cfg.GeminiModel, system, userMsg, req.History)
}

// ── Ollama (local) ────────────────────────────────────────────────────────────

func askLocalLLM(cfg Config, req agentRequest, route, modelName string) (string, error) {
	system := buildBountyPrompt(req, normalizeLanguage(req.Language))
	userMsg := req.Message
	if route != "" {
		userMsg += "\nLikely app route: " + route
	}
	return callOllamaModel(cfg, modelName, system, userMsg, req.History)
}

// ── Low-level callers (used by both Bounty and section agents) ────────────────
// These live in sections.go: callGoogleAIModel, callOllamaModel

func hasAny(value string, words ...string) bool {
	for _, word := range words {
		if strings.Contains(value, word) {
			return true
		}
	}
	return false
}

// ── Vercel API proxy (for agent tool calls) ───────────────────────────────────

type vercelProxy struct {
	base   string
	client *http.Client
}

func newProxy(base string) *vercelProxy {
	return &vercelProxy{
		base:   base,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (p *vercelProxy) get(path, token string) ([]byte, error) {
	req, err := http.NewRequest(http.MethodGet, p.base+path, nil)
	if err != nil {
		return nil, err
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := p.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("%s → %s", path, resp.Status)
	}
	return io.ReadAll(io.LimitReader(resp.Body, 1<<20))
}
