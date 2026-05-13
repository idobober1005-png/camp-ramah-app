'use client';

import Link from 'next/link';
import { Activity } from '@/types/activity';
import { useLanguage } from '@/components/layout/LanguageProvider';
import { getTitle, getDescription } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const ENERGY_CONFIG = {
  calm:      { he: 'שקט',   en: 'Calm',      chip: 'bg-blue-100 text-blue-700',    border: 'border-s-4 border-s-blue-400' },
  medium:    { he: 'בינוני', en: 'Medium',    chip: 'bg-amber-100 text-amber-700',  border: 'border-s-4 border-s-amber-400' },
  energetic: { he: 'פראי',  en: 'Energetic', chip: 'bg-rose-100 text-rose-700',    border: 'border-s-4 border-s-rose-400' },
};

const LOCATION_ICON: Record<string, string> = {
  indoor:     '🏠',
  outdoor:    '🌳',
  waterfront: '🌊',
  cabin:      '🛖',
  field:      '⛳',
  any:        '📍',
};

interface ActivityCardProps {
  activity: Activity;
  compact?: boolean;
  className?: string;
}

export function ActivityCard({ activity, compact = false, className }: ActivityCardProps) {
  const { lang } = useLanguage();
  const energy = ENERGY_CONFIG[activity.energy_level] ?? ENERGY_CONFIG.medium;

  return (
    <Link
      href={`/bank/${activity.id}`}
      className={cn(
        'block bg-white rounded-3xl shadow-[0_2px_14px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-all active:scale-[0.99] p-4 overflow-hidden',
        energy.border,
        className
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-bold text-stone-900 text-[15px] leading-tight flex-1" dir="auto">
          {getTitle(activity, lang)}
        </h3>
        {activity.hebrew_element && (
          <span className="text-base shrink-0" title="כולל אלמנט עברי">✡️</span>
        )}
      </div>

      {/* Description */}
      {!compact && (
        <p className="text-xs text-stone-500 mb-3 line-clamp-2 leading-relaxed" dir="auto">
          {getDescription(activity, lang)}
        </p>
      )}

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', energy.chip)}>
          {energy[lang] ?? energy.he}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-500">
          {LOCATION_ICON[activity.location]}
        </span>
        {activity.duration_minutes > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium">
            ⏱ {activity.duration_minutes}{lang === 'he' ? ' דק׳' : ' min'}
          </span>
        )}
        {(activity.feedback_worked_well ?? 0) > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold ms-auto">
            ✅ {activity.feedback_worked_well}
          </span>
        )}
      </div>

      {/* Topics */}
      {!compact && activity.topics && activity.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {activity.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="text-xs bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full font-medium">
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {!compact && activity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {activity.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-stone-300">#{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
