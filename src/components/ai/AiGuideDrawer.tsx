import { Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAiGuide } from '../../hooks/AiGuideContext';
import { aiPrompts } from '../../services/contentService';
import { Modal } from '../common/Modal';
import { ChatPanel } from './ChatPanel';

/** Floating "Ask AI" button + slide-in chat panel, available on every page. */
export function AiGuideDrawer() {
  const { isDrawerOpen, openDrawer, closeDrawer } = useAiGuide();
  const { pathname } = useLocation();
  const onGuidePage = pathname.startsWith('/guide');

  return (
    <>
      {!onGuidePage && !isDrawerOpen && (
        <button type="button" className="ai-fab" onClick={() => openDrawer()} aria-label={`Open ${aiPrompts.assistantName}`}>
          <span className="ai-fab-pulse" aria-hidden="true" />
          <Bot size={24} aria-hidden="true" />
          <span className="ai-fab-label">Ask AI</span>
        </button>
      )}
      <Modal open={isDrawerOpen && !onGuidePage} onClose={closeDrawer} title={aiPrompts.assistantName} variant="panel" className="ai-drawer">
        <ChatPanel variant="drawer" />
      </Modal>
    </>
  );
}
