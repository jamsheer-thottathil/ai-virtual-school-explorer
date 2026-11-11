import { useId, useState } from 'react';
import { AlertTriangle, KeyRound, ShieldCheck, WifiOff, Eye, EyeOff } from 'lucide-react';
import { useAiGuide } from '../../hooks/AiGuideContext';
import { aiConfig, aiPrompts } from '../../services/contentService';

const MODE_LABEL = {
  proxy: { text: 'Live AI · secure proxy', icon: ShieldCheck, cls: 'mode-proxy' },
  demo: { text: 'Live AI · demo key', icon: KeyRound, cls: 'mode-demo' },
  offline: { text: 'Records mode (offline)', icon: WifiOff, cls: 'mode-offline' }
} as const;

export function AiModeBadge() {
  const { mode } = useAiGuide();
  const m = MODE_LABEL[mode];
  return (
    <span className={`mode-badge ${m.cls}`}>
      <m.icon size={14} aria-hidden="true" /> {m.text}
    </span>
  );
}

/**
 * Demo-mode key entry. The key is kept only in React memory (lost on refresh),
 * never written to localStorage/cookies and never sent anywhere except the
 * configured AI endpoint.
 */
export function DemoKeyPanel({ compact = false }: { compact?: boolean }) {
  const { apiKey, setApiKey, mode } = useAiGuide();
  const [draft, setDraft] = useState('');
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const inputId = useId();

  if (!aiConfig.enabled || aiConfig.proxyUrl.trim() || !aiConfig.allowDemoKey) return null;

  if (!expanded && !apiKey) {
    return (
      <button type="button" className="link-btn demo-key-toggle" onClick={() => setExpanded(true)}>
        <KeyRound size={14} aria-hidden="true" /> Use a demo API key for live AI
      </button>
    );
  }

  return (
    <div className="demo-key-panel">
      <p className="warning" role="alert">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>{aiPrompts.demoKeyWarning}</span>
      </p>
      {apiKey ? (
        <div className="demo-key-row">
          <span className="demo-key-set">
            <KeyRound size={14} aria-hidden="true" /> Demo key active (memory only)
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setApiKey(null)}>
            Forget key
          </button>
        </div>
      ) : (
        <form
          className="demo-key-row"
          onSubmit={(e) => {
            e.preventDefault();
            setApiKey(draft);
            setDraft('');
          }}
          autoComplete="off"
        >
          <label htmlFor={inputId} className="sr-only">
            AICredits API key (demo mode)
          </label>
          <div className="key-input-wrap">
            <input
              id={inputId}
              type={show ? 'text' : 'password'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste API key (kept in memory only)"
              autoComplete="off"
              spellCheck={false}
              name="ai-demo-key"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide key' : 'Show key'}
            >
              {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
            Use key
          </button>
        </form>
      )}
      {mode === 'offline' && !apiKey && (
        <p className="muted small">Without a key, answers come from the school records loaded in this app.</p>
      )}
    </div>
  );
}
