import { Activity, ChevronDown, MapPin, Radio, RotateCcw, Sparkles, Zap } from 'lucide-react';

const formatOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;

export default function ScoreCard({ match, onAdvance, onReset, advancing }) {
  const lastBalls = match.recentBalls || [];
  return (
    <section className="score-card" id="live">
      <div className="score-card-glow" />
      <div className="score-card-top">
        <div className="match-meta">
          <span className="live-pill"><span className="live-pulse" /> DEMO MATCH</span>
          <span className="meta-divider" />
          <span className="format-label">{match.format}</span>
        </div>
        <div className="match-actions">
          <span className="demo-label"><Zap size={12} /> INTERACTIVE DEMO</span>
          <button className="icon-button" title="Reset demo match" onClick={onReset}><RotateCcw size={15} /></button>
        </div>
      </div>
      <div className="match-title-row">
        <div>
          <h2>{match.battingTeam} <span>vs</span> {match.bowlingTeam}</h2>
          <p><MapPin size={13} /> {match.venue} <span className="location-dot">·</span> {match.innings === 2 ? '2nd innings' : '1st innings'}</p>
        </div>
        <div className="series-tag">T20 DEMO <ChevronDown size={13} /></div>
      </div>
      <div className="teams-score-row">
        <div className="team-score batting">
          <div className="team-identity"><span className="flag">{match.battingCode}</span><div><strong>{match.battingTeam.toUpperCase()}</strong><small>Batting</small></div></div>
          <div className="score-numbers"><strong>{match.score}<span>/{match.wickets}</span></strong><small>{match.overs} <em>overs</em></small></div>
        </div>
        <div className="versus-mark">VS</div>
        <div className="team-score bowling">
          <div className="team-identity"><span className="flag">{match.bowlingCode}</span><div><strong>{match.bowlingTeam.toUpperCase()}</strong><small>Bowling</small></div></div>
          <div className="score-numbers target-score"><strong>{match.target}</strong><small>1st innings <em>total</em></small></div>
        </div>
      </div>
      <div className="chase-block">
        <div className="chase-heading"><span>THE CHASE</span><span>{match.chaseStatus}</span></div>
        <div className="chase-progress"><div className="chase-progress-fill" style={{ width: `${match.progressPercent}%` }} /></div>
        <div className="chase-numbers">
          <div><strong>{match.runsRequired}</strong><span>Runs needed</span></div>
          <div><strong>{match.ballsRemaining}</strong><span>Balls left</span></div>
          <div><strong>{match.requiredRunRate}</strong><span>Required RR</span></div>
          <div><strong>{match.currentRunRate}</strong><span>Current RR</span></div>
        </div>
      </div>
      <div className="score-card-footer">
        <div className="recent-balls"><span className="footer-label">LAST 6 BALLS</span><div className="ball-list">{lastBalls.map((ball, index) => <span key={`${ball.over}-${index}`} className={`ball-chip ${ball.kind === 'wicket' ? 'wicket' : ball.kind === 'boundary' || ball.kind === 'six' ? 'boundary' : ball.kind === 'dot' ? 'dot' : ''}`}>{ball.result}</span>)}</div></div>
        <div className="demo-controls"><span className="demo-hint"><Radio size={12} /> Simulated ball-by-ball feed</span><button className="advance-button" onClick={onAdvance} disabled={advancing}><Activity size={14} /> {advancing ? 'Updating…' : 'Advance 1 ball'}</button></div>
      </div>
    </section>
  );
}
