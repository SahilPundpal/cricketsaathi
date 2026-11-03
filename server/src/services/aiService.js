import Groq from 'groq-sdk';

const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
// Reasoning models (gpt-oss, qwen3) spend part of the token budget on hidden reasoning, so they need headroom.
const REASONING = /gpt-oss|qwen3/i.test(MODEL);
const LANGUAGE_STYLE = {
  english: 'plain, friendly English',
  hindi: 'simple everyday Hindi in Devanagari',
  hinglish: 'natural conversational Hinglish (Roman script, Hindi-English mix)',
};

export function getAiStatus() {
  return {
    provider: groq ? 'Groq' : 'Demo engine',
    mode: groq ? 'groq' : 'demo',
    model: groq ? MODEL : null,
    configured: Boolean(groq),
  };
}

function matchFacts(match) {
  return [
    `${match.battingCode} ${match.score}/${match.wickets} after ${match.overs} overs`,
    `target ${match.target}; need ${match.runsRequired} from ${match.ballsRemaining} balls`,
    `required run rate ${match.requiredRunRate}; current run rate ${match.currentRunRate}`,
    `partnership ${match.partnership.runs} runs from ${match.partnership.balls} balls`,
    `recent deliveries: ${match.recentBalls.map((ball) => `${ball.over}: ${ball.result} (${ball.detail})`).join(' | ')}`,
    `recent moments: ${match.timeline.slice(0, 5).map((event) => `${event.over} ${event.title}: ${event.description}`).join(' | ')}`,
  ].join('\n');
}

function fallbackRecap(match, language = 'hinglish', missed = null) {
  const team = match.battingTeam;
  const plural = (n) => (n === 1 ? '' : 's');
  const keys = (missed?.highlights || []).slice(-3).map((h) => `${h.over} ${h.title}`).join(', ');
  const pressure = match.requiredRunRate >= 11 ? 0 : match.requiredRunRate >= 8 ? 1 : 2;
  const done = Boolean(match.resultText);
  const has = Boolean(missed?.count);
  const copy = {
    english: {
      missed: has ? `In the ${missed.count} balls you missed (${missed.fromOver} to ${missed.toOver}): ${missed.runs} runs and ${missed.wickets} wicket${plural(missed.wickets)}.${keys ? ` Key moments: ${keys}.` : ''}` : 'Nothing new has happened since you last looked.',
      now: done ? `${match.resultText}.` : `${team} are ${match.score}/${match.wickets} after ${match.overs} overs, needing ${match.runsRequired} from ${match.ballsRemaining} balls (${match.requiredRunRate} an over).`,
      next: ['Boundaries are a must now, but another wicket would hurt badly.', 'The chase is getting competitive; the next over matters.', 'The batting side looks in control.'][pressure],
    },
    hinglish: {
      missed: has ? `Jo ${missed.count} balls aapne miss kiye (${missed.fromOver} se ${missed.toOver}): ${missed.runs} runs aur ${missed.wickets} wicket${plural(missed.wickets)}.${keys ? ` Key moments: ${keys}.` : ''}` : 'Pichhli baar dekhne ke baad kuch naya nahi hua.',
      now: done ? `${match.resultText}.` : `${team} ${match.overs} overs ke baad ${match.score}/${match.wickets} par hai. ${match.ballsRemaining} balls mein ${match.runsRequired} runs chahiye (RRR ${match.requiredRunRate}).`,
      next: ['Ab boundaries chahiye, par ek aur wicket bahut mehnga padega.', 'Chase competitive hai, agla over important hai.', 'Batting side control mein lag rahi hai.'][pressure],
    },
    hindi: {
      missed: has ? `आपने जो ${missed.count} गेंदें मिस कीं (${missed.fromOver} से ${missed.toOver}): ${missed.runs} रन और ${missed.wickets} विकेट।${keys ? ` मुख्य पल: ${keys}।` : ''}` : 'पिछली बार देखने के बाद कुछ नया नहीं हुआ।',
      now: done ? `${match.resultText}।` : `${team} ${match.overs} ओवर में ${match.score}/${match.wickets} पर है। जीत के लिए ${match.ballsRemaining} गेंदों में ${match.runsRequired} रन चाहिए।`,
      next: ['अब बाउंड्री ज़रूरी हैं, लेकिन एक और विकेट भारी पड़ेगा।', 'चेज़ रोमांचक है; अगला ओवर अहम है।', 'बल्लेबाज़ी टीम नियंत्रण में दिख रही है।'][pressure],
    },
  }[language] || null;
  const c = copy || { missed: '', now: '', next: '' };
  return [c.missed, c.now, done ? '' : c.next].filter(Boolean).join(' ');
}

