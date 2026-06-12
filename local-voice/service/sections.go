package main

// sections.go — Per-section SectionAgent definitions.
//
// Each section agent:
//   1. Has MCP tools that fetch live data from the Everyday API
//   2. Exposes an A2A task endpoint for Bounty to delegate to
//   3. Runs Gemma 3 4B with a domain-specific system prompt

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// ── SectionAgent ──────────────────────────────────────────────────────────────

type SectionAgent struct {
	ID          string
	Name        string
	Description string
	Skills      []AgentSkill
	Tools       []SectionTool
	BuildPrompt func(fetchedData string) string
}

type SectionTool struct {
	Name        string
	Description string
	// Schema is a JSON Schema object string for the input parameters.
	Schema  string
	Handler func(cfg Config, args json.RawMessage, token string) (string, error)
}

// Card returns the A2A agent card for this section.
func (sa *SectionAgent) Card(cfg Config) AgentCard {
	// A2A endpoints live on the voice service, not the Next.js API.
	base := "http://" + cfg.Addr
	return AgentCard{
		Name:         "Everyday " + sa.Name + " Agent",
		Description:  sa.Description,
		URL:          base + "/a2a/" + sa.ID,
		Version:      "1.0.0",
		Capabilities: AgentCapabilities{Streaming: false},
		Skills:       sa.Skills,
	}
}

// Handle is the A2A tasks/send handler: fetches context, calls Gemma 3, returns task.
func (sa *SectionAgent) Handle(cfg Config, task a2aTaskSend) a2aTask {
	userMsg := ""
	for _, p := range task.Message.Parts {
		if p.Type == "text" {
			userMsg = strings.TrimSpace(p.Text)
			break
		}
	}

	// Fetch live section data via the first read tool
	fetchedData := ""
	if len(sa.Tools) > 0 {
		if data, err := sa.Tools[0].Handler(cfg, json.RawMessage(`{}`), task.Token); err == nil {
			fetchedData = data
		}
	}

	// Build section-specific system prompt with live data
	system := sa.BuildPrompt(fetchedData)
	if len(task.Context) > 2 {
		system += "\n\nBounty context snapshot:\n" + string(task.Context)
	}

	// Call Gemma 3 (online → local → static fallback)
	reply := sa.callGemma(cfg, system, userMsg)

	return a2aTask{
		ID:     task.ID,
		Status: a2aStatus{State: "completed"},
		Artifacts: []a2aArtifact{{
			Index: 0,
			Parts: []a2aPart{{Type: "text", Text: reply}},
		}},
	}
}

// callGemma calls Gemma 3 with an explicit system prompt. Online path first, local fallback.
func (sa *SectionAgent) callGemma(cfg Config, system, userMsg string) string {
	switch {
	case cfg.GoogleAIKey != "":
		if reply, err := callGemma3Online(cfg, system, userMsg, nil); err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply)
		}
		fallthrough
	case cfg.AgentLLMURL != "":
		if reply, err := callGemma3Local(cfg, system, userMsg, nil); err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply)
		}
	}
	return "I'm the " + sa.Name + " agent. " + sa.Description + " Ask me anything about " + strings.ToLower(sa.Name) + "."
}

// ── Shared low-level Gemma 3 callers ──────────────────────────────────────────

// callGemma3Online calls Gemma 3 4B via Google AI Studio with an explicit system prompt.
func callGemma3Online(cfg Config, systemPrompt, userMsg string, history []agentMessage) (string, error) {
	var contents []googleContent
	for _, h := range history {
		role := "user"
		if strings.ToLower(h.Role) == "assistant" {
			role = "model"
		}
		if strings.TrimSpace(h.Text) != "" {
			contents = append(contents, googleContent{Role: role, Parts: []googlePart{{Text: h.Text}}})
		}
	}
	contents = append(contents, googleContent{Role: "user", Parts: []googlePart{{Text: userMsg}}})

	payload := googleRequest{
		SystemInstruction: &googleContent{Parts: []googlePart{{Text: systemPrompt}}},
		Contents:          contents,
	}
	body, _ := json.Marshal(payload)

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=%s", cfg.GoogleAIKey)
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Post(url, "application/json", strings.NewReader(string(body)))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return "", fmt.Errorf("google AI %s: %s", resp.Status, string(raw))
	}
	var out googleResponse
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&out); err != nil {
		return "", err
	}
	if len(out.Candidates) == 0 || len(out.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("google AI: empty response")
	}
	return out.Candidates[0].Content.Parts[0].Text, nil
}

