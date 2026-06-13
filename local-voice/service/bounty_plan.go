package main

// bounty_plan.go — Bounty's plan-first brain. Instead of routing a message to a
// single section, Bounty asks what the user is planning and decomposes the goal
// into an ordered set of steps across the four finance-centered sections —
// Save, Pay, Commute, Shop — with Save (savings) as the base everything centers
// on. The model emits a fenced ```plan {...}``` block; we parse it into a
// structured plan the UI renders as a confirm-to-act checklist. Money still only
// moves through the existing propose→confirm boundary (see save_proposals.go).

import (
	"encoding/json"
	"regexp"
	"strings"
)

// planSections are the only sections Bounty plans across in this pass. Save is
// first because every plan is framed around its effect on savings.
var planSections = map[string]bool{"save": true, "pay": true, "commute": true, "shop": true}

type planStep struct {
	Section string `json:"section"`          // save | pay | commute | shop
	Title   string `json:"title"`            // short imperative, e.g. "Set aside 20,000 for the trip"
	Detail  string `json:"detail,omitempty"` // one supporting sentence
}

type bountyPlan struct {
	Goal  string     `json:"goal"`
	Steps []planStep `json:"steps"`
	Note  string     `json:"note,omitempty"` // savings-impact summary
}

var planBlockRe = regexp.MustCompile("(?s)```plan\\s*(\\{.*?\\})\\s*```")

// extractPlan pulls a plan block out of the model reply, returning the parsed
// plan (or nil) and the reply with the raw block stripped. Lenient: an
// unparseable or empty-step block is treated as no plan so the chat still reads
// cleanly and we fall back to a plain conversational reply.
func extractPlan(reply string) (*bountyPlan, string) {
	m := planBlockRe.FindStringSubmatch(reply)
	clean := strings.TrimSpace(planBlockRe.ReplaceAllString(reply, ""))
	if len(m) < 2 {
		return nil, clean
	}
	var p bountyPlan
	if err := json.Unmarshal([]byte(m[1]), &p); err != nil {
		return nil, clean
	}
	// Keep only steps in a known section; drop the rest.
	kept := p.Steps[:0]
	for _, s := range p.Steps {
		s.Section = strings.ToLower(strings.TrimSpace(s.Section))
		if planSections[s.Section] && strings.TrimSpace(s.Title) != "" {
			kept = append(kept, s)
		}
	}
	p.Steps = kept
	if len(p.Steps) == 0 {
		return nil, clean
	}
	return &p, clean
}

// runPlanner calls the model with the planner prompt and parses a plan. If the
// first reply stalls (a question with no plan block) it retries once with a
// strict block-only nudge — small models like Gemma sometimes ask questions on
// the first pass but comply when pushed. Returns the plan (or nil), the cleaned
// conversational text, and the raw reply (reused as a plain answer when no plan).
func runPlanner(cfg Config, req agentRequest, lang string) (plan *bountyPlan, clean, raw string) {
	// history carries the "What are you planning?" greeting, which primes small
	// models to ask questions back. Pass it on the first try (keeps context) but
	// drop it on the retry so nothing competes with the block-only instruction.
	call := func(message string, history []agentMessage) string {
		switch {
		case cfg.GoogleAIKey != "":
			if r, err := callGemma3Online(cfg, buildPlannerPrompt(req, lang), message, history); err == nil {
				return strings.TrimSpace(r)
			}
		case cfg.AgentLLMURL != "":
			if r, err := callGemma3Local(cfg, buildPlannerPrompt(req, lang), message, history); err == nil {
				return strings.TrimSpace(r)
			}
		}
		return ""
	}

	raw = call(req.Message, req.History)
	if raw == "" {
		return nil, "", ""
	}
	if p, c := extractPlan(raw); p != nil {
		return p, c, raw
	}
	// No plan on the first pass — push once, history-free, for the block only.
	retry := call(req.Message+"\n\nOutput ONLY the fenced ```plan``` JSON block for this goal. Make reasonable assumptions. Do not ask any questions.", nil)
	if p, c := extractPlan(retry); p != nil {
		return p, c, retry
	}
	_, clean = extractPlan(raw)
	return nil, clean, raw
}

