import { createInitialMatch, SEED_BALLS } from '../data/initialMatch.js';

const BALL_SEQUENCE = [
  { result: '1', runs: 1, kind: 'run', detail: 'Nudged into the leg side for a quick single.' },
  { result: '0', runs: 0, kind: 'dot', detail: 'Good length; the batter blocks it safely.' },
  { result: '4', runs: 4, kind: 'boundary', detail: 'A crisp drive beats the sweeper and races away.' },
  { result: '1', runs: 1, kind: 'run', detail: 'Rotates the strike with a single.' },
  { result: 'W', runs: 0, kind: 'wicket', detail: 'Wicket! A mistimed shot is taken in the deep.' },
  { result: '2', runs: 2, kind: 'run', detail: 'Excellent running; they come back for two.' },
  { result: '1', runs: 1, kind: 'run', detail: 'Clipped off the pads for one.' },
  { result: '6', runs: 6, kind: 'six', detail: 'That is huge! Picked up and deposited over the boundary.' },
  { result: '0', runs: 0, kind: 'dot', detail: 'Beaten outside off; no run.' },
  { result: '3', runs: 3, kind: 'run', detail: 'They hustle back for three into the wide gap.' },
];
const INCOMING_BATTERS = ['S. Naik', 'D. Pillai', 'M. Joshi', 'P. Desai', 'L. Kamat'];

const MAX_SESSIONS = 500;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_LOG = 240;
const sessions = new Map();

const overLabel = (legalBalls) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
const isOver = (m) => m.legalBalls >= 120 || m.score >= m.target || m.wickets >= 10;

function refreshDerived(m) {
  const overs = m.legalBalls / 6;
  const ballsRemaining = Math.max(0, 120 - m.legalBalls);
  const runsRequired = Math.max(0, m.target - m.score);
  m.overs = overLabel(m.legalBalls);
  m.runsRequired = runsRequired;
  m.ballsRemaining = ballsRemaining;
  m.currentRunRate = overs > 0 ? Number((m.score / overs).toFixed(2)) : 0;
  m.requiredRunRate = ballsRemaining > 0 ? Number((runsRequired * 6 / ballsRemaining).toFixed(2)) : 0;
  m.progressPercent = Math.min(100, Math.round((m.score / m.target) * 100));
  m.chaseStatus = runsRequired === 0 ? 'TARGET CHASED' : m.wickets >= 10 ? 'ALL OUT' : ballsRemaining === 0 ? 'INNINGS COMPLETE' : 'CHASE IN PROGRESS';
  if (runsRequired === 0) m.resultText = `${m.battingTeam} won by ${10 - m.wickets} wickets`;
  else if (m.wickets >= 10 || ballsRemaining === 0) {
    const margin = m.target - 1 - m.score;
    m.resultText = margin === 0 ? 'Match tied' : `${m.bowlingTeam} won by ${margin} runs`;
  } else m.resultText = null;
}

function createSession() {
  const match = createInitialMatch();
  refreshDerived(match);
  return { match, log: SEED_BALLS.map((ball) => ({ ...ball })), touched: Date.now() };
}

function prune() {
  const now = Date.now();
  for (const [id, s] of sessions) if (now - s.touched > SESSION_TTL_MS) sessions.delete(id);
  if (sessions.size > MAX_SESSIONS) {
    [...sessions.entries()].sort((a, b) => a[1].touched - b[1].touched)
      .slice(0, sessions.size - MAX_SESSIONS).forEach(([id]) => sessions.delete(id));
  }
}

function session(id = 'default') {
  prune();
  let s = sessions.get(id);
  if (!s) { s = createSession(); sessions.set(id, s); }
  s.touched = Date.now();
  return s;
}

