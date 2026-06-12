package handler

// Shop service.
//
//   GET  /api/shop                catalog (shops + products), public
//   POST /api/shop  { product_id, quantity }
//                                 place an order — records a ledger entry
//                                 (transactions.section = "shop", direction = "out")
//                                 and decrements stock atomically per row.
//
// Stock is the single source of truth for availability. Orders are append-only
// ledger writes; we never mutate or delete a recorded order.

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"everyday/api/internal/sb"
)

type product struct {
	ID       string `json:"id"`
	ShopID   string `json:"shop_id"`
	Name     string `json:"name"`
	Category string `json:"category"`
	PriceRWF int    `json:"price_rwf"`
	Stock    int    `json:"stock"`
	Sold     int    `json:"sold"`
}

type orderReq struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
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
	switch r.Method {
	case "GET":
		handleCatalog(w, c)
	case "POST":
		handleOrder(w, r, c)
	}
}

func handleCatalog(w http.ResponseWriter, c *sb.Client) {
	var shops, products json.RawMessage
	var sErr, pErr error
	var wg sync.WaitGroup
	wg.Add(2)
	go func() { defer wg.Done(); shops, sErr = c.Get("shops?select=*&order=name.asc", "") }()
	go func() { defer wg.Done(); products, pErr = c.Get("products?select=*&order=sold.desc", "") }()
	wg.Wait()
	if sErr != nil {
		sb.WriteError(w, http.StatusBadGateway, sErr)
		return
	}
	if pErr != nil {
		sb.WriteError(w, http.StatusBadGateway, pErr)
		return
	}
	w.Header().Set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
	sb.WriteJSON(w, http.StatusOK, map[string]json.RawMessage{
		"shops":    shops,
		"products": products,
	})
}

func handleOrder(w http.ResponseWriter, r *http.Request, c *sb.Client) {
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
	var req orderReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	if req.ProductID == "" {
		sb.WriteError(w, http.StatusBadRequest, errors.New("product_id required"))
		return
	}
	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	prodRaw, err := c.Get("products?select=*&id=eq."+url.QueryEscape(req.ProductID)+"&limit=1", "")
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	var prods []product
	if err := json.Unmarshal(prodRaw, &prods); err != nil || len(prods) == 0 {
		sb.WriteError(w, http.StatusNotFound, errors.New("product not found"))
		return
	}
	p := prods[0]
	if p.Stock < req.Quantity {
		sb.WriteError(w, http.StatusConflict, fmt.Errorf("only %d in stock", p.Stock))
		return
	}
	total := p.PriceRWF * req.Quantity

	if _, err := c.Post("transactions", token, map[string]any{
		"user_id":    userID,
		"section":    "shop",
		"title":      p.Name,
		"amount_rwf": total,
		"direction":  "out",
		"status":     "completed",
	}, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}

	if _, err := c.Patch("products?id=eq."+url.QueryEscape(p.ID), token, map[string]any{
		"stock": p.Stock - req.Quantity,
		"sold":  p.Sold + req.Quantity,
	}, "return=representation"); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}

	sb.WriteJSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"product":   p.ID,
		"quantity":  req.Quantity,
		"total_rwf": total,
	})
}