function fallbackAnswer(question, match, language = 'hinglish') {
  const q = question.toLowerCase();
  const facts = `Abhi ${match.battingTeam} ${match.score}/${match.wickets} par hai (${match.overs} overs), target ${match.target}. ${match.ballsRemaining} balls mein ${match.runsRequired} runs chahiye; required rate ${match.requiredRunRate}.`;
  const answers = [
    { test: /free.?hit|no.?ball/, hinglish: 'Free hit usually no-ball ke baad milti hai. Is delivery par batter bowled, caught, LBW jaise normal dismissals se out nahi hota; run out, obstructing the field aur hit the ball twice jaise kuch exceptions rehte hain. Matlab batter ko ek extra attacking chance milta hai.', english: 'A free hit is awarded after most no-balls. On that delivery, the batter cannot be dismissed by most ordinary methods such as bowled, caught or LBW, though exceptions such as run out still apply. It gives the batting side a lower-risk scoring chance.', hindi: 'आमतौर पर नो-बॉल के बाद फ्री हिट मिलती है। इस गेंद पर बल्लेबाज़ बोल्ड, कैच या LBW जैसे सामान्य तरीकों से आउट नहीं हो सकता, हालांकि रन आउट जैसे अपवाद लागू रहते हैं।' },
    { test: /power.?play/, hinglish: 'Powerplay innings ka starting phase hota hai jahan fielding restrictions hoti hain. T20 mein pehle 6 overs ke dauran circle ke bahar maximum 2 fielders allowed hote hain. Isliye batters ke paas gaps target karne ke chances zyada hote hain.', english: 'The powerplay is the opening phase with fielding restrictions. In a standard T20 innings, during the first six overs, at most two fielders may be outside the 30-yard circle. That creates more gaps for batters to target.', hindi: 'पावरप्ले शुरुआती ओवरों का चरण है जिसमें फील्डिंग पर पाबंदियाँ होती हैं। सामान्य T20 में पहले छह ओवरों के दौरान 30-यार्ड सर्कल के बाहर अधिकतम दो फील्डर हो सकते हैं।' },
    { test: /dls|duckworth|rain/, hinglish: 'DLS (Duckworth–Lewis–Stern) rain ya interruption wale limited-overs matches mein revised target ya par score calculate karne ka method hai. Ye overs aur wickets ke saath available resources ko consider karta hai. Is demo mein abhi live DLS calculation connected nahi hai.', english: 'DLS (Duckworth–Lewis–Stern) is a method for setting revised targets or par scores when a limited-overs match is interrupted, usually by rain. It accounts for overs and wickets as resources. This demo does not calculate a live DLS target.', hindi: 'DLS बारिश या रुकावट से प्रभावित सीमित ओवरों के मैच में नया लक्ष्य या पार स्कोर तय करने की विधि है। इसमें बचे हुए ओवर और विकेट जैसे संसाधन देखे जाते हैं। इस डेमो में लाइव DLS गणना उपलब्ध नहीं है।' },
    { test: /night.?watchman/, hinglish: 'Nightwatchman usually lower-order batter hota hai jise innings ke end mein bheja jata hai, taaki specialist batter ko difficult light ya day ke last overs mein risk na lena pade. Idea wicket protect karna hota hai, fast scoring nahi.', english: 'A nightwatchman is usually a lower-order batter sent in near the end of a day in a multi-day match. The aim is to protect a specialist batter from facing a difficult short spell, not to accelerate scoring.', hindi: 'नाइटवॉचमैन आमतौर पर निचले क्रम का बल्लेबाज़ होता है जिसे दिन के अंत में भेजा जाता है, ताकि विशेषज्ञ बल्लेबाज़ को कठिन परिस्थितियों में तुरंत बल्लेबाज़ी न करनी पड़े।' },
    { test: /why|pressure|situation|chase|win|next|strategy|score|difficult/, hinglish: `${facts} ${match.requiredRunRate >= 11 ? 'Required run rate 11 se upar hai, so batters ko boundaries dhoondhni hongi, lekin wickets bhi bachane honge.' : 'Required rate manageable range mein hai, par partnership ko continue karna important hoga.'} Latest ball-by-ball events ko dekhte hue next over par nazar rakho.`, english: `${match.battingCode} are ${match.score}/${match.wickets} after ${match.overs} overs. They need ${match.runsRequired} from ${match.ballsRemaining} balls at ${match.requiredRunRate} per over. ${match.requiredRunRate >= 11 ? 'The batting side needs boundaries, but losing another wicket would make the chase harder.' : 'The required rate is still manageable; preserving the partnership will matter.'} The next over is an important checkpoint.`, hindi: `${facts} ${match.requiredRunRate >= 11 ? 'अब बल्लेबाज़ों को बाउंड्री ढूँढनी होंगी, लेकिन विकेट बचाना भी ज़रूरी है।' : 'ज़रूरी रन रेट संभालने लायक है; साझेदारी बनाए रखना अहम होगा।'}` },
  ];
  const found = answers.find((item) => item.test.test(q));
  const languageKey = language === 'english' ? 'english' : language === 'hindi' ? 'hindi' : 'hinglish';
  return found ? found[languageKey] : language === 'english'
    ? `${facts} I can explain the match situation, DLS, powerplay, free hits, fielding decisions and other cricket terms. Try asking one specific question.`
    : language === 'hindi'
      ? `${facts} मैं मैच की स्थिति, DLS, पावरप्ले, फ्री हिट और क्रिकेट के नियम समझा सकता हूँ। कोई एक सवाल पूछें।`
      : `${facts} Main match situation, DLS, powerplay, free hit aur cricket ke rules simple Hinglish mein samjha sakta hoon. Ek specific question try karo.`;
}

