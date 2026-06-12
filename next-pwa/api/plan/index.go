package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"everyday/api/_lib/sb"
)

type folder struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type file struct {
	ID          string          `json:"id"`
	FolderID    string          `json:"folderId"`
	Title       string          `json:"title"`
	Body        string          `json:"body"`
	Updated     int64           `json:"updated"`
	Attachments json.RawMessage `json:"attachments"`
	Voice       json.RawMessage `json:"voice"`
	Trashed     bool            `json:"trashed"`
}

type saveReq struct {
	Folders []folder `json:"folders"`
	Files   []file   `json:"files"`
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
		handleSave(w, r, c, token, userID)
	}
}

func handleGet(w http.ResponseWriter, c *sb.Client, token, userID string) {
	folders, err := c.Get("plan_folders?select=*&user_id=eq."+userID+"&order=created_at.asc", token)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	files, err := c.Get("plan_files?select=*&user_id=eq."+userID+"&order=updated.desc", token)
	if err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{
		"folders": folders,
		"files":   files,
	})
}

func handleSave(w http.ResponseWriter, r *http.Request, c *sb.Client, token, userID string) {
	var req saveReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sb.WriteError(w, http.StatusBadRequest, err)
		return
	}
	now := time.Now().UnixMilli()

	folderRows := make([]map[string]any, 0, len(req.Folders))
	for _, f := range req.Folders {
		name := f.Name
		if name == "" {
			name = "Untitled"
		}
		icon := f.Icon
		if icon == "" {
			icon = "folder"
		}
		folderRows = append(folderRows, map[string]any{
			"id":      f.ID,
			"user_id": userID,
			"name":    name,
			"icon":    icon,
		})
	}

	defaultFolder := "personal"
	if len(folderRows) > 0 {
		defaultFolder = folderRows[0]["id"].(string)
	}

	fileRows := make([]map[string]any, 0, len(req.Files))
	for _, f := range req.Files {
		folderID := f.FolderID
		if folderID == "" {
			folderID = defaultFolder
		}
		updated := f.Updated
		if updated == 0 {
			updated = now
		}
		attachments := f.Attachments
		if len(attachments) == 0 {
			attachments = json.RawMessage("[]")
		}
		voice := f.Voice
		if len(voice) == 0 {
			voice = json.RawMessage("[]")
		}
		fileRows = append(fileRows, map[string]any{
			"id":          f.ID,
			"user_id":     userID,
			"folder_id":   folderID,
			"title":       f.Title,
			"body":        f.Body,
			"attachments": attachments,
			"voice":       voice,
			"trashed":     f.Trashed,
			"updated":     updated,
		})
	}

	if err := c.Delete("plan_files?user_id=eq."+userID, token); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	if err := c.Delete("plan_folders?user_id=eq."+userID, token); err != nil {
		sb.WriteError(w, http.StatusBadGateway, err)
		return
	}
	if len(folderRows) > 0 {
		if _, err := c.Post("plan_folders", token, folderRows, ""); err != nil {
			sb.WriteError(w, http.StatusBadGateway, err)
			return
		}
	}
	if len(fileRows) > 0 {
		if _, err := c.Post("plan_files", token, fileRows, ""); err != nil {
			sb.WriteError(w, http.StatusBadGateway, err)
			return
		}
	}
	sb.WriteJSON(w, http.StatusOK, map[string]any{"ok": true, "folders": len(folderRows), "files": len(fileRows)})
}
