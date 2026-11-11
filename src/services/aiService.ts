/**
 * AI integration layer (OpenAI-compatible – AICredits by default)
 * ---------------------------------------------------------------
 * Modes, chosen automatically:
 *   1. proxy   – config.proxyUrl is set. Requests go to the proxy, which holds
 *                the API key server-side. Recommended for the exhibition.
 *   2. demo    – no proxy, but a key was typed in at runtime. The key lives only
 *                in React state (memory) and is never stored or committed.
 *   3. offline – AI disabled, or no proxy/key. Answers come from the records.
 * Any network/API failure falls back to the offline records answer.
 */
import type { AiAnswer, AiMode, ChatMessage, LocationData } from '../types';
import { aiConfig, aiPrompts } from './contentService';
import { answerFromRecords, buildSystemPrompt, chooseOptionFromRecords } from './knowledgeService';

export class AiRequestError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'AiRequestError';
  }
}

export function getAiMode(apiKey: string | null): AiMode {
  if (!aiConfig.enabled) return 'offline';
  if (aiConfig.proxyUrl.trim()) return 'proxy';
  if (aiConfig.allowDemoKey && apiKey && apiKey.trim()) return 'demo';
  return 'offline';
}

function chatEndpoint(mode: AiMode): string {
  if (mode === 'proxy') return aiConfig.proxyUrl.trim();
  return `${aiConfig.apiBaseUrl.replace(/\/+$/, '')}/chat/completions`;
}

interface CompletionOptions {
  apiKey: string | null;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

interface CompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

/** Low-level OpenAI-compatible chat completion call. */
export async function createChatCompletion(messages: ChatMessage[], opts: CompletionOptions): Promise<string> {
  const mode = getAiMode(opts.apiKey);
  if (mode === 'offline') throw new AiRequestError('AI is offline (no proxy or demo key configured).');

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), aiConfig.timeoutMs);
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onAbort);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (mode === 'demo' && opts.apiKey) headers.Authorization = `Bearer ${opts.apiKey.trim()}`;

  try {
    const res = await fetch(chatEndpoint(mode), {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        temperature: opts.temperature ?? aiConfig.temperature,
        max_tokens: opts.maxTokens ?? aiConfig.maxTokens,
        stream: false
      })
    });

    let data: CompletionResponse | null = null;
    try {
      data = (await res.json()) as CompletionResponse;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const msg = data?.error?.message ?? `The AI service responded with status ${res.status}.`;
      throw new AiRequestError(msg, res.status);
    }
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new AiRequestError('The AI service returned an empty answer.');
    return content;
  } catch (err) {
    if (err instanceof AiRequestError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AiRequestError(opts.signal?.aborted ? 'Request cancelled.' : 'The AI service took too long to respond.');
    }
    throw new AiRequestError('Could not reach the AI service (network or CORS error).');
  } finally {
    window.clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

function describeFailure(err: unknown): string {
  if (err instanceof AiRequestError) {
    if (err.status === 401 || err.status === 403) return 'The AI key was rejected.';
    if (err.status === 429) return 'The AI service is busy (rate limit).';
    return err.message;
  }
  return 'Unexpected AI error.';
}

/** Ask the school guide. Always resolves – falls back to records on failure. */
export async function askSchoolGuide(params: {
  question: string;
  history: ChatMessage[];
  location?: LocationData;
  apiKey: string | null;
  signal?: AbortSignal;
}): Promise<AiAnswer> {
  const { question, history, location, apiKey, signal } = params;
  const mode = getAiMode(apiKey);

  if (mode === 'offline') {
    return { content: answerFromRecords(question, location), source: 'offline' };
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(location) },
    ...history.slice(-aiConfig.maxHistoryMessages),
    { role: 'user', content: question }
  ];

  try {
    const content = await createChatCompletion(messages, { apiKey, signal });
    return { content, source: 'ai' };
  } catch (err) {
    if (signal?.aborted) throw err;
    return {
      content: answerFromRecords(question, location),
      source: 'offline',
      fallbackReason: describeFailure(err)
    };
  }
}

/** Free-form creative text (stories, future visions). Returns null when offline/failing. */
export async function generateCreativeText(prompt: string, apiKey: string | null): Promise<string | null> {
  if (getAiMode(apiKey) === 'offline') return null;
  try {
    return await createChatCompletion(
      [
        {
          role: 'system',
          content:
            'You are a friendly creative writing assistant at a school exhibition. Keep content positive, age-appropriate, and clearly imaginative. Never present invented details as real school facts.'
        },
        { role: 'user', content: prompt }
      ],
      { apiKey, temperature: 0.8 }
    );
  } catch {
    return null;
  }
}

/** Human vs AI: the AI picks an option. Uses the LLM when available, records otherwise. */
export async function aiChooseOption(
  question: string,
  options: string[],
  apiKey: string | null
): Promise<{ index: number; source: 'ai' | 'offline' }> {
  if (getAiMode(apiKey) !== 'offline') {
    try {
      const prompt = aiPrompts.humanVsAiPrompt
        .replace('{question}', question)
        .replace('{options}', options.map((o, i) => `${i + 1}. ${o}`).join('\n'));
      const reply = await createChatCompletion(
        [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        { apiKey, temperature: 0, maxTokens: 10 }
      );
      const n = parseInt(reply.match(/\d+/)?.[0] ?? '', 10);
      if (n >= 1 && n <= options.length) return { index: n - 1, source: 'ai' };
    } catch {
      /* fall through to records */
    }
  }
  return { index: chooseOptionFromRecords(question, options), source: 'offline' };
}

/** Optional image generation through a configurable OpenAI-compatible endpoint. */
export async function generateImage(prompt: string, apiKey: string | null): Promise<string | null> {
  const cfg = aiConfig.imageGeneration;
  if (!aiConfig.enabled || !cfg.enabled || !cfg.endpoint.trim()) return null;
  const usingProxy = Boolean(aiConfig.proxyUrl.trim());
  if (!usingProxy && !apiKey) return null;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), Math.max(aiConfig.timeoutMs, 45000));
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (!usingProxy && apiKey) headers.Authorization = `Bearer ${apiKey.trim()}`;
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({ model: cfg.model, prompt, size: cfg.size, n: 1 })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { url?: string; b64_json?: string }[] };
    const first = data.data?.[0];
    if (first?.url) return first.url;
    if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
    return null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}