// callGemma3Local calls Gemma 3 4B via Ollama with an explicit system prompt.
func callGemma3Local(cfg Config, systemPrompt, userMsg string, history []agentMessage) (string, error) {
	messages := []ollamaMessage{{Role: "system", Content: systemPrompt}}
	for _, h := range history {
		role := "user"
		if strings.ToLower(h.Role) == "assistant" {
			role = "assistant"
		}
		if strings.TrimSpace(h.Text) != "" {
			messages = append(messages, ollamaMessage{Role: role, Content: h.Text})
		}
	}
	messages = append(messages, ollamaMessage{Role: "user", Content: userMsg})

	model := cfg.AgentModel
	if model == "" {
		model = "gemma3:4b"
	}
	body, _ := json.Marshal(ollamaRequest{Model: model, Messages: messages, Stream: false})
	client := &http.Client{Timeout: 45 * time.Second}
	resp, err := client.Post(cfg.AgentLLMURL, "application/json", strings.NewReader(string(body)))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("ollama %s", resp.Status)
	}
	var out ollamaResponse
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&out); err != nil {
		return "", err
	}
	return out.Message.Content, nil
}

// ── API fetch helper ──────────────────────────────────────────────────────────

func fetchSection(cfg Config, path, token string) (string, error) {
	url := cfg.APIBase + path
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("%s returned %s", path, resp.Status)
	}
	raw, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	return string(raw), err
}

// filterJSON filters a JSON array field by a search query string (case-insensitive).
func filterJSON(raw, arrayField, query string) string {
	q := strings.ToLower(query)
	var obj map[string]json.RawMessage
	if err := json.Unmarshal([]byte(raw), &obj); err != nil {
		return "[]"
	}
	items, ok := obj[arrayField]
	if !ok {
		return "[]"
	}
	var arr []json.RawMessage
	json.Unmarshal(items, &arr)
	var matched []json.RawMessage
	for _, item := range arr {
		if strings.Contains(strings.ToLower(string(item)), q) {
			matched = append(matched, item)
		}
	}
	out, _ := json.Marshal(matched)
	return string(out)
}

// ── Section Definitions ───────────────────────────────────────────────────────

func newShopAgent() *SectionAgent {
	return &SectionAgent{
		ID:          "shop",
		Name:        "Shop",
		Description: "Helps users browse products and place orders at trusted stores in Rwanda.",
		Skills: []AgentSkill{
			{ID: "product-search", Name: "Product Search", Description: "Search the product catalog", Tags: []string{"shop", "products", "buy"}},
			{ID: "place-order", Name: "Place Order", Description: "Order a product by ID and quantity", Tags: []string{"shop", "order", "purchase"}},
		},
		Tools: []SectionTool{
			{
				Name:        "list_products",
				Description: "List all shops and products with prices and stock",
				Schema:      `{"type":"object","properties":{}}`,
				Handler: func(cfg Config, _ json.RawMessage, token string) (string, error) {
					return fetchSection(cfg, "/api/shop", token)
				},
			},
			{
				Name:        "search_products",
				Description: "Search products by name or category keyword",
				Schema:      `{"type":"object","properties":{"query":{"type":"string","description":"product name or category"}},"required":["query"]}`,
				Handler: func(cfg Config, args json.RawMessage, token string) (string, error) {
					var a struct {
						Query string `json:"query"`
					}
					json.Unmarshal(args, &a)
					raw, err := fetchSection(cfg, "/api/shop", token)
					if err != nil {
						return "", err
					}
					return filterJSON(raw, "products", a.Query), nil
				},
			},
		},
		BuildPrompt: func(data string) string {
			p := "You are the Shop agent for Everyday, Rwanda's super-app. Help the user find products, compare prices, and decide on purchases. Prices are in RWF. Be concise and practical. Never invent product listings."
			if data != "" {
				p += "\n\nLive catalog:\n" + data
			}
			return p
		},
	}
}