// buildPlannerPrompt is Bounty's plan-first system prompt. It asks the model to
// answer briefly, then emit one plan block when the user states a goal.
func buildPlannerPrompt(req agentRequest, lang string) string {
	system := strings.Join([]string{
		"You are Bounty, Everyday's planning agent for Rwanda. The user tells you what they are planning; you help them execute it.",
		"CRITICAL: Whenever the user states ANYTHING they want to do, want, or are planning, you MUST output a plan block. NEVER ask clarifying questions and NEVER reply with only questions — make reasonable assumptions and plan anyway. A reply to a goal without a plan block is wrong.",
		"Everyday's finance sections all center on SAVINGS as the base: Save (savings, goals, wallet), Pay (transfers, bills), Commute (book a ride/moto), Shop (buy and deliver). Payments and shop checkouts settle in RWF from the Everyday Wallet via the x402 protocol — you never need crypto or external accounts.",
		"Map every goal onto these four sections: buying supplies/food/gifts -> shop; paying a venue/person/bill -> pay; setting money aside or budgeting -> save; getting somewhere -> commute. Most plans start with a 'save' step because savings is the base.",
		"Reply in ONE short friendly sentence, then emit exactly one fenced plan block the app turns into a checklist. Use valid JSON in this shape:",
		"```plan",
		`{"goal":"<the user's goal>","steps":[{"section":"save|pay|commute|shop","title":"<short imperative>","detail":"<one sentence>"}],"note":"<one sentence on the effect on their savings>"}`,
		"```",
		"Example — user: \"I'm planning a trip to Musanze this weekend to visit family and buy groceries there\". You reply:",
		"Here's a simple plan for your Musanze weekend.",
		"```plan",
		`{"goal":"Weekend trip to Musanze","steps":[{"section":"save","title":"Set aside money for the trip","detail":"Move a little into savings so transport and groceries are covered."},{"section":"commute","title":"Book a ride to Musanze","detail":"Compare moto and car options and reserve one."},{"section":"shop","title":"Order groceries in Musanze","detail":"Browse trusted shops and add what you need for the family."}],"note":"Funding this from savings keeps your goals on track - only spend what you set aside."}`,
		"```",
		"Example — user: \"I'm planning a small birthday party for my daughter this Saturday\". You reply:",
		"Let's get your daughter's party sorted.",
		"```plan",
		`{"goal":"Daughter's birthday party on Saturday","steps":[{"section":"save","title":"Budget for the party","detail":"Set aside an amount so the party stays within what you can afford."},{"section":"shop","title":"Order cake, food and decorations","detail":"Browse trusted shops for the party supplies and have them delivered."},{"section":"commute","title":"Arrange rides for guests if needed","detail":"Book transport for family who need a lift."}],"note":"Setting a party budget in savings first protects your other goals."}`,
		"```",
		"Rules: only use the sections save, pay, commute, shop. Order steps the way the user would do them. Keep 2-5 steps. ALWAYS produce a plan block when the user states a goal — never ask clarifying questions; make reasonable assumptions instead. Always include the savings note. Never invent specific prices or balances not in the context. Only when the message is a pure question (not a goal) answer briefly with no plan block.",
	}, "\n")
	if lang == "rw" {
		system += "\nThe user prefers Kinyarwanda. Write the reply sentence and the titles in Kinyarwanda when you can; keep the JSON keys in English."
	}
	if len(req.Context) > 2 {
		system += "\n\nLive user context (wallet balances in RWF, recent transactions, shops, rides):\n" + string(req.Context) + "\nGround every number in this context."
	}
	return system
}
