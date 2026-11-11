import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Bot, Database, MapPin, RotateCcw, Send, Square, User } from 'lucide-react';
import { useAiGuide } from '../../hooks/AiGuideContext';
import { aiPrompts, getLocation } from '../../services/contentService';
import { RichText } from '../common/RichText';
import { AiModeBadge, DemoKeyPanel } from './AiStatus';

export function ChatPanel({ variant = 'page' }: { variant?: 'page' | 'drawer' }) {
  const { messages, isLoading, ask, cancel, clear, currentLocationId, consumePrefill, pendingPrefill } = useAiGuide();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = getLocation(currentLocationId ?? undefined);

  useEffect(() => {
    if (!pendingPrefill) return;
    const prefill = consumePrefill();
    if (prefill) void ask(prefill);
  }, [pendingPrefill, consumePrefill, ask]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const onlyWelcome = messages.length <= 1;

  // Suggested questions stay visible (minus ones already asked) – handy for exhibition visitors.
  const suggestions = useMemo(() => {
    const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.content.trim().toLowerCase()));
    const base = location
      ? [...aiPrompts.locationQuestions.map((q) => q.replace('{location}', location.name)), ...aiPrompts.suggestedQuestions]
      : aiPrompts.suggestedQuestions;
    return Array.from(new Set(base))
      .filter((q) => !asked.has(q.toLowerCase()))
      .slice(0, onlyWelcome ? 6 : 4);
  }, [location, messages, onlyWelcome]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    void ask(input);
    setInput('');
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section className={`chat-panel chat-${variant}`} aria-label={aiPrompts.assistantName}>
      <div className="chat-toolbar">
        <AiModeBadge />
        {location && (
          <span className="context-chip" title="The guide knows where you are">
            <MapPin size={14} aria-hidden="true" /> {location.name}
          </span>
        )}
        <button type="button" className="icon-btn chat-reset" onClick={clear} aria-label="Start a new conversation">
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>

      <div ref={listRef} className="chat-messages" role="log" aria-live="polite" aria-relevant="additions" aria-busy={isLoading}>
        {messages.map((m) => (
          <article key={m.id} className={`chat-msg from-${m.role} ${m.source === 'error' ? 'is-error' : ''}`}>
            <span className="chat-avatar" aria-hidden="true">
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </span>
            <div className="chat-bubble">
              <span className="sr-only">{m.role === 'user' ? 'You said:' : `${aiPrompts.assistantName} said:`}</span>
              <RichText text={m.content} />
              {m.role === 'assistant' && m.source === 'offline' && m.id !== 'welcome' && (
                <span className="msg-meta">
                  <Database size={12} aria-hidden="true" /> From loaded school records
                </span>
              )}
              {m.role === 'user' && m.locationName && (
                <span className="msg-meta">
                  <MapPin size={12} aria-hidden="true" /> asked at {m.locationName}
                </span>
              )}
            </div>
          </article>
        ))}
        {isLoading && (
          <div className="chat-msg from-assistant typing" aria-label="The guide is typing">
            <span className="chat-avatar" aria-hidden="true">
              <Bot size={16} />
            </span>
            <div className="chat-bubble">
              <span className="typing-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && !isLoading && (
        <div className="chat-suggestions" aria-label="Suggested questions">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => void ask(s)} disabled={isLoading}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={submit}>
        <label htmlFor={`chat-input-${variant}`} className="sr-only">
          Ask a question about the school
        </label>
        <textarea
          id={`chat-input-${variant}`}
          ref={inputRef}
          rows={1}
          value={input}
          maxLength={600}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={location ? `Ask about the ${location.name}…` : 'Ask anything about our school…'}
          data-autofocus={variant === 'drawer' ? true : undefined}
        />
        {isLoading ? (
          <button type="button" className="icon-btn send-btn" onClick={cancel} aria-label="Stop answer">
            <Square size={18} aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" className="icon-btn send-btn" disabled={!input.trim()} aria-label="Send question">
            <Send size={18} aria-hidden="true" />
          </button>
        )}
      </form>
      <DemoKeyPanel compact />
    </section>
  );
}
