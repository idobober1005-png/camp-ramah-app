import { NextRequest, NextResponse } from 'next/server';
import { createActivity } from '@/lib/activity-bank';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiUsage } from '@/lib/usage';
import { callClaude, parseActivityJson, DEFAULT_MODEL, isAiAvailable } from '@/lib/anthropic';
import { SYSTEM_PROMPT } from '@/lib/prompts/system';
import { buildMagicPrompt } from '@/lib/prompts/magic';
import { Activity, MagicParams } from '@/types/activity';

const isDev = process.env.NODE_ENV !== 'production';

// Valid enum values mirroring the DB CHECK constraints
const VALID_ENERGY = new Set(['calm', 'medium', 'energetic']);
const VALID_LOCATION = new Set(['indoor', 'outdoor', 'waterfront', 'cabin', 'field', 'any']);
const VALID_COORDINATION = new Set(['none', 'recommended', 'required']);

// ── Structured logger ─────────────────────────────────────────────────────
function makeLogger(id: string) {
  const ts = () => new Date().toISOString();
  return {
    info(stage: string, msg: string, data?: unknown) {
      if (data !== undefined) console.log(`[magic:${id}] ✓ [${stage}] ${msg}`, data);
      else console.log(`[magic:${id}] ✓ [${stage}] ${msg}`);
    },
    warn(stage: string, msg: string, data?: unknown) {
      if (data !== undefined) console.warn(`[magic:${id}] ⚠ [${stage}] ${msg}`, data);
      else console.warn(`[magic:${id}] ⚠ [${stage}] ${msg}`);
    },
    error(stage: string, msg: string, data?: unknown) {
      if (data !== undefined) console.error(`[magic:${id}] ✗ [${stage}] ${msg}`, data);
      else console.error(`[magic:${id}] ✗ [${stage}] ${msg}`);
    },
    // Stamp every log line so entries from parallel requests are clearly separated
    _ts: ts,
  };
}

