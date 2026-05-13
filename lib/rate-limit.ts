import { createHash } from 'crypto';
import { createServerClient } from '@/lib/supabase';
import { RateLimitResult } from '@/types/activity';

const SESSION_LIMIT = parseInt(process.env.AI_RATE_LIMIT_SESSION_DAILY ?? '10');
const IP_LIMIT = parseInt(process.env.AI_RATE_LIMIT_IP_DAILY ?? '20');

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

function startOfDay(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function checkRateLimit(
  sessionId: string,
  ip: string
): Promise<RateLimitResult> {
  const db = createServerClient();
  const dayStart = startOfDay();
  const ipHash = hashIp(ip);

  const [sessionRes, ipRes] = await Promise.all([
    db
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .gte('created_at', dayStart),
    db
      .from('ai_usage')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', dayStart),
  ]);

  const sessionCount = sessionRes.count ?? 0;
  const ipCount = ipRes.count ?? 0;

  if (sessionCount >= SESSION_LIMIT) {
    return { allowed: false, reason: 'session_limit' };
  }
  if (ipCount >= IP_LIMIT) {
    return { allowed: false, reason: 'ip_limit' };
  }
  return { allowed: true };
}

export { hashIp };
