import { createServerClient } from '@/lib/supabase';
import { hashIp } from '@/lib/rate-limit';
import { AiUsageLog } from '@/types/activity';

export async function logAiUsage(log: AiUsageLog): Promise<void> {
  const db = createServerClient();
  await db.from('ai_usage').insert({
    session_id: log.session_id,
    ip_hash: hashIp(log.ip_hash), // ip_hash field receives raw IP, we hash it here
    feature: log.feature,
    model: log.model,
    input_tokens: log.input_tokens ?? null,
    output_tokens: log.output_tokens ?? null,
    output_activity_id: log.output_activity_id ?? null,
  });
}