// ── Validation / normalization ────────────────────────────────────────────
function validateAndNormalize(raw: unknown): Omit<Activity, 'id' | 'created_at'> {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Response is not a JSON object (got ${typeof raw})`);
  }

  const r = raw as Record<string, unknown>;

  const title = typeof r.title === 'string' && r.title.trim()
    ? r.title.trim()
    : typeof r.title_he === 'string' && r.title_he.trim()
      ? r.title_he.trim()
      : null;
  if (!title) throw new Error('Missing required field: title (and title_he fallback is also empty)');

  const instructions = typeof r.instructions === 'string' && r.instructions.trim()
    ? r.instructions.trim()
    : typeof r.instructions_he === 'string' && r.instructions_he.trim()
      ? r.instructions_he.trim()
      : null;
  if (!instructions) throw new Error('Missing required field: instructions (and instructions_he fallback is also empty)');

  const energy_level = VALID_ENERGY.has(String(r.energy_level))
    ? (r.energy_level as Activity['energy_level'])
    : 'medium';

  const location = VALID_LOCATION.has(String(r.location))
    ? (r.location as Activity['location'])
    : 'any';

  const coordination_level = VALID_COORDINATION.has(String(r.coordination_level))
    ? (r.coordination_level as Activity['coordination_level'])
    : 'none';

  const duration_minutes = typeof r.duration_minutes === 'number' && r.duration_minutes > 0
    ? Math.round(r.duration_minutes)
    : 15;

  const group_size_min = typeof r.group_size_min === 'number' ? Math.round(r.group_size_min) : undefined;
  const group_size_max = typeof r.group_size_max === 'number' ? Math.round(r.group_size_max) : undefined;
  const counselors_min = typeof r.counselors_min === 'number' ? Math.round(r.counselors_min) : undefined;
  const counselors_max = typeof r.counselors_max === 'number' ? Math.round(r.counselors_max) : undefined;

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

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const id = Math.random().toString(36).slice(2, 7).toUpperCase();
  const log = makeLogger(id);
  const t0 = Date.now();

  // ── STAGE 1: Parse request body ───────────────────────────────
  let body: { params?: MagicParams; sessionId?: string; creatorId?: string };
  try {
    body = await req.json();
  } catch (bodyErr) {
    log.error('BODY', 'Request body is not valid JSON', isDev ? bodyErr : String(bodyErr));
    return NextResponse.json(
      { error: 'bad_request', message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const params: MagicParams = body.params ?? ({} as MagicParams);
  const sessionId = body.sessionId ?? 'anonymous';
  const creatorId = body.creatorId ?? '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';

  log.info('BODY', `task="${(params.task ?? '').slice(0, 80)}" session=${sessionId.slice(0, 8)}… ip=${ip}`);

  if (!params?.task?.trim()) {
    log.warn('BODY', 'Missing or empty task field');
    return NextResponse.json({ error: 'Missing task description' }, { status: 400 });
  }

  // ── STAGE 2: Rate limit ───────────────────────────────────────
  let limit: { allowed: boolean; reason?: string };
  try {
    limit = await checkRateLimit(sessionId, ip);
    log.info('RATE_LIMIT', `allowed=${limit.allowed}${limit.reason ? ` reason=${limit.reason}` : ''}`);
  } catch (rlErr) {
    // Fail open — don't block users because of an infra error on rate-limit check
    log.error('RATE_LIMIT', 'checkRateLimit threw — failing open', isDev ? rlErr : String(rlErr));
    limit = { allowed: true };
  }

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'limit_reached',
        message: limit.reason === 'ip_limit'
          ? 'הגעת למגבלת ה-AI היומית לכתובת IP זו. נסה מחר.'
          : 'הגעת למגבלת ה-AI היומית. נסה מחר.',
      },
      { status: 429 }
    );
  }

  // ── STAGE 3: AI availability ──────────────────────────────────
  if (!isAiAvailable()) {
    log.error('AI_CHECK', 'ANTHROPIC_API_KEY missing or invalid — aborting');
    return NextResponse.json(
      { error: 'ai_unavailable', message: 'שירות ה-AI אינו זמין כרגע. נסה שוב מאוחר יותר.' },
      { status: 503 }
    );
  }

  // ── STAGE 4: Build prompt ─────────────────────────────────────
  const userMessage = buildMagicPrompt(params);
  log.info('PROMPT', `Built (${userMessage.length} chars)`);

  // ── STAGE 5: Claude API call ──────────────────────────────────
  log.info('CLAUDE', `Calling model=${DEFAULT_MODEL} maxTokens=1800`);
  let rawText: string;
  let usage: { input_tokens: number; output_tokens: number };
  let stopReason: string | null;

  try {
    const result = await callClaude({
      model: DEFAULT_MODEL,
      system: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1800,
    });
    rawText = result.text;
    usage = result.usage;
    stopReason = result.stopReason;

    log.info(
      'CLAUDE',
      `Response: ${rawText.length} chars | stop_reason=${stopReason} | tokens=${usage.input_tokens}in/${usage.output_tokens}out | ${Date.now() - t0}ms`
    );

    if (stopReason === 'max_tokens') {
      log.warn('CLAUDE', 'stop_reason=max_tokens — response likely TRUNCATED, JSON parse may fail');
    }

    // Log raw response — full in dev, first 800 chars in prod
    const preview = isDev ? rawText : rawText.slice(0, 800);
    log.info('CLAUDE_RAW', `Raw response (showing ${preview.length}/${rawText.length} chars):\n${preview}`);

  } catch (aiErr) {
    const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
    log.error('CLAUDE', `API call FAILED after ${Date.now() - t0}ms: ${msg}`, isDev ? aiErr : undefined);
    return NextResponse.json(
      {
        error: 'ai_error',
        message: 'שגיאה ביצירת פעילות. אנא נסה שוב.',
        ...(isDev && { debug: { stage: 'CLAUDE', reqId: id, error: msg } }),
      },
      { status: 502 }
    );
  }

  // ── STAGE 6: JSON extraction + parsing ───────────────────────
  log.info('PARSE', 'Extracting and parsing JSON from response');
  let rawParsed: unknown;
  try {
    rawParsed = parseActivityJson<unknown>(rawText);
    const keys = rawParsed && typeof rawParsed === 'object' ? Object.keys(rawParsed as object) : [];
    log.info('PARSE', `OK — ${keys.length} keys: [${keys.join(', ')}]`);
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    log.error('PARSE', `JSON parse FAILED: ${msg}`);
    // Always log full raw response on parse failure regardless of env
    log.error('PARSE', `Full raw response (${rawText.length} chars):\n${rawText}`);
    return NextResponse.json(
      {
        error: 'parse_error',
        message: 'שגיאה בעיבוד תוצאת ה-AI. אנא נסה שוב.',
        ...(isDev && {
          debug: {
            stage: 'PARSE',
            reqId: id,
            error: msg,
            stop_reason: stopReason,
            raw_length: rawText.length,
            raw_head: rawText.slice(0, 300),
            raw_tail: rawText.slice(-200),
          },
        }),
      },
      { status: 502 }
    );
  }

  // ── STAGE 7: Validation + normalization ───────────────────────
  log.info('NORMALIZE', 'Validating fields against schema');
  let activity: Omit<Activity, 'id' | 'created_at'>;
  try {
    activity = validateAndNormalize(rawParsed);
    activity = { ...activity, creator_id: creatorId || undefined };
    log.info(
      'NORMALIZE',
      `OK — title="${activity.title}" | energy=${activity.energy_level} | location=${activity.location} | duration=${activity.duration_minutes}min`
    );
  } catch (validErr) {
    const msg = validErr instanceof Error ? validErr.message : String(validErr);
    const parsedKeys = rawParsed && typeof rawParsed === 'object' ? Object.keys(rawParsed as object) : ['(not an object)'];
    log.error('NORMALIZE', `Validation FAILED: ${msg}`);
    log.error('NORMALIZE', `Parsed object keys: [${parsedKeys.join(', ')}]`);
    if (isDev) {
      log.error('NORMALIZE', 'Parsed object:', rawParsed);
    }
    return NextResponse.json(
      {
        error: 'validation_error',
        message: 'שגיאה בעיבוד תוצאת ה-AI. אנא נסה שוב.',
        ...(isDev && {
          debug: {
            stage: 'NORMALIZE',
            reqId: id,
            error: msg,
            parsed_keys: parsedKeys,
          },
        }),
      },
      { status: 502 }
    );
  }

  // ── STAGE 8: Supabase insert ──────────────────────────────────
  log.info('SAVE', `Inserting to Supabase: "${activity.title}"`);
  let saved: Activity;
  try {
    saved = await createActivity(activity);
    log.info('SAVE', `OK — id=${saved.id}`);
  } catch (saveErr) {
    const msg = saveErr instanceof Error ? saveErr.message : String(saveErr);
    log.error('SAVE', `Supabase INSERT FAILED: ${msg}`, isDev ? saveErr : undefined);
    // Non-fatal: return the activity without an id so the UI still works
    log.warn('SAVE', 'Returning unsaved activity to client');
    return NextResponse.json({ activity, saved: false });
  }

  // ── STAGE 9: Usage logging ────────────────────────────────────
  log.info('USAGE', 'Writing ai_usage row');
  try {
    await logAiUsage({
      session_id: sessionId,
      ip_hash: ip,
      feature: 'magic',
      model: DEFAULT_MODEL,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      output_activity_id: saved.id,
    });
    log.info('USAGE', 'OK');
  } catch (usageErr) {
    // Non-fatal — never fail the request over a logging error
    log.warn('USAGE', `Usage log FAILED (non-fatal): ${usageErr instanceof Error ? usageErr.message : String(usageErr)}`);
  }

  log.info('DONE', `Request complete in ${Date.now() - t0}ms — activity id=${saved.id}`);

  return NextResponse.json({ activity: saved, saved: true });
}
