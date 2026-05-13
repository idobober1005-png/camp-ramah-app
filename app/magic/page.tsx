'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, MagicParams, TOPIC_OPTIONS, EQUIPMENT_OPTIONS } from '@/types/activity';
import { ActivityDetail } from '@/components/activity/ActivityDetail';
import { getSessionId, getCreatorId, getMockUser, AGE_GROUPS } from '@/lib/mock-auth';
import { useLanguage, useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

const EXAMPLE_TASKS_HE = [
  'לחכות 10 דקות לפני חדר האוכל',
  'לסדר את הצריף לפני ביקורת',
  'ללכת בשקט ממקום למקום',
  'לארגן תיקים לפני האגם',
  'לחזור על כללי בטיחות',
  'להתכונן לישון',
];

const EXAMPLE_TASKS_EN = [
  'Waiting 10 minutes before the dining hall',
  'Tidying the cabin before inspection',
  'Walking quietly from place to place',
  'Packing bags before the waterfront',
  'Reviewing safety rules',
  'Getting ready for bed',
];

type PageState = 'form' | 'loading' | 'result' | 'error';

interface ResultState {
  activity: Activity;
  saved: boolean;
}

export default function MagicPage() {
  const t = useT();
  const { lang } = useLanguage();
  const mockUser = getMockUser();
  const EXAMPLE_TASKS = lang === 'en' ? EXAMPLE_TASKS_EN : EXAMPLE_TASKS_HE;

  const [task, setTask] = useState('');
  const [ageGroup, setAgeGroup] = useState(mockUser.defaultAgeGroup);
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [energy, setEnergy] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [showContext, setShowContext] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const [pageState, setPageState] = useState<PageState>('form');
  const [result, setResult] = useState<ResultState | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const LOCATION_OPTIONS = [
    { value: 'any',        label: t('activity.loc.any') },
    { value: 'cabin',      label: t('activity.loc.cabin') },
    { value: 'indoor',     label: t('activity.loc.indoor') },
    { value: 'outdoor',    label: t('activity.loc.outdoor') },
    { value: 'field',      label: t('activity.loc.field') },
    { value: 'waterfront', label: t('activity.loc.waterfront') },
  ];

  const DURATION_OPTIONS = [
    { value: 5,  label: t('magic.dur.5') },
    { value: 10, label: t('magic.dur.10') },
    { value: 15, label: t('magic.dur.15') },
    { value: 30, label: t('magic.dur.30') },
    { value: 60, label: t('magic.dur.60') },
  ];

  const ENERGY_OPTIONS = [
    { value: 'calm',      label: t('magic.energy.calm') },
    { value: 'medium',    label: t('magic.energy.medium') },
    { value: 'energetic', label: t('magic.energy.energetic') },
  ];

  function toggleEquipment(val: string) {
    setEquipment((prev) =>
      prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val]
    );
  }

  function toggleTopic(topic: string) {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function reset() {
    setPageState('form');
    setResult(null);
    setErrorMsg('');
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = task.trim();
    if (!trimmed) return;

    setPageState('loading');
    setResult(null);
    setErrorMsg('');

    const params: MagicParams = {
      task: trimmed,
      age_group: ageGroup || undefined,
      location: location || undefined,
      duration_minutes: duration ?? undefined,
      energy_level: energy || undefined,
      equipment_available: equipment.length > 0 ? equipment : undefined,
      topics: topics.length > 0 ? topics : undefined,
    };

    try {
      const res = await fetch('/api/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params,
          sessionId: getSessionId(),
          creatorId: getCreatorId(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMsg(json.message ?? t('magic.err.limit'));
        } else if (res.status === 503) {
          setErrorMsg(t('magic.err.unavailable'));
        } else {
          setErrorMsg(json.message ?? t('magic.err.generic'));
        }
        setPageState('error');
        return;
      }

      setResult({ activity: json.activity, saved: json.saved ?? false });
      setPageState('result');
    } catch (err) {
      const isNetworkErr = err instanceof TypeError && String(err).includes('fetch');
      setErrorMsg(isNetworkErr ? t('magic.err.network') : t('magic.err.generic'));
      setPageState('error');
    }
  }

  // ── Loading ───────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div>
        <div className="bg-gradient-to-br from-violet-700 to-purple-600 px-4 pt-10 pb-24">
          <div className="max-w-lg mx-auto">
            <p className="text-violet-300 text-xs font-extrabold uppercase tracking-widest mb-1">MAGIC ✨</p>
            <h1 className="text-2xl font-extrabold text-white">{t('magic.title')}</h1>
          </div>
        </div>
        <div className="-mt-14 px-4 max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-xl flex flex-col items-center text-center">
            <div className="relative w-20 h-20 flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full bg-violet-200 animate-ping opacity-50" />
              <div className="relative text-4xl">✨</div>
            </div>
            <h2 className="text-lg font-extrabold text-stone-900 mb-1">{t('magic.loading.title')}</h2>
            <p className="text-sm text-stone-400">{t('magic.loading.sub')}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div>
        <div className="bg-gradient-to-br from-violet-700 to-purple-600 px-4 pt-10 pb-24">
          <div className="max-w-lg mx-auto">
            <p className="text-violet-300 text-xs font-extrabold uppercase tracking-widest mb-1">MAGIC ✨</p>
            <h1 className="text-2xl font-extrabold text-white">{t('magic.title')}</h1>
          </div>
        </div>
        <div className="-mt-14 px-4 pb-6 max-w-lg mx-auto animate-fade-in-up">
          <div className="bg-white rounded-3xl p-5 shadow-xl">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl mb-4">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
            <button
              onClick={reset}
              className="w-full py-3.5 bg-green-700 text-white font-bold rounded-2xl text-sm active:scale-[0.98] transition-all shadow-lg shadow-green-900/15"
            >
              {t('magic.try_again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────
  if (pageState === 'result' && result) {
    return (
      <div className="animate-fade-in-up">
        {/* Action bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-stone-100 px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={reset}
            className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            {t('magic.try_again')}
          </button>

          <div className="flex items-center gap-2">
            {result.saved && result.activity.id ? (
              <>
                <span className="text-xs text-emerald-700 flex items-center gap-1">
                  {t('magic.saved')}
                </span>
                <Link
                  href={`/bank/${result.activity.id}`}
                  className="text-sm font-medium text-green-700 border border-green-600 rounded-lg px-3 py-1 hover:bg-green-50"
                >
                  {t('magic.view_bank')}
                </Link>
              </>
            ) : (
              <span className="text-xs text-stone-400">{t('magic.not_saved')}</span>
            )}
          </div>
        </div>

        {/* Original task chip */}
        <div className="px-4 pt-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-stone-400">{t('magic.original_task')}</span>
            <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full font-medium">
              {task}
            </span>
          </div>
        </div>

        <ActivityDetail activity={result.activity} />
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-700 to-purple-600 px-4 pt-10 pb-24">
        <div className="max-w-lg mx-auto">
          <p className="text-violet-300 text-xs font-extrabold uppercase tracking-widest mb-1">MAGIC ✨</p>
          <h1 className="text-2xl font-extrabold text-white">{t('magic.title')}</h1>
          <p className="text-violet-200 text-sm mt-1">{t('magic.subtitle')}</p>
        </div>
      </div>

      {/* Floating form card */}
      <div className="-mt-14 px-4 pb-10 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-5 shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Main input */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-stone-700 mb-2">
                {t('magic.input_label')}
              </label>
              <textarea
                rows={4}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder={t('magic.placeholder')}
                dir="auto"
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-white text-stone-900 resize-none transition-all"
                autoFocus
              />
            </div>

            {/* Example task chips */}
            <div className="mb-5">
              <p className="text-xs font-bold text-stone-400 mb-2">{t('magic.examples')}</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_TASKS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setTask(ex)}
                    className="text-xs bg-white text-stone-600 border border-stone-200 shadow-sm px-3 py-1.5 rounded-full hover:border-violet-300 hover:text-violet-700 active:scale-95 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Context section — collapsible */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => setShowContext((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>⚙️</span>
                  <span>{t('magic.context')}</span>
                  {(ageGroup || location || duration || energy || equipment.length > 0 || topics.length > 0) && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-normal">{t('magic.context_set')}</span>
                  )}
                </span>
                <span className="text-stone-400 text-xs">{showContext ? '▲' : '▼'}</span>
              </button>

              {showContext && (
                <div className="space-y-4 pt-4 pb-3 px-3 mt-2 bg-stone-50 rounded-2xl border border-stone-100">

                  {/* Age group */}
                  <div>
                    <p className="text-xs font-extrabold text-stone-400 uppercase tracking-wide mb-2">{t('magic.age_group')}</p>
                    <div className="flex flex-wrap gap-2">
                      {AGE_GROUPS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setAgeGroup(ageGroup === g.value ? '' : g.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all',
                            ageGroup === g.value
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
                          )}
                        >
                          {lang === 'en' ? g.en : g.he}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-extrabold text-stone-400 uppercase tracking-wide mb-2">{t('magic.location')}</p>
                    <div className="flex flex-wrap gap-2">
                      {LOCATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setLocation(location === opt.value ? '' : opt.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all',
                            location === opt.value
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-xs font-extrabold text-stone-400 uppercase tracking-wide mb-2">{t('magic.duration')}</p>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDuration(duration === opt.value ? null : opt.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all',
                            duration === opt.value
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Energy */}
                  <div>
                    <p className="text-xs font-extrabold text-stone-400 uppercase tracking-wide mb-2">{t('magic.energy')}</p>
                    <div className="flex gap-2">
                      {ENERGY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEnergy(energy === opt.value ? '' : opt.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all',
                            energy === opt.value
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <p className="text-xs font-extrabold text-stone-400 uppercase tracking-wide mb-2">{t('magic.equipment')}</p>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_OPTIONS.map((eq) => (
                        <button
                          key={eq.value}
                          type="button"
                          onClick={() => toggleEquipment(eq.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all',
                            equipment.includes(eq.value)
                              ? 'bg-stone-800 text-white border-stone-800'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                          )}
                        >
                          {eq.icon} {eq.value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topics */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowTopics((v) => !v)}
                      className="flex items-center gap-2 text-xs font-extrabold text-stone-400 uppercase tracking-wide mb-2"
                    >
                      <span>{t('magic.topics')}</span>
                      <span>{showTopics ? '▲' : '▼'}</span>
                      {topics.length > 0 && (
                        <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full normal-case">
                          {topics.length}
                        </span>
                      )}
                    </button>
                    {showTopics && (
                      <div className="flex flex-wrap gap-2">
                        {TOPIC_OPTIONS.map((topic) => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => toggleTopic(topic)}
                            className={cn(
                              'px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all',
                              topics.includes(topic)
                                ? 'bg-violet-600 text-white border-violet-600'
                                : 'bg-white text-stone-600 border-stone-200'
                            )}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!task.trim()}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-900/20 active:scale-[0.98] transition-all"
            >
              {t('magic.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
