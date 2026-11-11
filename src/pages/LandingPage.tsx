import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, Copy, Hand, QrCode, Share2 } from 'lucide-react';
import { locations, school } from '../services/contentService';
import { assetUrl } from '../utils/assets';
import { DynamicIcon } from '../utils/icons';
import { LazyImage } from '../components/common/LazyImage';
import { SectionHeading } from '../components/common/SectionHeading';
import { SampleNotice } from '../components/common/SampleBadge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const url = school.exhibition.publicUrl || window.location.href.split('#')[0];

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: school.name, text: school.hero.subtitle, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share sheet */
    }
  };

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  return (
    <button type="button" className="btn btn-ghost" onClick={() => void share()}>
      {copied ? <Check size={18} aria-hidden="true" /> : canShare ? <Share2 size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      {copied ? 'Link copied' : canShare ? 'Share this tour' : 'Copy link'}
    </button>
  );
}

export default function LandingPage() {
  useDocumentTitle();
  const { hero, exhibition } = school;

  return (
    <>
      {/* HERO ---------------------------------------------------------- */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-bg" aria-hidden="true">
          <img src={assetUrl(school.heroImage)} alt="" />
        </div>
        <div className="hero-orbs" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="container hero-content">
          <div className="hero-school">
            <img src={assetUrl(school.logo)} alt={`${school.name} logo`} width={56} height={56} />
            <div>
              <strong>{school.name}</strong>
              <span>{school.tagline}</span>
            </div>
          </div>
          <p className="eyebrow glow">{hero.eyebrow}</p>
          <h1 id="hero-heading" className="hero-title">
            {hero.heading}
          </h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <p className="hero-desc">{hero.description}</p>
          <div className="hero-buttons">
            {hero.primaryButtons.map((b, i) => (
              <Link key={b.route} to={b.route} className={`btn ${i === 0 ? 'btn-primary btn-lg' : 'btn-glass btn-lg'}`}>
                <DynamicIcon name={b.icon} size={20} /> {b.label}
              </Link>
            ))}
          </div>
          <div className="explore-indicator">
            <span className="explore-ring" aria-hidden="true">
              <Hand size={22} />
            </span>
            <span>{hero.instruction}</span>
          </div>
        </div>
        <a href="#features" className="scroll-cue" aria-label="Scroll to features" onClick={(e) => {
          e.preventDefault();
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          <ChevronDown size={26} aria-hidden="true" />
        </a>
      </section>

      {/* FEATURES ------------------------------------------------------ */}
      <section id="features" className="section light">
        <div className="container">
          <SectionHeading
            eyebrow="An interactive digital museum"
            title="Everything you can discover"
            description="Walk the campus, travel through time and talk to an AI guide that knows our school records."
            align="center"
          />
          <ul className="feature-grid">
            {school.features.map((f) => (
              <li key={f.title} className="feature-card">
                <span className="feature-icon">
                  <DynamicIcon name={f.icon} size={24} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* QUICK ACCESS -------------------------------------------------- */}
      <section className="section dark">
        <div className="container">
          <SectionHeading eyebrow="Quick access" title="Where would you like to go?" />
          <ul className="quick-grid">
            {school.quickAccess.map((q) => (
              <li key={q.route}>
                <Link to={q.route} className="quick-card">
                  {q.image && <LazyImage src={q.image} alt="" className="quick-bg" />}
                  <span className="quick-overlay" aria-hidden="true" />
                  <span className="quick-icon">
                    <DynamicIcon name={q.icon} size={22} />
                  </span>
                  <span className="quick-text">
                    <strong>{q.title}</strong>
                    <span>{q.description}</span>
                  </span>
                  <ArrowRight className="quick-arrow" size={20} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TOUR STOPS ---------------------------------------------------- */}
      <section className="section light">
        <div className="container">
          <SectionHeading
            eyebrow={`${locations.length} tour stops`}
            title="Step inside our campus"
            actions={
              <Link to="/campus" className="btn btn-dark">
                Open campus map <ArrowRight size={18} aria-hidden="true" />
              </Link>
            }
          />
          <ul className="stop-grid">
            {locations.map((loc) => (
              <li key={loc.id}>
                <Link to={`/campus/${loc.id}`} className="stop-card">
                  <LazyImage src={loc.thumbnail} alt="" />
                  <span className="stop-body">
                    <small>Stop {loc.order}{loc.panorama ? ' · 360°' : ''}</small>
                    <strong>{loc.name}</strong>
                    <span>{loc.shortDescription}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* EXHIBITION / QR ----------------------------------------------- */}
      <section className="section dark exhibition" aria-labelledby="exhibition-title">
        <div className="container exhibition-grid">
          <div>
            <p className="eyebrow glow">
              <QrCode size={16} aria-hidden="true" /> AI Exhibition
            </p>
            <h2 id="exhibition-title" className="section-title">
              {exhibition.title}
            </h2>
            <p className="section-desc">{exhibition.message}</p>
            <ol className="steps">
              {exhibition.steps.map((s, i) => (
                <li key={s}>
                  <span>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="btn-row">
              <Link to={`/campus/${school.startLocation}`} className="btn btn-primary">
                Start the tour
              </Link>
              <ShareButton />
            </div>
          </div>
          <div className="qr-card glass">
            {exhibition.qrImage ? (
              <img src={assetUrl(exhibition.qrImage)} alt={`QR code to open ${school.name} virtual explorer`} width={220} height={220} />
            ) : (
              <div className="qr-placeholder" aria-hidden="true">
                <QrCode size={96} />
              </div>
            )}
            <p>Scan the code on the exhibition banner to continue on your own phone.</p>
            {exhibition.publicUrl && <code>{exhibition.publicUrl.replace(/^https?:\/\//, '')}</code>}
          </div>
        </div>
        {school.isSampleData && (
          <div className="container">
            <SampleNotice>{school.sampleDataNotice}</SampleNotice>
          </div>
        )}
      </section>
    </>
  );
}
