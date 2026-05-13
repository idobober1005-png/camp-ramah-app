import { NextRequest, NextResponse } from 'next/server';
import { createActivity } from '@/lib/activity-bank';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiUsage } from '@/lib/usage';
import { callClaude, parseActivityJson, DEFAULT_MODEL, isAiAvailable } from '@/lib/anthropic';
import { SYSTEM_PROMPT } from '@/lib/prompts/system';
import { buildMagicPrompt } from '@/lib/prompts/magic';
import { Activity, MagicParams } from '@/types/activity';

// Valid enum values mirroring the DB CHECK constraints
const VALID_ENERGY = new Set(['calm', 'medium', 'energetic']);
const VALID_LOCATION = new Set(['indoor', 'outdoor', 'waterfront', 'cabin', 'field', 'any']);
const VALID_COORDINATION = new Set(['none', 'recommended', 'required']);

function validateAndNormalize(raw: unknown): Omit<Activity, 'id' | 'created_at'> {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Response is not a JSON object');
  }

  const r = raw as Record<string, unknown>;

  // Required string fields
  const title = typeof r.title === 'string' && r.title.trim()
    ? r.title.trim()
    : typeof r.title_he === 'string' && r.title_he.trim()
      ? r.title_he.trim()   // fall back to Hebrew title if English missing
      : null;
  if (!title) throw new Error('Missing required field: title');

  const instructions = typeof r.instructions === 'string' && r.instructions.trim()
    ? r.instructions.trim()
    : typeof r.instructions_he === 'string' && r.instructions_he.trim()
      ? r.instructions_he.trim()
      : null;
  if (!instructions) throw new Error('Missing required field: instructions');

  // Enum fields with safe defaults
  const energy_level = VALID_ENERGY.has(String(r.energy_level))
    ? (r.energy_level as Activity['energy_level'])
    : 'medium';

  const location = VALID_LOCATION.has(String(r.location))
    ? (r.location as Activity['location'])
    : 'any';

  const coordination_level = VALID_COORDINATION.has(String(r.coordination_level))
    ? (r.coordination_level as Activity['coordination_level'])
    : 'none';

  // Numeric fields with safe defaults
  const duration_minutes = typeof r.duration_minutes === 'number' && r.duration_minutes > 0
    ? Math.round(r.duration_minutes)
    : 15;

  const group_size_min = typeof r.group_size_min === 'number' ? Math.round(r.group_size_min) : undefined;
  const group_size_max = typeof r.group_size_max === 'number' ? Math.round(r.group_size_max) : undefined;
  const counselors_min = typeof r.counselors_min === 'number' ? Math.round(r.counselors_min) : undefined;
  const counselors_max = typeof r.counselors_max === 'number' ? Math.round(r.counselors_max) : undefined;

  // Array fields
  const materials = Array.isArray(r.materials)
    ? r.materials.filter((m): m is string => typeof m === 'string')
    : [];
  const variations = Array.isArray(r.variations)
    ? r.variations.filter(
        (v): v is { name: string; description: string } =>
          typeof v === 'object' && v !== null && 'name' in v && 'description' in v
      )
    : [];
  const variations_he = Array.isArray(r.variations_he)
    ? r.variations_he.filter(
        (v): v is { name: string; description: string } =>
          typeof v === 'object' && v !== null && 'name' in v && 'description' in v
      )
    : undefined;
  const topics = Array.isArray(r.topics)
    ? r.topics.filter((t): t is string => typeof t === 'string')
    : [];
  const tags = Array.isArray(r.tags)
    ? r.tags.filter((t): t is string => typeof t === 'string')
    : [];

  // Optional string fields
  function optStr(v: unknown): string | undefined {
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  }

  return {
    title,
    title_he: optStr(r.title_he),
    description: optStr(r.description) ?? optStr(r.description_he) ?? '',
    description_he: optStr(r.description_he),
    instructions,
    instructions_he: optStr(r.instructions_he),
    why_it_works: optStr(r.why_it_works),
    why_it_works_he: optStr(r.why_it_works_he),
    educational_goal: optStr(r.educational_goal),
    educational_goal_he: optStr(r.educational_goal_he),
    hebrew_element: optStr(r.hebrew_element),
    safety_notes: optStr(r.safety_notes),
    location_type: optStr(r.location_type),
    energy_level,
    location,
    duration_minutes,
    group_size_min,
    group_size_max,
    counselors_min,
    counselors_max,
    coordination_level,
    materials,
    variations,
    variations_he: variations_he && variations_he.length > 0 ? variations_he : undefined,
    topics,
    tags,
    source: 'ai_generated',
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const params: MagicParams = body.params;
  const sessionId: string = body.sessionId ?? 'anonymous';
  const creatorId: string = body.creatorId ?? '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';

  if (!params?.task?.trim()) {
    return NextResponse.json({ error: 'Missing task description' }, { status: 400 });
  }

  // ── Rate limit check ──────────────────────────────────────────
  const limit = await checkRateLimit(sessionId, ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'limit_reached',
        message:
          limit.reason === 'ip_limit'
            ? 'הגעת למגבלת ה-AI היומית לכתובת IP זו. נסה מחר.'
            : 'הגעת למגבלת ה-AI היומית. נסה מחר.',
      },
      { status: 429 }
    );
  }

  // ── API key / model check ─────────────────────────────────────
  if (!isAiAvailable()) {
    return NextResponse.json(
      { error: 'ai_unavailable', message: 'שירות ה-AI אינו זמין כרגע. נסה שוב מאוחר יותר.' },
      { status: 503 }
    );
  }

  // ── Call Claude ───────────────────────────────────────────────
  const userMessage = buildMagicPrompt(params);

  let rawText: string;
  let usage: { input_tokens: number; output_tokens: number };

  try {
    const result = await callClaude({
      model: DEFAULT_MODEL,
      system: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1800,
    });
    rawText = result.text;
    usage = result.usage;
  } catch (err) {
    console.error('[magic] AI call failed:', err);
    return NextResponse.json(
      { error: 'ai_error', message: 'שגיאה ביצירת פעילות. אנא נסה שוב.' },
      { status: 502 }
    );
  }

  // ── Parse JSON ────────────────────────────────────────────────
  let rawParsed: unknown;
  try {
    rawParsed = parseActivityJson<unknown>(rawText);
  } catch (parseErr) {
    console.error(
      '[magic] JSON parse failed.\n',
      'Error:', parseErr,
      '\nRaw response (first 1000 chars):', rawText.slice(0, 1000)
    );
    return NextResponse.json(
      { error: 'parse_error', message: 'שגיאה בעיבוד תוצאת ה-AI. אנא נסה שוב.' },
      { status: 502 }
    );
  }

  // ── Validate + normalize fields ───────────────────────────────
  let activity: Omit<Activity, 'id' | 'created_at'>;
  try {
    activity = validateAndNormalize(rawParsed);
    activity = { ...activity, creator_id: creatorId || undefined };
  } catch (validErr) {
    console.error(
      '[magic] Validation failed.\n',
      'Error:', validErr,
      '\nParsed object keys:', Object.keys(rawParsed as object)
    );
    return NextResponse.json(
      { error: 'validation_error', message: 'שגיאה בעיבוד תוצאת ה-AI. אנא נסה שוב.' },
      { status: 502 }
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[magic] Normalized activity keys:', Object.keys(activity));
  }

  // ── Auto-save to Activity Bank ────────────────────────────────
  let saved: Activity;
  try {
    saved = await createActivity(activity);
  } catch (saveErr) {
    const msg = saveErr instanceof Error ? saveErr.message : String(saveErr);
    console.error('[magic] Save to bank failed:', msg, saveErr);
    return NextResponse.json({ activity, saved: false });
  }

  // ── Log AI usage ──────────────────────────────────────────────
  await logAiUsage({
    session_id: sessionId,
    ip_hash: ip,
    feature: 'magic',
    model: DEFAULT_MODEL,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    output_activity_id: saved.id,
  });

  return NextResponse.json({ activity: saved, saved: true });
}
