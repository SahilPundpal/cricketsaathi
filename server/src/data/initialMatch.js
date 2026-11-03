// Simulated demo data: fictional teams, venue and players. Not a real fixture.
// SEED_BALLS is the recent ball-by-ball history (12.3 to 14.2) so "catch me up" has events to summarise.
export const SEED_BALLS = [
  { balls: 75, over: '12.3', result: '1', runs: 1, kind: 'run', detail: 'Pushed to long-on for a single.' },
  { balls: 76, over: '12.4', result: '6', runs: 6, kind: 'six', detail: 'Smashed over midwicket for six!' },
  { balls: 77, over: '12.5', result: '4', runs: 4, kind: 'boundary', detail: 'Pulled through the leg side for four.' },
  { balls: 78, over: '12.6', result: '0', runs: 0, kind: 'dot', detail: 'Beaten outside off; no run.' },
  { balls: 79, over: '13.1', result: '1', runs: 1, kind: 'run', detail: 'Worked off the pads for one.' },
  { balls: 80, over: '13.2', result: 'W', runs: 0, kind: 'wicket', detail: 'Wicket! N. Gokhale holes out in the deep.' },
  { balls: 81, over: '13.3', result: '1', runs: 1, kind: 'run', detail: 'Worked into the leg side for a single.' },
  { balls: 82, over: '13.4', result: '0', runs: 0, kind: 'dot', detail: 'Good length, defended back to the bowler.' },
  { balls: 83, over: '13.5', result: '2', runs: 2, kind: 'run', detail: 'Pushed into the gap; comfortable two.' },
  { balls: 84, over: '13.6', result: '1', runs: 1, kind: 'run', detail: 'A single to keep the strike moving.' },
  { balls: 85, over: '14.1', result: '4', runs: 4, kind: 'boundary', detail: 'Cracked through cover for four!' },
  { balls: 86, over: '14.2', result: '0', runs: 0, kind: 'dot', detail: 'Slower ball; the batter checks the shot.' },
];

export function createInitialMatch() {
  return {
    id: 'pun-jag-t20-demo',
    sport: 'CRICKET',
    format: 'DEMO T20 MATCH · SIMULATED',
    status: 'DEMO MATCH',
    venue: 'Demo Ground (fictional)',
    dateLabel: 'Simulated · not a real fixture',
    battingTeam: 'Pune Panthers',
    bowlingTeam: 'Jaipur Jaguars',
    battingCode: 'PUN',
    bowlingCode: 'JAG',
    innings: 2,
    score: 112,
    wickets: 4,
    legalBalls: 86,
    target: 185,
    firstInningsScore: 184,
    partnership: { runs: 8, balls: 6 },
    batters: [
      { name: 'V. Rao', runs: 38, balls: 26, fours: 3, sixes: 1, strikeRate: 146.15, onStrike: true },
      { name: 'K. Menon', runs: 4, balls: 4, fours: 0, sixes: 0, strikeRate: 100, onStrike: false },
    ],
    bowler: { name: 'T. Fletcher', overs: '2.2', runs: 19, wickets: 1, economy: 8.14 },
    recentBalls: SEED_BALLS.slice(-6).map(({ over, result, runs, kind, detail }) => ({ over, result, runs, kind, detail })),
    timeline: [
      { id: 'e1', over: '14.2', title: 'Dot ball', description: 'A clever change of pace from the bowler.', type: 'dot', time: 'Just now' },
      { id: 'e2', over: '14.1', title: 'FOUR!', description: 'Rao finds the cover gap and keeps the chase moving.', type: 'boundary', time: '1 ball ago' },
      { id: 'e3', over: '13.2', title: 'WICKET', description: 'N. Gokhale holes out trying to increase the tempo.', type: 'wicket', time: '6 balls ago' },
      { id: 'e4', over: '12.4', title: 'Big over', description: 'A six and a boundary bring 13 runs.', type: 'highlight', time: '10 balls ago' },
    ],
    overRuns: [
      { over: '9', runs: 7 },
      { over: '10', runs: 9 },
      { over: '11', runs: 5 },
      { over: '12', runs: 13 },
      { over: '13', runs: 5 },
      { over: '14', runs: 4 },
    ],
    nextBallIndex: 0,
    isDemo: true,
  };
}
