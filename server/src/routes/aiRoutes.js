import { Router } from 'express';
import { answerQuestion, checkAi, createRecap, getAiStatus } from '../services/aiService.js';
import { getMatch, getMissed } from '../services/matchEngine.js';

const router = Router();
const LANGUAGES = ['hinglish', 'hindi', 'english'];
const pickLanguage = (value) => (LANGUAGES.includes(value) ? value : 'hinglish');

router.get('/status', (_req, res) => res.json({ success: true, data: getAiStatus() }));
router.get('/check', async (_req, res, next) => {
  try { res.json({ success: true, data: await checkAi() }); } catch (error) { next(error); }
});

router.post('/recap', async (req, res, next) => {
  try {
    const language = pickLanguage(req.body?.language);
    const sinceBalls = typeof req.body?.sinceBalls === 'number' ? req.body.sinceBalls : undefined;
    const lastOvers = typeof req.body?.lastOvers === 'number' ? req.body.lastOvers : undefined;
    const missed = getMissed(req.sessionId, { sinceBalls, lastOvers });
    const result = await createRecap(getMatch(req.sessionId), language, missed);
    const { balls: _balls, highlights: _highlights, ...window } = missed;
    res.json({ success: true, data: { ...result, window } });
  } catch (error) {
    next(error);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim().slice(0, 500) : '';
    if (!question) return res.status(400).json({ success: false, error: 'Please enter a question.' });
    const result = await answerQuestion({ question, match: getMatch(req.sessionId), language: pickLanguage(req.body?.language), history: req.body?.history });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
