package main

// save_proposals.go — Turns the Save expert's ```proposal {...}``` blocks into
// pending agent_proposals via the RLS-protected Next.js API (using the user's
// token). The model proposes; the user confirms in the UI; Go executes. The
// model itself has no DB credentials and never moves money.

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"
)

var proposalBlockRe = regexp.MustCompile("(?s)```proposal\\s*(\\{.*?\\})\\s*```")

// extractAndPostProposals finds proposal blocks, persists each, strips the raw
// JSON from the reply, and appends a short confirm list for the user.
func extractAndPostProposals(cfg Config, reply, token string) string {
	matches := proposalBlockRe.FindAllStringSubmatch(reply, -1)
	if len(matches) == 0 {
		return reply
	}
	var notes []string
	for _, m := range matches {
		var p struct {
			Kind    string          `json:"kind"`
			Summary string          `json:"summary"`
			Payload json.RawMessage `json:"payload"`
		}
		if err := json.Unmarshal([]byte(m[1]), &p); err != nil || p.Kind == "" {
			continue
		}
		if err := postProposal(cfg, token, p.Kind, p.Summary, p.Payload); err == nil {
			label := p.Summary
			if label == "" {
				label = p.Kind
			}
			notes = append(notes, "• "+label)
		}
	}
	clean := strings.TrimSpace(proposalBlockRe.ReplaceAllString(reply, ""))
	if len(notes) > 0 {
		clean = strings.TrimSpace(clean + "\n\nReady to confirm:\n" + strings.Join(notes, "\n"))
	}
	return clean
}

// postProposal writes one pending proposal through /api/save (create_proposal).
// Without a user token there is nothing to attach it to, so it no-ops.
func postProposal(cfg Config, token, kind, summary string, payload json.RawMessage) error {
	if strings.TrimSpace(token) == "" {
		return fmt.Errorf("no user token for proposal")
	}
	body, _ := json.Marshal(map[string]any{
		"action":  "create_proposal",
		"kind":    kind,
		"summary": summary,
		"payload": payload,
	})
	req, err := http.NewRequest(http.MethodPost, cfg.APIBase+"/api/save", strings.NewReader(string(body)))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("create_proposal: %s", resp.Status)
	}
	return nil
}
