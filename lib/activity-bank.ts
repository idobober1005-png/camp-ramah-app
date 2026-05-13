import { createServerClient } from '@/lib/supabase';
import { Activity, ActivityFilter, CoordinationLevel, EnergyLevel, Location } from '@/types/activity';

export interface ActivityRow {
  id: string;
  title: string;
  description: string;
  title_he: string | null;
  description_he: string | null;
  instructions_he: string | null;
  why_it_works_he: string | null;
  variations_he: { name: string; description: string }[];
  educational_goal_he: string | null;
  age_min: number | null;
  age_max: number | null;
  duration_minutes: number | null;
  energy_level: EnergyLevel | null;
  location: Location | null;
  group_size_min: number | null;
  group_size_max: number | null;
  materials: string[];
  instructions: string;
  variations: { name: string; description: string }[];
  safety_notes: string | null;
  educational_goal: string | null;
  hebrew_element: string | null;
  topics: string[];
  tags: string[];
  source: string;
  why_it_works: string | null;
  counselors_min: number | null;
  counselors_max: number | null;
  location_type: string | null;
  coordination_level: CoordinationLevel | null;
  feedback_worked_well: number;
  feedback_too_chaotic: number;
  feedback_too_boring: number;
  feedback_run_again: number;
  feedback_total: number;
  is_public: boolean;
  creator_id: string | null;
  created_at: string;
}

export function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    title_he: row.title_he ?? undefined,
    description_he: row.description_he ?? undefined,
    instructions_he: row.instructions_he ?? undefined,
    why_it_works_he: row.why_it_works_he ?? undefined,
    variations_he: row.variations_he && row.variations_he.length > 0 ? row.variations_he : undefined,
    educational_goal_he: row.educational_goal_he ?? undefined,
    age_min: row.age_min ?? undefined,
    age_max: row.age_max ?? undefined,
    duration_minutes: row.duration_minutes ?? 0,
    energy_level: row.energy_level ?? 'medium',
    location: row.location ?? 'any',
    group_size_min: row.group_size_min ?? undefined,
    group_size_max: row.group_size_max ?? undefined,
    materials: row.materials ?? [],
    instructions: row.instructions,
    variations: row.variations ?? [],
    safety_notes: row.safety_notes ?? undefined,
    educational_goal: row.educational_goal ?? undefined,
    hebrew_element: row.hebrew_element ?? undefined,
    topics: row.topics ?? [],
    tags: row.tags ?? [],
    source: row.source as Activity['source'],
    why_it_works: row.why_it_works ?? undefined,
    counselors_min: row.counselors_min ?? undefined,
    counselors_max: row.counselors_max ?? undefined,
    location_type: row.location_type ?? undefined,
    coordination_level: row.coordination_level ?? undefined,
    feedback_worked_well: row.feedback_worked_well,
    feedback_too_chaotic: row.feedback_too_chaotic,
    feedback_too_boring: row.feedback_too_boring,
    feedback_run_again: row.feedback_run_again,
    feedback_total: row.feedback_total,
    creator_id: row.creator_id ?? undefined,
    created_at: row.created_at,
  };
}

export async function searchActivities(filter: ActivityFilter): Promise<Activity[]> {
  const db = createServerClient();
  let query = db.from('activities').select('*').eq('is_public', true);

  if (filter.search?.trim()) {
    query = query.textSearch(
      'title,description,educational_goal',
      filter.search.trim(),
      { type: 'websearch', config: 'english' }
    );
  }

  if (filter.energy_level) {
    query = query.eq('energy_level', filter.energy_level);
  }

  if (filter.location) {
    query = query.or(`location.eq.${filter.location},location.eq.any`);
  }

  if (filter.duration_max) {
    query = query.lte('duration_minutes', filter.duration_max);
  }

  if (filter.age) {
    query = query
      .or(`age_min.is.null,age_min.lte.${filter.age}`)
      .or(`age_max.is.null,age_max.gte.${filter.age}`);
  }

  if (filter.tags && filter.tags.length > 0) {
    query = query.contains('tags', filter.tags);
  }

  // Topics: activity must overlap with at least one requested topic
  if (filter.topics && filter.topics.length > 0) {
    query = query.overlaps('topics', filter.topics);
  }

  const { data, error } = await query
    .order('feedback_worked_well', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data as ActivityRow[]).map(rowToActivity);
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from('activities')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (error || !data) return null;
  return rowToActivity(data as ActivityRow);
}

