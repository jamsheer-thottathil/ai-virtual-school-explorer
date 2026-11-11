import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Trophy } from 'lucide-react';
import type { Badge } from '../../types';
import { DynamicIcon } from '../../utils/icons';

export function ChallengeComplete({
  title,
  score,
  total,
  percent,
  badge,
  extra,
  onRestart
}: {
  title: string;
  score: number;
  total: number;
  percent: number;
  badge: Badge | null;
  extra?: ReactNode;
  onRestart: () => void;
}) {
  return (
    <section className="challenge-complete glass fade-in" aria-labelledby="complete-title">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <Trophy size={48} className="complete-trophy" aria-hidden="true" />
      <h2 id="complete-title">Challenge complete!</h2>
      <p className="muted">{title}</p>
      <p className="big-score" aria-live="polite">
        {score} <span>/ {total}</span>
      </p>
      <p className="score-pct">{percent}% correct</p>
      {badge ? (
        <div className="badge-earned">
          <span className="badge-icon">
            <DynamicIcon name={badge.icon} size={28} />
          </span>
          <div>
            <strong>Badge earned: {badge.title}</strong>
            <p>{badge.description}</p>
          </div>
        </div>
      ) : (
        <p className="muted">Keep exploring the campus and try again to earn a badge!</p>
      )}
      {extra}
      <div className="btn-row center">
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          <RotateCcw size={18} aria-hidden="true" /> Play again
        </button>
        <Link to="/challenges" className="btn btn-ghost">
          More challenges
        </Link>
      </div>
    </section>
  );
}
