import React, { useState, useRef, useEffect } from 'react';

/* ── Pre-programmed knowledge base ─────────────────── */
const KB = [
  {
    triggers: ['hello', 'hi', 'hey', 'start', 'help', 'sup'],
    text: "Hey! 👋 I'm the CryptoSpark AI assistant. I can help you understand our platform, ML models, infrastructure, and predictions. What are you curious about?",
    chips: ['How accurate?', 'What models?', 'How to start', 'Infrastructure'],
  },
  {
    triggers: ['accurate', 'accuracy', 'precision', 'reliable', 'correct', 'performance'],
    text: "Our production XGBoost model achieves **94.2% accuracy** on historical out-of-sample data. The LSTM challenger hits 91.8%. Both are continuously retrained via AWS SageMaker on 1.2 TB of historical data.",
    chips: ['What models?', 'View metrics', 'Infrastructure'],
  },
  {
    triggers: ['model', 'algorithm', 'lstm', 'xgboost', 'ml', 'machine learning', 'ai'],
    text: "We run an ensemble of four models:\n🟢 XGBoost — 94.2% (production)\n🟡 LSTM — 91.8% (challenger)\n⚪ Random Forest — 88.5%\n⚫ Linear Regression — 76.4% (baseline)\n\nXGBoost and LSTM are the primary pair.",
    chips: ['How accurate?', 'View model metrics', 'Infrastructure'],
  },
  {
    triggers: ['aws', 'infrastructure', 'pipeline', 'spark', 'architecture', 'cloud', 'emr', 'sagemaker', 's3'],
    text: "The pipeline is fully cloud-native:\nRaw API data → Amazon S3 Data Lake → AWS EMR (Apache Spark) → PySpark ETL & Feature Engineering → SageMaker inference → Live React dashboard.\n\nLatency: <45ms end-to-end.",
    chips: ['View pipeline', 'Model accuracy', 'Get started'],
  },
  {
    triggers: ['start', 'get started', 'begin', 'dashboard', 'use', 'try', 'access', 'open'],
    text: "You can jump straight in! Head to the **Dashboard** for live market data, or open the **Predictions** page to run the ML models interactively — choose your asset, timeframe, and algorithm.",
    chips: ['Dashboard', 'Try Predictions', 'View Architecture'],
  },
  {
    triggers: ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'market', 'price', 'coin'],
    text: "We cover BTC/USD, ETH/USD, SOL/USD, ADA/USD, and BNB/USD with live WebSocket feeds. Our models analyze 200+ indicators: RSI, MACD, Bollinger Bands, order book imbalance, and on-chain sentiment.",
    chips: ['Try Predictions', 'Dashboard', 'Model accuracy'],
  },
  {
    triggers: ['about', 'project', 'who', 'team', 'capstone', 'academic', 'built', 'made'],
    text: "CryptoSpark AI is an academic capstone project. The team includes ML specialists, data engineers, and frontend architects. We process 1.2TB+ of training data daily through a distributed Spark pipeline.",
    chips: ['Meet team', 'Infrastructure', 'Model accuracy'],
  },
  {
    triggers: ['free', 'cost', 'price', 'pay', 'subscription', 'plan'],
    text: "CryptoSpark AI is a 100% free academic research platform. All features are fully accessible — no account required.",
    chips: ['Get started', 'View Dashboard'],
  },
  {
    triggers: ['dark', 'light', 'theme', 'mode', 'colour', 'color'],
    text: "You can toggle between dark and light mode using the sun/moon icon in the top navigation bar. Your preference is saved automatically.",
    chips: ['How to start', 'About project'],
  },
];

const DEFAULT = {
  text: "I'm not sure I have specific info on that, but I can help with our platform, models, infrastructure, or predictions. Try one of these:",
  chips: ['How accurate?', 'What models?', 'Infrastructure', 'Get started'],
};

function matchResponse(input) {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.triggers.some(t => lower.includes(t))) return entry;
  }
  return DEFAULT;
}

/* ── Format bold markdown (**text**) ─────────────── */
function formatText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') ? <strong key={i} className="font-bold">{p.slice(2, -2)}</strong> : p
  );
}

/* ── Component ───────────────────────────────────── */
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: "Hello! I'm CryptoSpark AI's assistant. Ask me anything about predictions, models, or the platform.",
      chips: ['How accurate?', 'What models?', 'How to start', 'Infrastructure'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const inputRef = useRef(null);
  let msgId = useRef(2);
  const messagesContainerRef = useRef(null);

  /* Scroll INSIDE the chat container only — never the page */
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  /* Focus input when opened */
  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  /* Mount animation trick */
  useEffect(() => { setMounted(true); }, []);

  const addBotMessage = (text, chips) => {
    setIsTyping(true);
    const delay = 600 + Math.min(text.length * 5, 1000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: msgId.current++, from: 'bot', text, chips },
      ]);
    }, delay);
  };

  const send = (value) => {
    const trimmed = (value || input).trim();
    if (!trimmed) return;
    setInput('');

    setMessages(prev => [
      ...prev,
      { id: msgId.current++, from: 'user', text: trimmed },
    ]);

    const resp = matchResponse(trimmed);
    addBotMessage(resp.text, resp.chips);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* ── Floating Button ───────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip hint */}
        {!open && mounted && (
          <div className="animate-fade-in-up bg-charcoal dark:bg-dark-surface text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
            Ask me anything ✦
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle AI assistant"
          className="relative w-14 h-14 rounded-2xl bg-gradient-primary text-white shadow-glow flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow active:scale-95"
        >
          {/* Unread badge */}
          {hasUnread && !open && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-lime rounded-full border-2 border-white dark:border-dark-bg animate-ping-once" />
          )}
          <span className="material-symbols-outlined text-2xl transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
            {open ? 'close' : 'smart_toy'}
          </span>
        </button>
      </div>

      {/* ── Chat Panel ───────────────────────────── */}
      {open && (
        <div
          className="chat-panel chat-panel-enter fixed bottom-24 right-6 z-50 w-[340px] sm:w-[360px] rounded-2xl overflow-hidden shadow-chat flex flex-col"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            maxHeight: 'calc(100vh - 120px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-primary">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">CryptoSpark AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="live-dot" style={{ background:'#A2E037' }} />
                  <span className="text-white/70 text-[10px] font-semibold tracking-wide">ONLINE · AI Assistant</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: '380px' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div
                  className={`chat-msg-${msg.from} max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-primary text-white rounded-br-sm font-medium'
                      : 'rounded-bl-sm font-medium'
                  }`}
                  style={msg.from === 'bot' ? { background: 'var(--surface-low)', color: 'var(--text)' } : {}}
                >
                  {msg.from === 'bot' ? formatText(msg.text) : msg.text}
                </div>

                {/* Quick chips */}
                {msg.chips && msg.from === 'bot' && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {msg.chips.map(chip => (
                      <button
                        key={chip}
                        onClick={() => send(chip)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          background: 'rgba(44,110,89,0.08)',
                          border: '1px solid rgba(44,110,89,0.2)',
                          color: 'var(--primary)',
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5" style={{ background: 'var(--surface-low)' }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}



          </div>

          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--surface-low)', border: '1px solid var(--border)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-[13px] font-medium placeholder:text-[color:var(--text-muted)] outline-none"
                style={{ color: 'var(--text)' }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center transition-all duration-200 hover:bg-primary-light disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
              >
                <span className="material-symbols-outlined text-lg">arrow_upward</span>
              </button>
            </div>
            <p className="text-center mt-2 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              CryptoSpark AI · Academic Project
            </p>
          </div>
        </div>
      )}
    </>
  );
}
