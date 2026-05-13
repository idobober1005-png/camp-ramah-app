export type EnergyLevel = 'calm' | 'medium' | 'energetic';
export type Location = 'indoor' | 'outdoor' | 'waterfront' | 'cabin' | 'field' | 'any';
export type ActivitySource = 'manual' | 'ai_generated' | 'syllabus_derived';
export type CounselorRole =
  | 'social_counselor'
  | 'waterfront_instructor'
  | 'art'
  | 'martial_arts'
  | 'theater'
  | 'ropes'
  | 'basketball'
  | 'sports'
  | 'music'
  | 'dance'
  | 'nature'
  | 'hebrew_jewish';
export type Language = 'he' | 'en';
export type CoordinationLevel = 'none' | 'recommended' | 'required';

export type RemixModification =
  | 'calmer'
  | 'more_energetic'
  | 'indoor'
  | 'outdoor'
  | 'no_equipment'
  | 'younger_campers'
  | 'older_campers'
  | 'add_hebrew'
  | 'add_teamwork'
  | 'waterfront_safe'
  | 'shorter'
  | 'longer';

export type FeedbackType = 'worked_well' | 'too_chaotic' | 'too_boring' | 'run_again';

export interface ActivityVariation {
  name: string;
  description: string;
}

export interface Activity {
  id?: string;
  title: string;
  description: string;
  // Bilingual overrides (undefined = fall back to English canonical field)
  title_he?: string;
  description_he?: string;
  instructions_he?: string;
  why_it_works_he?: string;
  variations_he?: ActivityVariation[];
  educational_goal_he?: string;
  age_min?: number;
  age_max?: number;
  duration_minutes: number;
  energy_level: EnergyLevel;
  location: Location;
  group_size_min?: number;
  group_size_max?: number;
  materials: string[];
  instructions: string; // Markdown — English canonical
  variations: ActivityVariation[];
  safety_notes?: string;
  educational_goal?: string;
  hebrew_element?: string;
  topics: string[];
  tags: string[];
  source: ActivitySource;
  why_it_works?: string;
  // Operational metadata
  counselors_min?: number;
  counselors_max?: number;
  location_type?: string;
  coordination_level?: CoordinationLevel;
  // Ownership (localStorage-based MVP auth)
  creator_id?: string;
  // Feedback aggregates (from DB)
  feedback_worked_well?: number;
  feedback_too_chaotic?: number;
  feedback_too_boring?: number;
  feedback_run_again?: number;
  feedback_total?: number;
  created_at?: string;
}

export interface MockUser {
  id: string;
  name: string;
  role: CounselorRole;
  defaultAgeGroup: string;
}

export interface GeneratorParams {
  role: CounselorRole;
  age_min: number;
  age_max: number;
  energy_level: EnergyLevel;
  location: Location;
  duration_minutes: number;
  group_size?: number;
  equipment_available?: string[];
  educational_goal?: string;
  hebrew_element_requested?: boolean;
  topics?: string[];
}

export interface EmergencyParams {
  time_available_minutes: number;
  location: Location;
  energy_level: EnergyLevel;
  group_size: number;
  equipment_available: string[];
  topics?: string[];
}

export interface EmergencyResult {
  safest: Activity;
  most_fun: Activity;
  most_educational: Activity;
}

export interface MagicParams {
  task: string;
  age_group?: string;
  location?: string;
  duration_minutes?: number;
  energy_level?: string;
  equipment_available?: string[];
  topics?: string[];
}

export interface RemixParams {
  original_activity: Activity;
  modification: RemixModification;
}

export interface FeedbackPayload {
  response: FeedbackType;
  age_group?: string;
  location?: string;
}

export interface ActivityFilter {
  search?: string;
  energy_level?: EnergyLevel;
  location?: Location;
  duration_max?: number;
  age?: number;
  tags?: string[];
  topics?: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: 'session_limit' | 'ip_limit';
}

export interface AiUsageLog {
  session_id: string;
  ip_hash: string;
  feature: 'generator' | 'magic' | 'remix' | 'emergency' | 'syllabus';
  model: string;
  input_tokens?: number;
  output_tokens?: number;
  output_activity_id?: string;
}

// ── Shared constants ──────────────────────────────────────────────────────────

export const TOPIC_OPTIONS = [
  'ישראל', 'יהדות', 'ספורט', 'מים', 'מנהיגות', 'גיבוש',
  'ערכים', 'שבת', 'טבע', 'מוזיקה', 'יצירה', 'תנועה',
  'צחוקים', 'שקט ורוגע', 'חינוך',
];

export const EQUIPMENT_OPTIONS: { value: string; icon: string }[] = [
  { value: 'כדור',       icon: '⚽' },
  { value: 'טושים',      icon: '✏️' },
  { value: 'דפים',       icon: '📄' },
  { value: 'חבל',        icon: '🪢' },
  { value: 'מוזיקה',     icon: '🎵' },
  { value: 'רמקול',      icon: '🔊' },
  { value: 'מים',        icon: '💧' },
  { value: 'בגדי ים',    icon: '🩱' },
  { value: 'כיסאות',     icon: '🪑' },
  { value: 'קונוסים',    icon: '🔶' },
  { value: 'ציוד ספורט', icon: '🏃' },
];
