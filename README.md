# 🏏 CricketSaathi — Your AI Cricket Co-watcher

CricketSaathi is a full-stack web application that acts as an AI co-watcher for cricket fans. A scoreboard gives you numbers but not the story, so CricketSaathi solves two fan problems: catching up fast after looking away, and understanding the game in your own language.

🚀 **Live Demo:** https://cricketsaathi.onrender.com/

> ⚠️ **Prototype data notice:** The included Pune Panthers vs Jaipur Jaguars match is **simulated demonstration data** with fictional teams and players. It is not a real or licensed live score feed, and the UI labels it as an interactive demo. Connect a licensed cricket data provider before presenting it as real live match coverage.

---

## 💡 What It Does

1. **Catch Me Up:** a one-tap, ~15-second summary of what happened, the current score situation, and what to watch next.
2. **Hinglish Co-watcher:** a match-aware assistant that explains cricket rules, terminology, and the current chase in Hinglish, Hindi, or English.

---

## 🚀 Features

- Responsive dark sports dashboard for desktop and mobile
- Live-style scoreboard with a runs-per-over chart and key-moments timeline
- Demo match engine with **Advance 1 ball**, **Look away for 2 overs**, and reset controls
- **Catch Me Up since you last looked:** recaps exactly the balls you missed (or the last 2 or 5 overs)
- Recaps in **Hinglish, Hindi, or English**
- **Ask Saathi** chat with suggested prompts and conversation context
- Backend-calculated score, wickets, overs, target, runs required, balls remaining, current run rate, and required run rate
- Isolated match per browser tab, so visitors never affect each other
- Deterministic demo responses when no Groq key is configured or the Groq request fails
- AI request rate limiting and basic HTTP security headers

---

## 🛠 Tech Stack

### Frontend
- React 18
- Vite
- Custom CSS
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js

### AI Integration
- Groq API (default model: `openai/gpt-oss-20b`, configurable)

### Match Data
- In-memory simulated match engine (no database required)

### Deployment
- Single-service deployment (Express serves the built client), or split deployment with Render/Railway + Vercel

---

## 🧠 System Architecture

- The React frontend communicates with the Express backend via REST APIs
- The Vite dev server proxies `/api` requests to the backend during development
- The backend owns the match state and recalculates all score arithmetic and run rates
- Each browser tab is identified by an `X-Session-Id` header and gets its own simulated match
- Recap and chat requests are built from structured match data and event history, then sent to Groq
- If no Groq key is set, or a request fails, the backend falls back to deterministic demo responses
- In production, Express also serves the compiled frontend, giving one public URL with no CORS setup

---

## 🤖 AI Integration & Grounding

### Groq API
Used for:
- Catch Me Up recaps in Hinglish, Hindi, or English
- Answering rules and terminology questions (e.g. free hit, DLS, powerplay)
- Explaining the current chase using live match context

### Grounding Choice
Score arithmetic and event history are **structured backend data**. The LLM explains those facts rather than inventing them, which keeps recaps consistent with the scoreboard.

### Security
- The Groq API key stays on the server and is never sent to the browser
- Never place the key in a `client/.env` file or in frontend code

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health |
| GET | `/api/match/current` | Current simulated match state (per `X-Session-Id`) |
| POST | `/api/match/advance` | Advance the match; body `{ "balls": 1 }` (1 to 18) |
| POST | `/api/match/reset` | Reset the simulated match |
| GET | `/api/ai/status` | Reports Groq or demo mode |
| GET | `/api/ai/check` | Tiny live test of your Groq key and model |
| POST | `/api/ai/recap` | Generate a recap; body `{ "language": "hinglish", "sinceBalls": 86 }` or `{ "lastOvers": 2 }` |
| POST | `/api/ai/chat` | Ask a question; body `{ "question": "...", "language": "hinglish", "history": [] }` |

Supported `language` values: `hinglish`, `hindi`, `english`.

---

## 🎬 Demo Walkthrough

A simple 3-minute product demo:

