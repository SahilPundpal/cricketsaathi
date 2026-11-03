import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRight, BadgeCheck, ChevronRight, CircleHelp, Flame, Globe2, Radio, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Header from './components/Header.jsx';
import ScoreCard from './components/ScoreCard.jsx';
import CatchMeUp from './components/CatchMeUp.jsx';
import CoWatcher from './components/CoWatcher.jsx';
import MomentumPanel from './components/MomentumPanel.jsx';
import { api } from './api.js';

const FALLBACK_MATCH = {
  battingTeam: 'Pune Panthers', bowlingTeam: 'Jaipur Jaguars', battingCode: 'PUN', bowlingCode: 'JAG', format: 'DEMO T20 MATCH · SIMULATED', venue: 'Demo Ground (fictional)', innings: 2, legalBalls: 86,
  score: 112, wickets: 4, overs: '14.2', target: 185, runsRequired: 73, ballsRemaining: 34, requiredRunRate: 12.88, currentRunRate: 7.81, progressPercent: 61,
  chaseStatus: 'CHASE IN PROGRESS', partnership: { runs: 31, balls: 22 }, recentBalls: [], timeline: [], overRuns: [],
};

export default function App() {
  const [match, setMatch] = useState(FALLBACK_MATCH);
  const [aiStatus, setAiStatus] = useState({ configured: false, mode: 'demo' });
  const [apiOnline, setApiOnline] = useState(false);
  const [recap, setRecap] = useState('');
  const [recapSource, setRecapSource] = useState('');
  const [recapError, setRecapError] = useState('');
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapLanguage, setRecapLanguage] = useState('hinglish');
  const [chatLanguage, setChatLanguage] = useState('hinglish');
  const [messages, setMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [toast, setToast] = useState('');
  const [lastSeen, setLastSeen] = useState(null);
  const [windowMode, setWindowMode] = useState('since');
  const [recapWindow, setRecapWindow] = useState(null);
  const [recapReason, setRecapReason] = useState('');
  const [lookingAway, setLookingAway] = useState(false);

  const refreshMatch = useCallback(async () => {
    try {
      const response = await api.getMatch();
      setMatch(response.data);
      setLastSeen((current) => current ?? response.data.legalBalls);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  }, []);

  useEffect(() => {
    refreshMatch();
    api.aiStatus().then((response) => setAiStatus(response.data)).catch(() => setApiOnline(false));
  }, [refreshMatch]);

  async function generateRecap() {
    setRecapLoading(true);
    setRecapError('');
    try {
      const window = windowMode === 'since' ? { sinceBalls: lastSeen ?? Math.max(0, match.legalBalls - 12) } : { lastOvers: Number(windowMode) };
      const response = await api.recap(recapLanguage, window);
      setRecap(response.data.text);
      setRecapSource(response.data.source);
      setRecapReason(response.data.fallbackReason || '');
      setRecapWindow(response.data.window || null);
      setLastSeen(response.data.window?.toBalls ?? match.legalBalls); // the fan is now caught up
    } catch (error) {
      setRecapError(error.message || 'Could not generate a recap. Please try again.');
    } finally {
      setRecapLoading(false);
    }
  }

  async function lookAway() {
    setLookingAway(true);
    try {
      const response = await api.advanceBall(12); // two overs happen while the fan is away; lastSeen stays put
      setMatch(response.match);
      setToast(response.message);
      window.setTimeout(() => setToast(''), 2600);
      setRecap('');
      setRecapSource('');
      setRecapWindow(null);
      setRecapReason('');
    } catch (error) {
      setToast(error.message || 'Could not move the demo match on.');
    } finally {
      setLookingAway(false);
    }
  }

  async function askSaathi(question) {
    const previous = messages.slice(-6).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: 'user', content: question }]);
    setChatBusy(true);
    try {
      const response = await api.chat(question, chatLanguage, previous);
      setMessages((current) => [...current, { role: 'assistant', content: response.data.text, source: response.data.source }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error.message || 'I hit a small snag. Try again in a moment.', source: 'demo' }]);
    } finally {
      setChatBusy(false);
    }
  }

  async function advanceBall() {
    setAdvancing(true);
    try {
      const response = await api.advanceBall();
      setMatch(response.match);
      setToast(response.message);
      window.setTimeout(() => setToast(''), 2600);
      setRecap('');
      setRecapSource('');
      setRecapWindow(null);
      setRecapReason('');
    } catch (error) {
      setToast(error.message || 'Could not advance the demo.');
    } finally {
      setAdvancing(false);
    }
  }

  async function resetMatch() {
    try {
      const response = await api.resetMatch();
      setMatch(response.data);
      setLastSeen(response.data.legalBalls);
      setRecap('');
      setRecapSource('');
      setRecapWindow(null);
      setRecapReason('');
      setMessages([]);
      setToast('Demo match reset to 14.2 overs.');
      window.setTimeout(() => setToast(''), 2600);
    } catch {
      setToast('Could not reset the demo match.');
    }
  }

  return (
    <div className="app-shell" id="top">
      <Header aiStatus={aiStatus} />
      <main className="page-container">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="kicker-line" /> THE MATCH, WITH CONTEXT <span className="kicker-spark">✳</span></div>
            <h1>Never lose<br />the <span>story.</span></h1>
            <p className="hero-description">Your AI cricket co-watcher. Catch up in seconds, understand every moment, and enjoy the game in your language.</p>
            <div className="hero-proof"><span><ShieldCheck size={14} /> Context-aware answers</span><span><Globe2 size={14} /> Hinglish · Hindi · English</span></div>
          </div>
          <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><span>CS</span></div><div className="orbit-node node-one"><Sparkles size={17} /></div><div className="orbit-node node-two"><Radio size={17} /></div><div className="orbit-node node-three"><Zap size={16} /></div><div className="orbit-caption">THE GAME<br /><b>EXPLAINED.</b></div></div>
        </section>

        <div className="section-kicker-row"><div className="section-kicker"><span className="section-index">01</span><span>DEMO MATCH CENTRE</span></div><div className="connection-state"><span className={apiOnline ? 'connection-good' : 'connection-demo'} /> {apiOnline ? 'API connected' : 'Preview data'} <span className="connection-divider">/</span> {aiStatus.configured ? 'Groq AI enabled' : 'Demo responses'}</div></div>

        <ScoreCard match={match} onAdvance={advanceBall} onReset={resetMatch} advancing={advancing} />

        <div className="section-kicker-row feature-kicker-row"><div className="section-kicker"><span className="section-index">02</span><span>YOUR MATCH, YOUR WAY</span></div><span className="section-side-note">TWO SMALL FEATURES. A BETTER FAN EXPERIENCE.</span></div>
        <div className="main-grid">
          <div className="left-column">
            <CatchMeUp recap={recap} language={recapLanguage} setLanguage={setRecapLanguage} onGenerate={generateRecap} loading={recapLoading} error={recapError} source={recapSource} reason={recapReason} windowMode={windowMode} setWindowMode={setWindowMode} missedBalls={Math.max(0, match.legalBalls - (lastSeen ?? match.legalBalls))} onLookAway={lookAway} lookingAway={lookingAway} recapWindow={recapWindow} />
            <MomentumPanel match={match} />
          </div>
          <div className="right-column">
            <CoWatcher language={chatLanguage} setLanguage={setChatLanguage} onAsk={askSaathi} busy={chatBusy} messages={messages} setMessages={setMessages} aiMode={aiStatus.mode} />
            <div className="trust-card"><div className="trust-icon"><BadgeCheck size={17} /></div><div><strong>Built on match context</strong><p>Scores and events come from the match feed. AI explains them — it doesn't make them up.</p></div></div>
          </div>
        </div>

        <section className="bottom-strip"><div className="bottom-strip-icon"><Flame size={18} /></div><div><strong>Made for the moments between the moments.</strong><span>Missed an over? New to cricket? Saathi gets you back in the game.</span></div><a href="#catch-up">Try Catch Me Up <ArrowRight size={15} /></a></section>
        <footer className="site-footer"><a className="footer-brand" href="#top">cricketsaathi<span>.</span></a><span>Not another scoreboard. A better way to follow the game.</span><span className="footer-disclaimer">Prototype · Demo match data</span></footer>
      </main>
      {toast && <div className="toast-message"><Activity size={14} /> {toast}</div>}
    </div>
  );
}
