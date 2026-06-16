package main

import "testing"

func TestParseGoogleAIKey(t *testing.T) {
	key := parseGoogleAIKey(`
# local secret file
GEMINI_API_KEY=AIza-test-key
`)
	if key != "AIza-test-key" {
		t.Fatalf("expected Gemini key, got %q", key)
	}
}

func TestParseGoogleAIKeyBareValue(t *testing.T) {
	key := parseGoogleAIKey(`"AIza-bare-key"`)
	if key != "AIza-bare-key" {
		t.Fatalf("expected bare Gemini key, got %q", key)
	}
}
