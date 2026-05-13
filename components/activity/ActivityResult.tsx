'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';
import { FeedbackWidget } from './FeedbackWidget';
import { useLanguage, useT } from '@/components/layout/LanguageProvider';
import { getTitle, getDescription, getInstructions, getWhyItWorks, getVariations, translateMaterials } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ResultSlot {
  labelKey: string;
  emoji: string;
  labelColor: string;
  activity: Activity;
  isFallback?: boolean;
}

interface ActivityResultProps {
  safest: Activity;
  most_fun?: Activity;
  most_educational?: Activity;
  source: 'bank' | 'ai';
  rateLimited?: boolean;
  safest_fallback?: boolean;
  fun_fallback?: boolean;
  edu_fallback?: boolean;
  requested_duration?: number;
}

const ENERGY_DOT: Record<string, string> = {
  calm:      '🔵',
  medium:    '🟡',
  energetic: '🔴',
};

export function ActivityResult({
  safest,
  most_fun,
  most_educational,
  source,
  rateLimited,
  safest_fallback,
  fun_fallback,
  edu_fallback,
}: ActivityResultProps) {
  const t = useT();

  const slots: ResultSlot[] = [
    { labelKey: 'result.safest',   emoji: '🛡️', labelColor: 'bg-green-100 text-green-800',  activity: safest,           isFallback: safest_fallback },
    ...(most_fun        ? [{ labelKey: 'result.most_fun', emoji: '🎉', labelColor: 'bg-orange-100 text-orange-800', activity: most_fun,        isFallback: fun_fallback }] : []),
    ...(most_educational? [{ labelKey: 'result.most_edu', emoji: '📚', labelColor: 'bg-blue-100 text-blue-800',    activity: most_educational, isFallback: edu_fallback }] : []),
  ];

  const resultCount = slots.length;

  return (
    <div className="space-y-3">
      {/* Source badge + rate limit notice */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-500">
          {source === 'bank' ? t('result.from_bank') : t('result.ai_generated')}
        </span>
        {resultCount < 3 && (
          <span className="text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded-full">
            {resultCount} {t('common.options')}
          </span>
        )}
        {rateLimited && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
            {t('result.rate_limited')}
          </span>
        )}
      </div>

      {slots.map((slot) => (
        <ResultCard key={slot.labelKey} slot={slot} />
      ))}
    </div>
  );
}

function ResultCard({ slot }: { slot: ResultSlot }) {
  const [expanded, setExpanded] = useState(false);
  const { lang } = useLanguage();
  const t = useT();
  const { activity } = slot;
  const materials = translateMaterials(activity.materials, lang);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <button onClick={() => setExpanded((v) => !v)} className="w-full text-start p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', slot.labelColor)}>
            {slot.emoji} {t(slot.labelKey)}
          </span>
          <span className="mr-auto text-stone-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>

        {slot.isFallback && (
          <p className="text-xs text-amber-600 mb-1.5">{t('result.fallback')}</p>
        )}

        <h3 className="font-semibold text-stone-900 text-base leading-tight mb-1" dir="auto">
          {getTitle(activity, lang)}
        </h3>
        <p className="text-xs text-stone-500 line-clamp-2" dir="auto">
          {getDescription(activity, lang)}
        </p>

        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs text-stone-400">{ENERGY_DOT[activity.energy_level]}</span>
          <span className="text-xs text-stone-400">
            ⏱ {activity.duration_minutes}{lang === 'he' ? ' דק׳' : ' min'}
          </span>
          {materials.length === 0 && (
            <span className="text-xs text-stone-400">{t('result.no_equipment')}</span>
          )}
          {activity.hebrew_element && (
            <span className="text-xs text-stone-400">{t('result.hebrew_badge')}</span>
          )}
          {activity.topics && activity.topics.length > 0 && (
            <span className="text-xs text-violet-500">🏷️ {activity.topics[0]}</span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4">
          {materials.length > 0 && (
            <div className="mt-3 mb-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                {t('result.equipment')}
              </p>
              <p className="text-sm text-stone-700" dir="auto">{materials.join(', ')}</p>
            </div>
          )}

          <div className="mt-3 mb-3">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
              {t('result.instructions')}
            </p>
            <div className="text-sm text-stone-700 space-y-1">
              {getInstructions(activity, lang)
                .split('\n')
                .filter(Boolean)
                .map((line, i) => (
                  <p key={i} dir="auto">{line}</p>
                ))}
            </div>
          </div>

          {getWhyItWorks(activity, lang) && (
            <p className="text-xs text-stone-500 italic mt-2 mb-2" dir="auto">
              💡 {getWhyItWorks(activity, lang)}
            </p>
          )}

          {activity.safety_notes && (
            <div className="mt-3 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-bold text-amber-800 mb-1">{t('result.safety')}</p>
              <p className="text-xs text-amber-900" dir="auto">{activity.safety_notes}</p>
            </div>
          )}

          {activity.hebrew_element && (
            <div className="mt-2 mb-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-bold text-blue-800 mb-1">{t('result.hebrew_el')}</p>
              <p className="text-xs text-blue-900" dir="auto">{activity.hebrew_element}</p>
            </div>
          )}

          {activity.variations.length > 0 && (
            <div className="mt-3 mb-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                {t('result.variation')}
              </p>
              <div className="ps-3 border-s-2 border-violet-200">
                <p className="text-xs font-semibold text-stone-700" dir="auto">
                  {getVariations(activity, lang)[0]?.name}
                </p>
                <p className="text-xs text-stone-500 mt-0.5" dir="auto">
                  {getVariations(activity, lang)[0]?.description}
                </p>
              </div>
            </div>
          )}

          {activity.id && (
            <FeedbackWidget
              activityId={activity.id}
              counts={{
                worked_well: activity.feedback_worked_well ?? 0,
                too_chaotic: activity.feedback_too_chaotic ?? 0,
                too_boring:  activity.feedback_too_boring  ?? 0,
                run_again:   activity.feedback_run_again   ?? 0,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
