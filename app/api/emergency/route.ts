import { NextRequest, NextResponse } from 'next/server';
import { searchActivities, createActivity, hasEnoughMatches } from '@/lib/activity-bank';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAiUsage } from '@/lib/usage';
import { callClaude, parseActivityJson, DEFAULT_MODEL, isAiAvailable } from '@/lib/anthropic';
import { SYSTEM_PROMPT } from '@/lib/prompts/system';
import { buildEmergencyPrompt } from '@/lib/prompts/emergency';
import { Activity, EmergencyParams, ActivityFilter } from '@/types/activity';

export interface EmergencyResult {
  source: 'bank' | 'ai';
  safest: Activity;
  most_fun?: Activity;
  most_educational?: Activity;
  safest_fallback?: boolean;
  fun_fallback?: boolean;
  edu_fallback?: boolean;
  requested_duration?: number;
  rate_limited?: boolean;
  ai_unavailable?: boolean;
}

function bankFallbackResponse(
  activities: Activity[],
  requestedDuration: number,
  flags: { rate_limited?: boolean; ai_unavailable?: boolean }
): NextResponse | null {
  if (activities.length === 0) return null;
  const result = pickBankCategories(activities, requestedDuration);
  return NextResponse.json({ source: 'bank', ...result, ...flags }, { status: 200 });
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function deduplicateActivities(activities: Activity[]): Activity[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  return activities.filter((a) => {
    const id = a.id ?? '';
    const title = normalizeTitle(a.title);
    if (id && seenIds.has(id)) return false;
    if (seenTitles.has(title)) return false;
    if (id) seenIds.add(id);
    seenTitles.add(title);
    return true;
  });
}

function durProximityBonus(activityDuration: number, requestedDuration: number): number {
  if (requestedDuration <= 0) return 0;
  // Reward activities that use close to the full available time
  const ratio = Math.min(activityDuration, requestedDuration) / requestedDuration;
  return ratio * 2; // 0–2 bonus points
}

function scoreSafety(a: Activity, requestedDuration: number): number {
  let score = 0;
  if (a.energy_level === 'calm') score += 3;
  if (a.energy_level === 'medium') score += 1;
  if (a.safety_notes) score += 2;
  if (!a.materials || a.materials.length === 0) score += 1; // no equipment = safer logistics
  score += durProximityBonus(a.duration_minutes, requestedDuration);
  return score;
}

function scoreFun(a: Activity, requestedDuration: number): number {
  let score = 0;
  score += (a.feedback_worked_well ?? 0) * 1.5;
  score += (a.feedback_run_again ?? 0) * 2;
  if (a.energy_level === 'energetic') score += 2;
  if (a.energy_level === 'medium') score += 1;
  if (a.variations && a.variations.length > 0) score += 1;
  score += durProximityBonus(a.duration_minutes, requestedDuration);
  return score;
}

function scoreEducational(a: Activity, requestedDuration: number): number {
  let score = 0;
  if (a.educational_goal) score += 3;
  if (a.hebrew_element) score += 2;
  if (a.topics && a.topics.length > 0) score += 1;
  score += (a.feedback_worked_well ?? 0) * 0.5;
  score += durProximityBonus(a.duration_minutes, requestedDuration);
  return score;
}

function isDurationFallback(activityDuration: number, requestedDuration: number): boolean {
  if (requestedDuration <= 0) return false;
  return activityDuration < requestedDuration * 0.5;
}

function pickBankCategories(
  activities: Activity[],
  requestedDuration: number
): Omit<EmergencyResult, 'source'> {
  const unique = deduplicateActivities(activities);

  if (unique.length === 0) {
    // Should not happen — caller guards this
    throw new Error('No activities to pick from');
  }

  // Sort by each scoring function, then greedily pick unique activities
  const bySafety = [...unique].sort(
    (a, b) => scoreSafety(b, requestedDuration) - scoreSafety(a, requestedDuration)
  );
  const safest = bySafety[0];
  const remainingAfterSafest = unique.filter(
    (a) => (a.id ? a.id !== safest.id : normalizeTitle(a.title) !== normalizeTitle(safest.title))
  );

  let most_fun: Activity | undefined;
  let fun_fallback = false;
  if (remainingAfterSafest.length > 0) {
    const byFun = [...remainingAfterSafest].sort(
      (a, b) => scoreFun(b, requestedDuration) - scoreFun(a, requestedDuration)
    );
    most_fun = byFun[0];
    fun_fallback = isDurationFallback(most_fun.duration_minutes, requestedDuration);
  }

  let most_educational: Activity | undefined;
  let edu_fallback = false;
  const remainingAfterFun = most_fun
    ? remainingAfterSafest.filter(
        (a) =>
          a.id
            ? a.id !== most_fun!.id
            : normalizeTitle(a.title) !== normalizeTitle(most_fun!.title)
      )
    : remainingAfterSafest;

  if (remainingAfterFun.length > 0) {
    const byEdu = [...remainingAfterFun].sort(
      (a, b) => scoreEducational(b, requestedDuration) - scoreEducational(a, requestedDuration)
    );
    most_educational = byEdu[0];
    edu_fallback = isDurationFallback(most_educational.duration_minutes, requestedDuration);
  }

  return {
    safest,
    most_fun,
    most_educational,
    safest_fallback: isDurationFallback(safest.duration_minutes, requestedDuration),
    fun_fallback: most_fun ? fun_fallback : undefined,
    edu_fallback: most_educational ? edu_fallback : undefined,
    requested_duration: requestedDuration,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const params: EmergencyParams = body.params;
  const sessionId: string = body.sessionId ?? 'anonymous';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';

  if (!params) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const requestedDuration = params.time_available_minutes;

  // ── Step 1: Try the Activity Bank first ───────────────────────

  const bankFilter: ActivityFilter = {
    energy_level: params.energy_level,
    location: params.location,
    duration_max: requestedDuration,
    topics: params.topics && params.topics.length > 0 ? params.topics : undefined,
  };

  const enoughInBank = await hasEnoughMatches(bankFilter, 2);

  if (enoughInBank) {
    const activities = await searchActivities(bankFilter);
    const result = pickBankCategories(activities, requestedDuration);
    return NextResponse.json({ source: 'bank', ...result } satisfies EmergencyResult);
  }

  // Helper: loosen filter and return best bank matches
  async function getBankFallback() {
    const fallbackFilter: ActivityFilter = {
      energy_level: params.energy_level,
      duration_max: requestedDuration,
    };
    return searchActivities(fallbackFilter);
  }

  // ── Step 2: Check rate limit before calling AI ────────────────

  const limit = await checkRateLimit(sessionId, ip);

  if (!limit.allowed) {
    const fallback = await getBankFallback();
    const res = bankFallbackResponse(fallback, requestedDuration, { rate_limited: true });
    if (res) return res;
    return NextResponse.json(
      { error: 'limit_reached', message: 'Daily AI limit reached. No bank matches found.' },
      { status: 429 }
    );
  }

  // ── Step 2b: Check API key availability ──────────────────────

  if (!isAiAvailable()) {
    const fallback = await getBankFallback();
    const res = bankFallbackResponse(fallback, requestedDuration, { ai_unavailable: true });
    if (res) return res;
    return NextResponse.json(
      { error: 'ai_unavailable', ai_unavailable: true, message: 'AI unavailable and no bank matches found.' },
      { status: 200 }
    );
  }

  // ── Step 3: Call Claude (Haiku — cheapest model) ──────────────

  const userMessage = buildEmergencyPrompt(params);

  let text: string;
  let usage: { input_tokens: number; output_tokens: number };

  try {
    const result = await callClaude({
      model: DEFAULT_MODEL,
      system: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1200,
    });
    text = result.text;
    usage = result.usage;
  } catch (aiErr) {
    console.error('[emergency] AI call failed:', aiErr);
    const fallback = await getBankFallback();
    const res = bankFallbackResponse(fallback, requestedDuration, { ai_unavailable: true });
    if (res) return res;
    return NextResponse.json(
      { error: 'ai_unavailable', ai_unavailable: true },
      { status: 200 }
    );
  }

  const parsed = parseActivityJson<{ safest: Activity; most_fun: Activity; most_educational: Activity }>(text);

  const safest = { ...parsed.safest, source: 'ai_generated' as const };
  const most_fun = { ...parsed.most_fun, source: 'ai_generated' as const };
  const most_educational = { ...parsed.most_educational, source: 'ai_generated' as const };

  // ── Step 4: Auto-save to Activity Bank + log usage ────────────

  const saved = await Promise.allSettled([
    createActivity(safest),
    createActivity(most_fun),
    createActivity(most_educational),
  ]);

  const withIds = [safest, most_fun, most_educational].map((act, i) => {
    const res = saved[i];
    return res.status === 'fulfilled' ? { ...act, id: res.value.id } : act;
  });

  await logAiUsage({
    session_id: sessionId,
    ip_hash: ip,
    feature: 'emergency',
    model: DEFAULT_MODEL,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    output_activity_id: withIds[0]?.id,
  });

  return NextResponse.json({
    source: 'ai',
    safest: withIds[0],
    most_fun: withIds[1],
    most_educational: withIds[2],
    requested_duration: requestedDuration,
  } satisfies EmergencyResult);
}
