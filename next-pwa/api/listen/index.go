package handler

import (
	"encoding/json"
	"net/http"
	"sync"

	"everyday/api/_lib/sb"
)

type response struct {
	Sources  json.RawMessage `json:"sources"`
	Episodes json.RawMessage `json:"episodes"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if !sb.RequireMethod(w, r, "GET") {
		return
	}
	c, err := sb.New()
	if err != nil {
		sb.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	var out response
	var wg sync.WaitGroup
	errs := make(chan error, 2)
	wg.Add(2)
	go func() {
		defer wg.Done()
		d, err := c.Get("listen_sources?select=*&order=name.asc", "")
		if err != nil {
			errs <- err
			return
		}
		out.Sources = d
	}()
	go func() {
		defer wg.Done()
		d, err := c.Get("listen_episodes?select=*&order=published_label.desc", "")
		if err != nil {
			errs <- err
			return
		}
		out.Episodes = d
	}()
	wg.Wait()
	close(errs)
	for e := range errs {
		sb.WriteError(w, http.StatusBadGateway, e)
		return
	}
	w.Header().Set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
	sb.WriteJSON(w, http.StatusOK, out)
}
