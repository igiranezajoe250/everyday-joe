package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"everyday/api/internal/sb"
)

type wallet struct {
	ID            string `json:"id"`
	UserID        string `json:"user_id"`
	Label         string `json:"label"`
	BalanceRWF    int    `json:"balance_rwf"`
	SavingsRWF    int    `json:"savings_rwf"`
	CreditLimit   int    `json:"credit_limit_rwf"`
}

type depositReq struct {
	AmountRWF int    `json:"amount_rwf"`
	Title     string `json:"title"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if !sb.RequireMethod(w, r, "GET", "POST") {
		return
	}
	c, err := sb.New()
	if err != nil {
		sb.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	token := sb.UserToken(r)
	if token == "" {
		sb.WriteError(w, http.StatusUnauthorized, errors.New("sign in required"))
		return
	}
	userID, err := c.UserID(token)
	if err != nil {
		sb.WriteError(w, http.StatusUnauthorized, err)
		return
	}

	switch r.Method {
	case "GET":
		handleGet(w, c, token, userID)
	case "POST":
		handleDeposit(w, r, c, token, userID)
	}
}

func handleGet(w http.ResponseWriter, c *sb.Client, token, userID string) {
	wal, err := ensureWallet(c, token, userID)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	txs, err := c.Get("transactions?select=*&user_id=eq."+userID+"&section=eq.save&order=happened_at.desc&limit=50", token)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{
		"wallet":       wal,
		"transactions": txs,
	})
}

func handleDeposit(w http.ResponseWriter, r *http.Request, c *sb.Client, token, userID string) {
	var req depositReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if req.AmountRWF <= 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("amount_rwf must be positive"))
		return
	}
	title := strings.TrimSpace(req.Title)
	if title == "" {
		title = "Savings deposit"
	}
	wal, err := ensureWallet(c, token, userID)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	tx := map[string]any{
		"user_id":    userID,
		"wallet_id":  wal.ID,
		"section":    "save",
		"title":      title,
		"amount_rwf": req.AmountRWF,
		"direction":  "in",
		"status":     "completed",
	}
	if _, err := c.Post("transactions", token, tx, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	newSavings := wal.SavingsRWF + req.AmountRWF
	if _, err := c.Patch("wallets?id=eq."+wal.ID, token, map[string]any{"savings_rwf": newSavings}, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	wal.SavingsRWF = newSavings
	sb.WriteJSON(w, http.StatusOK, map[string]any{"wallet": wal, "ok": true})
}

func ensureWallet(c *sb.Client, token, userID string) (*wallet, error) {
	raw, err := c.Get("wallets?select=*&user_id=eq."+userID+"&limit=1", token)
	if err != nil {
		return nil, err
	}
	var existing []wallet
	if err := json.Unmarshal(raw, &existing); err != nil {
		return nil, err
	}
	if len(existing) > 0 {
		return &existing[0], nil
	}
	created, err := c.Post("wallets", token, map[string]any{
		"user_id": userID,
		"label":   "Everyday Wallet",
	}, "return=representation")
	if err != nil {
		return nil, err
	}
	var made []wallet
	if err := json.Unmarshal(created, &made); err != nil {
		return nil, err
	}
	if len(made) == 0 {
		return nil, errors.New("wallet create returned empty")
	}
	return &made[0], nil
}
