import { EmergencyParams } from '@/types/activity';

const ACTIVITY_SCHEMA = `{
  "title": "string (English)",
  "title_he": "string (Hebrew translation of title)",
  "description": "string — one sentence (English)",
  "description_he": "string — one sentence (Hebrew)",
  "duration_minutes": number,
  "energy_level": "calm" | "medium" | "energetic",
  "location": "indoor" | "outdoor" | "waterfront" | "cabin" | "field" | "any",
  "materials": ["string — equipment needed (English)"],
  "instructions": "string — numbered steps, newline-separated (English)",
  "instructions_he": "string — same steps in Hebrew",
  "variations": [{"name": "string", "description": "string"}],
  "safety_notes": "string or null",
  "educational_goal": "string or null",
  "hebrew_element": "string or null",
  "topics": ["string — from: ישראל,יהדות,ספורט,מים,מנהיגות,גיבוש,ערכים,שבת,טבע,מוזיקה,יצירה,תנועה,צחוקים,שקט ורוגע,חינוך"],
  "tags": ["string"],
  "source": "ai_generated",
  "why_it_works": "string — one sentence",
  "counselors_min": 1,
  "counselors_max": number or null,
  "location_type": "string — specific place e.g. דשא, צריף, חדר אוכל, אגם, מגרש ספורט",
  "coordination_level": "none" | "recommended" | "required"
}`;

export function buildEmergencyPrompt(params: EmergencyParams): string {
  const equipmentNote = params.equipment_available.length > 0
    ? `Equipment on hand: ${params.equipment_available.join(', ')}. Prioritize activities using this equipment. If no activity perfectly matches, adapt using available equipment.`
    : 'No equipment available — all activities must require zero equipment.';

  const topicNote = params.topics && params.topics.length > 0
    ? `Preferred topics: ${params.topics.join(', ')}. At least one activity should align with these topics.`
    : '';

  return `A camp counselor needs an activity RIGHT NOW. Generate exactly 3 activities.

SITUATION:
- Time available: ${params.time_available_minutes} minutes
- Location: ${params.location}
- Group energy: ${params.energy_level}
- Group size: ~${params.group_size} campers
- ${equipmentNote}${topicNote ? `\n- ${topicNote}` : ''}

OUTPUT: A single JSON object with exactly these three keys. Each value matches this schema:
${ACTIVITY_SCHEMA}

{
  "safest": { ...activity that is safest and easiest to run immediately },
  "most_fun": { ...activity with highest fun/engagement factor },
  "most_educational": { ...activity with strongest educational or Jewish value }
}

Rules:
- Every activity must fit within ${params.time_available_minutes} minutes.
- Every activity must work at location: ${params.location}.
- Match energy level: ${params.energy_level}.
- If location is waterfront, safety_notes must be non-null and include buddy system and lifeguard positioning.
- Include topics array for every activity.
- Return ONLY the JSON object. No explanation.`;
}
