package main

// llm.go — Unified model chain for Bounty and the section agents.
//
// Priority (first that is configured AND answers wins):
//   1. Gemini API — Google AI Studio key (primary Bounty brain)
//   2. Qwen       — hosted OpenAI-compatible endpoint, then local Ollama
//   3. Gemma      — Google AI Studio model, then local Ollama

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// generate runs the model chain and returns (text, modelLabel).
func generate(cfg Config, system, userMsg string, history []agentMessage) (string, string) {
	if cfg.GoogleAIKey != "" && cfg.GeminiModel != "" {
		if reply, err := callGoogleAIModel(cfg, cfg.GeminiModel, system, userMsg, history); err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply), cfg.GeminiModel
		}
	}
	if cfg.OpenAIBaseURL != "" {
		if reply, err := callOpenAICompatible(cfg, system, userMsg, history); err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply), cfg.OpenAIModel
		}
	}
	if cfg.AgentLLMURL != "" {
		if reply, err := callOllamaModel(cfg, cfg.AgentModel, system, userMsg, history); err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply), cfg.AgentModel
		}
	}
	if cfg.GoogleAIKey != "" && cfg.GoogleGemmaModel != "" && cfg.GoogleGemmaModel != cfg.GeminiModel {
		if reply, err := callGoogleAIModel(cfg, cfg.GoogleGemmaModel, system, userMsg, history); err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply), cfg.GoogleGemmaModel
		}
	}
	if cfg.AgentLLMURL != "" && cfg.AgentGemmaModel != "" && cfg.AgentGemmaModel != cfg.AgentModel {
		if reply, err := callOllamaModel(cfg, cfg.AgentGemmaModel, system, userMsg, history); err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply), cfg.AgentGemmaModel
		}
	}
	return "", ""
}

// ── OpenAI-compatible chat completions (GPU box: vLLM serving Qwen) ────────────

type oaiMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type oaiRequest struct {
	Model       string       `json:"model"`
	Messages    []oaiMessage `json:"messages"`
	Temperature float64      `json:"temperature"`
	Stream      bool         `json:"stream"`
}

type oaiResponse struct {
	Choices []struct {
		Message oaiMessage `json:"message"`
	} `json:"choices"`
}

func callOpenAICompatible(cfg Config, system, userMsg string, history []agentMessage) (string, error) {
	messages := []oaiMessage{{Role: "system", Content: system}}
	for _, h := range history {
		role := "user"
		if strings.ToLower(h.Role) == "assistant" {
			role = "assistant"
		}
		if strings.TrimSpace(h.Text) != "" {
			messages = append(messages, oaiMessage{Role: role, Content: h.Text})
		}
	}
	messages = append(messages, oaiMessage{Role: "user", Content: userMsg})

	body, _ := json.Marshal(oaiRequest{
		Model:       cfg.OpenAIModel,
		Messages:    messages,
		Temperature: 0.3,
		Stream:      false,
	})

	url := strings.TrimRight(cfg.OpenAIBaseURL, "/") + "/chat/completions"
	req, err := http.NewRequest(http.MethodPost, url, strings.NewReader(string(body)))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.OpenAIKey)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return "", fmt.Errorf("gpu box %s: %s", resp.Status, string(raw))
	}
	var out oaiResponse
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&out); err != nil {
		return "", err
	}
	if len(out.Choices) == 0 {
		return "", fmt.Errorf("gpu box: empty response")
	}
	return out.Choices[0].Message.Content, nil
}
