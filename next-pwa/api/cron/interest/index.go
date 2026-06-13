package handler

// Interest + schedule cron. Vercel invokes this daily (see vercel.json crons).
// It runs with the Supabase service-role key — it has no user JWT — so it can
// sweep every wallet. Protected by CRON_SECRET so only Vercel Cron can call it.
//
//   1. accrue_daily_interest()  — adds 8%/365 of savings to accrued interest
//   2. pay_monthly_interest()   — on the 1st, floors accrued interest into savings
//   3. runDueSchedules()        — auto-deposits any recurring savings now due
//
// Schedules auto-deposit (the user already consented when creating them); only
// agent-initiated one-off actions go through the propose-confirm boundary.

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"everyday/api/_lib/sb"
)

type schedule struct {
	ID        string  `json:"id"`
	UserID    string  `json:"user_id"`
	GoalID    *string `json:"goal_id"`
	WalletID  string  `json:"wallet_id"`
	AmountRWF int     `json:"amount_rwf"`
	Cadence   string  `json:"cadence"`
	NextRunOn string  `json:"next_run_on"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if !authorized(r) {
		sb.WriteError(w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}
	c, err := sb.NewService()
	if err != nil {
		sb.WriteError(w, http.StatusInternalServerError, err)
		return
	}

	out := map[string]any{}

	// 1. Daily accrual on every funded wallet.
	if res, err := c.RPC("accrue_daily_interest", nil); err != nil {
		sb.WriteError(w, http.StatusBadGateway, fmt.Errorf("accrue: %w", err))
		return
	} else {
		out["accrued_wallets"] = json.RawMessage(res)
	}

	// 2. Monthly payout on the first of the month.
	if time.Now().UTC().Day() == 1 {
		if res, err := c.RPC("pay_monthly_interest", nil); err != nil {
			sb.WriteError(w, http.StatusBadGateway, fmt.Errorf("payout: %w", err))
			return
		} else {
			out["paid_wallets"] = json.RawMessage(res)
		}
	}

	// 3. Auto-deposit due recurring schedules.
	ran, err := runDueSchedules(c)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, fmt.Errorf("schedules: %w", err))
		return
	}
	out["schedules_run"] = ran
	out["ok"] = true
	sb.WriteJSON(w, http.StatusOK, out)
}

// authorized accepts the request only with the Vercel Cron bearer secret.
func authorized(r *http.Request) bool {
	secret := os.Getenv("CRON_SECRET")
	if secret == "" {
		return false // fail closed: never run unprotected
	}
	return r.Header.Get("Authorization") == "Bearer "+secret
}

// runDueSchedules deposits each active schedule whose next_run_on is today or
// past, updates the wallet (and goal, if any), then advances next_run_on.
func runDueSchedules(c *sb.Client) (int, error) {
	today := time.Now().UTC().Format("2006-01-02")
	raw, err := c.Get("savings_schedules?select=*&active=eq.true&next_run_on=lte."+today, "")
	if err != nil {
		return 0, err
	}
	var due []schedule
	if err := json.Unmarshal(raw, &due); err != nil {
		return 0, err
	}

	ran := 0
	for _, s := range due {
		// Resolve the user's wallet (service role can read across users).
		walletID, savings, err := walletFor(c, s.UserID)
		if err != nil || walletID == "" {
			continue
		}
		// Deposit transaction.
		tx := map[string]any{
			"user_id":    s.UserID,
			"wallet_id":  walletID,
			"section":    "save",
			"title":      "Scheduled savings",
			"amount_rwf": s.AmountRWF,
			"direction":  "in",
			"status":     "completed",
			"kind":       "scheduled",
		}
		if _, err := c.Post("transactions", "", tx, ""); err != nil {
			continue
		}
		// Grow savings balance.
		if _, err := c.Patch("wallets?id=eq."+walletID, "", map[string]any{
			"savings_rwf": savings + s.AmountRWF,
		}, ""); err != nil {
			continue
		}
		// Advance the goal, if attached.
		if s.GoalID != nil && *s.GoalID != "" {
			bumpGoal(c, *s.GoalID, s.AmountRWF)
		}
		// Advance the schedule.
		next := advance(s.NextRunOn, s.Cadence)
		c.Patch("savings_schedules?id=eq."+s.ID, "", map[string]any{"next_run_on": next}, "")
		ran++
	}
	return ran, nil
}

func walletFor(c *sb.Client, userID string) (id string, savings int, err error) {
	raw, err := c.Get("wallets?select=id,savings_rwf&user_id=eq."+userID+"&limit=1", "")
	if err != nil {
		return "", 0, err
	}
	var rows []struct {
		ID         string `json:"id"`
		SavingsRWF int    `json:"savings_rwf"`
	}
	if err := json.Unmarshal(raw, &rows); err != nil || len(rows) == 0 {
		return "", 0, err
	}
	return rows[0].ID, rows[0].SavingsRWF, nil
}

func bumpGoal(c *sb.Client, goalID string, amount int) {
	raw, err := c.Get("savings_goals?select=saved_rwf,target_rwf&id=eq."+goalID+"&limit=1", "")
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
	c.Patch("savings_goals?id=eq."+goalID, "", patch, "")
}

// advance returns the next run date for a cadence, anchored on the prior date so
// a missed/late cron run doesn't drift the schedule.
func advance(from, cadence string) string {
	d, err := time.Parse("2006-01-02", from)
	if err != nil {
		d = time.Now().UTC()
	}
	switch cadence {
	case "daily":
		d = d.AddDate(0, 0, 1)
	case "weekly":
		d = d.AddDate(0, 0, 7)
	case "monthly":
		d = d.AddDate(0, 1, 0)
	default:
		d = d.AddDate(0, 0, 7)
	}
	return d.Format("2006-01-02")
}
