import { ArrowDownRight, ArrowUpRight, CircleDot, Clock3, Target } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function EventIcon({ type }) {
  if (type === 'wicket') return <span className="event-icon wicket-icon">W</span>;
  if (type === 'boundary') return <span className="event-icon boundary-icon">4</span>;
  if (type === 'highlight') return <span className="event-icon highlight-icon">✦</span>;
  return <span className="event-icon dot-icon">•</span>;
}

export default function MomentumPanel({ match }) {
  const chartData = match.overRuns.map((item) => ({ over: `Ov ${item.over}`, runs: item.runs }));
  const latestRuns = match.overRuns.slice(-1)[0]?.runs || 0;
  return (
    <section className="momentum-card">
      <div className="panel-heading">
        <div><div className="eyebrow">READ THE GAME</div><h3>Match momentum<span className="heading-period">.</span></h3></div>
        <span className="chart-live"><span /> LIVE FEED</span>
      </div>
      <div className="momentum-stats">
        <div><span>Last over</span><strong>{latestRuns} <small>runs</small></strong></div>
        <div><span>Partnership</span><strong>{match.partnership.runs}<small> ({match.partnership.balls})</small></strong></div>
        <div><span>Wickets left</span><strong>{10 - match.wickets}<small> / 10</small></strong></div>
      </div>
      <div className="chart-wrap">
        <div className="chart-caption"><span>RUNS PER OVER</span><span><i className="chart-legend-dot" /> {match.battingTeam}</span></div>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#24312d" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="over" tick={{ fill: '#81908a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 'auto']} tick={{ fill: '#81908a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#17211e', border: '1px solid #30413a', borderRadius: 10, color: '#f1f5ed', fontSize: 12 }} labelStyle={{ color: '#9baa9f' }} formatter={(value) => [`${value} runs`, 'Scored']} />
            <Line type="monotone" dataKey="runs" stroke="#c2f970" strokeWidth={2.5} dot={{ r: 3, fill: '#c2f970', stroke: '#111a16', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#c2f970', stroke: '#c2f970' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="timeline-header"><div><Clock3 size={14} /> <span>KEY MOMENTS</span></div><span>RECENT FIRST</span></div>
      <div className="event-list">{match.timeline.slice(0, 4).map((event) => <div className="event-row" key={event.id}><EventIcon type={event.type} /><div className="event-copy"><strong>{event.title}</strong><p>{event.description}</p></div><span className="event-over">{event.over}</span></div>)}</div>
      <div className="momentum-note"><Target size={14} /><span>Key watch: {match.requiredRunRate >= 11 ? `${match.battingTeam} need a boundary burst without losing another wicket.` : 'Can this partnership take the chase deep?'}</span></div>
    </section>
  );
}
