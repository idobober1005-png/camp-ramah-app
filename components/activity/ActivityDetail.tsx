'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity } from '@/types/activity';
import { FeedbackWidget } from './FeedbackWidget';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { getTitle, getDescription, getInstructions, getWhyItWorks, getVariations, getEducationalGoal, translateMaterials } from '@/lib/i18n';
import { getCreatorId } from '@/lib/mock-auth';
import { cn } from '@/lib/utils';

const ENERGY_CHIP = {
  calm:      'bg-blue-100 text-blue-700',
  medium:    'bg-amber-100 text-amber-700',
  energetic: 'bg-rose-100 text-rose-700',
};

const ENERGY_LABEL: Record<string, Record<string, string>> = {
  calm:      { he: 'שקט',   en: 'Calm' },
  medium:    { he: 'בינוני', en: 'Medium' },
  energetic: { he: 'פראי',  en: 'Energetic' },
};

const SOURCE_LABEL: Record<string, Record<string, string>> = {
  manual:           { he: '📌 פעילות מאוצרת', en: '📌 Curated' },
  ai_generated:     { he: '🤖 נוצר ע״י AI',   en: '🤖 AI Generated' },
  syllabus_derived: { he: '📄 מסילבוס',        en: '📄 From Syllabus' },
};

const COORDINATION_LABEL: Record<string, Record<string, string>> = {
  none:        { he: '✅ ללא תיאום',   en: '✅ No Coordination' },
  recommended: { he: '📋 תיאום מומלץ', en: '📋 Coordination Recommended' },
  required:    { he: '⚠️ תיאום נדרש', en: '⚠️ Coordination Required' },
};

const LOCATION_LABEL: Record<string, Record<string, string>> = {
  indoor:     { he: 'בפנים 🏠',    en: 'Indoor 🏠' },
  outdoor:    { he: 'בחוץ 🌳',     en: 'Outdoor 🌳' },
  waterfront: { he: 'אגם 🌊',      en: 'Waterfront 🌊' },
  cabin:      { he: 'צריף 🛖',     en: 'Cabin 🛖' },
  field:      { he: 'מגרש ⛳',     en: 'Field ⛳' },
  any:        { he: 'כל מקום 📍',  en: 'Any Location 📍' },
};

const LOCATION_HERO: Record<string, string> = {
  outdoor:    'from-green-700 to-emerald-600',
  waterfront: 'from-blue-700 to-cyan-600',
  indoor:     'from-sky-700 to-sky-500',
  cabin:      'from-amber-700 to-amber-500',
  field:      'from-teal-700 to-green-500',
  any:        'from-stone-600 to-stone-500',
};

