import { ArrowUpRight, AudioLines, Clock3, EyeOff, RefreshCw, Sparkles, WandSparkles } from 'lucide-react';

const FALLBACK_NOTES = {
  no_api_key: 'Demo response · add a Groq key for live LLM responses',
  token_limit: 'Demo response · Groq ran out of tokens, so the built-in recap is shown',
  empty_response: 'Demo response · Groq returned no text, so the built-in recap is shown',
  api_error: 'Demo response · the Groq request failed, so the built-in recap is shown',
};

export default function CatchMeUp({
  recap, language, setLanguage, onGenerate, loading, error, source, reason,
  windowMode, setWindowMode, missedBalls, onLookAway, lookingAway, recapWindow,
}) {
  const missed = missedBalls > 0;
  return (
    <section className="feature-card catch-card" id="catch-up">
      <div className="feature-card-head">
        <div className="feature-icon catch-icon"><Clock3 size={18} /></div>
        <div className="feature-title-wrap"><div className="eyebrow">FOR THE LATE ARRIVAL</div><h3>Catch me up<span className="heading-period">.</span></h3></div>
        <span className="time-chip"><AudioLines size={12} /> 15 sec read</span>
      </div>
      <p className="feature-description">Looked away for a bit? Get the match story since you last looked, not just the score.</p>
      <div className="catch-controls">
        <span className={`missed-chip${missed ? '' : ' clear'}`}>{missed ? `You have missed ${missedBalls} ball${missedBalls === 1 ? '' : 's'}` : 'You are up to date'}</span>
        <button className="secondary-button" onClick={onLookAway} disabled={lookingAway} title="Demo only: the match moves on while you are away">
          <EyeOff size={13} /> {lookingAway ? 'Looking away…' : 'Look away for 2 overs'}
        </button>
      </div>
      <div className="recap-preview">
        <div className="recap-topline"><span><Sparkles size={13} /> SAATHI'S QUICK RECAP</span><span className="live-mini"><i /> NOW</span></div>
        {recap ? <p className="recap-text">{recap}</p> : <div className="recap-placeholder"><span className="placeholder-spark"><WandSparkles size={19} /></span><p>Your 15-second catch-up will appear here. Try “Look away for 2 overs”, then tap Catch me up.</p></div>}
        {error && <p className="inline-error">{error}</p>}
        {source && <div className="source-note">{source === 'groq' ? 'Generated with Groq AI' : (FALLBACK_NOTES[reason] || FALLBACK_NOTES.no_api_key)}</div>}
        {recap && recapWindow && <div className="window-note">Covers {recapWindow.fromOver} to {recapWindow.toOver} · {recapWindow.count} ball{recapWindow.count === 1 ? '' : 's'}{recapWindow.truncated ? ' (that is all the history this demo has)' : ''}</div>}
      </div>
      <div className="feature-actions">
        <label className="language-select"><span>IN</span><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Recap language"><option value="hinglish">Hinglish</option><option value="hindi">हिन्दी</option><option value="english">English</option></select></label>
        <label className="language-select"><span><Clock3 size={9} /></span><select value={windowMode} onChange={(event) => setWindowMode(event.target.value)} aria-label="How much did you miss"><option value="since">Since I last looked</option><option value="2">Last 2 overs</option><option value="5">Last 5 overs</option></select></label>
        <button className="primary-button" onClick={onGenerate} disabled={loading}>{loading ? <RefreshCw className="spin" size={15} /> : <Sparkles size={15} />}{loading ? 'Building recap…' : recap ? 'Refresh recap' : 'Catch me up'} <ArrowUpRight size={14} /></button>
      </div>
    </section>
  );
}
