# CricketSaathi architecture

## System overview

```text
React UI (Vite)
  ├── Live scoreboard and demo controls
  ├── Catch Me Up panel
  ├── Hinglish Co-watcher chat
  └── Momentum chart and key-moment timeline
             │ /api/*
             ▼
Express API
  ├── Match routes ──> In-memory match engine
  │                     ├── score / wickets / legal balls
  │                     ├── target and chase calculations
  │                     └── recent delivery + event history
  └── AI routes ─────> AI service
                        ├── Groq chat completion (when configured)
                        └── deterministic demo fallback
```

## Why the match engine is separate from the LLM

Match arithmetic and event facts are deterministic backend responsibilities. The engine owns the score, legal-ball count, target, wickets, required runs, balls remaining, run rates, recent deliveries, and key moments. The LLM receives a compact, read-only snapshot of those facts and converts it into a human explanation.

This split reduces the chance that generated prose invents a score or calculates a run rate incorrectly. The model is instructed to acknowledge when the supplied context does not contain a requested statistic.

## Catch Me Up request flow

1. The client calls `POST /api/ai/recap` with the selected language.
2. The backend reads the current match snapshot from the match engine.
3. The AI service assembles current score facts and recent events.
4. If `GROQ_API_KEY` is configured, the service asks the selected Groq model for a concise recap.
5. If Groq is not configured or the request fails, a clearly labelled demo template is returned.

## Co-watcher request flow

1. The user submits a question and selected language.
2. The client sends the question, up to six recent chat messages, and the selected language to `POST /api/ai/chat`.
3. The backend validates the question, reads the latest match snapshot, and builds a grounding prompt.
4. Groq generates the answer, or the demo rule explainer responds when no live LLM is available.

## Important product/engineering trade-offs

- **No database in this MVP:** the sample match is a self-contained reproducible demo. State is in memory and resets when the server restarts.
- **No third-party cricket feed:** the assignment prototype uses simulated ball-by-ball events. A real deployment must use a licensed data source and clearly distinguish live provider data from sample/demo data.
- **No model-owned score math:** the backend computes score-derived values; the model explains them.
- **Language as an explicit parameter:** Hinglish, Hindi, and English are selected by the fan, not guessed from their question.
- **Safe API key handling:** Groq credentials are read only by the backend.

## v1.1 additions

- **Per-visitor sessions:** the client sends a random `X-Session-Id`; the server keeps one match per id in memory (2 hour expiry, 500 session cap). Without an id, requests share a `default` match.
- **Missed-ball window:** the engine keeps a ball log. `getMissed` summarises the deliveries since the fan last looked (`sinceBalls`) or the last N overs (`lastOvers`), and the recap prompt is built from that window plus the current state.
- **Reasoning-model handling:** for `gpt-oss` and `qwen3` models the Groq call uses `reasoning_effort` and extra token headroom. If Groq returns nothing, the response carries a `fallbackReason` so the UI says why the built-in recap is shown. `GET /api/ai/check` tests the key and model.
- **Rate limiting:** limits are counted per session id (falling back to IP), with `trust proxy` set so hosted deployments see real client addresses.
- **Single-service deploy:** if `client/dist` exists, Express serves it.
