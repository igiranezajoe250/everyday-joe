package handler

// Universal Commerce Protocol (UCP) endpoint for Everyday's Shop.
// https://ucp.dev/specification/overview
//
// One Vercel Go function, internally routed on the `ucp_path` query that
// vercel.json rewrites from the real path (Vercel's Go runtime treats each .go
// file as a single entrypoint, so we route in-process rather than per-file):
//
//   GET  /.well-known/ucp                          → capability discovery
//   POST /api/ucp/checkout-sessions                → create a checkout session
//   GET  /api/ucp/checkout-sessions/{id}           → retrieve a session
//   PATCH/api/ucp/checkout-sessions/{id}           → update fulfillment/items
//   POST /api/ucp/checkout-sessions/{id}/complete  → settle + create the order
//   GET  /api/ucp/orders/{id}                      → retrieve an order
//
// Everyday is Merchant of Record: "completing" a checkout debits the user's
// wallet, writes a shop ledger transaction, decrements stock, and creates an
// order. The only payment handler advertised is the Everyday Wallet.

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"everyday/api/_lib/sb"
)

const ucpVersion = "2026-04-08"
const deliveryFlatRWF = 1000 // flat delivery fee; pickup is free

type ucpProduct struct {
	ID       string `json:"id"`
	ShopID   string `json:"shop_id"`
	Name     string `json:"name"`
	PriceRWF int    `json:"price_rwf"`
	Stock    int    `json:"stock"`
	Sold     int    `json:"sold"`
}

type lineItem struct {
	ProductID   string `json:"product_id"`
	Name        string `json:"name"`
	Quantity    int    `json:"quantity"`
	UnitAmount  int    `json:"unit_amount"`
	TotalAmount int    `json:"total_amount"`
}

type totals struct {
	SubtotalAmount int    `json:"subtotal_amount"`
	TaxAmount      int    `json:"tax_amount"`
	ShippingAmount int    `json:"shipping_amount"`
	TotalAmount    int    `json:"total_amount"`
	Currency       string `json:"currency"`
}

type fulfillment struct {
	Type    string `json:"type"`              // delivery | pickup
	Address string `json:"address,omitempty"` // for delivery
	Contact string `json:"contact,omitempty"`
}

type checkoutSession struct {
	ID          string      `json:"id"`
	Status      string      `json:"status"`
	LineItems   []lineItem  `json:"line_items"`
	Totals      totals      `json:"totals"`
	Fulfillment fulfillment `json:"fulfillment"`
	Buyer       any         `json:"buyer"`
}

// Handler is the single Vercel entrypoint; it dispatches on method + ucp_path.
func Handler(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Query().Get("ucp_path"), "/")
	seg := strings.Split(path, "/")
	if path == "" {
		seg = nil
	}

	// Discovery is public; everything else needs the user's JWT.
	if len(seg) == 0 || seg[0] == ".well-known" || seg[0] == "discovery" {
		writeDiscovery(w)
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
	case seg[0] == "checkout-sessions" && len(seg) == 1 && r.Method == http.MethodPost:
		createCheckout(w, r, c, token, userID)
	case seg[0] == "checkout-sessions" && len(seg) == 2 && r.Method == http.MethodGet:
		getCheckout(w, c, token, seg[1])
	case seg[0] == "checkout-sessions" && len(seg) == 2 && r.Method == http.MethodPatch:
		updateCheckout(w, r, c, token, seg[1])
	case seg[0] == "checkout-sessions" && len(seg) == 3 && seg[2] == "complete" && r.Method == http.MethodPost:
		completeCheckout(w, r, c, token, userID, seg[1])
	case seg[0] == "orders" && len(seg) == 2 && r.Method == http.MethodGet:
		getOrder(w, c, token, seg[1])
	default:
		sb.WriteError(w, http.StatusNotFound, fmt.Errorf("unknown UCP route: %s %s", r.Method, path))
	}
}

// writeDiscovery advertises the capabilities Everyday implements, per the UCP
// well-known discovery contract.
func writeDiscovery(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "public, s-maxage=300")
	sb.WriteJSON(w, http.StatusOK, map[string]any{
		"ucp": map[string]any{
			"version": ucpVersion,
			"capabilities": map[string]any{
				"dev.ucp.shopping.checkout": []map[string]string{{"version": ucpVersion}},
				"dev.ucp.shopping.order":    []map[string]string{{"version": ucpVersion}},
			},
			"payment_handlers": map[string]any{
				"app.everyday.wallet": []map[string]any{{
					"version":  ucpVersion,
					"currency": "RWF",
					"label":    "Everyday Wallet",
				}},
			},
		},
		"merchant_of_record": "Everyday",
	})
}

func ucpEnvelope(body map[string]any) map[string]any {
	body["ucp"] = map[string]any{
		"version": ucpVersion,
		"capabilities": map[string]any{
			"dev.ucp.shopping.checkout": []map[string]string{{"version": ucpVersion}},
			"dev.ucp.shopping.order":    []map[string]string{{"version": ucpVersion}},
		},
	}
	return body
}

