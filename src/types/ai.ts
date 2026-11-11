/** Mirrors src/data/ai/config.json */
export interface AiConfig {
  /** Master switch. false = always use the offline records-based guide. */
  enabled: boolean;
  /** OpenAI-compatible base URL, e.g. https://api.aicredits.in/v1 */
  apiBaseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  /**
   * Secure proxy mode: if set, chat requests are POSTed here (OpenAI chat
   * completion body) and the proxy adds the API key server-side.
   * Example: https://school-ai-proxy.example.workers.dev/v1/chat/completions
   */
  proxyUrl: string;
  /** Request timeout in milliseconds. */
  timeoutMs: number;
  /** Allow visitors/staff to paste a key at runtime (memory only). */
  allowDemoKey: boolean;
  /** How many previous chat messages are sent along for context. */
  maxHistoryMessages: number;
  imageGeneration: {
    enabled: boolean;
    /** OpenAI-compatible images endpoint, ideally a proxy. */
    endpoint: string;
    model: string;
    size: string;
  };
}

/** Mirrors src/data/ai/prompts.json */
export interface AiPrompts {
  assistantName: string;
  assistantTagline: string;
  welcomeMessage: string;
  systemPrompt: string;
  unavailableMessage: string;
  offlineNotice: string;
  errorMessage: string;
  demoKeyWarning: string;
  suggestedQuestions: string[];
  locationQuestions: string[];
  storyPrompt: string;
  futurePrompt: string;
  humanVsAiPrompt: string;
}

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type AnswerSource = 'ai' | 'offline' | 'error';

export interface UiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: AnswerSource;
  locationName?: string;
  createdAt: number;
}

export type AiMode = 'proxy' | 'demo' | 'offline';

export interface AiAnswer {
  content: string;
  source: AnswerSource;
  /** Set when an online attempt failed and the offline guide answered instead. */
  fallbackReason?: string;
}