func newSaveAgent() *SectionAgent {
	return &SectionAgent{
		ID:          "save",
		Name:        "Save",
		Description: "Helps users manage their wallet, savings balance, and financial goals.",
		Skills: []AgentSkill{
			{ID: "wallet-overview", Name: "Wallet Overview", Description: "Check balance and savings", Tags: []string{"save", "wallet", "balance"}},
			{ID: "transaction-history", Name: "Transaction History", Description: "Review recent savings deposits", Tags: []string{"save", "transactions"}},
		},
		Tools: []SectionTool{
			{
				Name:        "get_wallet",
				Description: "Get wallet balance, savings total, and recent transactions",
				Schema:      `{"type":"object","properties":{}}`,
				Handler: func(cfg Config, _ json.RawMessage, token string) (string, error) {
					return fetchSection(cfg, "/api/save", token)
				},
			},
		},
		BuildPrompt: func(data string) string {
			p := "You are the Save agent for Everyday, Rwanda's super-app. Help the user understand their savings progress, wallet balance, and financial health. All amounts are RWF. Never invent numbers — only use data you are given."
			if data != "" {
				p += "\n\nUser wallet and recent transactions:\n" + data
			}
			return p
		},
	}
}

func newPayAgent() *SectionAgent {
	return &SectionAgent{
		ID:          "pay",
		Name:        "Pay",
		Description: "Helps users send money, pay bills, and review payment history.",
		Skills: []AgentSkill{
			{ID: "payment-history", Name: "Payment History", Description: "Review recent payments", Tags: []string{"pay", "history", "transfers"}},
			{ID: "send-money", Name: "Send Money", Description: "Guide a payment to a recipient", Tags: []string{"pay", "transfer", "send"}},
		},
		Tools: []SectionTool{
			{
				Name:        "list_payments",
				Description: "List recent payment transactions",
				Schema:      `{"type":"object","properties":{}}`,
				Handler: func(cfg Config, _ json.RawMessage, token string) (string, error) {
					return fetchSection(cfg, "/api/pay", token)
				},
			},
		},
		BuildPrompt: func(data string) string {
			p := "You are the Pay agent for Everyday, Rwanda's super-app. Help the user send payments, understand bills, and review their payment history. All amounts are RWF. Never invent transaction data."
			if data != "" {
				p += "\n\nRecent payment transactions:\n" + data
			}
			return p
		},
	}
}

func newPlanAgent() *SectionAgent {
	return &SectionAgent{
		ID:          "plan",
		Name:        "Plan",
		Description: "Helps users organize notes, tasks, reminders, and plans.",
		Skills: []AgentSkill{
			{ID: "list-notes", Name: "List Notes", Description: "Browse plan files and folders", Tags: []string{"plan", "notes", "tasks"}},
			{ID: "search-notes", Name: "Search Notes", Description: "Find content within notes", Tags: []string{"plan", "search", "find"}},
		},
		Tools: []SectionTool{
			{
				Name:        "list_files",
				Description: "List all plan folders and files",
				Schema:      `{"type":"object","properties":{}}`,
				Handler: func(cfg Config, _ json.RawMessage, token string) (string, error) {
					return fetchSection(cfg, "/api/plan", token)
				},
			},
			{
				Name:        "search_notes",
				Description: "Search plan files by keyword in title or body",
				Schema:      `{"type":"object","properties":{"query":{"type":"string","description":"keyword to search"}},"required":["query"]}`,
				Handler: func(cfg Config, args json.RawMessage, token string) (string, error) {
					var a struct {
						Query string `json:"query"`
					}
					json.Unmarshal(args, &a)
					raw, err := fetchSection(cfg, "/api/plan", token)
					if err != nil {
						return "", err
					}
					return filterJSON(raw, "files", a.Query), nil
				},
			},
		},
		BuildPrompt: func(data string) string {
			p := "You are the Plan agent for Everyday, Rwanda's super-app. Help the user capture notes, organize tasks, and build their plans. Be structured and actionable."
			if data != "" {
				p += "\n\nUser's current plan workspace:\n" + data
			}
			return p
		},
	}
}