interface ActivityDetailProps {
  activity: Activity;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const { lang } = useLanguage();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (activity.creator_id) {
      setIsOwner(activity.creator_id === getCreatorId());
    }
  }, [activity.creator_id]);

  const materials = translateMaterials(activity.materials, lang);
  const heroGradient = LOCATION_HERO[activity.location] ?? LOCATION_HERO.any;

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'DELETE',
        headers: { 'X-Creator-Id': getCreatorId() },
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'שגיאה במחיקה');
      }
      router.push('/bank');
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'שגיאה לא ידועה');
      setDeleting(false);
      setDeleteConfirming(false);
    }
  }

  return (
    <article>
      {/* ── Colored header ──────────────────────────────────────── */}
      <div className={cn('bg-gradient-to-br px-4 pt-5 pb-10', heroGradient)}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-2 mb-2">
            <h1 className="text-2xl font-extrabold text-white flex-1 leading-tight" dir="auto">
              {getTitle(activity, lang)}
            </h1>
            {activity.hebrew_element && (
              <span className="text-xl shrink-0 mt-0.5" title={lang === 'he' ? 'כולל אלמנט עברי' : 'Includes Hebrew element'}>✡️</span>
            )}
          </div>
          <p className="text-white/80 text-sm leading-relaxed" dir="auto">{getDescription(activity, lang)}</p>

          {/* Meta chips on gradient */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', ENERGY_CHIP[activity.energy_level])}>
              {ENERGY_LABEL[activity.energy_level]?.[lang] ?? activity.energy_level}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white">
              {LOCATION_LABEL[activity.location]?.[lang] ?? activity.location}
            </span>
            {activity.duration_minutes > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white">
                ⏱ {activity.duration_minutes}{lang === 'he' ? ' דק׳' : ' min'}
              </span>
            )}
            {(activity.age_min || activity.age_max) && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white">
                👤 {lang === 'he' ? 'גיל' : 'Age'} {activity.age_min}–{activity.age_max}
              </span>
            )}
            {activity.group_size_min && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20 text-white">
                👥 {activity.group_size_min}–{activity.group_size_max ?? '∞'}
              </span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/10 text-white/70">
              {SOURCE_LABEL[activity.source]?.[lang] ?? activity.source}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body — floats up over header ────────────────────────── */}
      <div className="-mt-4 px-4 pb-8 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-5 space-y-1">

          {/* Topics */}
          {activity.topics && activity.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-4 border-b border-stone-100">
              {activity.topics.map((topic) => (
                <span key={topic} className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full font-semibold">
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Operational metadata */}
          {(activity.counselors_min || activity.location_type || activity.coordination_level) && (
            <div className="py-4 border-b border-stone-100 grid grid-cols-2 gap-3">
              {activity.counselors_min != null && (
                <div className="bg-stone-50 rounded-2xl p-3">
                  <p className="text-xs text-stone-400 font-medium mb-0.5">
                    {lang === 'he' ? 'מדריכים' : 'Staff'}
                  </p>
                  <p className="text-sm font-bold text-stone-800">
                    {activity.counselors_min}
                    {activity.counselors_max && activity.counselors_max !== activity.counselors_min
                      ? `–${activity.counselors_max}`
                      : '+'
                    }
                  </p>
                </div>
              )}
              {activity.location_type && (
                <div className="bg-stone-50 rounded-2xl p-3">
                  <p className="text-xs text-stone-400 font-medium mb-0.5">
                    {lang === 'he' ? 'מיקום' : 'Spot'}
                  </p>
                  <p className="text-sm font-bold text-stone-800">{activity.location_type}</p>
                </div>
              )}
              {activity.coordination_level && (
                <div className="col-span-2 bg-stone-50 rounded-2xl p-3">
                  <p className="text-sm font-semibold text-stone-700">
                    {COORDINATION_LABEL[activity.coordination_level]?.[lang] ?? activity.coordination_level}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Materials */}
          {materials.length > 0 && (
            <Section title={lang === 'he' ? 'ציוד נדרש' : 'Equipment'}>
              <div className="flex flex-wrap gap-2">
                {materials.map((m, i) => (
                  <span key={i} className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full font-medium" dir="auto">
                    {m}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Instructions */}
          <Section title={lang === 'he' ? 'איך מריצים' : 'How to Run It'}>
            <div className="space-y-3">
              {getInstructions(activity, lang)
                .split('\n')
                .filter(Boolean)
                .map((line, i) => {
                  const stripped = line.replace(/^\d+\.\s*/, '');
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-stone-700 flex-1 leading-relaxed" dir="auto">{stripped}</p>
                    </div>
                  );
                })}
            </div>
          </Section>

          {/* Why it works */}
          {getWhyItWorks(activity, lang) && (
            <Section title={lang === 'he' ? 'למה זה עובד' : 'Why It Works'}>
              <p className="text-sm text-stone-600 italic leading-relaxed" dir="auto">{getWhyItWorks(activity, lang)}</p>
            </Section>
          )}

          {/* Hebrew element */}
          {activity.hebrew_element && (
            <div className="py-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base leading-none">✡️</span>
                  <p className="text-xs font-extrabold text-blue-600 uppercase tracking-wide">
                    {lang === 'he' ? 'אלמנט עברי / יהודי' : 'Hebrew / Jewish Element'}
                  </p>
                </div>
                <p className="text-sm text-blue-900 leading-relaxed" dir="auto">{activity.hebrew_element}</p>
              </div>
            </div>
          )}

          {/* Educational goal */}
          {getEducationalGoal(activity, lang) && (
            <Section title={lang === 'he' ? 'מטרה חינוכית' : 'Educational Goal'}>
              <p className="text-sm text-stone-700 leading-relaxed" dir="auto">{getEducationalGoal(activity, lang)}</p>
            </Section>
          )}

          {/* Variations */}
          {activity.variations.length > 0 && (
            <Section title={lang === 'he'
              ? `וריאציות (${getVariations(activity, lang).length})`
              : `Variations (${getVariations(activity, lang).length})`}>
              <div className="space-y-3">
                {getVariations(activity, lang).map((v, i) => (
                  <div key={i} className="ps-4 border-s-2 border-violet-200">
                    <p className="text-sm font-bold text-stone-800" dir="auto">{v.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed" dir="auto">{v.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Safety notes */}
          {activity.safety_notes && (
            <div className="py-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base leading-none">⚠️</span>
                  <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wide">
                    {lang === 'he' ? 'הערות בטיחות' : 'Safety Notes'}
                  </p>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed" dir="auto">{activity.safety_notes}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-100">
              {activity.tags.map((tag) => (
                <span key={tag} className="text-xs text-stone-300 font-medium">#{tag}</span>
              ))}
            </div>
          )}

        </div>

        {/* Feedback — outside the white card for breathing room */}
        <div className="mt-3">
          <FeedbackWidget
            activityId={activity.id!}
            counts={{
              worked_well:  activity.feedback_worked_well  ?? 0,
              too_chaotic:  activity.feedback_too_chaotic  ?? 0,
              too_boring:   activity.feedback_too_boring   ?? 0,
              run_again:    activity.feedback_run_again    ?? 0,
            }}
          />
        </div>

        {/* Owner actions */}
        {isOwner && activity.id && (
          <div className="mt-3 bg-white rounded-3xl shadow-sm p-4">
            <p className="text-xs text-stone-400 font-medium mb-3">
              {lang === 'he' ? 'פעולות בעלים' : 'Owner Actions'}
            </p>
            <div className="flex gap-3">
              <Link
                href={`/bank/${activity.id}/edit`}
                className="flex-1 text-center py-3 text-sm font-semibold border-2 border-stone-200 text-stone-700 rounded-2xl hover:bg-stone-50 transition-colors"
              >
                ✏️ {lang === 'he' ? 'ערוך' : 'Edit'}
              </Link>

              {!deleteConfirming ? (
                <button
                  onClick={() => setDeleteConfirming(true)}
                  className="flex-1 py-3 text-sm font-semibold border-2 border-red-200 text-red-600 rounded-2xl hover:bg-red-50 transition-colors"
                >
                  🗑️ {lang === 'he' ? 'מחק' : 'Delete'}
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-3 text-sm font-bold bg-red-600 text-white rounded-2xl disabled:opacity-60"
                  >
                    {deleting
                      ? (lang === 'he' ? 'מוחק...' : 'Deleting...')
                      : (lang === 'he' ? 'כן, מחק' : 'Yes, Delete')}
                  </button>
                  <button
                    onClick={() => setDeleteConfirming(false)}
                    className="flex-1 py-3 text-sm font-semibold border-2 border-stone-200 text-stone-600 rounded-2xl"
                  >
                    {lang === 'he' ? 'ביטול' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
            {deleteError && (
              <p className="text-xs text-red-600 mt-2">{deleteError}</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-stone-100 last:border-b-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-green-500 rounded-full shrink-0" />
        <h2 className="text-sm font-bold text-stone-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}
