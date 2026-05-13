import Anthropic from '@anthropic-ai/sdk';
import type { Message } from '@anthropic-ai/sdk/resources/messages';

export const DEFAULT_MODEL =
  process.env.AI_DEFAULT_MODEL ?? 'claude-haiku-4-5-20251001';
export const SYLLABUS_MODEL =
  process.env.AI_SYLLABUS_MODEL ?? 'claude-sonnet-4-6';

export function isAiAvailable(): boolean {
  const key = process.env.ANTHROPIC_API_KEY ?? '';
  return (
    key.length > 20 &&
    key !== 'dummy' &&
    !key.startsWith('your-') &&
    !key.startsWith('sk-ant-test')
  );
}

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function callClaude({
  model,
  system,
  userMessage,
  maxTokens,
}: {
  model: string;
  system: string;
  userMessage: string;
  maxTokens: number;
}): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
  const client = getAnthropicClient();

  // Explicitly type as Message (non-streaming) to keep TypeScript happy
  const message: Message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    stream: false,
    system,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return { text, usage: message.usage };
}

export function parseActivityJson<T>(text: string): T {
  // Step 1: strip markdown code fences (handles ```json ... ``` wrapping)
  let cleaned = text
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  // Step 2: extract the first top-level JSON object or array,
  // which handles preamble text like "Here is the JSON: {...}"
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');

  let start = -1;
  let endChar = '';
  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    start = objStart;
    endChar = '}';
  } else if (arrStart !== -1) {
    start = arrStart;
    endChar = ']';
  }

  if (start !== -1) {
    const end = cleaned.lastIndexOf(endChar);
    if (end > start) {
      cleaned = cleaned.slice(start, end + 1);
    }
  }

  // Step 3: fix literal unescaped newlines/tabs inside JSON string values.
  // Claude sometimes emits raw \n or \t characters inside quoted strings,
  // which is invalid JSON. Walk character-by-character and escape them.
  cleaned = fixLiteralControlChars(cleaned);

  return JSON.parse(cleaned) as T;
}

function fixLiteralControlChars(s: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      // Replace raw control characters that are illegal inside JSON strings
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
    }

    result += ch;
  }

  return result;
}
