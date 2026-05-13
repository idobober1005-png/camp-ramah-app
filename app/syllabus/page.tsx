'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Activity } from '@/types/activity';
import { getSessionId } from '@/lib/mock-auth';
import { useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

type Stage = 'upload' | 'objectives' | 'generating' | 'results';

const ACCEPTED_TYPES = '.pdf,.docx,.txt,.md';

export default function SyllabusPage() {
  const t = useT();
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setError(null);
    }
  }

  async function handleExtract() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/syllabus?action=extract', {
        method: 'POST',
        headers: { 'x-session-id': getSessionId() },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t('syllabus.err.extract'));
        return;
      }
      setObjectives(json.objectives ?? []);
      setSelected(json.objectives ?? []);
      setStage('objectives');
    } catch {
      setError(t('syllabus.err.network'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (selected.length === 0) return;
    setLoading(true);
    setError(null);
    setStage('generating');

    try {
      const res = await fetch('/api/syllabus?action=generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getSessionId(),
        },
        body: JSON.stringify({ objectives: selected }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t('syllabus.err.generate'));
        setStage('objectives');
        return;
      }
      setActivities(json.activities ?? []);
      setStage('results');
    } catch {
      setError(t('syllabus.err.network'));
      setStage('objectives');
    } finally {
      setLoading(false);
    }
  }

  function toggleObjective(obj: string) {
    setSelected((prev) =>
      prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]
    );
  }

  function reset() {
    setStage('upload');
    setFile(null);
    setObjectives([]);
    setSelected([]);
    setActivities([]);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="px-4 pt-5 pb-8 max-w-lg mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-stone-900">{t('syllabus.title')}</h1>
        <p className="text-sm text-stone-500 mt-1">{t('syllabus.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Stage: upload ── */}
      {stage === 'upload' && (
        <div className="space-y-4">
          <label
            htmlFor="syllabus-file"
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors',
              file
                ? 'border-green-400 bg-green-50'
                : 'border-stone-300 bg-stone-50 hover:border-stone-400'
            )}
          >
            <span className="text-4xl">{file ? '✅' : '📂'}</span>
            <div className="text-center">
              {file ? (
                <>
                  <p className="text-sm font-semibold text-green-800">{file.name}</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-stone-700">{t('syllabus.choose_file')}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{t('syllabus.file_hint')}</p>
                </>
              )}
            </div>
          </label>
          <input
            id="syllabus-file"
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            className="sr-only"
          />

          <button
            onClick={handleExtract}
            disabled={!file || loading}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-base transition-all min-h-[56px] shadow-sm',
              !file || loading
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white shadow-green-200'
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block">⏳</span>
                {t('syllabus.extracting')}
              </span>
            ) : (
              t('syllabus.extract')
            )}
          </button>
        </div>
      )}

      {/* ── Stage: objectives ── */}
      {stage === 'objectives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-stone-700">
              {t('syllabus.objectives_found').replace('{n}', String(objectives.length))}
            </p>
            <button onClick={reset} className="text-xs text-stone-400 underline">
              {t('syllabus.reset')}
            </button>
          </div>

          <div className="space-y-2">
            {objectives.map((obj) => (
              <button
                key={obj}
                onClick={() => toggleObjective(obj)}
                className={cn(
                  'w-full text-start px-4 py-3 rounded-xl border-2 text-sm transition-colors',
                  selected.includes(obj)
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                )}
              >
                <span className="me-2">{selected.includes(obj) ? '☑️' : '⬜'}</span>
                {obj}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={selected.length === 0}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-base transition-all min-h-[56px] shadow-sm',
              selected.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white shadow-violet-200'
            )}
          >
            {t('syllabus.generate').replace('{n}', String(selected.length))}
          </button>
        </div>
      )}

      {/* ── Stage: generating ── */}
      {stage === 'generating' && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="text-5xl animate-spin">⚙️</span>
          <p className="text-stone-600 font-medium">
            {t('syllabus.generating').replace('{n}', String(selected.length))}
          </p>
          <p className="text-xs text-stone-400">
            {t('syllabus.time_est').replace('{n}', String(selected.length * 5))}
          </p>
        </div>
      )}

      {/* ── Stage: results ── */}
      {stage === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-green-800">
              {t('syllabus.done').replace('{n}', String(activities.length))}
            </p>
            <button onClick={reset} className="text-xs text-stone-400 underline">
              {t('syllabus.new_upload')}
            </button>
          </div>

          {activities.map((activity, i) => (
            <div
              key={activity.id ?? i}
              className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-stone-900 text-sm leading-tight flex-1" dir="auto">
                  {activity.title_he ?? activity.title}
                </h3>
                {activity.id && (
                  <Link
                    href={`/bank/${activity.id}`}
                    className="text-xs text-green-700 underline shrink-0"
                  >
                    {t('syllabus.open')}
                  </Link>
                )}
              </div>
              <p className="text-xs text-stone-500 line-clamp-2" dir="auto">
                {activity.description_he ?? activity.description}
              </p>
              {activity.topics && activity.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activity.topics.slice(0, 3).map((topic) => (
                    <span key={topic} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/bank"
            className="block text-center w-full py-3 rounded-2xl bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200 transition-colors"
          >
            {t('syllabus.go_bank')}
          </Link>
        </div>
      )}
    </div>
  );
}