1. Open the dashboard and explain the fan problem: a scoreboard gives numbers but not the story of the match.
2. Click **Catch me up**, then switch between Hinglish, Hindi, and English.
3. In Ask Saathi, try one of the suggested questions below.
4. Click **Advance 1 ball** and note that the recap and chat now use the latest match context.
5. Generate another recap to show how the situation changes with the feed.
6. Explain the grounding choice: structured backend data, with the LLM explaining the facts.

**Suggested questions:**
- `Free hit kya hota hai?`
- `Why is the chase difficult now?`
- `DLS method simple words mein?`
- `Powerplay mein fielding restrictions kyun hoti hain?`

---

## 📁 Project Structure

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

---

## 🚀 Deployment

### Option 1: Single Service (Recommended)

Express serves the built client, so one deployment gives one public URL.

- **Build command:** `npm install --include=dev --prefix server && npm install --include=dev --prefix client && npm run build`
- **Start command:** `npm start`
- **Environment variables:** `GROQ_API_KEY` (for live AI), `NODE_VERSION=20`, optionally `GROQ_MODEL`
- **Health check path (optional):** `/api/health`
- After deploying, open `/api/ai/check` to confirm your Groq key and model work
- Free hosts sleep when idle, so open the link a minute before you share it

### Option 2: Split Deployment

**Backend (Render, Railway, or another Node host)**
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `GROQ_API_KEY`: your key (optional, but needed for live LLM responses)
  - `GROQ_MODEL`: `openai/gpt-oss-20b` or another model enabled for your account
  - `CLIENT_ORIGIN`: your deployed frontend origin, e.g. `https://your-app.vercel.app`
  - `NODE_ENV`: `production`
  - `PORT`: normally supplied by the host

**Frontend (Vercel)**
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- `client/vercel.json` rewrites `/api/*` calls to your backend. Replace the placeholder backend URL in that file with your actual backend URL, and set `CLIENT_ORIGIN` on the backend to your Vercel production domain.

---

## ⚙ Challenges & Learnings

### Challenges
- Keeping LLM output consistent with the actual match state
- Keeping per-visitor demo state isolated without a database
- Making the experience reliable when the AI provider is unavailable
- Supporting natural Hinglish alongside Hindi and English

### Learnings
- Grounding LLMs in structured data instead of letting them compute facts
- Designing graceful fallbacks for AI failures
- Protecting API keys with a server-side proxy pattern
- Rate limiting and securing AI endpoints
- Single-service deployment for simpler hosting

---

## 🔮 Future Improvements

- Integrate a licensed cricket data provider for real live matches, mapping its ball-by-ball events to the existing `match` JSON contract
- Clearly distinguish real provider data from demo data in the UI
- Add official DLS par scores and win probability calculations
- Persist match state and chat history in a database
- Add voice input and commentary-style audio recaps
- Add more languages and regional commentary styles

---

## 🧪 Getting Started (Local Setup)

### Requirements
- Node.js 20 or newer
- npm 10 or newer
- A Groq API key for live LLM responses (optional for local demo mode)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/CricketSaathi.git
cd CricketSaathi
```

### 2️⃣ Install dependencies
```bash
npm run install:all
```

### 3️⃣ Add environment variables

Create `server/.env` by copying `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Then set `GROQ_API_KEY` in `server/.env`. This is optional: leave it blank to use the clearly labelled demo response engine.

### 4️⃣ Start frontend and backend
```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend health: <http://localhost:5000/api/health>

Or run them in two terminals:

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

### 5️⃣ Run the match-engine tests
```bash
npm run test:server
```

### 6️⃣ Create a production build
```bash
npm run build
```

The compiled frontend is written to `client/dist/`.

---

## 📝 Notes

- The prototype does not calculate official DLS par scores or win probabilities.
- Match state is stored in memory, is not persistent, and resets when the server restarts.
- Demo-mode answers are deterministic templates, not LLM-generated. Add a valid Groq API key to enable Groq-powered responses.
- Cricket laws and playing conditions have exceptions. The assistant is a fan explainer, not an official umpiring source.
