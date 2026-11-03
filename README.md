# CricketSaathi — Your AI Cricket Co-watcher

CricketSaathi is a full-stack prototype built around two fan problems:

1. **Catch Me Up:** a one-tap, approximately 15-second summary of what happened, the current score situation, and what to watch next.
2. **Hinglish Co-watcher:** a match-aware assistant that explains cricket rules, terminology, and the current chase in Hinglish, Hindi, or English.

It also includes a live-style scoreboard, an interactive ball-by-ball demo feed, a runs-per-over chart, and a key-moments timeline.

> **Prototype data notice:** the included Pune Panthers vs Jaipur Jaguars match is simulated demonstration data with fictional teams and players. It is not a real or licensed live score feed. The UI labels the match as an interactive demo. Connect a licensed cricket data provider before presenting it as real live match coverage.

## Features

- Responsive dark sports dashboard for desktop and mobile.
- Demo match engine with **Advance 1 ball**, **Look away for 2 overs** and reset controls. Every browser tab gets its own match, so visitors never affect each other.
- **Catch Me Up since you last looked:** the recap covers exactly the balls you missed (or the last 2 or 5 overs).
- Score, wickets, overs, target, runs required, balls remaining, current run rate, and required run rate recalculated by the backend.
- Catch Me Up recap in Hinglish, Hindi, or English.
- Ask Saathi chat with suggested prompts and conversation context.
- Groq API integration kept on the server (the API key is never sent to the browser).
- Deterministic demo responses when no Groq key is configured or the Groq request fails.
- AI request rate limiting and basic HTTP security headers.

## Tech stack

- **Frontend:** React 18, Vite, custom CSS, Recharts, Lucide React
- **Backend:** Node.js, Express
- **LLM:** Groq API (default model: `openai/gpt-oss-20b`, configurable)
- **Match data:** in-memory simulated match engine for this prototype

No database is required to run the demo. The match state resets when the backend restarts.

## Requirements

- Node.js 20 or newer
- npm 10 or newer (npm bundled with a recent Node.js version is fine)
- A Groq API key for live LLM-generated responses (optional for local demo mode)

## Run locally

Open a terminal in the `CricketSaathi` root folder.

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the backend

Create `server/.env` by copying `server/.env.example`.

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

`GROQ_API_KEY` is optional. Leave it blank to use the clearly labelled demo response engine. Never put the Groq key in a `client/.env` file or in frontend code.

### 3. Start frontend and backend

From the project root:

```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend health: <http://localhost:5000/api/health>

The Vite development server proxies `/api` requests to the Express server.

You can also run the processes in two terminals:

```bash
# Terminal 1
cd server
npm run dev
```

```bash
# Terminal 2
cd client
npm run dev
```

### 4. Run the match-engine tests

```bash
npm run test:server
```

### 5. Create a production frontend build

```bash
npm run build
```

The compiled frontend is written to `client/dist/`.

## Demo walkthrough

A simple 3-minute product demo:

1. Open the dashboard and explain the fan problem: a scoreboard gives numbers but does not tell a returning fan the story of the match.
2. Click **Catch me up**. Show the recap and switch between Hinglish, Hindi, and English.
3. In Ask Saathi, try `Free hit kya hota hai?`, `DLS method simple words mein?`, or `Why is the chase difficult now?`.
4. Click **Advance 1 ball**. Point out that the backend updates the match state and that the recap/chat use the latest match context.
5. Generate another recap to show how the situation changes with the feed.
6. Explain the grounding choice: score arithmetic and event history are structured backend data; the LLM explains those facts rather than inventing them.

Suggested questions for the demo:

- `Free hit kya hota hai?`
- `Why is the chase difficult now?`
- `DLS method simple words mein?`
- `Powerplay mein fielding restrictions kyun hoti hain?`

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health |
| GET | `/api/match/current` | Current simulated match state (per `X-Session-Id`) |
| POST | `/api/match/advance` | Advance the match; body `{ "balls": 1 }` (1 to 18) |
| POST | `/api/match/reset` | Reset the simulated match |
| GET | `/api/ai/status` | Reports Groq or demo mode |
| GET | `/api/ai/check` | Tiny live test of your Groq key and model |
| POST | `/api/ai/recap` | Generate a recap; body: `{ "language": "hinglish", "sinceBalls": 86 }` or `{ "lastOvers": 2 }` |
| POST | `/api/ai/chat` | Ask a question; body: `{ "question": "...", "language": "hinglish", "history": [] }` |

Supported language values: `hinglish`, `hindi`, `english`.

## Deployment

### Single service (recommended)

The Express server also serves the built client, so one deployment gives one public URL with no CORS or proxy setup.

- Build command: `npm install --include=dev --prefix server && npm install --include=dev --prefix client && npm run build` (the client build needs dev dependencies such as Vite)
- Start command: `npm start`
- Environment variables: `GROQ_API_KEY` (needed for live AI), `NODE_VERSION=20`, optionally `GROQ_MODEL`
- Health check path (optional): `/api/health`
- Open `/api/ai/check` after deploying to confirm your Groq key and model work.
- Free hosts sleep when idle, so open the link a minute before you share it.

### Alternative: split deployment

#### Backend (Render, Railway, or another Node host)

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `GROQ_API_KEY`: your key (optional, but needed for live LLM responses)
  - `GROQ_MODEL`: `openai/gpt-oss-20b` or another model enabled for your Groq account
  - `CLIENT_ORIGIN`: your deployed frontend origin, e.g. `https://your-app.vercel.app`
  - `NODE_ENV`: `production`
  - `PORT`: normally supplied by the host

#### Frontend (Vercel)

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Add a `client/vercel.json` rewrite (already included) so `/api/*` calls are forwarded to your backend, or set up an equivalent Vercel rewrite to your deployed backend URL.

Before deploying, replace the placeholder backend URL in `client/vercel.json` with your actual backend URL. Also set the backend `CLIENT_ORIGIN` to the Vercel production domain.

## Project structure

```text
CricketSaathi/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── CatchMeUp.jsx
│       │   ├── CoWatcher.jsx
│       │   ├── Header.jsx
│       │   ├── MomentumPanel.jsx
│       │   └── ScoreCard.jsx
│       ├── api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── server/
│   ├── src/
│   │   ├── data/initialMatch.js
│   │   ├── middleware/
│   │   ├── routes/aiRoutes.js
│   │   ├── routes/matchRoutes.js
│   │   ├── services/aiService.js
│   │   ├── services/matchEngine.js
│   │   └── server.js
│   └── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   └── DEMO_SCRIPT.md
├── .env.example
├── package.json
└── README.md
```

## Important next step before a real live-match demo

The current feed is intentionally simulated so the entire experience is reproducible without a third-party sports API account. For real live scores, integrate a licensed cricket-data provider in the backend and map its ball-by-ball events to the match-engine response shape. Keep provider credentials on the server, preserve the `match` JSON contract, and make the UI distinguish real provider data from demo data.

## Notes

- The prototype does not calculate official DLS par scores or win probabilities.
- Match state is stored in memory; it is not persistent and is reset by a server restart.
- Demo-mode answers are deterministic templates, not generated by an LLM. Add a valid Groq API key to enable Groq-powered responses.
- Cricket laws and playing conditions can have exceptions. The assistant is designed as a fan explainer, not an official umpiring source.