export async function createActivity(
  activity: Omit<Activity, 'id' | 'created_at'>
): Promise<Activity> {
  const db = createServerClient();
  const { data, error } = await db
    .from('activities')
    .insert({
      title: activity.title,
      description: activity.description,
      title_he: activity.title_he ?? null,
      description_he: activity.description_he ?? null,
      instructions_he: activity.instructions_he ?? null,
      why_it_works_he: activity.why_it_works_he ?? null,
      variations_he: activity.variations_he ?? [],
      educational_goal_he: activity.educational_goal_he ?? null,
      age_min: activity.age_min ?? null,
      age_max: activity.age_max ?? null,
      duration_minutes: activity.duration_minutes,
      energy_level: activity.energy_level,
      location: activity.location,
      group_size_min: activity.group_size_min ?? null,
      group_size_max: activity.group_size_max ?? null,
      materials: activity.materials ?? [],
      instructions: activity.instructions,
      variations: activity.variations ?? [],
      safety_notes: activity.safety_notes ?? null,
      educational_goal: activity.educational_goal ?? null,
      hebrew_element: activity.hebrew_element ?? null,
      topics: activity.topics ?? [],
      tags: activity.tags ?? [],
      source: activity.source,
      why_it_works: activity.why_it_works ?? null,
      counselors_min: activity.counselors_min ?? null,
      counselors_max: activity.counselors_max ?? null,
      location_type: activity.location_type ?? null,
      coordination_level: activity.coordination_level ?? null,
      creator_id: activity.creator_id ?? null,
      is_public: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToActivity(data as ActivityRow);
}

export async function recordFeedback(
  activityId: string,
  response: 'worked_well' | 'too_chaotic' | 'too_boring' | 'run_again',
  ageGroup?: string,
  location?: string
): Promise<void> {
  const db = createServerClient();

  await db.from('activity_feedback').insert({
    activity_id: activityId,
    response,
    age_group: ageGroup ?? null,
    location: location ?? null,
  });

  const colMap: Record<string, string> = {
    worked_well: 'feedback_worked_well',
    too_chaotic: 'feedback_too_chaotic',
    too_boring: 'feedback_too_boring',
    run_again: 'feedback_run_again',
  };
  const col = colMap[response];

  const { data } = await db
    .from('activities')
    .select('feedback_worked_well, feedback_too_chaotic, feedback_too_boring, feedback_run_again, feedback_total')
    .eq('id', activityId)
    .single<{
      feedback_worked_well: number;
      feedback_too_chaotic: number;
      feedback_too_boring: number;
      feedback_run_again: number;
      feedback_total: number;
    }>();

  if (data) {
    await db
      .from('activities')
      .update({
        [col]: (data[col as keyof typeof data] as number) + 1,
        feedback_total: data.feedback_total + 1,
      })
      .eq('id', activityId);
  }
}

export async function hasEnoughMatches(
  filter: ActivityFilter,
  threshold = 2
): Promise<boolean> {
  const db = createServerClient();
  let query = db
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('is_public', true);

  if (filter.energy_level) {
    query = query.eq('energy_level', filter.energy_level);
  }
  if (filter.location) {
    query = query.or(`location.eq.${filter.location},location.eq.any`);
  }
  if (filter.duration_max) {
    query = query.lte('duration_minutes', filter.duration_max);
  }
  if (filter.topics && filter.topics.length > 0) {
    query = query.overlaps('topics', filter.topics);
  }

  const { count } = await query;
  return (count ?? 0) >= threshold;
}
