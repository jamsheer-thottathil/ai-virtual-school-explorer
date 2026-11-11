import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AiMode, ChatMessage, UiChatMessage } from '../types';
import { aiPrompts, getLocation } from '../services/contentService';
import { askSchoolGuide, getAiMode } from '../services/aiService';
import { createId } from '../utils/text';

interface AiGuideState {
  messages: UiChatMessage[];
  isLoading: boolean;
  error: string | null;
  mode: AiMode;
  /** Memory-only demo key. Never persisted. */
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  currentLocationId: string | null;
  setCurrentLocationId: (id: string | null) => void;
  isDrawerOpen: boolean;
  openDrawer: (prefill?: string) => void;
  closeDrawer: () => void;
  ask: (question: string) => Promise<void>;
  cancel: () => void;
  clear: () => void;
  pendingPrefill: string | null;
  consumePrefill: () => string | null;
}

const AiGuideContext = createContext<AiGuideState | null>(null);

function welcome(): UiChatMessage {
  return { id: 'welcome', role: 'assistant', content: aiPrompts.welcomeMessage, source: 'offline', createdAt: Date.now() };
}

export function AiGuideProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<UiChatMessage[]>(() => [welcome()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [pendingPrefill, setPendingPrefill] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyState(key && key.trim() ? key.trim() : null);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const location = getLocation(currentLocationId ?? undefined);
      const history: ChatMessage[] = messagesRef.current
        .filter((m) => m.id !== 'welcome' && m.source !== 'error')
        .map((m) => ({ role: m.role, content: m.content }));

      setError(null);
      setMessages((prev) => [
        ...prev,
        { id: createId('u'), role: 'user', content: q, locationName: location?.name, createdAt: Date.now() }
      ]);
      setIsLoading(true);

      try {
        const answer = await askSchoolGuide({ question: q, history, location, apiKey, signal: controller.signal });
        const content =
          answer.fallbackReason && answer.source === 'offline'
            ? `${answer.content}\n\n_${aiPrompts.offlineNotice} (${answer.fallbackReason})_`
            : answer.content;
        if (answer.fallbackReason) setError(answer.fallbackReason);
        setMessages((prev) => [
          ...prev,
          { id: createId('a'), role: 'assistant', content, source: answer.source, createdAt: Date.now() }
        ]);
      } catch {
        if (!controller.signal.aborted) {
          setError(aiPrompts.errorMessage);
          setMessages((prev) => [
            ...prev,
            { id: createId('e'), role: 'assistant', content: aiPrompts.errorMessage, source: 'error', createdAt: Date.now() }
          ]);
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [apiKey, currentLocationId]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    cancel();
    setError(null);
    setMessages([welcome()]);
  }, [cancel]);

  const openDrawer = useCallback((prefill?: string) => {
    if (prefill) setPendingPrefill(prefill);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const consumePrefill = useCallback(() => {
    const value = pendingPrefill;
    setPendingPrefill(null);
    return value;
  }, [pendingPrefill]);

  const value = useMemo<AiGuideState>(
    () => ({
      messages,
      isLoading,
      error,
      mode: getAiMode(apiKey),
      apiKey,
      setApiKey,
      currentLocationId,
      setCurrentLocationId,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      ask,
      cancel,
      clear,
      pendingPrefill,
      consumePrefill
    }),
    [messages, isLoading, error, apiKey, setApiKey, currentLocationId, isDrawerOpen, openDrawer, closeDrawer, ask, cancel, clear, pendingPrefill, consumePrefill]
  );

  return <AiGuideContext.Provider value={value}>{children}</AiGuideContext.Provider>;
}

export function useAiGuide(): AiGuideState {
  const ctx = useContext(AiGuideContext);
  if (!ctx) throw new Error('useAiGuide must be used inside <AiGuideProvider>');
  return ctx;
}
