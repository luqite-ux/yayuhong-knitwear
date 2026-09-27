import { getSecret } from './secrets';

const LLM_SECRET_KEY = 'llm';

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export async function getLLMConfig(): Promise<LLMConfig | null> {
  const raw = await getSecret(LLM_SECRET_KEY);
  if (!raw) return null;
  try {
    const cfg = JSON.parse(raw);
    return { baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, model: cfg.model };
  } catch {
    return null;
  }
}

export async function testLLMConnection(): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getLLMConfig();
  if (!cfg) return { ok: false, error: '未配置 LLM' };
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'user', content: 'Say "ok" in one word.' }],
        max_tokens: 5,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export interface LLMResponse {
  content: string;
  promptTokens: number;
  completionTokens: number;
}

export async function callLLM(
  prompt: string,
  systemPrompt?: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<LLMResponse> {
  const cfg = await getLLMConfig();
  if (!cfg) throw new Error('未配置 LLM');
  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM 调用失败 HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const usage = data.usage ?? {};
  return {
    content,
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
  };
}

/**
 * 调用 LLM 并要求返回单个 JSON 对象（去掉 markdown 代码块包裹）
 */
export async function callLLMJson<T = Record<string, unknown>>(
  prompt: string,
  systemPrompt?: string,
): Promise<{ data: T; promptTokens: number; completionTokens: number }> {
  const resp = await callLLM(prompt, systemPrompt);
  let content = resp.content.trim();
  // 去掉 markdown 代码块包裹
  if (content.startsWith('```')) {
    content = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  const data = JSON.parse(content) as T;
  return { data, promptTokens: resp.promptTokens, completionTokens: resp.completionTokens };
}
