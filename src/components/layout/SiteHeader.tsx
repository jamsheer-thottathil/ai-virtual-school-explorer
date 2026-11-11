import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bot, Compass, History, Home, Image as ImageIcon, Menu, Rocket, Trophy, X } from 'lucide-react';
import { school } from '../../services/contentService';
import { assetUrl } from '../../utils/assets';
import { useAiGuide } from '../../hooks/AiGuideContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/campus', label: 'Campus', icon: Compass, end: false },
  { to: '/history', label: 'History', icon: History, end: false },
  { to: '/gallery', label: 'Gallery', icon: ImageIcon, end: false },
  { to: '/challenges', label: 'Challenges', icon: Trophy, end: false },
  { to: '/future', label: '2040', icon: Rocket, end: false },
  { to: '/guide', label: 'AI Guide', icon: Bot, end: false }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { openDrawer } = useAiGuide();
  const menuRef = useRef<HTMLDivElement>(null);

  useFocusTrap(menuRef, menuOpen, () => setMenuOpen(false));
  useBodyScrollLock(menuOpen);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <NavLink to="/" className="brand" aria-label={`${school.name} – home`}>
          <img src={assetUrl(school.logo)} alt="" width={40} height={40} />
          <span className="brand-text">
            <strong>{school.shortName}</strong>
            <small>Virtual Explorer</small>
          </span>
        </NavLink>

        <nav className="desktop-nav" aria-label="Main navigation">
          <ul>
            {NAV_ITEMS.filter((i) => i.to !== '/').map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button type="button" className="btn btn-glow btn-sm hide-mobile" onClick={() => openDrawer()}>
            <Bot size={16} aria-hidden="true" /> Ask AI
          </button>
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu-root">
          <div className="modal-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div ref={menuRef} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu">
            <div className="mobile-menu-head">
              <span className="brand-text">
                <strong>{school.name}</strong>
                <small>Virtual Explorer</small>
              </span>
              <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile navigation">
              <ul>
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                      <item.icon size={20} aria-hidden="true" />
                      {item.label === '2040' ? 'Future School 2040' : item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
