import { MagicParams } from '@/types/activity';

// Flat schema description avoids nested code blocks that confuse some models
const MAGIC_SCHEMA = `Required JSON fields (all must be present):
- title: string (English activity name)
- title_he: string (Hebrew activity name)
- description: string (one English sentence)
- description_he: string (one Hebrew sentence)
- duration_minutes: integer
- energy_level: exactly one of "calm", "medium", "energetic"
- location: exactly one of "indoor", "outdoor", "waterfront", "cabin", "field", "any"
- group_size_min: integer
- group_size_max: integer or null
- materials: array of strings (Hebrew preferred; empty array if none needed)
- instructions: string (numbered steps, newline-separated, English)
- instructions_he: string (same steps in Hebrew, newline-separated)
- variations: array of 1-2 objects with "name" and "description" keys
- variations_he: array matching variations, Hebrew names and descriptions
- safety_notes: string or null (required for waterfront or physical activities)
- educational_goal: string or null
- educational_goal_he: string or null
- hebrew_element: string or null (Hebrew/Jewish cultural connection if natural)
- topics: array of strings chosen from: ישראל,יהדות,ספורט,מים,מנהיגות,גיבוש,ערכים,שבת,טבע,מוזיקה,יצירה,תנועה,צחוקים,שקט ורוגע,חינוך
- tags: array of short English keyword strings
- source: the literal string "ai_generated"
- why_it_works: string (why this transformation engages campers, English)
- why_it_works_he: string (same, Hebrew — explain the psychology of the transformation)
- counselors_min: integer (minimum staff needed)
- counselors_max: integer or null
- location_type: string (specific place in Hebrew, e.g. צריף, חדר אוכל, מגרש)
- coordination_level: exactly one of "none", "recommended", "required"`;

export function buildMagicPrompt(params: MagicParams): string {
  const lines: string[] = [];

  // Lead with the hard constraint — models comply better when it's first
  lines.push('IMPORTANT: Respond with ONLY a valid JSON object. No preamble, no explanation,');
  lines.push('no markdown, no code fences. Your response must start with { and end with }.');
  lines.push('CRITICAL: Use \\n (the two characters backslash-n) for line breaks inside string values.');
  lines.push('NEVER use actual newline characters inside a JSON string value.');
  lines.push('');
  lines.push(`Transform this routine camp task into an engaging, practical activity.`);
  lines.push('');
  lines.push(`ORIGINAL TASK: "${params.task}"`);
  lines.push('');
  lines.push('CONTEXT:');

  if (params.age_group) {
    lines.push(`- Camper age group: ${params.age_group}`);
  }
  if (params.location) {
    lines.push(`- Location: ${params.location}`);
  }
  if (params.duration_minutes) {
    lines.push(`- Time available: ${params.duration_minutes} minutes`);
  }
  if (params.energy_level) {
    lines.push(`- Group energy level: ${params.energy_level}`);
  }
  if (params.equipment_available && params.equipment_available.length > 0) {
    lines.push(`- Equipment on hand: ${params.equipment_available.join(', ')}`);
  } else {
    lines.push('- No special equipment — prefer zero-materials activity');
  }
  if (params.topics && params.topics.length > 0) {
    lines.push(`- Preferred themes: ${params.topics.join(', ')}`);
  }

  lines.push('');
  lines.push('TRANSFORMATION RULES:');
  lines.push('1. PRESERVE PURPOSE. If the task needs a clean cabin, the game must actually clean it.');
  lines.push('   If campers must walk somewhere, the activity still moves them there.');
  lines.push('2. Add one clear game mechanic: competition, points, storytelling, mystery, or role-play.');
  lines.push('3. Keep setup under 2 minutes. Rules must be explainable in one sentence.');
  lines.push('4. Include a Jewish/Hebrew element only if it fits naturally — never force it.');
  lines.push('5. why_it_works_he: explain WHY adding this mechanic changes how campers experience the task.');
  lines.push('6. For waterfront or physically intensive activities: safety_notes must be non-null.');
  lines.push('');
  lines.push('OUTPUT SCHEMA:');
  lines.push(MAGIC_SCHEMA);
  lines.push('');
  lines.push('Respond with ONLY the JSON object. Start with { and end with }. Nothing else.');

  return lines.join('\n');
}
