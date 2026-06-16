# Lean agent service: Go-only. Serves Bounty + section agents + the model chain
# (Gemini -> Qwen -> Gemma). The Python ASR/TTS path is invoked lazily and
# is intentionally NOT bundled here — voice synthesis is a later phase. Chat,
# A2A, MCP, and the Save expert all work without it.
FROM golang:1.25-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/agent .

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /out/agent /app/agent
# Render provides $PORT; bind to it. VOICE_SERVICE_ADDR overrides cfg.Addr.
ENV VOICE_SERVICE_ADDR=0.0.0.0:8787
EXPOSE 8787
CMD ["/app/agent"]
