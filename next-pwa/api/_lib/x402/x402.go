// Package x402 implements the x402 payment protocol (https://x402.org) with
// Everyday as its own facilitator and the Everyday Wallet as the settlement
// network — scheme "exact", network "app.everyday.wallet", currency RWF. No
// blockchain: "settlement" debits the user's wallet and writes a ledger
// transaction, all under the caller's JWT so RLS guarantees a user only ever
// moves their own money.
//
// Both the standalone x402 HTTP endpoints (api/x402) and UCP checkout
// completion (api/ucp) settle through Settle() here, so there is one money
// path.
package x402

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"time"

	"everyday/api/_lib/sb"
)

const (
	Version = "1"
	Scheme  = "exact"
	Network = "app.everyday.wallet"
	Currency = "RWF"
)

// PaymentRequirements is one accepted way to pay, advertised in a 402 response.
type PaymentRequirements struct {
	Scheme      string `json:"scheme"`
	Network     string `json:"network"`
	Currency    string `json:"currency"`
	Amount      int    `json:"amount"`
	Resource    string `json:"resource,omitempty"`
	Description  string `json:"description,omitempty"`
	PayTo       string `json:"pay_to,omitempty"` // merchant of record
}

// PaymentRequired is the body/PAYMENT-REQUIRED header payload of a 402.
type PaymentRequired struct {
	X402Version string                `json:"x402_version"`
	Accepts     []PaymentRequirements `json:"accepts"`
}

// PaymentPayload is what the client returns in PAYMENT-SIGNATURE. For the wallet
// network the "authorization" is the user's own intent under their JWT — there
// is no external signature because they are spending their own balance.
type PaymentPayload struct {
	Scheme        string `json:"scheme"`
	Network       string `json:"network"`
	Amount        int    `json:"amount"`
	Authorization string `json:"authorization,omitempty"`
}

// SettlementResponse is returned to the client (and base64'd into
// PAYMENT-RESPONSE) after a successful settle.
type SettlementResponse struct {
	Success       bool   `json:"success"`
	Network       string `json:"network"`
	TxID          string `json:"tx_id"`
	AmountSettled int    `json:"amount_settled"`
	Currency      string `json:"currency"`
}

// Require builds a single-option PaymentRequired for an amount in RWF.
func Require(amount int, resource, description string) PaymentRequired {
	return PaymentRequired{
		X402Version: Version,
		Accepts: []PaymentRequirements{{
			Scheme: Scheme, Network: Network, Currency: Currency,
			Amount: amount, Resource: resource, Description: description, PayTo: "Everyday",
		}},
	}
}

// EncodeRequired base64-encodes a PaymentRequired for the PAYMENT-REQUIRED header.
func EncodeRequired(pr PaymentRequired) string {
	b, _ := json.Marshal(pr)
	return base64.StdEncoding.EncodeToString(b)
}

// DecodePayload parses a base64 PAYMENT-SIGNATURE (or raw JSON) into a payload.
func DecodePayload(s string) (*PaymentPayload, error) {
	raw := []byte(s)
	if dec, err := base64.StdEncoding.DecodeString(s); err == nil {
		raw = dec
	}
	var p PaymentPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return nil, fmt.Errorf("invalid payment payload: %w", err)
	}
	return &p, nil
}

type wallet struct {
	ID         string `json:"id"`
	BalanceRWF int    `json:"balance_rwf"`
}

func loadWallet(c *sb.Client, token, userID string) (*wallet, error) {
	raw, err := c.Get("wallets?select=id,balance_rwf&user_id=eq."+url.QueryEscape(userID)+"&limit=1", token)
	if err != nil {
		return nil, err
	}
	var ws []wallet
	if err := json.Unmarshal(raw, &ws); err != nil {
		return nil, err
	}
	if len(ws) == 0 {
		return nil, errors.New("no wallet to charge")
	}
	return &ws[0], nil
}

// Verify checks the payment is well-formed and the wallet can cover it, without
// moving money (the facilitator /verify contract). Returns the current balance.
func Verify(c *sb.Client, token, userID string, req PaymentRequirements, pay *PaymentPayload) (balance int, err error) {
	if pay == nil {
		return 0, errors.New("missing payment payload")
	}
	if pay.Scheme != Scheme || pay.Network != Network {
		return 0, fmt.Errorf("unsupported scheme/network: %s/%s", pay.Scheme, pay.Network)
	}
	if pay.Amount < req.Amount {
		return 0, fmt.Errorf("payment amount %d is short of required %d", pay.Amount, req.Amount)
	}
	w, err := loadWallet(c, token, userID)
	if err != nil {
		return 0, err
	}
	if w.BalanceRWF < req.Amount {
		return w.BalanceRWF, fmt.Errorf("insufficient wallet balance: have %d, need %d", w.BalanceRWF, req.Amount)
	}
	return w.BalanceRWF, nil
}

// Settle debits the wallet by the required amount and records a ledger entry
// (the facilitator /settle contract). section/title/kind describe the ledger
// row so Save/Pay/Shop reads stay meaningful. Idempotency is the caller's job
// (e.g. UCP marks the checkout completed).
func Settle(c *sb.Client, token, userID string, req PaymentRequirements, section, title, kind string) (*SettlementResponse, error) {
	if _, err := Verify(c, token, userID, req, &PaymentPayload{Scheme: Scheme, Network: Network, Amount: req.Amount}); err != nil {
		return nil, err
	}
	w, err := loadWallet(c, token, userID)
	if err != nil {
		return nil, err
	}
	if _, err := c.Patch("wallets?id=eq."+url.QueryEscape(w.ID), token, map[string]any{
		"balance_rwf": w.BalanceRWF - req.Amount,
	}, "return=representation"); err != nil {
		return nil, err
	}
	if section == "" {
		section = "pay"
	}
	if kind == "" {
		kind = "x402"
	}
	txRaw, _ := c.Post("transactions", token, map[string]any{
		"user_id": userID, "wallet_id": w.ID, "section": section,
		"title": title, "amount_rwf": req.Amount, "direction": "out",
		"status": "completed", "kind": kind,
	}, "return=representation")
	txID := extractID(txRaw)
	if txID == "" {
		txID = fmt.Sprintf("x402_%x", time.Now().UnixNano())
	}
	return &SettlementResponse{
		Success: true, Network: Network, TxID: txID, AmountSettled: req.Amount, Currency: Currency,
	}, nil
}

// EncodeSettlement base64-encodes a settlement for the PAYMENT-RESPONSE header.
func EncodeSettlement(s *SettlementResponse) string {
	b, _ := json.Marshal(s)
	return base64.StdEncoding.EncodeToString(b)
}

func extractID(raw json.RawMessage) string {
	var rows []struct {
		ID string `json:"id"`
	}
	if json.Unmarshal(raw, &rows); len(rows) > 0 {
		return rows[0].ID
	}
	return ""
}