function step(s) {
  const m = s.match;
  if (isOver(m)) return null;
  const ball = BALL_SEQUENCE[m.nextBallIndex % BALL_SEQUENCE.length];
  m.nextBallIndex += 1;
  m.legalBalls += 1;
  m.score += ball.runs;
  const label = overLabel(m.legalBalls);

  const strikerIdx = Math.max(0, m.batters.findIndex((b) => b.onStrike));
  const striker = m.batters[strikerIdx];
  striker.balls += 1;
  striker.runs += ball.runs;
  if (ball.runs === 4) striker.fours += 1;
  if (ball.runs === 6) striker.sixes += 1;
  striker.strikeRate = Number((striker.runs / striker.balls * 100).toFixed(2));
  m.partnership.runs += ball.runs;
  m.partnership.balls += 1;

  let title = ball.kind === 'dot' ? 'Dot ball' : `${ball.runs} run${ball.runs === 1 ? '' : 's'}`;
  let type = ball.kind;
  if (ball.kind === 'wicket') {
    title = 'WICKET';
    m.wickets += 1;
    m.partnership = { runs: 0, balls: 0 };
    if (m.wickets < 10) {
      // The dismissed batter leaves; the incoming batter takes their place on strike.
      m.batters[strikerIdx] = { name: INCOMING_BATTERS[m.wickets - 5] || 'New batter', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, onStrike: true };
    }
  } else if (ball.kind === 'boundary' || ball.kind === 'six') {
    title = ball.kind === 'six' ? 'SIX!' : 'FOUR!';
    type = 'boundary';
  }
  m.timeline.unshift({ id: `e${m.legalBalls}-${m.nextBallIndex}`, over: label, title, description: ball.detail, type, time: 'Just now' });
  m.timeline = m.timeline.slice(0, 6);

  const currentOver = String(Math.floor((m.legalBalls - 1) / 6));
  const thisOver = m.overRuns.find((item) => item.over === currentOver);
  if (thisOver) thisOver.runs += ball.runs; else m.overRuns.push({ over: currentOver, runs: ball.runs });
  m.overRuns = m.overRuns.slice(-8);

  const entry = { over: label, result: ball.result, runs: ball.runs, kind: ball.kind, detail: ball.detail };
  m.recentBalls = [...m.recentBalls, entry].slice(-6);
  s.log = [...s.log, { balls: m.legalBalls, ...entry }].slice(-MAX_LOG);

  if (m.legalBalls % 6 === 0 || ball.runs % 2 === 1) m.batters.forEach((b) => { b.onStrike = !b.onStrike; });
  refreshDerived(m);
  return ball;
}

export function getMatch(id) {
  const s = session(id);
  refreshDerived(s.match);
  return structuredClone(s.match);
}

export function advanceBall(id, count = 1) {
  const s = session(id);
  const wanted = Math.min(18, Math.max(1, Math.floor(Number(count)) || 1));
  let last = null;
  let advanced = 0;
  for (let i = 0; i < wanted; i += 1) {
    const ball = step(s);
    if (!ball) break;
    last = ball;
    advanced += 1;
  }
  const match = getMatch(id);
  if (!advanced) return { match, advanced, message: 'This demo innings has reached its end. Reset the demo to play again.' };
  const message = wanted === 1 ? `${last.result} · ${last.detail}` : `${advanced} balls bowled while you looked away.`;
  return { match, advanced, message };
}

export function resetMatch(id) {
  const s = createSession();
  sessions.set(id || 'default', s);
  return getMatch(id);
}

// Summarise the deliveries a fan missed: either everything since `sinceBalls`, or the last `lastOvers` overs.
export function getMissed(id, { sinceBalls, lastOvers } = {}) {
  const s = session(id);
  const now = s.match.legalBalls;
  const overs = Math.min(10, Math.max(1, Number(lastOvers) || 2));
  const requestedFrom = Number.isFinite(Number(sinceBalls)) && sinceBalls !== null && sinceBalls !== undefined
    ? Math.min(now, Math.max(0, Math.floor(Number(sinceBalls))))
    : Math.max(0, now - overs * 6);
  const earliest = s.log.length ? s.log[0].balls - 1 : now;
  const from = Math.max(requestedFrom, earliest);
  const balls = s.log.filter((b) => b.balls > from);
  const sum = (kind) => balls.filter((b) => b.kind === kind).length;
  return {
    fromBalls: from,
    toBalls: now,
    fromOver: overLabel(from),
    toOver: overLabel(now),
    count: balls.length,
    runs: balls.reduce((total, b) => total + b.runs, 0),
    wickets: sum('wicket'),
    fours: sum('boundary'),
    sixes: sum('six'),
    dots: sum('dot'),
    truncated: requestedFrom < earliest,
    highlights: balls.filter((b) => ['wicket', 'six', 'boundary'].includes(b.kind))
      .map((b) => ({ over: b.over, kind: b.kind, title: b.kind === 'wicket' ? 'WICKET' : b.kind === 'six' ? 'SIX' : 'FOUR', detail: b.detail })),
    balls,
  };
}
