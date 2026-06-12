package handler

// Bounty is the bridge.
//
// It owns no domain. It reads a coherent snapshot across every service —
// shop, save, pay, plan, listen, commute — so the assistant can answer
// "what should I do?" with the whole user context in hand.
//
// Design rules:
//   * Read-only. Mutations always go through the owning service.
//   * Partial failure is acceptable. A slow or down section degrades its slice
//     to null + an entry in `errors`; the rest of the snapshot still ships.
//   * Public sections (shop catalog, listen, commute) load even without a JWT.
//   * Private sections (save, pay, plan) require a session and silently
//     omit themselves if the caller is anonymous.

import (
	"encoding/json"
	"net/http"
	"strings"
	"sync"

	"everyday/api/internal/sb"
)

type snapshot struct {
	Ask     string            `json:"ask,omitempty"`
	UserID  string            `json:"user_id,omitempty"`
	Shop    json.RawMessage   `json:"shop,omitempty"`
	Save    json.RawMessage   `json:"save,omitempty"`
	Pay     json.RawMessage   `json:"pay,omitempty"`
	Plan    json.RawMessage   `json:"plan,omitempty"`
	Listen  json.RawMessage   `json:"listen,omitempty"`
	Commute json.RawMessage   `json:"commute,omitempty"`
	Errors  map[string]string `json:"errors,omitempty"`
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

	ask := strings.TrimSpace(r.URL.Query().Get("ask"))
	if r.Method == "POST" {
		var body struct {
			Ask string `json:"ask"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		if body.Ask != "" {
			ask = body.Ask
		}
	}

	token := sb.UserToken(r)
	out := snapshot{Ask: ask, Errors: map[string]string{}}

	var (
		mu     sync.Mutex
		wg     sync.WaitGroup
		userID string
	)
	record := func(name string, err error) {
		if err == nil {
			return
		}
		mu.Lock()
		defer mu.Unlock()
		out.Errors[name] = err.Error()
	}

	if token != "" {
		if uid, err := c.UserID(token); err == nil {
			userID = uid
			out.UserID = uid
		} else {
			record("auth", err)
		}
	}

	// Public slices — load for everyone.
	wg.Add(3)
	go func() {
		defer wg.Done()
		shops, sErr := c.Get("shops?select=*&order=name.asc", "")
		products, pErr := c.Get("products?select=*&order=sold.desc&limit=12", "")
		record("shop.shops", sErr)
		record("shop.products", pErr)
		if sErr == nil && pErr == nil {
			out.Shop = mergeJSON("shops", shops, "products", products)
		}
	}()
	go func() {
		defer wg.Done()
		d, err := c.Get("commute_options?select=*&order=eta_min.asc", "")
		record("commute", err)
		if err == nil {
			out.Commute = d
		}
	}()
	go func() {
		defer wg.Done()
		sources, sErr := c.Get("listen_sources?select=*&order=name.asc", "")
		episodes, eErr := c.Get("listen_episodes?select=*&order=published_label.desc&limit=20", "")
		record("listen.sources", sErr)
		record("listen.episodes", eErr)
		if sErr == nil && eErr == nil {
			out.Listen = mergeJSON("sources", sources, "episodes", episodes)
		}
	}()

	// Private slices — load only with a session.
	if userID != "" {
		wg.Add(3)
		go func() {
			defer wg.Done()
			wallet, wErr := c.Get("wallets?select=*&user_id=eq."+userID+"&limit=1", token)
			txs, tErr := c.Get("transactions?select=*&user_id=eq."+userID+"&section=eq.save&order=happened_at.desc&limit=20", token)
			record("save.wallet", wErr)
			record("save.transactions", tErr)
			if wErr == nil && tErr == nil {
				out.Save = mergeJSON("wallet", wallet, "transactions", txs)
			}
		}()
		go func() {
			defer wg.Done()
			txs, err := c.Get("transactions?select=*&user_id=eq."+userID+"&section=eq.pay&order=happened_at.desc&limit=20", token)
			record("pay", err)
			if err == nil {
				out.Pay = mergeJSON("transactions", txs)
			}
		}()
		go func() {
			defer wg.Done()
			folders, fErr := c.Get("plan_folders?select=*&user_id=eq."+userID+"&order=created_at.asc", token)
			files, flErr := c.Get("plan_files?select=*&user_id=eq."+userID+"&order=updated.desc&limit=50", token)
			record("plan.folders", fErr)
			record("plan.files", flErr)
			if fErr == nil && flErr == nil {
				out.Plan = mergeJSON("folders", folders, "files", files)
			}
		}()
	}

	wg.Wait()
	if len(out.Errors) == 0 {
		out.Errors = nil
	}
	sb.WriteJSON(w, http.StatusOK, out)
}

func mergeJSON(kv ...any) json.RawMessage {
	obj := make(map[string]json.RawMessage, len(kv)/2)
	for i := 0; i+1 < len(kv); i += 2 {
		k, _ := kv[i].(string)
		v, _ := kv[i+1].(json.RawMessage)
		obj[k] = v
	}
	b, _ := json.Marshal(obj)
	return b
}
