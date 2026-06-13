package handler

// actions.go — Save section write actions beyond a plain deposit:
// creating goals, creating recurring schedules, and confirming/rejecting the
// agent proposals that the Save expert writes. All run with the user's JWT, so
// RLS guarantees a user can only ever touch their own rows.

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"everyday/api/_lib/sb"
)

// ── Goals ─────────────────────────────────────────────────────────────────────

type createGoalReq struct {
	Label     string `json:"label"`
	TargetRWF int    `json:"target_rwf"`
	Deadline  string `json:"deadline,omitempty"` // YYYY-MM-DD, optional
}

func handleCreateGoal(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string) {
	var req createGoalReq
	if err := json.Unmarshal(body, &req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if strings.TrimSpace(req.Label) == "" || req.TargetRWF <= 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("label and positive target_rwf required"))
		return
	}
	row := map[string]any{
		"user_id":    userID,
		"label":      strings.TrimSpace(req.Label),
		"target_rwf": req.TargetRWF,
	}
	if d := strings.TrimSpace(req.Deadline); d != "" {
		row["deadline"] = d
	}
	created, err := c.Post("savings_goals", token, row, "return=representation")
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"goal": firstRow(created), "ok": true})
}

// bumpGoalProgress adds amount to a goal's saved total and marks it reached when
// it crosses the target. Best-effort — a deposit still succeeds if this fails.
func bumpGoalProgress(c *sb.Client, token, userID, goalID string, amount int) {
	raw, err := c.Get("savings_goals?select=saved_rwf,target_rwf&id=eq."+goalID+"&user_id=eq."+userID+"&limit=1", token)
	if err != nil {
		return
	}
	var rows []struct {
		SavedRWF  int `json:"saved_rwf"`
		TargetRWF int `json:"target_rwf"`
	}
	if json.Unmarshal(raw, &rows); len(rows) == 0 {
		return
	}
	newSaved := rows[0].SavedRWF + amount
	patch := map[string]any{"saved_rwf": newSaved}
	if newSaved >= rows[0].TargetRWF {
		patch["status"] = "reached"
	}
	c.Patch("savings_goals?id=eq."+goalID+"&user_id=eq."+userID, token, patch, "")
}

// handleWithdraw moves money out of savings, guarding against overdrawing.
func handleWithdraw(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string) {
	var req struct {
		AmountRWF int    `json:"amount_rwf"`
		Title     string `json:"title"`
	}
	if err := json.Unmarshal(body, &req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if req.AmountRWF <= 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("amount_rwf must be positive"))
		return
	}
	wal, err := ensureWallet(c, token, userID)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	if req.AmountRWF > wal.SavingsRWF {
		sb.WriteError(w, http.StatusBadRequest, errors.New("amount exceeds savings balance"))
		return
	}
	title := strings.TrimSpace(req.Title)
	if title == "" {
		title = "Withdrawal"
	}
	tx := map[string]any{
		"user_id": userID, "wallet_id": wal.ID, "section": "save",
		"title": title, "amount_rwf": req.AmountRWF, "direction": "out",
		"status": "completed", "kind": "withdraw",
	}
	if _, err := c.Post("transactions", token, tx, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	newSavings := wal.SavingsRWF - req.AmountRWF
	if _, err := c.Patch("wallets?id=eq."+wal.ID, token, map[string]any{"savings_rwf": newSavings}, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	wal.SavingsRWF = newSavings
	sb.WriteJSON(w, http.StatusOK, map[string]any{"wallet": wal, "ok": true})
}

// handleUpdateGoal edits a goal's label, target, or deadline.
func handleUpdateGoal(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string) {
	var req struct {
		GoalID    string `json:"goal_id"`
		Label     string `json:"label,omitempty"`
		TargetRWF int    `json:"target_rwf,omitempty"`
		Deadline  string `json:"deadline,omitempty"`
	}
	if err := json.Unmarshal(body, &req); err != nil || strings.TrimSpace(req.GoalID) == "" {
		sb.WriteError(w, http.StatusBadRequest, errors.New("goal_id required"))
		return
	}
	patch := map[string]any{}
	if strings.TrimSpace(req.Label) != "" {
		patch["label"] = strings.TrimSpace(req.Label)
	}
	if req.TargetRWF > 0 {
		patch["target_rwf"] = req.TargetRWF
	}
	if strings.TrimSpace(req.Deadline) != "" {
		patch["deadline"] = strings.TrimSpace(req.Deadline)
	}
	if len(patch) == 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("nothing to update"))
		return
	}
	if _, err := c.Patch("savings_goals?id=eq."+req.GoalID+"&user_id=eq."+userID, token, patch, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// handleDeleteGoal removes a goal. RLS scopes the delete to the owner.
func handleDeleteGoal(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string) {
	var req struct {
		GoalID string `json:"goal_id"`
	}
	if err := json.Unmarshal(body, &req); err != nil || strings.TrimSpace(req.GoalID) == "" {
		sb.WriteError(w, http.StatusBadRequest, errors.New("goal_id required"))
		return
	}
	if err := c.Delete("savings_goals?id=eq."+req.GoalID+"&user_id=eq."+userID, token); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// handleCancelSchedule stops a recurring auto-save.
func handleCancelSchedule(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string) {
	var req struct {
		ScheduleID string `json:"schedule_id"`
	}
	if err := json.Unmarshal(body, &req); err != nil || strings.TrimSpace(req.ScheduleID) == "" {
		sb.WriteError(w, http.StatusBadRequest, errors.New("schedule_id required"))
		return
	}
	if err := c.Delete("savings_schedules?id=eq."+req.ScheduleID+"&user_id=eq."+userID, token); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"ok": true})
}

