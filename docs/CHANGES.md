# Changes in v1.1

| Area | Before | Now |
|---|---|---|
| Match state | One global match shared by all visitors | One match per visitor session |
| Rate limiting | Likely counted the proxy IP when hosted | `trust proxy` set; counted per session |
| Groq reasoning model | Small token limit could return empty text and silently fall back | `reasoning_effort` plus headroom; explicit `fallbackReason`; `/api/ai/check` |
| Match engine | Dismissed batters stayed in the list, partnership never reset, a dismissed player returned | Wicket replaces the batter, partnership resets, result text added |
| Demo data | Real players and a "Tonight" fixture | Fictional teams, players and venue |
| Catch Me Up | Last 6 balls only | Covers what you missed since you last looked, or the last 2 or 5 overs |
| Deployment | Frontend needed a placeholder backend URL | Server can serve the built client (single URL) |
| Small | Generic GitHub link, no favicon | GitHub link only if `VITE_GITHUB_URL` is set; favicon added |
