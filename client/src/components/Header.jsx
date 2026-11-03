import { Activity, ArrowUpRight, CircleHelp, Github, Menu, Sparkles } from 'lucide-react';

export default function Header({ aiStatus }) {
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="CricketSaathi home">
        <span className="brand-mark"><Activity size={19} strokeWidth={2.8} /></span>
        <span>cricket<span className="brand-accent">saathi</span><i>.</i></span>
      </a>
      <nav className="main-nav" aria-label="Main navigation">
        <a className="nav-link active" href="#live" onClick={() => document.querySelector('.main-nav')?.classList.remove('nav-open')}>Match centre</a>
        <a className="nav-link" href="#catch-up" onClick={() => document.querySelector('.main-nav')?.classList.remove('nav-open')}>Catch me up</a>
        <a className="nav-link" href="#co-watcher" onClick={() => document.querySelector('.main-nav')?.classList.remove('nav-open')}>Co-watcher</a>
      </nav>
      <div className="topbar-actions">
        <span className={`ai-status ${aiStatus?.configured ? 'connected' : 'demo'}`}>
          <span className="status-dot" />{aiStatus?.configured ? 'Groq configured' : 'Demo AI mode'}
        </span>
        {import.meta.env.VITE_GITHUB_URL && <a className="icon-link github-link" href={import.meta.env.VITE_GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>}
        <a className="topbar-cta" href="#co-watcher">Ask Saathi <ArrowUpRight size={15} /></a>
      </div>
      <button className="mobile-menu" aria-label="Open navigation" onClick={() => document.querySelector('.main-nav')?.classList.toggle('nav-open')}><Menu size={21} /></button>
    </header>
  );
}
