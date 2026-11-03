import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import matchRoutes from './routes/matchRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { sessionMiddleware } from './middleware/session.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());

// Behind Render/Railway there is one proxy hop. Without this every visitor shares the proxy's IP.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));

// upgrade-insecure-requests is removed so the built app also works when tested over plain http://localhost.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { useDefaults: true, directives: { 'upgrade-insecure-requests': null } },
}));
// Allow: no Origin header, listed origins, anything outside production, and same-origin requests
// (browsers send Origin on same-origin POSTs, which matters when this server also serves the client).
app.use(cors((req, callback) => {
  const origin = req.get('origin');
  let allowed = !origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production';
  if (!allowed) {
    try { allowed = new URL(origin).host === req.get('host'); } catch { allowed = false; }
  }
  callback(allowed ? null : new Error('This origin is not allowed by CORS.'), { origin: allowed });
}));
app.use(express.json({ limit: '32kb' }));
app.use(sessionMiddleware);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Count per visitor session, falling back to IP when no session id was sent.
  keyGenerator: (req) => (req.sessionId !== 'default' ? req.sessionId : req.ip),
  message: { success: false, error: 'Too many AI requests. Please pause for a moment and try again.' },
});

app.get('/api/health', (_req, res) => res.json({ success: true, name: 'CricketSaathi API', timestamp: new Date().toISOString() }));
app.use('/api/match', matchRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// Single-service deploy: if the client has been built, serve it from this server too.
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((req, res) => res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, error: 'Something went wrong on the server. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`CricketSaathi API running at http://localhost:${PORT}`);
  console.log(`AI mode: ${process.env.GROQ_API_KEY ? `Groq (${process.env.GROQ_MODEL || 'openai/gpt-oss-20b'})` : 'Demo fallback (add GROQ_API_KEY to enable Groq)'}`);
});
