import { NextRequest, NextResponse } from 'next/server';
import {
  callClaude,
  parseActivityJson,
  SYLLABUS_MODEL,
  DEFAULT_MODEL,
  isAiAvailable,
} from '@/lib/anthropic';
import { SYSTEM_PROMPT } from '@/lib/prompts/system';
import {
  buildImportPrompt,
  buildSyllabusExtractPrompt,
  buildSyllabusActivityPrompt,
} from '@/lib/prompts/syllabus';
import { createActivity } from '@/lib/activity-bank';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiUsage } from '@/lib/usage';
import { Activity } from '@/types/activity';

export const maxDuration = 60;

const isDev = process.env.NODE_ENV !== 'production';

const VALID_ENERGY = new Set(['calm', 'medium', 'energetic']);
const VALID_LOCATION = new Set(['indoor', 'outdoor', 'waterfront', 'cabin', 'field', 'any']);
const VALID_COORDINATION = new Set(['none', 'recommended', 'required']);
const MAX_FILE_BYTES = 500_000;

// ── Structured logger ─────────────────────────────────────────────────────
function makeLogger(id: string) {
  return {
    info(stage: string, msg: string, data?: unknown) {
      if (data !== undefined) console.log(`[syllabus:${id}] ✓ [${stage}] ${msg}`, data);
      else console.log(`[syllabus:${id}] ✓ [${stage}] ${msg}`);
    },
    warn(stage: string, msg: string, data?: unknown) {
      if (data !== undefined) console.warn(`[syllabus:${id}] ⚠ [${stage}] ${msg}`, data);
      else console.warn(`[syllabus:${id}] ⚠ [${stage}] ${msg}`);
    },
    error(stage: string, msg: string, data?: unknown) {
      if (data !== undefined) console.error(`[syllabus:${id}] ✗ [${stage}] ${msg}`, data);
      else console.error(`[syllabus:${id}] ✗ [${stage}] ${msg}`);
    },
  };
}

// ── File text extraction ──────────────────────────────────────────────────
async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return file.text();
  }

  if (name.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (name.endsWith('.docx')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth') as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
    };
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('UNSUPPORTED_TYPE');
}

// ── Per-item validation / normalization ───────────────────────────────────
// Returns null for completely invalid items (skip them) rather than throwing.
function normalizeImportedActivity(
  raw: unknown,
  creatorId: string
): Omit<Activity, 'id' | 'created_at'> | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const title = typeof r.title_he === 'string' && r.title_he.trim()
    ? r.title_he.trim()
    : typeof r.title === 'string' && r.title.trim()
      ? r.title.trim()
      : null;
  if (!title) return null; // skip items with no recognisable title

  const instructions = typeof r.instructions_he === 'string' && r.instructions_he.trim()
    ? r.instructions_he.trim()
    : typeof r.instructions === 'string' && r.instructions.trim()
      ? r.instructions.trim()
      : '—'; // safe default: single dash; better than failing the import

  function optStr(v: unknown): string | undefined {
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  }

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

  function optInt(v: unknown): number | undefined {
    return typeof v === 'number' && v > 0 ? Math.round(v) : undefined;
  }

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

  return {
    title: title,
    title_he: optStr(r.title_he) ?? title,
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
    group_size_min: optInt(r.group_size_min),
    group_size_max: optInt(r.group_size_max),
    counselors_min: optInt(r.counselors_min),
    counselors_max: optInt(r.counselors_max),
    coordination_level,
    materials,
    variations,
    variations_he: variations_he && variations_he.length > 0 ? variations_he : undefined,
    topics,
    tags,
    source: 'syllabus_derived',
    creator_id: creatorId || undefined,
  };
}

