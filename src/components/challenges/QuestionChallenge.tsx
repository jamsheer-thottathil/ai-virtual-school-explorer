import { useMemo, useRef, useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, Lightbulb, User, XCircle } from 'lucide-react';
import type { Challenge, MediaImage } from '../../types';
import { getLocation, getLocationName } from '../../services/contentService';
import { aiChooseOption } from '../../services/aiService';
import { useAiGuide } from '../../hooks/AiGuideContext';
import { awardBadge, scorePercent } from '../../utils/score';
import { LazyImage } from '../common/LazyImage';
import { ProgressBar } from './ProgressBar';
import { ChallengeComplete } from './ChallengeComplete';

interface NormalizedQuestion {
  id: string;
  prompt: string;
  image?: MediaImage;
  options: string[];
  answerIndex: number;
  explanation: string;
  hint?: string;
}

type QuestionBased = Exclude<Challenge, { type: 'story' }>;

/** Convert every question-style challenge JSON into one common shape. */
function normalize(challenge: QuestionBased): NormalizedQuestion[] {
  switch (challenge.type) {
    case 'quiz':
    case 'human-vs-ai':
      return challenge.questions.map((q) => ({
        id: q.id,
        prompt: q.question,
        image: q.image,
        options: q.options,
        answerIndex: q.answerIndex,
        explanation: q.explanation
      }));
    case 'true-false':
      return challenge.questions.map((q) => ({
        id: q.id,
        prompt: q.statement,
        options: ['True', 'False'],
        answerIndex: q.isTrue ? 0 : 1,
        explanation: q.explanation
      }));
    case 'guess-location':
      return challenge.questions.map((q) => {
        const loc = getLocation(q.answer);
        return {
          id: q.id,
          prompt: q.prompt,
          image: q.image,
          options: q.options.map(getLocationName),
          answerIndex: Math.max(0, q.options.indexOf(q.answer)),
          explanation: loc ? `This is the ${loc.name}. ${loc.shortDescription}` : '',
          hint: q.hint
        };
      });
  }
}

export function QuestionChallenge({ challenge }: { challenge: QuestionBased }) {
  const questions = useMemo(() => normalize(challenge), [challenge]);
  const isVersus = challenge.type === 'human-vs-ai';
  const { apiKey } = useAiGuide();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [aiPick, setAiPick] = useState<{ index: number; source: 'ai' | 'offline' } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  const q = questions[index];

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setAiScore(0);
    setAiPick(null);
    setShowHint(false);
    setFinished(false);
  };

  const choose = async (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answerIndex) setScore((s) => s + 1);
    if (isVersus) {
      setAiThinking(true);
      const pick = await aiChooseOption(q.prompt, q.options, apiKey);
      setAiPick(pick);
      if (pick.index === q.answerIndex) setAiScore((s) => s + 1);
      setAiThinking(false);
    }
    window.setTimeout(() => nextRef.current?.focus(), 50);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAiPick(null);
    setShowHint(false);
  };

  if (!questions.length) return <p className="muted">This challenge has no questions yet.</p>;

  if (finished) {
    const percent = scorePercent(score, questions.length);
    const verdict =
      score > aiScore ? 'You beat the AI! Human curiosity wins.' : score === aiScore ? "It's a draw – great teamwork!" : 'The AI won this round. Explore the campus and try again!';
    return (
      <ChallengeComplete
        title={challenge.title}
        score={score}
        total={questions.length}
        percent={percent}
        badge={awardBadge(challenge.badges, percent)}
        onRestart={restart}
        extra={
          isVersus ? (
            <div className="versus-result">
              <span>
                <User size={18} aria-hidden="true" /> You: <strong>{score}</strong>
              </span>
              <span>
                <Bot size={18} aria-hidden="true" /> AI: <strong>{aiScore}</strong>
              </span>
              <p>{verdict}</p>
            </div>
          ) : undefined
        }
      />
    );
  }

  const answered = selected !== null;
  const correct = answered && selected === q.answerIndex;

  return (
    <section className="question-card glass" aria-labelledby={`q-${q.id}`}>
      <div className="question-top">
        <span className="muted small">
          Question {index + 1} of {questions.length}
        </span>
        <span className="score-pill" aria-live="polite">
          {isVersus ? (
            <>
              <User size={14} aria-hidden="true" /> {score} · <Bot size={14} aria-hidden="true" /> {aiScore}
            </>
          ) : (
            <>Score: {score}</>
          )}
        </span>
      </div>
      <ProgressBar value={index + (answered ? 1 : 0)} max={questions.length} label="Challenge progress" />

      {q.image && (
        <div className="question-image">
          <LazyImage src={q.image.src} alt={q.image.alt} />
        </div>
      )}
      <h2 id={`q-${q.id}`} className="question-text">
        {q.prompt}
      </h2>

      {q.hint && !answered && (
        <button type="button" className="link-btn" onClick={() => setShowHint(true)} disabled={showHint}>
          <Lightbulb size={16} aria-hidden="true" /> {showHint ? q.hint : 'Show a hint'}
        </button>
      )}

      <div className={`options ${q.options.length === 2 ? 'two' : ''}`} role="group" aria-label="Answer options">
        {q.options.map((opt, i) => {
          const state = !answered ? '' : i === q.answerIndex ? 'is-correct' : i === selected ? 'is-wrong' : 'is-dim';
          return (
            <button key={opt + i} type="button" className={`option ${state}`} onClick={() => void choose(i)} disabled={answered}>
              <span className="option-letter" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
              {isVersus && aiPick?.index === i && (
                <span className="ai-pick-tag">
                  <Bot size={12} aria-hidden="true" /> AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`feedback ${correct ? 'good' : 'bad'}`} role="status">
          {correct ? <CheckCircle2 size={22} aria-hidden="true" /> : <XCircle size={22} aria-hidden="true" />}
          <div>
            <strong>{correct ? 'Correct!' : `Not quite – the answer is "${q.options[q.answerIndex]}".`}</strong>
            {q.explanation && <p>{q.explanation}</p>}
            {isVersus && (
              <p className="muted small">
                {aiThinking
                  ? 'The AI is thinking…'
                  : aiPick
                    ? `The AI chose "${q.options[aiPick.index]}" ${aiPick.index === q.answerIndex ? '✓' : '✗'} (${
                        aiPick.source === 'ai' ? 'live AI model' : 'offline records search'
                      })`
                    : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {answered && (
        <div className="btn-row end">
          <button ref={nextRef} type="button" className="btn btn-primary" onClick={next} disabled={aiThinking}>
            {index + 1 >= questions.length ? 'See results' : 'Next question'} <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
