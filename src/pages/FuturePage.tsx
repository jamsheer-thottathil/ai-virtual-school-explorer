import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Sparkles, Wand2 } from 'lucide-react';
import type { FutureScenario } from '../types';
import { aiPrompts, futureSchool, school } from '../services/contentService';
import { generateCreativeText, generateImage } from '../services/aiService';
import { useAiGuide } from '../hooks/AiGuideContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { overlapScore, tokenize } from '../utils/text';
import { DynamicIcon } from '../utils/icons';
import { LazyImage } from '../components/common/LazyImage';
import { RichText } from '../components/common/RichText';
import { SampleNotice } from '../components/common/SampleBadge';

function matchScenario(prompt: string): FutureScenario {
  const tokens = tokenize(prompt);
  let best = futureSchool.scenarios[0];
  let bestScore = -1;
  for (const s of futureSchool.scenarios) {
    const score = overlapScore(tokens, tokenize([s.title, s.tagline, s.description, ...s.keywords, ...s.keywords].join(' ')));
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}

interface Vision {
  prompt: string;
  scenario: FutureScenario;
  text: string | null;
  imageUrl: string | null;
}

export default function FuturePage() {
  useDocumentTitle('Future School 2040');
  const { apiKey } = useAiGuide();
  const [activeId, setActiveId] = useState(futureSchool.scenarios[0]?.id);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [vision, setVision] = useState<Vision | null>(null);
  const active = futureSchool.scenarios.find((s) => s.id === activeId) ?? futureSchool.scenarios[0];

  const imagine = async (e?: FormEvent, preset?: string) => {
    e?.preventDefault();
    const p = (preset ?? prompt).trim();
    if (!p || loading) return;
    if (preset) setPrompt(preset);
    setLoading(true);
    const scenario = matchScenario(p);
    const fullPrompt = aiPrompts.futurePrompt.replace('{schoolName}', school.name).replace('{idea}', p);
    const [text, imageUrl] = await Promise.all([
      generateCreativeText(fullPrompt, apiKey),
      generateImage(`Futuristic school campus concept art, year 2040: ${p}. Bright, optimistic, educational.`, apiKey)
    ]);
    setVision({ prompt: p, scenario, text, imageUrl });
    setActiveId(scenario.id);
    setLoading(false);
  };

  return (
    <>
      <section className="section dark page-hero future-hero">
        <div className="future-grid-bg" aria-hidden="true" />
        <div className="container narrow center">
          <p className="eyebrow glow">
            <Sparkles size={16} aria-hidden="true" /> AI Future School 2040
          </p>
          <h1 className="hero-title future-title">{futureSchool.title}</h1>
          <p className="section-desc">{futureSchool.subtitle}</p>

          <form className="future-prompt glass" onSubmit={(e) => void imagine(e)}>
            <label htmlFor="future-input" className="sr-only">
              Describe your idea for the school of 2040
            </label>
            <input
              id="future-input"
              value={prompt}
              maxLength={200}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Imagine… a classroom where robots help with experiments"
            />
            <button type="submit" className="btn btn-glow" disabled={!prompt.trim() || loading}>
              {loading ? <Loader2 size={18} className="spin" aria-hidden="true" /> : <Wand2 size={18} aria-hidden="true" />}
              {loading ? 'Imagining…' : 'Imagine'}
            </button>
          </form>
          <div className="chip-row center">
            {futureSchool.promptSuggestions.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => void imagine(undefined, s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
          <SampleNotice>{futureSchool.notice}</SampleNotice>
        </div>

        {vision && (
          <div className="container">
            <article className="vision glass fade-in" aria-live="polite">
              <div className="vision-media">
                {vision.imageUrl ? (
                  <img src={vision.imageUrl} alt={`AI-generated concept: ${vision.prompt}`} />
                ) : (
                  <LazyImage src={vision.scenario.image.src} alt={vision.scenario.image.alt} priority />
                )}
                <span className="vision-tag">{vision.imageUrl ? 'AI-generated concept' : 'Prepared concept visual'}</span>
              </div>
              <div className="vision-body">
                <p className="eyebrow">Your vision · closest concept: {vision.scenario.title}</p>
                <h2>“{vision.prompt}”</h2>
                {vision.text ? (
                  <RichText text={vision.text} />
                ) : (
                  <>
                    <p>{vision.scenario.description}</p>
                    <p className="muted small">Live AI is not connected, so this is the prepared concept that best matches your idea.</p>
                  </>
                )}
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="section light">
        <div className="container">
          <div className="scenario-tabs" role="tablist" aria-label="Future school scenarios">
            {futureSchool.scenarios.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`tab-${s.id}`}
                aria-controls="scenario-panel"
                aria-selected={s.id === active.id}
                tabIndex={s.id === active.id ? 0 : -1}
                className={`scenario-tab ${s.id === active.id ? 'active' : ''}`}
                onClick={() => setActiveId(s.id)}
                onKeyDown={(e) => {
                  const i = futureSchool.scenarios.findIndex((x) => x.id === active.id);
                  const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                  if (!delta) return;
                  e.preventDefault();
                  const next = futureSchool.scenarios[(i + delta + futureSchool.scenarios.length) % futureSchool.scenarios.length];
                  setActiveId(next.id);
                  document.getElementById(`tab-${next.id}`)?.focus();
                }}
              >
                <DynamicIcon name={s.icon} size={18} />
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          <div id="scenario-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} className="scenario-panel" key={active.id}>
            <div className="scenario-media">
              <LazyImage src={active.image.src} alt={active.image.alt} />
            </div>
            <div className="scenario-body fade-in">
              <p className="eyebrow">{active.tagline}</p>
              <h2 className="section-title">{active.title}</h2>
              <p className="lead">{active.description}</p>
              <ul className="check-list">
                {active.features.map((f) => (
                  <li key={f}>
                    <CheckCircle2 size={18} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="future-cards">
            {futureSchool.scenarios.map((s) => (
              <li key={s.id}>
                <button type="button" className={`future-card ${s.id === active.id ? 'active' : ''}`} onClick={() => setActiveId(s.id)}>
                  <LazyImage src={s.image.src} alt="" />
                  <span className="future-card-body">
                    <DynamicIcon name={s.icon} size={18} />
                    <strong>{s.title}</strong>
                    <small>{s.tagline}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