// ── Array extractor for import flow ──────────────────────────────────────
// Claude sometimes wraps the array: {"activities":[...]}, or returns a single
// object instead of a one-element array. Handle all three cases robustly.
function parseImportedArray(rawText: string): unknown[] {
  const parsed = parseActivityJson<unknown>(rawText);

  if (Array.isArray(parsed)) return parsed;

  if (parsed && typeof parsed === 'object') {
    const r = parsed as Record<string, unknown>;
    // Wrapped object: {"activities": [...]} or {"items": [...]} etc.
    for (const key of ['activities', 'items', 'results', 'data']) {
      if (Array.isArray(r[key])) return r[key] as unknown[];
    }
    // Single object — treat as one-element array
    return [parsed];
  }

  throw new Error(`Cannot extract activity array from response (got ${typeof parsed})`);
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const id = Math.random().toString(36).slice(2, 7).toUpperCase();
  const log = makeLogger(id);
  const t0 = Date.now();

  const sessionId = req.headers.get('x-session-id') ?? 'anonymous';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  const action = req.nextUrl.searchParams.get('action') ?? 'import';

  log.info('REQUEST', `action=${action} session=${sessionId.slice(0, 8)}… ip=${ip}`);

  // ════════════════════════════════════════════════════════════════
  // ACTION: import
  // ONE AI call extracts + structures all existing activities from file.
  // Returns Activity[] without saving — user must approve before save.
  // ════════════════════════════════════════════════════════════════
  if (action === 'import') {

    // ── STAGE 1: Parse form data ────────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      log.error('BODY', 'formData() failed', isDev ? err : String(err));
      return NextResponse.json(
        { error: 'bad_request', message: 'Invalid form data' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      log.warn('BODY', 'No file in form data');
      return NextResponse.json({ error: 'no_file', message: 'No file uploaded' }, { status: 400 });
    }

    // Byte offset into the extracted text to resume from (0 = start of file)
    const offsetRaw = formData.get('offset');
    const offset = typeof offsetRaw === 'string' && /^\d+$/.test(offsetRaw)
      ? Math.max(0, parseInt(offsetRaw, 10))
      : 0;

    log.info('FILE', `name="${file.name}" size=${file.size} bytes type="${file.type}" offset=${offset}`);

    // ── STAGE 2: File validation ────────────────────────────────
    if (file.size > MAX_FILE_BYTES) {
      log.warn('FILE', `File too large: ${file.size} > ${MAX_FILE_BYTES}`);
      return NextResponse.json(
        { error: 'file_too_large', message: 'הקובץ גדול מדי (מקסימום 500KB).' },
        { status: 413 }
      );
    }

    const name = file.name.toLowerCase();
    const supportedTypes = ['.txt', '.md', '.pdf', '.docx'];
    if (!supportedTypes.some((ext) => name.endsWith(ext))) {
      log.warn('FILE', `Unsupported extension: ${name}`);
      return NextResponse.json(
        { error: 'unsupported_type', message: 'סוג קובץ לא נתמך. השתמש ב-PDF, DOCX, TXT, או MD.' },
        { status: 415 }
      );
    }

    // ── STAGE 3: Text extraction ────────────────────────────────
    log.info('EXTRACT_TEXT', `Extracting text from ${name}`);
    let text: string;
    try {
      text = await extractText(file);
      log.info('EXTRACT_TEXT', `Extracted ${text.length} chars`);
      if (text.trim().length < 20) {
        log.warn('EXTRACT_TEXT', 'Extracted text is very short — file may be empty or image-only');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'UNSUPPORTED_TYPE') {
        log.warn('EXTRACT_TEXT', 'Unsupported type reached extractText');
        return NextResponse.json(
          { error: 'unsupported_type', message: 'סוג קובץ לא נתמך.' },
          { status: 415 }
        );
      }
      log.error('EXTRACT_TEXT', `File read FAILED: ${msg}`, isDev ? err : undefined);
      return NextResponse.json(
        {
          error: 'file_read_error',
          message: 'לא הצלחנו לקרוא את הקובץ.',
          ...(isDev && { debug: { stage: 'EXTRACT_TEXT', error: msg } }),
        },
        { status: 422 }
      );
    }

    // ── STAGE 3b: Chunk the text ───────────────────────────────
    const CHUNK_SIZE = 6000; // chars — matches token budget (≈1500 tokens input)
    const chunk = text.slice(offset, offset + CHUNK_SIZE);
    const nextOffset = offset + CHUNK_SIZE;
    const chunkHasMore = nextOffset < text.length;

    log.info('CHUNK', `offset=${offset} chunk_len=${chunk.length} next_offset=${nextOffset} has_more=${chunkHasMore}`);

    if (chunk.trim().length === 0) {
      log.warn('CHUNK', 'Chunk is empty — offset is past end of document');
      return NextResponse.json({ activities: [], skipped: 0, has_more: false, next_offset: null });
    }

    // ── STAGE 4: Rate limit ─────────────────────────────────────
    let limit: { allowed: boolean; reason?: string };
    try {
      limit = await checkRateLimit(sessionId, ip);
      log.info('RATE_LIMIT', `allowed=${limit.allowed}`);
    } catch (rlErr) {
      log.error('RATE_LIMIT', 'checkRateLimit threw — failing open', isDev ? rlErr : String(rlErr));
      limit = { allowed: true };
    }

    if (!limit.allowed) {
      log.warn('RATE_LIMIT', `Blocked: ${limit.reason}`);
      return NextResponse.json(
        { error: 'limit_reached', message: 'הגעת למגבלת ה-AI היומית. נסה מחר.' },
        { status: 429 }
      );
    }

    // ── STAGE 5: AI availability ────────────────────────────────
    if (!isAiAvailable()) {
      log.error('AI_CHECK', 'ANTHROPIC_API_KEY missing or invalid');
      return NextResponse.json(
        { error: 'ai_unavailable', message: 'יצירת AI אינה זמינה כרגע. בדוק את הגדרות המפתח.' },
        { status: 503 }
      );
    }

    // ── STAGE 6: Claude call ────────────────────────────────────
    // Token budget: 5 activities × ~350 tokens (concise schema) ≈ 1750 tokens.
    // 2500 gives a safe buffer while keeping cost and truncation risk low.
    const MAX_IMPORT_TOKENS = 2500;
    const userMessage = buildImportPrompt(chunk); // pre-sliced chunk, not full text
    log.info('CLAUDE', `Calling ${SYLLABUS_MODEL} maxTokens=${MAX_IMPORT_TOKENS}, prompt=${userMessage.length} chars`);

    let rawText: string;
    let usage: { input_tokens: number; output_tokens: number };
    let stopReason: string | null;

    try {
      const result = await callClaude({
        model: SYLLABUS_MODEL,
        system: SYSTEM_PROMPT,
        userMessage,
        maxTokens: MAX_IMPORT_TOKENS,
      });
      rawText = result.text;
      usage = result.usage;
      stopReason = result.stopReason;

      log.info(
        'CLAUDE',
        `Response: ${rawText.length} chars | stop_reason=${stopReason} | tokens=${usage.input_tokens}in/${usage.output_tokens}out | ${Date.now() - t0}ms`
      );

      const preview = isDev ? rawText : rawText.slice(0, 600);
      log.info('CLAUDE_RAW', `Raw (${preview.length}/${rawText.length}):\n${preview}`);
    } catch (aiErr) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      log.error('CLAUDE', `API call FAILED: ${msg}`, isDev ? aiErr : undefined);
      return NextResponse.json(
        {
          error: 'ai_error',
          message: 'שגיאה ביצירת AI. אנא נסה שוב.',
          ...(isDev && { debug: { stage: 'CLAUDE', reqId: id, error: msg } }),
        },
        { status: 502 }
      );
    }

    // ── STAGE 6b: Truncation guard ──────────────────────────────
    // If Claude hit the token limit the JSON is incomplete. Attempting to parse
    // it will always fail. Return a clear error instead of a confusing parse_error.
    if (stopReason === 'max_tokens') {
      log.error('TRUNCATION', `Response truncated at ${MAX_IMPORT_TOKENS} tokens — not attempting parse`);
      log.error('TRUNCATION', `Raw tail (last 300 chars): ${rawText.slice(-300)}`);
      return NextResponse.json(
        {
          error: 'truncation_error',
          message: 'הקובץ הכיל יותר מדי תוכן לעיבוד מלא. נסה קובץ קטן יותר או פחות פעילויות.',
          ...(isDev && {
            debug: {
              stage: 'TRUNCATION',
              reqId: id,
              output_tokens: usage.output_tokens,
              raw_tail: rawText.slice(-300),
            },
          }),
        },
        { status: 422 }
      );
    }

    // ── STAGE 7: JSON parse ─────────────────────────────────────
    log.info('PARSE', 'Parsing activity array from response');
    let rawArray: unknown[];
    try {
      rawArray = parseImportedArray(rawText);
      log.info('PARSE', `OK — ${rawArray.length} items (supports direct array, wrapped object, single object)`);
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      log.error('PARSE', `JSON parse FAILED: ${msg}`);
      // Always log full raw response on parse failure so we can debug
      log.error('PARSE', `Full raw response (${rawText.length} chars):\n${rawText}`);
      return NextResponse.json(
        {
          error: 'ai_parse_error',
          message: 'שגיאה בעיבוד תוצאות ה-AI. נסה שוב.',
          ...(isDev && {
            debug: {
              stage: 'PARSE',
              reqId: id,
              error: msg,
              stop_reason: stopReason,
              raw_length: rawText.length,
              raw_head: rawText.slice(0, 500),
              raw_tail: rawText.slice(-300),
            },
          }),
        },
        { status: 502 }
      );
    }

    // ── STAGE 8: Normalize each activity ───────────────────────
    log.info('NORMALIZE', `Normalizing ${rawArray.length} raw items`);
    const activities: Omit<Activity, 'id' | 'created_at'>[] = [];
    let skipped = 0;

    for (let i = 0; i < rawArray.length; i++) {
      const normalized = normalizeImportedActivity(rawArray[i], '');
      if (normalized) {
        activities.push(normalized);
        log.info('NORMALIZE', `[${i}] OK: "${normalized.title}"`);
      } else {
        skipped++;
        log.warn('NORMALIZE', `[${i}] Skipped — missing title or unparseable`);
      }
    }

    log.info('NORMALIZE', `Result: ${activities.length} valid, ${skipped} skipped`);

    if (activities.length === 0) {
      log.warn('NORMALIZE', 'No valid activities after normalization');
      return NextResponse.json({ activities: [], none_found: true });
    }

    // has_more is true when there is still unprocessed text after this chunk.
    const has_more = chunkHasMore;
    if (has_more) {
      log.info('HAS_MORE', `Flagging has_more=true — next chunk starts at offset ${nextOffset} (doc_len=${text.length})`);
    }

    // ── STAGE 9: Log usage (no save — user must approve first) ──
    try {
      await logAiUsage({
        session_id: sessionId,
        ip_hash: ip,
        feature: 'syllabus',
        model: SYLLABUS_MODEL,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
      });
      log.info('USAGE', 'Usage logged');
    } catch (usageErr) {
      log.warn('USAGE', `Usage log failed (non-fatal): ${usageErr instanceof Error ? usageErr.message : String(usageErr)}`);
    }

    log.info('DONE', `import complete in ${Date.now() - t0}ms — ${activities.length} activities extracted (NOT saved)`);

    // Return extracted activities WITHOUT saving — client reviews first.
    // next_offset tells the client where to start the next chunk request.
    return NextResponse.json({
      activities,
      skipped,
      has_more,
      next_offset: has_more ? nextOffset : null,
    });
  }

  // ════════════════════════════════════════════════════════════════
  // ACTION: save
  // Batch-inserts user-approved activities into Supabase.
  // Called only after user reviews and selects activities.
  // ════════════════════════════════════════════════════════════════
  if (action === 'save') {

    // ── STAGE 1: Parse body ─────────────────────────────────────
    let body: { activities?: unknown[]; creatorId?: string };
    try {
      body = await req.json();
    } catch (bodyErr) {
      log.error('BODY', 'req.json() failed', isDev ? bodyErr : String(bodyErr));
      return NextResponse.json({ error: 'bad_request', message: 'Invalid request body' }, { status: 400 });
    }

    const rawActivities = body.activities ?? [];
    const creatorId = body.creatorId ?? '';

    if (!Array.isArray(rawActivities) || rawActivities.length === 0) {
      log.warn('BODY', 'No activities in save request');
      return NextResponse.json({ error: 'no_activities', message: 'No activities to save' }, { status: 400 });
    }

    log.info('SAVE', `Received ${rawActivities.length} activities to save`);

    // ── STAGE 2: Normalize + batch insert ──────────────────────
    const saved: Activity[] = [];
    const failed: Array<{ title: string; error: string }> = [];

    for (let i = 0; i < rawActivities.length; i++) {
      const normalized = normalizeImportedActivity(rawActivities[i], creatorId);
      if (!normalized) {
        const title = (rawActivities[i] as Record<string, unknown>)?.title_he
          ?? (rawActivities[i] as Record<string, unknown>)?.title
          ?? `[${i}]`;
        log.warn('SAVE', `[${i}] Skipping invalid item: ${title}`);
        failed.push({ title: String(title), error: 'Invalid or missing required fields' });
        continue;
      }

      try {
        const result = await createActivity(normalized);
        saved.push(result);
        log.info('SAVE', `[${i}] Saved OK: "${normalized.title}" id=${result.id}`);
      } catch (saveErr) {
        const msg = saveErr instanceof Error ? saveErr.message : String(saveErr);
        log.error('SAVE', `[${i}] Supabase insert FAILED for "${normalized.title}": ${msg}`, isDev ? saveErr : undefined);
        failed.push({ title: normalized.title, error: msg });
      }
    }

    log.info('DONE', `save complete in ${Date.now() - t0}ms — ${saved.length} saved, ${failed.length} failed`);

    if (saved.length === 0) {
      return NextResponse.json(
        {
          error: 'all_failed',
          message: 'שגיאה בשמירה לבנק.',
          saved: [],
          failed_count: failed.length,
          ...(isDev && { failed }),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      saved,
      failed_count: failed.length,
      ...(isDev && failed.length > 0 && { failed }),
    });
  }

  // ════════════════════════════════════════════════════════════════
  // LEGACY ACTIONS: extract + generate (kept, not primary UX)
  // ════════════════════════════════════════════════════════════════
  if (action === 'extract') {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: 'File too large (max 500KB)' }, { status: 400 });

    let text: string;
    try {
      text = await extractText(file);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Could not read file' },
        { status: 422 }
      );
    }

    let limit: { allowed: boolean };
    try {
      limit = await checkRateLimit(sessionId, ip);
    } catch {
      limit = { allowed: true };
    }
    if (!limit.allowed) return NextResponse.json({ error: 'Daily AI limit reached.' }, { status: 429 });

    if (!isAiAvailable()) {
      return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 });
    }

    let rawExtract: string;
    let extractUsage: { input_tokens: number; output_tokens: number };
    try {
      const result = await callClaude({
        model: SYLLABUS_MODEL,
        system: SYSTEM_PROMPT,
        userMessage: buildSyllabusExtractPrompt(text),
        maxTokens: 400,
      });
      rawExtract = result.text;
      extractUsage = result.usage;
    } catch (aiErr) {
      log.error('LEGACY_EXTRACT', 'Claude call failed', isDev ? aiErr : String(aiErr));
      return NextResponse.json({ error: 'ai_error', message: 'שגיאה ב-AI.' }, { status: 502 });
    }

    try {
      await logAiUsage({
        session_id: sessionId,
        ip_hash: ip,
        feature: 'syllabus',
        model: SYLLABUS_MODEL,
        input_tokens: extractUsage.input_tokens,
        output_tokens: extractUsage.output_tokens,
      });
    } catch { /* non-fatal */ }

    let objectives: string[];
    try {
      objectives = parseActivityJson<string[]>(rawExtract);
    } catch (parseErr) {
      log.error('LEGACY_EXTRACT', 'JSON parse failed', isDev ? parseErr : String(parseErr));
      return NextResponse.json({ error: 'parse_error' }, { status: 502 });
    }

    return NextResponse.json({ objectives });
  }

  if (action === 'generate') {
    let body: { objectives?: string[]; context?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const objectives: string[] = body.objectives ?? [];
    const context: string | undefined = body.context;

    if (!objectives.length) return NextResponse.json({ error: 'No objectives provided' }, { status: 400 });

    let limit: { allowed: boolean };
    try {
      limit = await checkRateLimit(sessionId, ip);
    } catch {
      limit = { allowed: true };
    }
    if (!limit.allowed) return NextResponse.json({ error: 'Daily AI limit reached.' }, { status: 429 });

    if (!isAiAvailable()) {
      return NextResponse.json({ error: 'ai_unavailable' }, { status: 503 });
    }

    const results: Activity[] = [];

    for (const objective of objectives.slice(0, 6)) {
      let rawAct: string;
      let actUsage: { input_tokens: number; output_tokens: number };

      try {
        const result = await callClaude({
          model: DEFAULT_MODEL,
          system: SYSTEM_PROMPT,
          userMessage: buildSyllabusActivityPrompt(objective, context),
          maxTokens: 900,
        });
        rawAct = result.text;
        actUsage = result.usage;
      } catch (aiErr) {
        log.error('LEGACY_GENERATE', `Claude call failed for objective "${objective}"`, isDev ? aiErr : String(aiErr));
        continue; // skip this objective, continue with others
      }

      let parsed: Activity;
      try {
        parsed = parseActivityJson<Activity>(rawAct);
      } catch (parseErr) {
        log.error('LEGACY_GENERATE', `JSON parse failed for "${objective}"`, isDev ? parseErr : String(parseErr));
        continue;
      }

      const activity = { ...parsed, source: 'syllabus_derived' as const, topics: parsed.topics ?? [] };

      let saved: Activity;
      try {
        saved = await createActivity(activity);
      } catch (saveErr) {
        log.error('LEGACY_GENERATE', `Save failed for "${objective}"`, isDev ? saveErr : String(saveErr));
        continue;
      }

      try {
        await logAiUsage({
          session_id: sessionId,
          ip_hash: ip,
          feature: 'syllabus',
          model: DEFAULT_MODEL,
          input_tokens: actUsage.input_tokens,
          output_tokens: actUsage.output_tokens,
          output_activity_id: saved.id,
        });
      } catch { /* non-fatal */ }

      results.push(saved);
    }

    return NextResponse.json({ activities: results });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
