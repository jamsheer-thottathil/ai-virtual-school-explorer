import { useState } from 'react';
import { BookOpen, Loader2, RotateCcw, Wand2 } from 'lucide-react';
import type { StoryChallenge } from '../../types';
import { aiPrompts, getLocationName, school } from '../../services/contentService';
import { generateCreativeText } from '../../services/aiService';
import { useAiGuide } from '../../hooks/AiGuideContext';
import { fillTemplate, pickRandom } from '../../utils/text';
import { RichText } from '../common/RichText';
import { DynamicIcon } from '../../utils/icons';

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  render = (v: string) => v
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  render?: (v: string) => string;
}) {
  return (
    <fieldset className="choice-group">
      <legend>{label}</legend>
      <div className="chip-row">
        {options.map((o) => (
          <button key={o} type="button" className={`chip ${value === o ? 'active' : ''}`} aria-pressed={value === o} onClick={() => onChange(o)}>
            {render(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** AI Story Challenge – live AI when available, offline story templates otherwise. */
export function StoryChallengeView({ challenge }: { challenge: StoryChallenge }) {
  const { apiKey } = useAiGuide();
  const [character, setCharacter] = useState('');
  const [place, setPlace] = useState('');
  const [theme, setTheme] = useState('');
  const [idea, setIdea] = useState('');
  const [story, setStory] = useState<{ text: string; source: 'ai' | 'template' } | null>(null);
  const [loading, setLoading] = useState(false);

  const chosen = [character, place, theme].filter(Boolean).length;
  const ready = chosen >= challenge.minimumChoices;

  const generate = async () => {
    const values = {
      character: character || pickRandom(challenge.characters),
      place: getLocationName(place || pickRandom(challenge.places)),
      theme: theme || pickRandom(challenge.themes),
      idea: idea.trim(),
      schoolName: school.name
    };
    setLoading(true);
    const prompt = fillTemplate(aiPrompts.storyPrompt, values);
    const aiStory = await generateCreativeText(prompt, apiKey);
    if (aiStory) setStory({ text: aiStory, source: 'ai' });
    else {
      let text = fillTemplate(pickRandom(challenge.templates), values);
      if (values.idea) text += `\n\nAnd just as you imagined: ${values.idea}`;
      setStory({ text, source: 'template' });
    }
    setLoading(false);
  };

  const badge = challenge.badges[0];

  return (
    <section className="question-card glass story-card" aria-labelledby="story-title">
      <h2 id="story-title" className="question-text">
        Build your campus story
      </h2>
      <p className="muted">Pick at least {challenge.minimumChoices} ingredients, then let the AI storyteller write it.</p>
      <ChoiceGroup label="1. Choose a hero" options={challenge.characters} value={character} onChange={setCharacter} />
      <ChoiceGroup label="2. Choose a place" options={challenge.places} value={place} onChange={setPlace} render={getLocationName} />
      <ChoiceGroup label="3. Choose a theme" options={challenge.themes} value={theme} onChange={setTheme} />
      <label className="field">
        <span>4. Add your own twist (optional)</span>
        <input type="text" value={idea} maxLength={140} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. the library books start to glow…" />
      </label>
      <div className="btn-row">
        <button type="button" className="btn btn-glow" onClick={() => void generate()} disabled={!ready || loading}>
          {loading ? <Loader2 size={18} className="spin" aria-hidden="true" /> : <Wand2 size={18} aria-hidden="true" />}
          {loading ? 'Writing your story…' : story ? 'Write another version' : 'Create my story'}
        </button>
        {story && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setStory(null);
              setCharacter('');
              setPlace('');
              setTheme('');
              setIdea('');
            }}
          >
            <RotateCcw size={16} aria-hidden="true" /> Start over
          </button>
        )}
      </div>

      {story && (
        <article className="story-output fade-in" aria-live="polite">
          <h3>
            <BookOpen size={18} aria-hidden="true" /> Your story
          </h3>
          <RichText text={story.text} />
          <p className="muted small">
            {story.source === 'ai' ? 'Written by the live AI model.' : 'Created offline from story templates.'} This is a work of imagination, not a school record.
          </p>
          {badge && (
            <div className="badge-earned">
              <span className="badge-icon">
                <DynamicIcon name={badge.icon} size={24} />
              </span>
              <div>
                <strong>Badge earned: {badge.title}</strong>
                <p>{badge.description}</p>
              </div>
            </div>
          )}
        </article>
      )}
    </section>
  );
}
