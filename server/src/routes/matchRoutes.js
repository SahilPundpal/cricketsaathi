import { Router } from 'express';
import { advanceBall, getMatch, resetMatch } from '../services/matchEngine.js';

const router = Router();

router.get('/current', (req, res) => res.json({ success: true, data: getMatch(req.sessionId) }));
router.post('/advance', (req, res) => {
  const balls = Number(req.body?.balls);
  res.json({ success: true, ...advanceBall(req.sessionId, Number.isFinite(balls) ? balls : 1) });
});
router.post('/reset', (req, res) => res.json({ success: true, data: resetMatch(req.sessionId) }));

export default router;
