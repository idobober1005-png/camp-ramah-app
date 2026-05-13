'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Activity, EnergyLevel, Location, TOPIC_OPTIONS } from '@/types/activity';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { useLanguage, useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

export default function BankPage() {
  const t = useT();
  const { lang } = useLanguage();

  const ENERGY_FILTERS: { value: EnergyLevel | ''; label: string }[] = [
    { value: '', label: t('bank.all_levels') },
    { value: 'calm', label: t('activity.energy.calm') },
    { value: 'medium', label: t('activity.energy.medium') },
    { value: 'energetic', label: t('activity.energy.energetic') },
  ];

  const LOCATION_FILTERS: { value: Location | ''; label: string }[] = [
    { value: '', label: t('bank.all_locs') },
    { value: 'indoor', label: t('activity.loc.indoor') },
    { value: 'outdoor', label: t('activity.loc.outdoor') },
    { value: 'waterfront', label: t('activity.loc.waterfront') },
    { value: 'cabin', label: t('activity.loc.cabin') },
    { value: 'field', label: t('activity.loc.field') },
  ];

  const DURATION_FILTERS: { value: number | ''; label: string }[] = [
    { value: '', label: t('bank.all_times') },
    { value: 5, label: t('bank.dur.5') },
    { value: 15, label: t('bank.dur.15') },
    { value: 30, label: t('bank.dur.30') },
    { value: 60, label: t('bank.dur.60') },
  ];

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel | ''>('');
  const [location, setLocation] = useState<Location | ''>('');
  const [durationMax, setDurationMax] = useState<number | ''>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (energy) params.set('energy_level', energy);
    if (location) params.set('location', location);
    if (durationMax) params.set('duration_max', String(durationMax));
    if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));

    try {
      const res = await fetch(`/api/activities?${params}`);
      const json = await res.json();
      setActivities(json.activities ?? []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [search, energy, location, durationMax, selectedTopics]);

  useEffect(() => {
    const timer = setTimeout(fetchActivities, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchActivities, search]);

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function clearFilters() {
    setSearch('');
    setEnergy('');
    setLocation('');
    setDurationMax('');
    setSelectedTopics([]);
  }

  const hasFilters = search || energy || location || durationMax || selectedTopics.length > 0;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-sky-700 to-blue-600 px-4 pt-10 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-sky-300 text-xs font-extrabold uppercase tracking-widest mb-1">📋</p>
              <h1 className="text-2xl font-extrabold text-white">{t('bank.title')}</h1>
            </div>
            <Link
              href="/bank/add"
              className="flex items-center gap-1.5 text-sm font-bold text-sky-700 bg-white px-4 py-2 rounded-full shadow-lg hover:bg-sky-50 transition-colors active:scale-95"
            >
              <span>+</span>
              <span>{t('bank.add')}</span>
            </Link>
          </div>

          {/* Search bar in hero */}
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('bank.search')}
              className="w-full ps-9 pe-4 py-3.5 rounded-2xl bg-white text-sm focus:outline-none focus:ring-4 focus:ring-white/30 shadow-sm text-stone-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Floating content ──────────────────────────────────────── */}
      <div className="-mt-10 px-4 pb-6 max-w-lg mx-auto">

        {/* Filter card */}
        <div className="bg-white rounded-3xl p-4 shadow-lg mb-3">
          <div className="space-y-2">
            <FilterRow
              options={ENERGY_FILTERS}
              active={energy}
              onSelect={(v) => setEnergy(v as EnergyLevel | '')}
            />
            <FilterRow
              options={LOCATION_FILTERS}
              active={location}
              onSelect={(v) => setLocation(v as Location | '')}
            />
            <FilterRow
              options={DURATION_FILTERS}
              active={String(durationMax)}
              onSelect={(v) => setDurationMax(v === '' ? '' : parseInt(v))}
            />
          </div>

          {/* Topic filter */}
          <div className="mt-3 pt-3 border-t border-stone-100">
            <button
              onClick={() => setShowTopics((v) => !v)}
              className="flex items-center gap-2 text-xs font-bold text-stone-500"
            >
              <span>{t('bank.topics')}</span>
              <span className="text-stone-300">{showTopics ? '▲' : '▼'}</span>
              {selectedTopics.length > 0 && (
                <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  {selectedTopics.length} {t('common.selected')}
                </span>
              )}
            </button>
            {showTopics && (
              <div className="flex flex-wrap gap-2 pt-3">
                {TOPIC_OPTIONS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      'px-3 py-1 rounded-full border text-xs font-semibold transition-colors',
                      selectedTopics.includes(topic)
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs text-sky-600 font-semibold"
            >
              ✕ {t('bank.clear')}
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white/70 rounded-3xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 shadow-md text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-stone-500 text-sm font-medium">{t('bank.empty')}</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sky-600 text-sm font-semibold mt-3">
                {t('bank.clear_link')}
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">
              {activities.length} {lang === 'he' ? 'פעילויות' : 'activities'}
            </p>
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterRow({
  options,
  active,
  onSelect,
}: {
  options: { value: string | number; label: string }[];
  active: string | number;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onSelect(String(opt.value))}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
            String(active) === String(opt.value)
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
