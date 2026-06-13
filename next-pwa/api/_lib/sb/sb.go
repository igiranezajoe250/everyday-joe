package sb

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type Client struct {
	URL     string
	AnonKey string
	HTTP    *http.Client
}

func New() (*Client, error) {
	url := first(os.Getenv("SUPABASE_URL"), os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	key := first(os.Getenv("SUPABASE_ANON_KEY"), os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
	if url == "" || key == "" {
		return nil, errors.New("supabase env not configured")
	}
	return &Client{URL: url, AnonKey: key, HTTP: &http.Client{Timeout: 8 * time.Second}}, nil
}

// NewService returns a client authenticated with the service-role key. It
// bypasses RLS and must ONLY be used from trusted server contexts (the interest
// cron). Never expose a service-role client to a user-facing request path.
func NewService() (*Client, error) {
	url := first(os.Getenv("SUPABASE_URL"), os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	key := first(os.Getenv("SUPABASE_SERVICE_ROLE_KEY"), os.Getenv("SUPABASE_SERVICE_KEY"))
	if url == "" || key == "" {
		return nil, errors.New("supabase service env not configured")
	}
	// AnonKey carries the service key here; with an empty token, do() sends it as
	// both apikey and bearer, which PostgREST treats as service-role.
	return &Client{URL: url, AnonKey: key, HTTP: &http.Client{Timeout: 20 * time.Second}}, nil
}

// RPC calls a Postgres function via PostgREST (/rest/v1/rpc/<fn>). Pass nil args
// for a no-argument function.
func (c *Client) RPC(fn string, args any) (json.RawMessage, error) {
	if args == nil {
		args = map[string]any{}
	}
	return c.Post("rpc/"+fn, "", args, "")
}

func first(vs ...string) string {
	for _, v := range vs {
		if v != "" {
			return v
		}
	}
	return ""
}

// UserToken pulls the JWT off the incoming request. Empty string means anon.
func UserToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if strings.HasPrefix(h, "Bearer ") {
		return strings.TrimPrefix(h, "Bearer ")
	}
	return ""
}

func (c *Client) do(method, path, token string, body io.Reader, prefer string) ([]byte, int, error) {
	req, err := http.NewRequest(method, c.URL+"/rest/v1/"+path, body)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("apikey", c.AnonKey)
	auth := c.AnonKey
	if token != "" {
		auth = token
	}
	req.Header.Set("Authorization", "Bearer "+auth)
	req.Header.Set("Content-Type", "application/json")
	if prefer != "" {
		req.Header.Set("Prefer", prefer)
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	return b, resp.StatusCode, nil
}

func (c *Client) Get(path, token string) (json.RawMessage, error) {
	b, code, err := c.do("GET", path, token, nil, "")
	if err != nil {
		return nil, err
	}
	if code >= 300 {
		return nil, fmt.Errorf("supabase GET %s: %d %s", path, code, string(b))
	}
	return json.RawMessage(b), nil
}

func (c *Client) Post(path, token string, body any, prefer string) (json.RawMessage, error) {
	payload, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	b, code, err := c.do("POST", path, token, bytes.NewReader(payload), prefer)
	if err != nil {
		return nil, err
	}
	if code >= 300 {
		return nil, fmt.Errorf("supabase POST %s: %d %s", path, code, string(b))
	}
	return json.RawMessage(b), nil
}

func (c *Client) Patch(path, token string, body any, prefer string) (json.RawMessage, error) {
	payload, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	b, code, err := c.do("PATCH", path, token, bytes.NewReader(payload), prefer)
	if err != nil {
		return nil, err
	}
	if code >= 300 {
		return nil, fmt.Errorf("supabase PATCH %s: %d %s", path, code, string(b))
	}
	return json.RawMessage(b), nil
}

func (c *Client) Delete(path, token string) error {
	b, code, err := c.do("DELETE", path, token, nil, "")
	if err != nil {
		return err
	}
	if code >= 300 {
		return fmt.Errorf("supabase DELETE %s: %d %s", path, code, string(b))
	}
	return nil
}

// UserID hits /auth/v1/user with the bearer token. Empty token = error.
func (c *Client) UserID(token string) (string, error) {
	if token == "" {
		return "", errors.New("missing user token")
	}
	req, _ := http.NewRequest("GET", c.URL+"/auth/v1/user", nil)
	req.Header.Set("apikey", c.AnonKey)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("auth user: %d %s", resp.StatusCode, string(b))
	}
	var out struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(b, &out); err != nil {
		return "", err
	}
	if out.ID == "" {
		return "", errors.New("no user id in session")
	}
	return out.ID, nil
}

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func WriteError(w http.ResponseWriter, status int, err error) {
	WriteJSON(w, status, map[string]string{"error": err.Error()})
}

func RequireMethod(w http.ResponseWriter, r *http.Request, methods ...string) bool {
	for _, m := range methods {
		if r.Method == m {
			return true
		}
	}
	w.Header().Set("Allow", strings.Join(methods, ", "))
	WriteError(w, http.StatusMethodNotAllowed, fmt.Errorf("method %s not allowed", r.Method))
	return false
}