// ── Schedules ─────────────────────────────────────────────────────────────────

type createScheduleReq struct {
	AmountRWF int    `json:"amount_rwf"`
	Cadence   string `json:"cadence"`            // daily | weekly | monthly
	GoalID    string `json:"goal_id,omitempty"`  // optional link
	StartOn   string `json:"start_on,omitempty"` // YYYY-MM-DD, defaults to tomorrow
}

func handleCreateSchedule(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string) {
	var req createScheduleReq
	if err := json.Unmarshal(body, &req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if req.AmountRWF <= 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("amount_rwf must be positive"))
		return
	}
	if req.Cadence != "daily" && req.Cadence != "weekly" && req.Cadence != "monthly" {
		sb.WriteError(w, http.StatusBadRequest, errors.New("cadence must be daily, weekly, or monthly"))
		return
	}
	next := strings.TrimSpace(req.StartOn)
	if next == "" {
		next = time.Now().UTC().AddDate(0, 0, 1).Format("2006-01-02")
	}
	row := map[string]any{
		"user_id":     userID,
		"amount_rwf":  req.AmountRWF,
		"cadence":     req.Cadence,
		"next_run_on": next,
	}
	if req.GoalID != "" {
		row["goal_id"] = req.GoalID
	}
	created, err := c.Post("savings_schedules", token, row, "return=representation")
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"schedule": firstRow(created), "ok": true})
}

// ── Proposals (the agent propose → user-confirm boundary) ─────────────────────

// handleCreateProposal persists a pending proposal the Save expert emitted. It
// validates kind only; the payload is re-validated when the action executes on
// confirm, so a malformed payload can never move money.
func handleCreateProposal(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string) {
	var req struct {
		Kind    string          `json:"kind"`
		Summary string          `json:"summary"`
		Payload json.RawMessage `json:"payload"`
	}
	if err := json.Unmarshal(body, &req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if req.Kind != "deposit" && req.Kind != "schedule" && req.Kind != "goal" {
		sb.WriteError(w, http.StatusBadRequest, errors.New("kind must be deposit, schedule, or goal"))
		return
	}
	if len(req.Payload) == 0 {
		req.Payload = json.RawMessage("{}")
	}
	summary := strings.TrimSpace(req.Summary)
	if summary == "" {
		summary = "Confirm " + req.Kind
	}
	row := map[string]any{
		"user_id": userID,
		"section": "save",
		"kind":    req.Kind,
		"summary": summary,
		"payload": req.Payload,
	}
	created, err := c.Post("agent_proposals", token, row, "return=representation")
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"proposal": firstRow(created), "ok": true})
}

type proposalReq struct {
	ProposalID string `json:"proposal_id"`
}

// proposal mirrors a row of agent_proposals for execution on confirm.
type proposal struct {
	ID      string          `json:"id"`
	Kind    string          `json:"kind"`
	Payload json.RawMessage `json:"payload"`
	Status  string          `json:"status"`
}

// handleProposal confirms or rejects a pending proposal. On confirm it executes
// the underlying action (deposit / schedule / goal) using the same validated
// handlers, so the agent path and the manual path share one code route.
func handleProposal(w http.ResponseWriter, body []byte, c *sb.Client, token, userID string, confirm bool) {
	var req proposalReq
	if err := json.Unmarshal(body, &req); err != nil || strings.TrimSpace(req.ProposalID) == "" {
		sb.WriteError(w, http.StatusBadRequest, errors.New("proposal_id required"))
		return
	}
	raw, err := c.Get("agent_proposals?select=id,kind,payload,status&id=eq."+req.ProposalID+"&user_id=eq."+userID+"&limit=1", token)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	var rows []proposal
	if json.Unmarshal(raw, &rows); len(rows) == 0 {
		sb.WriteError(w, http.StatusNotFound, errors.New("proposal not found"))
		return
	}
	p := rows[0]
	if p.Status != "pending" {
		sb.WriteError(w, http.StatusConflict, errors.New("proposal already "+p.Status))
		return
	}

	if !confirm {
		c.Patch("agent_proposals?id=eq."+p.ID, token, map[string]any{"status": "rejected"}, "")
		sb.WriteJSON(w, http.StatusOK, map[string]any{"ok": true, "status": "rejected"})
		return
	}

	// Mark confirmed first so a double-tap can't execute twice.
	c.Patch("agent_proposals?id=eq."+p.ID, token, map[string]any{"status": "confirmed"}, "")
	switch p.Kind {
	case "deposit":
		handleDeposit(w, p.Payload, c, token, userID)
	case "schedule":
		handleCreateSchedule(w, p.Payload, c, token, userID)
	case "goal":
		handleCreateGoal(w, p.Payload, c, token, userID)
	default:
		sb.WriteError(w, http.StatusBadRequest, errors.New("unknown proposal kind: "+p.Kind))
	}
}

// ── helpers ───────────────────────────────────────────────────────────────────

func firstRow(raw json.RawMessage) json.RawMessage {
	var arr []json.RawMessage
	if json.Unmarshal(raw, &arr); len(arr) > 0 {
		return arr[0]
	}
	return raw
}
