import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getChallenge } from '../services/contentService';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { QuestionChallenge } from '../components/challenges/QuestionChallenge';
import { StoryChallengeView } from '../components/challenges/StoryChallengeView';
import { DynamicIcon } from '../utils/icons';
import NotFoundPage from './NotFoundPage';

export default function ChallengePlayPage() {
  const { challengeId } = useParams();
  const challenge = getChallenge(challengeId);
  useDocumentTitle(challenge?.title);

  if (!challenge) return <NotFoundPage />;

  return (
    <section className="section dark page-hero challenge-play" style={{ ['--accent' as string]: challenge.accent }}>
      <div className="container narrow">
        <Link to="/challenges" className="back-link">
          <ArrowLeft size={16} aria-hidden="true" /> All challenges
        </Link>
        <header className="challenge-head">
          <span className="challenge-icon">
            <DynamicIcon name={challenge.icon} size={28} />
          </span>
          <div>
            <h1>{challenge.title}</h1>
            <p className="muted">{challenge.description}</p>
          </div>
        </header>
        {challenge.type === 'story' ? (
          <StoryChallengeView key={challenge.id} challenge={challenge} />
        ) : (
          <QuestionChallenge key={challenge.id} challenge={challenge} />
        )}
      </div>
    </section>
  );
}
