package handler

// x402 payment endpoint for Everyday (https://x402.org).
// Everyday is its own facilitator; the Everyday Wallet is the settlement
// network (scheme "exact", network "app.everyday.wallet", RWF). One Vercel Go
// entrypoint, internally routed on the x402_path query that vercel.json
// rewrites from the real path.
//
//   GET  /.well-known/x402          → supported schemes/networks (discovery)
//   POST /api/x402/verify           → facilitator verify (no money moves)
//   POST /api/x402/settle           → facilitator settle (debits wallet)
//   GET  /api/x402/resource         → demo 402-protected resource (shows flow)
//
// The real payment integration is UCP checkout completion, which settles
// through the same _lib/x402.Settle.

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"everyday/api/_lib/sb"
	"everyday/api/_lib/x402"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Query().Get("x402_path"), "/")
	seg := strings.Split(path, "/")
	if path == "" {
		seg = nil
	}

	if len(seg) == 0 || seg[0] == ".well-known" || seg[0] == "discovery" {
		sb.WriteJSON(w, http.StatusOK, map[string]any{
			"x402_version": x402.Version,
			"facilitator":  "Everyday",
			"kinds": []map[string]string{{
				"scheme": x402.Scheme, "network": x402.Network, "currency": x402.Currency,
			}},
		})
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

	switch {
	case seg[0] == "verify" && r.Method == http.MethodPost:
		verify(w, r, c, token, userID)
	case seg[0] == "settle" && r.Method == http.MethodPost:
		settle(w, r, c, token, userID)
	case seg[0] == "resource" && r.Method == http.MethodGet:
		demoResource(w, r, c, token, userID)
	default:
		sb.WriteError(w, http.StatusNotFound, errors.New("unknown x402 route: "+path))
	}
}

type verifyReq struct {
	Requirements x402.PaymentRequirements `json:"requirements"`
	Payment      x402.PaymentPayload      `json:"payment"`
}

func verify(w http.ResponseWriter, r *http.Request, c *sb.Client, token, userID string) {
	var req verifyReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	bal, err := x402.Verify(c, token, userID, req.Requirements, &req.Payment)
	if err != nil {
		sb.WriteJSON(w, http.StatusOK, map[string]any{"valid": false, "reason": err.Error(), "balance": bal})
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"valid": true, "balance": bal})
}

// settle reads the requirements from the body and the payment authorization from
// the PAYMENT-SIGNATURE header (x402 contract), then debits the wallet.
func settle(w http.ResponseWriter, r *http.Request, c *sb.Client, token, userID string) {
	var body struct {
		Requirements x402.PaymentRequirements `json:"requirements"`
		Section      string                   `json:"section"`
		Title        string                   `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if sig := r.Header.Get("PAYMENT-SIGNATURE"); sig != "" {
		if pay, err := x402.DecodePayload(sig); err == nil && pay.Amount > 0 {
			body.Requirements.Amount = pay.Amount
		}
	}
	if body.Requirements.Amount <= 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("requirements.amount must be positive"))
		return
	}
	res, err := x402.Settle(c, token, userID, body.Requirements, body.Section, body.Title, "x402")
	if err != nil {
		sb.WriteError(w, http.StatusPaymentRequired, err)
		return
	}
	w.Header().Set("PAYMENT-RESPONSE", x402.EncodeSettlement(res))
	sb.WriteJSON(w, http.StatusOK, map[string]any{"settlement": res})
}

// demoResource shows the full 402 handshake: without PAYMENT-SIGNATURE it
// returns 402 + PAYMENT-REQUIRED; with a valid one it settles and returns 200.
func demoResource(w http.ResponseWriter, r *http.Request, c *sb.Client, token, userID string) {
	const price = 100 // RWF
	req := x402.Require(price, "/api/x402/resource", "Everyday x402 demo resource")
	sig := r.Header.Get("PAYMENT-SIGNATURE")
	if sig == "" {
		w.Header().Set("PAYMENT-REQUIRED", x402.EncodeRequired(req))
		sb.WriteJSON(w, http.StatusPaymentRequired, map[string]any{
			"x402_version": x402.Version, "accepts": req.Accepts,
		})
		return
	}
	pay, err := x402.DecodePayload(sig)
	if err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if _, err := x402.Verify(c, token, userID, req.Accepts[0], pay); err != nil {
		sb.WriteError(w, http.StatusPaymentRequired, err)
		return
	}
	res, err := x402.Settle(c, token, userID, req.Accepts[0], "pay", "x402 demo resource", "x402")
	if err != nil {
		sb.WriteError(w, http.StatusPaymentRequired, err)
		return
	}
	w.Header().Set("PAYMENT-RESPONSE", x402.EncodeSettlement(res))
	sb.WriteJSON(w, http.StatusOK, map[string]any{"resource": "unlocked", "paid": res.AmountSettled, "currency": res.Currency})
}
