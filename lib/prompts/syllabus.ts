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
