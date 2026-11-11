import { Link } from 'react-router-dom';
import { school } from '../../services/contentService';
import { assetUrl } from '../../utils/assets';
import { NAV_ITEMS } from './SiteHeader';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src={assetUrl(school.logo)} alt="" width={44} height={44} />
          <div>
            <strong>{school.name}</strong>
            <p>{school.footer.text}</p>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="footer-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label === '2040' ? 'Future 2040' : item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer-credits">{school.footer.credits}</p>
        {school.isSampleData && <p className="footer-sample">{school.sampleDataNotice}</p>}
      </div>
    </footer>
  );
}
