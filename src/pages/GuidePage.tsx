import { useEffect, useId } from 'react';
import { BookCheck, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { aiConfig, aiPrompts, locations } from '../services/contentService';
import { useAiGuide } from '../hooks/AiGuideContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ChatPanel } from '../components/ai/ChatPanel';

export default function GuidePage() {
  useDocumentTitle(aiPrompts.assistantName);
  const { currentLocationId, setCurrentLocationId, closeDrawer } = useAiGuide();
  const selectId = useId();

  useEffect(() => closeDrawer(), [closeDrawer]);

  return (
    <section className="section dark page-hero guide-page">
      <div className="container guide-grid">
        <div className="guide-intro">
          <p className="eyebrow glow">
            <Sparkles size={16} aria-hidden="true" /> AI school guide
          </p>
          <h1 className="section-title">{aiPrompts.assistantName}</h1>
          <p className="section-desc">{aiPrompts.assistantTagline}</p>

          <label htmlFor={selectId} className="field">
            <span>
              <MapPin size={14} aria-hidden="true" /> Ask about a specific location
            </span>
            <select id={selectId} className="select" value={currentLocationId ?? ''} onChange={(e) => setCurrentLocationId(e.target.value || null)}>
              <option value="">Whole school</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>

          <ul className="guide-points">
            <li>
              <BookCheck size={18} aria-hidden="true" />
              <span>Answers come only from the school records loaded in this app. If something isn't recorded, the guide will say so.</span>
            </li>
            <li>
              <MapPin size={18} aria-hidden="true" />
              <span>While you explore the campus, the guide automatically knows which location you are viewing.</span>
            </li>
            <li>
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                {aiConfig.proxyUrl
                  ? 'Live answers are served through the school’s secure AI proxy – no keys in the browser.'
                  : 'Without a secure proxy, the guide works offline from the records. A demo key can be used for live AI.'}
              </span>
            </li>
          </ul>
        </div>
        <ChatPanel variant="page" />
      </div>
    </section>
  );
}