// priceLineItems resolves products, validates stock, and computes totals. Tax is
// zero (RWF, informal retail); shipping is a flat fee for delivery.
func priceLineItems(c *sb.Client, items []lineItem, ful fulfillment) ([]lineItem, totals, error) {
	var out []lineItem
	sub := 0
	for _, it := range items {
		if it.ProductID == "" {
			return nil, totals{}, errors.New("each line item needs a product_id")
		}
		qty := it.Quantity
		if qty <= 0 {
			qty = 1
		}
		raw, err := c.Get("products?select=*&id=eq."+url.QueryEscape(it.ProductID)+"&limit=1", "")
		if err != nil {
			return nil, totals{}, err
		}
		var ps []ucpProduct
		if err := json.Unmarshal(raw, &ps); err != nil || len(ps) == 0 {
			return nil, totals{}, fmt.Errorf("product not found: %s", it.ProductID)
		}
		p := ps[0]
		if p.Stock < qty {
			return nil, totals{}, fmt.Errorf("only %d of %s in stock", p.Stock, p.Name)
		}
		line := lineItem{ProductID: p.ID, Name: p.Name, Quantity: qty, UnitAmount: p.PriceRWF, TotalAmount: p.PriceRWF * qty}
		sub += line.TotalAmount
		out = append(out, line)
	}
	ship := 0
	if ful.Type == "delivery" {
		ship = deliveryFlatRWF
	}
	return out, totals{SubtotalAmount: sub, TaxAmount: 0, ShippingAmount: ship, TotalAmount: sub + ship, Currency: "RWF"}, nil
}