async function tryGroq(messages, { temperature = 0.5, maxTokens = 260 } = {}) {
  if (!groq) return { text: null, reason: 'no_api_key' };
  try {
    const params = { model: MODEL, temperature, max_completion_tokens: REASONING ? maxTokens + 900 : maxTokens, messages };
    if (REASONING) params.reasoning_effort = /gpt-oss/i.test(MODEL) ? 'low' : 'none';
    const completion = await groq.chat.completions.create(params);
    const choice = completion.choices?.[0];
    const text = choice?.message?.content?.trim();
    if (text) return { text, reason: null };
    const reason = choice?.finish_reason === 'length' ? 'token_limit' : 'empty_response';
    console.warn(`Groq returned no answer (${reason}, model ${MODEL}).`);
    return { text: null, reason };
  } catch (error) {
    console.error('Groq error:', error.message);
    return { text: null, reason: 'api_error' };
  }
}

// Tiny live test so you can confirm your key and model work: GET /api/ai/check
export async function checkAi() {
  if (!groq) return { ok: false, mode: 'demo', model: null, reason: 'no_api_key' };
  const { text, reason } = await tryGroq([{ role: 'user', content: 'Reply with the single word: ready' }], { maxTokens: 20 });
  return { ok: Boolean(text), mode: 'groq', model: MODEL, reason, sample: text };
}

function missedFacts(missed) {
  if (!missed || !missed.count) return 'Deliveries the fan missed: none (nothing new since they last looked).';
  const lines = missed.balls.slice(-36).map((b) => `${b.over}: ${b.result === 'W' ? 'WICKET' : b.result} - ${b.detail}`);
  return `Deliveries the fan missed (${missed.fromOver} to ${missed.toOver}, ${missed.count} balls): ${missed.runs} runs, ${missed.wickets} wicket(s), ${missed.fours} fours, ${missed.sixes} sixes.\n${lines.join('\n')}`;
}

export async function createRecap(match, language = 'hinglish', missed = null) {
  const prompt = `A fan looked away from a cricket match and wants to catch up in about 15 seconds. Write (1) what they missed, (2) where the match stands now, and (3) what to watch next. Write in ${LANGUAGE_STYLE[language] || LANGUAGE_STYLE.hinglish}. Use only the facts below; do not invent players, events, stats or outcomes, and keep facts separate from opinion. Maximum 90 words.\n\n${missedFacts(missed)}\n\nCurrent match state:\n${matchFacts(match)}${match.resultText ? `\nresult: ${match.resultText}` : ''}`;
  const { text, reason } = await tryGroq([
    { role: 'system', content: 'You are CricketSaathi, a friendly cricket co-watcher. Be concise, accurate and fan-first.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.5, maxTokens: 260 });
  if (text) return { text, source: 'groq', model: MODEL };
  return { text: fallbackRecap(match, language, missed), source: 'demo', model: null, fallbackReason: reason };
}

export async function answerQuestion({ question, match, language = 'hinglish', history = [] }) {
  const safeHistory = Array.isArray(history) ? history.slice(-6).filter((item) => ['user', 'assistant'].includes(item.role) && typeof item.content === 'string').map((item) => ({ role: item.role, content: item.content.slice(0, 700) })) : [];
  const system = `You are CricketSaathi, a knowledgeable, friendly cricket co-watcher. Reply in ${LANGUAGE_STYLE[language] || LANGUAGE_STYLE.hinglish}. Explain jargon simply and use the current match context where relevant. Be helpful to newer fans. Never invent live stats, events, player actions, rule changes or certainty about who will win. If a requested statistic is not in the supplied context, say it is unavailable. For rules, explain the general rule with concise caveats where needed. Do not present predictions as facts. Keep answers under 120 words. Current verified match context:\n${matchFacts(match)}`;
  const { text, reason } = await tryGroq([{ role: 'system', content: system }, ...safeHistory, { role: 'user', content: question }], { temperature: 0.45, maxTokens: 240 });
  if (text) return { text, source: 'groq', model: MODEL };
  return { text: fallbackAnswer(question, match, language), source: 'demo', model: null, fallbackReason: reason };
}
