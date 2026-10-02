import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';

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
    setMessages(prev => [
      ...prev,
      { id: msgId.current++, from: 'bot', text, chips },
    ]);
  };

  const send = async (value) => {
    const trimmed = (value || input).trim();
    if (!trimmed) return;
    setInput('');

    const historySnapshot = messages.map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    setMessages(prev => [
      ...prev,
      { id: msgId.current++, from: 'user', text: trimmed },
    ]);

    setIsTyping(true);
    try {
      const res = await api.chat(trimmed, historySnapshot);
      setIsTyping(false);
      addBotMessage(res.text, res.chips);
    } catch (err) {
      setIsTyping(false);
      addBotMessage(
        "Sorry, I couldn't reach the server just now. Please try again in a moment.",
        []
      );
      console.error('Chatbot request failed:', err);
    }
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
                  <span className="live-dot" style={{ background: '#A2E037' }} />
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
                  className={`chat-msg-${msg.from} max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${msg.from === 'user'
                      ? 'bg-primary text-white rounded-br-sm font-medium'
                      : 'rounded-bl-sm font-medium'
                    }`}
                  style={msg.from === 'bot' ? { background: 'var(--surface-low)', color: 'var(--text)' } : {}}
                >
                  {msg.from === 'bot' ? formatText(msg.text) : msg.text}
                </div>

                {/* Quick chips */}
                {msg.chips && msg.chips.length > 0 && msg.from === 'bot' && (
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
