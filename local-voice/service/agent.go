package main

import (
	"bytes"
	"encoding/json"
	"errors"
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
}

type agentResponse struct {
	Language string `json:"language"`
	Model    string `json:"model"`
	Text     string `json:"text"`
	Route    string `json:"route,omitempty"`
	Action   string `json:"action,omitempty"`
}

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

func handleAgentChat(cfg Config) http.HandlerFunc {
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
		route, action, fallback := inferBountyIntent(msg, lang)
		text, model := fallback, "bounty-local"
		if cfg.AgentLLMURL != "" {
			if llmText, err := askLocalLLM(cfg, req, route); err == nil && strings.TrimSpace(llmText) != "" {
				text, model = strings.TrimSpace(llmText), cfg.AgentModel
			}
		}

		writeJSON(w, http.StatusOK, agentResponse{
			Language: lang,
			Model:    model,
			Text:     text,
			Route:    route,
			Action:   action,
		})
	}
}

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

func askLocalLLM(cfg Config, req agentRequest, route string) (string, error) {
	messages := []ollamaMessage{{
		Role:    "system",
		Content: "You are Bounty, Everyday's concise local agent. Help the user complete tasks in the app. Mention the app area to use when relevant. Keep replies short and practical.",
	}}
	for _, h := range req.History {
		role := strings.ToLower(strings.TrimSpace(h.Role))
		if role != "assistant" {
			role = "user"
		}
		if strings.TrimSpace(h.Text) != "" {
			messages = append(messages, ollamaMessage{Role: role, Content: h.Text})
		}
	}
	user := req.Message
	if route != "" {
		user += "\nLikely app route: " + route
	}
	messages = append(messages, ollamaMessage{Role: "user", Content: user})

	body, _ := json.Marshal(ollamaRequest{Model: cfg.AgentModel, Messages: messages, Stream: false})
	client := &http.Client{Timeout: 45 * time.Second}
	resp, err := client.Post(cfg.AgentLLMURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", errors.New("local LLM returned " + resp.Status)
	}
	var out ollamaResponse
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&out); err != nil {
		return "", err
	}
	return out.Message.Content, nil
}

func hasAny(value string, words ...string) bool {
	for _, word := range words {
		if strings.Contains(value, word) {
			return true
		}
	}
	return false
}
