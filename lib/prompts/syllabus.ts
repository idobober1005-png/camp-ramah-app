const ACTIVITY_SCHEMA = `{
  "title": "string (English)",
  "title_he": "string (Hebrew)",
  "description": "string — one sentence (English)",
  "description_he": "string — one sentence (Hebrew)",
  "duration_minutes": number,
  "energy_level": "calm" | "medium" | "energetic",
  "location": "indoor" | "outdoor" | "waterfront" | "cabin" | "field" | "any",
  "materials": ["string"],
  "instructions": "string — numbered steps, newline-separated (English)",
  "instructions_he": "string — same steps in Hebrew",
  "variations": [{"name": "string", "description": "string"}],
  "safety_notes": "string or null (REQUIRED non-null for waterfront activities)",
  "educational_goal": "string — the educational objective this activity serves",
  "hebrew_element": "string or null",
  "topics": ["string — from: ישראל,יהדות,ספורט,מים,מנהיגות,גיבוש,ערכים,שבת,טבע,מוזיקה,יצירה,תנועה,צחוקים,שקט ורוגע,חינוך"],
  "tags": ["string"],
  "source": "syllabus_derived",
  "why_it_works": "string",
  "counselors_min": 1,
  "counselors_max": number or null,
  "location_type": "string — e.g. דשא, צריף, חדר אוכל",
  "coordination_level": "none" | "recommended" | "required"
}`;

// Minimal schema for import — strips verbose optional fields to reduce output tokens.
// Fields omitted here (tags, why_it_works, educational_goal, counselors, location_type,
// coordination_level, English versions) are gracefully defaulted by normalizeImportedActivity.
const IMPORT_SCHEMA_CONCISE = `{
  "title_he": "string — Hebrew name (required)",
  "title": "string — English name if present in doc, otherwise omit",
  "description_he": "string — 1 sentence, ≤15 words",
  "instructions_he": "string — numbered steps, max 5 steps, each step ≤12 words",
  "duration_minutes": number,
  "energy_level": "calm" | "medium" | "energetic",
  "location": "indoor" | "outdoor" | "waterfront" | "cabin" | "field" | "any",
  "materials": ["string — only if explicitly mentioned"],
  "variations": [{"name": "string", "description": "string ≤10 words"}],
  "safety_notes": "string — REQUIRED if waterfront/water/heights, otherwise omit key entirely",
  "hebrew_element": "string — only if explicit Jewish/Hebrew element exists, otherwise omit",
  "topics": ["1–2 strings from: ישראל,יהדות,ספורט,מים,מנהיגות,גיבוש,ערכים,שבת,טבע,מוזיקה,יצירה,תנועה,צחוקים,שקט ורוגע,חינוך"],
  "source": "syllabus_derived"
}`;

// ── Primary import prompt ─────────────────────────────────────────────────
// Extracts and structures EXISTING activities from a document.
// Does NOT generate new activities — only transforms what's already there.
// TOKEN-SAFE: capped at 5 activities, concise schema, completeness over quantity.
export function buildImportPrompt(text: string): string {
  return `You are helping digitize an existing camp activities document.

Read the document and extract the FIRST 5 clearly described activities.

EXTRACTION RULES:
1. Extract ONLY activities explicitly described in the document. Do NOT invent.
2. Extract AT MOST 5 activities. Stop after 5 even if more exist.
3. Skip non-activity content: schedules, staff lists, policies, general notes.
4. You MAY infer missing metadata (duration, energy_level, location) from context.

TOKEN-SAFETY RULES — follow strictly:
- Return FEWER complete activities rather than MORE truncated ones.
- Every JSON object must be fully closed with all braces and brackets.
- description_he: 1 sentence, ≤15 words.
- instructions_he: numbered steps, max 5 steps, each step ≤12 words.
- variations: at most 1; omit the key entirely if none is obvious.
- Omit any key whose value would be null, empty, or not in the document.
- Do NOT include English fields (title, instructions) unless the document is in English.

Each activity must match this schema exactly:
${IMPORT_SCHEMA_CONCISE}

Return a JSON array: [ {...}, {...} ]
If no activities found, return: []
Return ONLY the JSON array. No text before [ or after ].

DOCUMENT:
${text}`;
}

// ── Legacy objective-extraction prompt (secondary flow) ───────────────────
export function buildSyllabusExtractPrompt(text: string): string {
  return `You are analyzing camp educational content. Extract a list of learning objectives or activities from the text below.

Return a JSON array of strings. Each string is one clear educational objective or activity goal.
Keep each under 15 words. Extract 3–10 objectives.

TEXT:
${text.slice(0, 4000)}

Return ONLY a JSON array like: ["objective 1", "objective 2", ...]`;
}

export function buildSyllabusActivityPrompt(objective: string, context?: string): string {
  const contextNote = context ? `\nCamp context: ${context}` : '';

  return `Convert this educational objective into a complete camp activity.

Objective: "${objective}"${contextNote}

Generate exactly ONE activity matching this schema:
${ACTIVITY_SCHEMA}

Rules:
- The activity must directly serve the educational objective.
- If the objective involves water/swimming, safety_notes must be non-null with buddy system and lifeguard info.
- Include at least 2 variations.
- topics array must contain at least 1 topic.
- Return ONLY the JSON object for one activity.`;
}