func newListenAgent() *SectionAgent {
	return &SectionAgent{
		ID:          "listen",
		Name:        "Listen",
		Description: "Helps users discover podcasts and audio episodes.",
		Skills: []AgentSkill{
			{ID: "browse-episodes", Name: "Browse Episodes", Description: "Browse the podcast catalog", Tags: []string{"listen", "podcast", "audio"}},
			{ID: "search-episodes", Name: "Search Episodes", Description: "Find specific episodes", Tags: []string{"listen", "search", "episode"}},
		},
		Tools: []SectionTool{
			{
				Name:        "list_episodes",
				Description: "List all podcast sources and recent episodes",
				Schema:      `{"type":"object","properties":{}}`,
				Handler: func(cfg Config, _ json.RawMessage, token string) (string, error) {
					return fetchSection(cfg, "/api/listen", token)
				},
			},
			{
				Name:        "search_episodes",
				Description: "Search episodes by title or topic keyword",
				Schema:      `{"type":"object","properties":{"query":{"type":"string","description":"topic or episode title"}},"required":["query"]}`,
				Handler: func(cfg Config, args json.RawMessage, token string) (string, error) {
					var a struct {
						Query string `json:"query"`
					}
					json.Unmarshal(args, &a)
					raw, err := fetchSection(cfg, "/api/listen", token)
					if err != nil {
						return "", err
					}
					return filterJSON(raw, "episodes", a.Query), nil
				},
			},
		},
		BuildPrompt: func(data string) string {
			p := "You are the Listen agent for Everyday, Rwanda's super-app. Help the user discover podcasts and audio episodes relevant to their interests."
			if data != "" {
				p += "\n\nAvailable sources and episodes:\n" + data
			}
			return p
		},
	}
}

func newCommuteAgent() *SectionAgent {
	return &SectionAgent{
		ID:          "commute",
		Name:        "Commute",
		Description: "Helps users find motos, taxis, and transport options across Rwanda.",
		Skills: []AgentSkill{
			{ID: "find-ride", Name: "Find Ride", Description: "Browse transport options with ETA and price", Tags: []string{"commute", "moto", "taxi", "ride"}},
			{ID: "fastest-option", Name: "Fastest Option", Description: "Identify the quickest available ride", Tags: []string{"commute", "eta", "fast"}},
		},
		Tools: []SectionTool{
			{
				Name:        "list_options",
				Description: "List all available transport options with ETA (minutes) and price (RWF)",
				Schema:      `{"type":"object","properties":{}}`,
				Handler: func(cfg Config, _ json.RawMessage, token string) (string, error) {
					return fetchSection(cfg, "/api/commute", token)
				},
			},
		},
		BuildPrompt: func(data string) string {
			p := "You are the Commute agent for Everyday, Rwanda's super-app. Help the user pick the best transport option. ETAs are in minutes. Prices are in RWF. Recommend based on speed and cost."
			if data != "" {
				p += "\n\nCurrent transport options:\n" + data
			}
			return p
		},
	}
}

// AllSectionAgents returns all 6 section agents in order.
func AllSectionAgents() []*SectionAgent {
	return []*SectionAgent{
		newShopAgent(),
		newSaveAgent(),
		newPayAgent(),
		newPlanAgent(),
		newListenAgent(),
		newCommuteAgent(),
	}
}
