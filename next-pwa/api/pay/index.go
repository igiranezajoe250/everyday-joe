package handler

// Pay service.
//
//   GET  /api/pay                 recent peer-to-peer payments by the caller
//   POST /api/pay  { amount_rwf, recipient, note? }
//                                 records an outbound ledger entry
//                                 (transactions.section = "pay", direction = "out")
//                                 and debits the caller's wallet balance.
//
// Pay never moves catalog data. It is a thin write surface over the ledger and
// the wallet — the same primitives Save uses, with section = "pay" instead of
// "save" so the activity log can fan out by section without re-querying.

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"everyday/api/internal/sb"
)

type wallet struct {
	ID         string `json:"id"`
	BalanceRWF int    `json:"balance_rwf"`
}

type payReq struct {
	AmountRWF int    `json:"amount_rwf"`
	Recipient string `json:"recipient"`
	Note      string `json:"note"`
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
		txs, err := c.Get("transactions?select=*&user_id=eq."+userID+"&section=eq.pay&order=happened_at.desc&limit=50", token)
		if err != nil {
			sb.WriteError(w, http.StatusBadGateway, err)
			return
		}
		sb.WriteJSON(w, http.StatusOK, map[string]json.RawMessage{"transactions": txs})

	case "POST":
		var req payReq
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			sb.WriteError(w, http.StatusBadRequest, err)
			return
		}
		if req.AmountRWF <= 0 {
			sb.WriteError(w, http.StatusBadRequest, errors.New("amount_rwf must be positive"))
			return
		}
		recipient := strings.TrimSpace(req.Recipient)
		if recipient == "" {
			sb.WriteError(w, http.StatusBadRequest, errors.New("recipient required"))
			return
		}

		wal, err := loadWallet(c, token, userID)
		if err != nil {
			sb.WriteError(w, http.StatusBadGateway, err)
			return
		}
		if wal.BalanceRWF < req.AmountRWF {
			sb.WriteError(w, http.StatusPaymentRequired, errors.New("insufficient balance"))
			return
		}

		title := "Pay " + recipient
		if req.Note != "" {
			title = title + " — " + req.Note
		}
		if _, err := c.Post("transactions", token, map[string]any{
			"user_id":    userID,
			"wallet_id":  wal.ID,
			"section":    "pay",
			"title":      title,
			"amount_rwf": req.AmountRWF,
			"direction":  "out",
			"status":     "completed",
		}, "return=representation"); err != nil {
			sb.WriteError(w, http.StatusBadGateway, err)
			return
		}
		if _, err := c.Patch("wallets?id=eq."+wal.ID, token, map[string]any{
			"balance_rwf": wal.BalanceRWF - req.AmountRWF,
		}, "return=representation"); err != nil {
			sb.WriteError(w, http.StatusBadGateway, err)
			return
		}
		sb.WriteJSON(w, http.StatusOK, map[string]any{
			"ok":             true,
			"recipient":      recipient,
			"amount_rwf":     req.AmountRWF,
			"balance_rwf":    wal.BalanceRWF - req.AmountRWF,
		})
	}
}

func loadWallet(c *sb.Client, token, userID string) (*wallet, error) {
	raw, err := c.Get("wallets?select=*&user_id=eq."+userID+"&limit=1", token)
	if err != nil {
		return nil, err
	}
	var wals []wallet
	if err := json.Unmarshal(raw, &wals); err != nil {
		return nil, err
	}
	if len(wals) == 0 {
		created, err := c.Post("wallets", token, map[string]any{
			"user_id": userID,
			"label":   "Everyday Wallet",
		}, "return=representation")
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal(created, &wals); err != nil {
			return nil, err
		}
		if len(wals) == 0 {
			return nil, errors.New("wallet create returned empty")
		}
	}
	return &wals[0], nil
}