func createCheckout(w http.ResponseWriter, r *http.Request, c *sb.Client, token, userID string) {
	var req struct {
		Checkout struct {
			LineItems   []lineItem  `json:"line_items"`
			Fulfillment fulfillment `json:"fulfillment"`
		} `json:"checkout"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if len(req.Checkout.LineItems) == 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("checkout.line_items required"))
		return
	}
	ful := req.Checkout.Fulfillment
	if ful.Type == "" {
		ful.Type = "delivery"
	}
	items, tot, err := priceLineItems(c, req.Checkout.LineItems, ful)
	if err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	id := "checkout_" + randomID()
	row := map[string]any{
		"id": id, "user_id": userID, "status": "incomplete",
		"line_items": items, "totals": tot, "fulfillment": ful,
	}
	if _, err := c.Post("ucp_checkout_sessions", token, row, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusCreated, ucpEnvelope(map[string]any{
		"id": id, "status": "incomplete", "line_items": items, "totals": tot, "fulfillment": ful,
	}))
}

func loadCheckout(c *sb.Client, token, id string) (*checkoutSession, error) {
	raw, err := c.Get("ucp_checkout_sessions?select=*&id=eq."+url.QueryEscape(id)+"&limit=1", token)
	if err != nil {
		return nil, err
	}
	var rows []checkoutSession
	if err := json.Unmarshal(raw, &rows); err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return &rows[0], nil
}

func getCheckout(w http.ResponseWriter, c *sb.Client, token, id string) {
	cs, err := loadCheckout(c, token, id)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	if cs == nil {
		sb.WriteError(w, http.StatusNotFound, errors.New("checkout session not found"))
		return
	}
	sb.WriteJSON(w, http.StatusOK, ucpEnvelope(map[string]any{
		"id": cs.ID, "status": cs.Status, "line_items": cs.LineItems, "totals": cs.Totals, "fulfillment": cs.Fulfillment,
	}))
}

// updateCheckout re-prices when line items or fulfillment change. Only an
// incomplete session can be edited.
func updateCheckout(w http.ResponseWriter, r *http.Request, c *sb.Client, token, id string) {
	cs, err := loadCheckout(c, token, id)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	if cs == nil {
		sb.WriteError(w, http.StatusNotFound, errors.New("checkout session not found"))
		return
	}
	if cs.Status != "incomplete" {
		sb.WriteError(w, http.StatusConflict, errors.New("checkout is "+cs.Status+" and can no longer be edited"))
		return
	}
	var req struct {
		LineItems   *[]lineItem  `json:"line_items"`
		Fulfillment *fulfillment `json:"fulfillment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	items := cs.LineItems
	if req.LineItems != nil {
		items = *req.LineItems
	}
	ful := cs.Fulfillment
	if req.Fulfillment != nil {
		ful = *req.Fulfillment
	}
	priced, tot, err := priceLineItems(c, items, ful)
	if err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if _, err := c.Patch("ucp_checkout_sessions?id=eq."+url.QueryEscape(id), token, map[string]any{
		"line_items": priced, "totals": tot, "fulfillment": ful, "updated_at": time.Now().UTC().Format(time.RFC3339),
	}, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, ucpEnvelope(map[string]any{
		"id": id, "status": "incomplete", "line_items": priced, "totals": tot, "fulfillment": ful,
	}))
}

// completeCheckout settles the session against the wallet and creates the order.
// Insufficient funds returns requires_escalation, mirroring UCP's status model.
func completeCheckout(w http.ResponseWriter, r *http.Request, c *sb.Client, token, userID, id string) {
	cs, err := loadCheckout(c, token, id)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	if cs == nil {
		sb.WriteError(w, http.StatusNotFound, errors.New("checkout session not found"))
		return
	}
	if cs.Status == "completed" {
		sb.WriteError(w, http.StatusConflict, errors.New("checkout already completed"))
		return
	}

	// Wallet balance is the payment instrument (Everyday is Merchant of Record).
	walRaw, err := c.Get("wallets?select=id,balance_rwf&user_id=eq."+url.QueryEscape(userID)+"&limit=1", token)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	var wals []struct {
		ID         string `json:"id"`
		BalanceRWF int    `json:"balance_rwf"`
	}
	if err := json.Unmarshal(walRaw, &wals); err != nil || len(wals) == 0 {
		sb.WriteError(w, http.StatusBadRequest, errors.New("no wallet to charge"))
		return
	}
	wal := wals[0]
	if wal.BalanceRWF < cs.Totals.TotalAmount {
		// Mark the session as needing escalation and report it per UCP.
		c.Patch("ucp_checkout_sessions?id=eq."+url.QueryEscape(id), token, map[string]any{"status": "requires_escalation"}, "")
		sb.WriteJSON(w, http.StatusPaymentRequired, ucpEnvelope(map[string]any{
			"id": id, "status": "requires_escalation",
			"error": fmt.Sprintf("wallet balance %d RWF is short of total %d RWF", wal.BalanceRWF, cs.Totals.TotalAmount),
		}))
		return
	}

	// Debit wallet, record the ledger entry, decrement stock per line.
	if _, err := c.Patch("wallets?id=eq."+url.QueryEscape(wal.ID), token, map[string]any{
		"balance_rwf": wal.BalanceRWF - cs.Totals.TotalAmount,
	}, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	title := "Shop order"
	if len(cs.LineItems) == 1 {
		title = cs.LineItems[0].Name
	} else if len(cs.LineItems) > 1 {
		title = fmt.Sprintf("%s + %d more", cs.LineItems[0].Name, len(cs.LineItems)-1)
	}
	c.Post("transactions", token, map[string]any{
		"user_id": userID, "wallet_id": wal.ID, "section": "shop",
		"title": title, "amount_rwf": cs.Totals.TotalAmount, "direction": "out",
		"status": "completed", "kind": "purchase",
	}, "")
	for _, it := range cs.LineItems {
		raw, err := c.Get("products?select=stock,sold&id=eq."+url.QueryEscape(it.ProductID)+"&limit=1", "")
		if err != nil {
			continue
		}
		var ps []ucpProduct
		if json.Unmarshal(raw, &ps); len(ps) == 0 {
			continue
		}
		c.Patch("products?id=eq."+url.QueryEscape(it.ProductID), token, map[string]any{
			"stock": ps[0].Stock - it.Quantity, "sold": ps[0].Sold + it.Quantity,
		}, "")
	}

	// Create the order and complete the session.
	now := time.Now().UTC().Format(time.RFC3339)
	orderID := "order_" + randomID()
	events := []map[string]string{{"type": "order_created", "at": now}, {"type": "payment_captured", "at": now}}
	orderRow := map[string]any{
		"id": orderID, "user_id": userID, "checkout_id": id, "status": "paid",
		"line_items": cs.LineItems, "totals": cs.Totals, "fulfillment": cs.Fulfillment, "events": events,
	}
	if _, err := c.Post("ucp_orders", token, orderRow, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	c.Patch("ucp_checkout_sessions?id=eq."+url.QueryEscape(id), token, map[string]any{"status": "completed"}, "")
	c.Post("activity_events", token, map[string]any{
		"user_id": userID, "section": "shop", "title": "Order placed", "detail": title,
	}, "")

	sb.WriteJSON(w, http.StatusOK, ucpEnvelope(map[string]any{
		"id": id, "status": "completed",
		"order": map[string]any{
			"id": orderID, "status": "paid", "checkout_id": id,
			"line_items": cs.LineItems, "totals": cs.Totals, "fulfillment": cs.Fulfillment, "events": events,
		},
	}))
}

func getOrder(w http.ResponseWriter, c *sb.Client, token, id string) {
	raw, err := c.Get("ucp_orders?select=*&id=eq."+url.QueryEscape(id)+"&limit=1", token)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	var rows []map[string]any
	if err := json.Unmarshal(raw, &rows); err != nil || len(rows) == 0 {
		sb.WriteError(w, http.StatusNotFound, errors.New("order not found"))
		return
	}
	sb.WriteJSON(w, http.StatusOK, ucpEnvelope(map[string]any{"order": rows[0]}))
}

// randomID returns a short time-ordered id suffix (no crypto needed — the row
// is namespaced by user via RLS).
func randomID() string {
	return fmt.Sprintf("%x", time.Now().UnixNano())
}
