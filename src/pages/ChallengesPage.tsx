import { Link } from 'react-router-dom';
import { ArrowRight, WifiOff } from 'lucide-react';
import { challenges } from '../services/contentService';
import { DynamicIcon } from '../utils/icons';
import { SectionHeading } from '../components/common/SectionHeading';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function countLabel(c: (typeof challenges)[number]): string {
  if (c.type === 'story') return 'Creative';
  return `${c.questions.length} questions`;
}

export default function ChallengesPage() {
  useDocumentTitle('AI Discovery Challenge');
  return (
    <section className="section dark page-hero">
      <div className="container">
        <SectionHeading
          as="h1"
          eyebrow="AI discovery challenge"
          title="Test what you discovered"
          description="Quick games built from our school records. Earn badges, challenge the AI, and create your own campus story."
        />
        <p className="offline-pill">
          <WifiOff size={14} aria-hidden="true" /> Works offline – all questions are stored in the app
        </p>
        <ul className="challenge-grid">
          {challenges.map((c) => (
            <li key={c.id}>
              <Link to={`/challenges/${c.id}`} className="challenge-card" style={{ ['--accent' as string]: c.accent }}>
                <span className="challenge-icon">
                  <DynamicIcon name={c.icon} size={28} />
                </span>
                <h2>{c.title}</h2>
                <p>{c.description}</p>
                <span className="challenge-meta">
                  {countLabel(c)} · {c.badges.length} badge{c.badges.length === 1 ? '' : 's'}
                </span>
                <span className="link-arrow">
                  Play <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
