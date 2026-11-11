import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <section className="section dark center-page">
      <div className="container narrow center">
        <Compass size={56} className="spin-slow accent" aria-hidden="true" />
        <h1 className="section-title">You've wandered off the map</h1>
        <p className="section-desc">This page doesn't exist. Let's get you back on the tour.</p>
        <div className="btn-row center">
          <Link to="/campus" className="btn btn-primary">
            Explore the campus
          </Link>
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
