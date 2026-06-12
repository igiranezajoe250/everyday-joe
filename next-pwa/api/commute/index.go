package handler

import (
	"net/http"

	"everyday/api/internal/sb"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	if !sb.RequireMethod(w, r, "GET") {
		return
	}
	c, err := sb.New()
	if err != nil {
		sb.WriteError(w, http.StatusInternalServerError, err)
		return
	}
	data, err := c.Get("commute_options?select=*&order=eta_min.asc", "")
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
	_, _ = w.Write(data)
}
