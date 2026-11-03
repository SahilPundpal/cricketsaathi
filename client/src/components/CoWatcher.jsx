import { ArrowUp, Bot, Check, ChevronDown, MessageCircle, Plus, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const starters = [
  'Free hit kya hota hai?',
  'Why is the chase difficult now?',
  'DLS method simple words mein?',
];

export default function CoWatcher({ language, setLanguage, onAsk, busy, messages, setMessages, aiMode }) {
  const [question, setQuestion] = useState('');
  const bottomRef = useRef(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [messages, busy]);

  async function submit(value = question) {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setQuestion('');
    await onAsk(trimmed);
  }

  return (
    <section className="feature-card chat-card" id="co-watcher">
      <div className="feature-card-head chat-head">
        <div className="feature-icon chat-icon"><MessageCircle size={18} /></div>
        <div className="feature-title-wrap"><div className="eyebrow">YOUR PERSONAL CRICKET BUDDY</div><h3>Ask Saathi<span className="heading-period">.</span></h3></div>
        <div className="ai-mini-status"><span /> {aiMode === 'groq' ? 'Groq enabled' : 'Demo AI'}</div>
      </div>
      <p className="feature-description">No jargon. No judgement. Ask in the language you think in.</p>
      <div className="chat-language-row"><span>REPLY IN</span><div className="language-pills"><button className={language === 'hinglish' ? 'selected' : ''} onClick={() => setLanguage('hinglish')}>Hinglish</button><button className={language === 'hindi' ? 'selected' : ''} onClick={() => setLanguage('hindi')}>हिन्दी</button><button className={language === 'english' ? 'selected' : ''} onClick={() => setLanguage('english')}>English</button></div></div>
      <div className="chat-window">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="saathi-avatar"><Bot size={21} /></div>
            <div className="assistant-bubble"><strong>Hey, I'm Saathi! 👋</strong><p>I'm following this match with you. Ask me anything — rules, tactics, or what's going on right now.</p><span className="bubble-time">JUST NOW</span></div>
            <div className="suggested-questions"><div className="suggested-label">TRY ASKING</div>{starters.map((item) => <button key={item} onClick={() => submit(item)} disabled={busy}>{item}<ArrowUp size={12} /></button>)}</div>
          </div>
        ) : (
          <div className="chat-thread">
            {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
              <div className={`message-avatar ${message.role}`}>{message.role === 'assistant' ? <Bot size={15} /> : <UserRound size={15} />}</div>
              <div className={`message-content ${message.role}`}><p>{message.content}</p>{message.source && <span className="message-source">{message.source === 'groq' ? 'GROQ AI' : 'DEMO RESPONSE'}</span>}</div>
            </div>)}
            {busy && <div className="chat-message assistant"><div className="message-avatar assistant"><Bot size={15} /></div><div className="typing-bubble"><i /><i /><i /></div></div>}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      {messages.length > 0 && <div className="chat-thread-actions"><button onClick={() => setMessages([])}><Plus size={13} /> New conversation</button><span><Check size={12} /> Match context included</span></div>}
      <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask anything about this match…" maxLength={500} aria-label="Ask Saathi a question" />
        <button type="submit" disabled={!question.trim() || busy} aria-label="Send question"><ArrowUp size={17} /></button>
      </form>
      <div className="chat-footnote"><Sparkles size={11} /> Saathi uses the current match context to answer. Always verify official decisions.</div>
    </section>
  );
}
