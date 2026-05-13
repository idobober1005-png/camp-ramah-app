'use client';

import { useState } from 'react';
import { EmergencyForm } from '@/components/forms/EmergencyForm';
import { ActivityResult } from '@/components/activity/ActivityResult';
import { EmergencyParams, Activity } from '@/types/activity';
import { getSessionId } from '@/lib/mock-auth';
import { useT } from '@/components/layout/LanguageProvider';

interface EmergencyState {
  source: 'bank' | 'ai';
  safest?: Activity;
  most_fun?: Activity;
  most_educational?: Activity;
  safest_fallback?: boolean;
  fun_fallback?: boolean;
  edu_fallback?: boolean;
  requested_duration?: number;
  rate_limited?: boolean;
  ai_unavailable?: boolean;
  error?: string;
}

export default function EmergencyPage() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmergencyState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(params: EmergencyParams) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params, sessionId: getSessionId() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(res.status === 429 ? t('emergency.err.rate_limit') : t('emergency.err.generic'));
        return;
      }

      if (json.ai_unavailable && !json.safest) {
        setError(t('emergency.err.no_match'));
        return;
      }

      setResult(json);
    } catch (e) {
      const isNetworkError = e instanceof TypeError && e.message.toLowerCase().includes('fetch');
      setError(isNetworkError ? t('emergency.err.network') : t('emergency.err.generic'));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  const resultCount = result
    ? 1 + (result.most_fun ? 1 : 0) + (result.most_educational ? 1 : 0)
    : 0;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-red-800 to-red-600 px-4 pt-10 pb-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl leading-none">🚨</span>
            <h1 className="text-2xl font-extrabold text-white">{t('emergency.title')}</h1>
          </div>
          <p className="text-red-200 text-sm">{t('emergency.subtitle')}</p>
        </div>
      </div>

      {/* ── Floating content ──────────────────────────────────────── */}
      <div className="-mt-14 px-4 pb-8 max-w-lg mx-auto">

        {/* Error state */}
        {error && (
          <div className="mb-3 p-4 bg-white rounded-2xl shadow-lg border-l-4 border-l-red-500">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button onClick={reset} className="text-xs text-red-600 font-semibold mt-2">
              {t('emergency.try_again')}
            </button>
          </div>
        )}

        {/* Results */}
        {result && result.safest ? (
          <div className="animate-fade-in-up">
            {result.ai_unavailable && (
              <div className="mb-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
                <p className="text-sm text-amber-800">{t('emergency.ai_unavailable')}</p>
              </div>
            )}
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-extrabold text-stone-800">
                {resultCount} {t('common.options')}
              </h2>
              <button onClick={reset} className="text-sm text-red-600 font-semibold">
                {t('emergency.new_search')}
              </button>
            </div>
            <ActivityResult
              safest={result.safest}
              most_fun={result.most_fun}
              most_educational={result.most_educational}
              source={result.source}
              rateLimited={result.rate_limited}
              safest_fallback={result.safest_fallback}
              fun_fallback={result.fun_fallback}
              edu_fallback={result.edu_fallback}
              requested_duration={result.requested_duration}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 shadow-xl">
            <EmergencyForm onSubmit={handleSubmit} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
}
