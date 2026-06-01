'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Activity } from '@/types/activity';
import { getSessionId, getCreatorId } from '@/lib/mock-auth';
import { useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

// upload  → extracting → review → saving → batch_done ──(has_more)──→ extracting (loop)
//                                                      ──(done)──────→ done
type Stage = 'upload' | 'extracting' | 'review' | 'saving' | 'batch_done' | 'done';

const SUPPORTED_EXTS = ['.txt', '.md', '.pdf', '.docx'];
const MAX_BYTES = 500_000;

function normTitle(a: Omit<Activity, 'id' | 'created_at'>): string {
  return ((a.title_he ?? a.title ?? '') as string).toLowerCase().trim();
}

function errorKeyForStatus(status: number, isSaving: boolean): string {
  if (status === 413) return 'syllabus.err.file_size';
  if (status === 415) return 'syllabus.err.file_type';
  if (status === 422) return 'syllabus.err.truncation';
  if (status === 503) return 'syllabus.err.ai_unavailable';
  if (status === 502) return 'syllabus.err.ai_error';
  if (status === 500) return isSaving ? 'syllabus.err.save' : 'syllabus.err.server';
  return isSaving ? 'syllabus.err.save' : 'syllabus.err.server';
}

export default function SyllabusPage() {
  const t = useT();

  // ── Stage ─────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('upload');

  // ── File ──────────────────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Chunking ──────────────────────────────────────────────────────────────
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [chunkNum, setChunkNum] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // ── Current batch candidates ──────────────────────────────────────────────
  const [candidates, setCandidates] = useState<Omit<Activity, 'id' | 'created_at'>[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<Set<number>>(new Set());

  // ── Accumulated state across batches ──────────────────────────────────────
  const [allSaved, setAllSaved] = useState<Activity[]>([]);
  const [lastBatchSaved, setLastBatchSaved] = useState<Activity[]>([]);
  // Normalized titles already imported — used for duplicate filtering
  const [importedTitles, setImportedTitles] = useState<Set<string>>(new Set());

  // ── Errors ────────────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function validateAndSetFile(f: File): boolean {
    const name = f.name.toLowerCase();
    if (!SUPPORTED_EXTS.some((ext) => name.endsWith(ext))) {
      setError(t('syllabus.err.file_type'));
      return false;
    }
    if (f.size > MAX_BYTES) {
      setError(t('syllabus.err.file_size'));
      return false;
    }
    setFile(f);
    setError(null);
    return true;
  }

  // ── File picker ───────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const isExtracting = stage === 'extracting';

  function handleDragEnter(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault(); e.stopPropagation();
    if (!isExtracting) setIsDragging(true);
  }
  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault(); e.stopPropagation();
  }
  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }
  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (isExtracting) return;
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    validateAndSetFile(dropped);
  }

  // ── Import chunk ──────────────────────────────────────────────────────────
  async function importChunk(offset: number, batchNum: number) {
    if (!file) return;
    setError(null);
    setStage('extracting');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('offset', String(offset));
    const cid = getCreatorId();
    if (cid) formData.append('creatorId', cid);

    let res: Response;
    try {
      res = await fetch('/api/syllabus?action=import', {
        method: 'POST',
        headers: { 'x-session-id': getSessionId() },
        body: formData,
      });
    } catch {
      setError(t('syllabus.err.network'));
      // Go back to a useful state: upload if first chunk, batch_done if resuming
      setStage(batchNum === 1 ? 'upload' : 'batch_done');
      return;
    }

    let json: {
      activities?: Omit<Activity, 'id' | 'created_at'>[];
      skipped?: number;
      has_more?: boolean;
      next_offset?: number | null;
      message?: string;
      error?: string;
    };
    try {
      json = await res.json();
    } catch {
      setError(t('syllabus.err.server'));
      setStage(batchNum === 1 ? 'upload' : 'batch_done');
      return;
    }

    if (!res.ok) {
      setError(json.message ?? t(errorKeyForStatus(res.status, false)));
      setStage(batchNum === 1 ? 'upload' : 'batch_done');
      return;
    }

    const raw = json.activities ?? [];
    // Filter out titles already imported in previous batches
    const fresh = raw.filter((a) => !importedTitles.has(normTitle(a)));

    setHasMore(json.has_more ?? false);
    setNextOffset(json.next_offset ?? null);
    setSkipped(json.skipped ?? 0);
    setChunkNum(batchNum);
    setCandidates(fresh);
    setSelectedIdx(new Set(fresh.map((_, i) => i)));
    setStage('review');
  }

  function handleImport() {
    importChunk(0, 1);
  }

  function handleNextChunk() {
    if (nextOffset == null) return;
    importChunk(nextOffset, chunkNum + 1);
  }

  // ── Save selected activities ──────────────────────────────────────────────
  async function handleSave() {
    // If nothing selected, just advance without saving
    if (selectedIdx.size === 0) {
      setStage(hasMore ? 'batch_done' : 'done');
      return;
    }

    setError(null);
    setStage('saving');

    const toSave = Array.from(selectedIdx).map((i) => candidates[i]);

    let res: Response;
    try {
      res = await fetch('/api/syllabus?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': getSessionId() },
        body: JSON.stringify({ activities: toSave, creatorId: getCreatorId() }),
      });
    } catch {
      setError(t('syllabus.err.network'));
      setStage('review');
      return;
    }

    let json: { saved?: Activity[]; failed_count?: number; message?: string; error?: string };
    try {
      json = await res.json();
    } catch {
      setError(t('syllabus.err.server'));
      setStage('review');
      return;
    }

    if (!res.ok) {
      setError(json.message ?? t(errorKeyForStatus(res.status, true)));
      setStage('review');
      return;
    }

    const saved = json.saved ?? [];

    // Accumulate imported titles for duplicate filtering in future batches
    setImportedTitles((prev) => {
      const next = new Set(prev);
      saved.forEach((a) => next.add(normTitle(a)));
      return next;
    });
    setAllSaved((prev) => [...prev, ...saved]);
    setLastBatchSaved(saved);

    setStage(hasMore ? 'batch_done' : 'done');
  }

  // ── Selection helpers ─────────────────────────────────────────────────────
  function toggleIndex(i: number) {
    setSelectedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }
  function selectAll() { setSelectedIdx(new Set(candidates.map((_, i) => i))); }
  function deselectAll() { setSelectedIdx(new Set()); }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function reset() {
    setStage('upload');
    setFile(null);
    setIsDragging(false);
    setNextOffset(null);
    setChunkNum(1);
    setHasMore(false);
    setCandidates([]);
    setSkipped(0);
    setSelectedIdx(new Set());
    setAllSaved([]);
    setLastBatchSaved([]);
    setImportedTitles(new Set());
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const totalImported = allSaved.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 px-4 pt-10 pb-24">
        <h1 className="text-2xl font-bold text-white">{t('syllabus.title')}</h1>
        <p className="text-sm text-teal-100 mt-1 leading-snug">{t('syllabus.subtitle')}</p>
      </div>

      <div className="-mt-14 px-4 pb-8 max-w-lg mx-auto space-y-4">
        {/* ── Error banner ── */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl animate-fade-in-up">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            Stage: upload / extracting
            ════════════════════════════════════════════════════════════ */}
        {(stage === 'upload' || stage === 'extracting') && (
          <div className="bg-white rounded-3xl shadow-xl p-5 space-y-4 animate-fade-in-up">
            <label
              htmlFor="syllabus-file"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors select-none',
                isExtracting
                  ? 'border-stone-200 bg-stone-50 opacity-60 pointer-events-none'
                  : isDragging
                    ? 'border-teal-500 bg-teal-100 scale-[1.01]'
                    : file
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-stone-300 bg-stone-50 hover:border-teal-400 hover:bg-teal-50/40 active:bg-stone-100'
              )}
            >
              <span className="text-4xl">{isDragging ? '📥' : file ? '✅' : '📂'}</span>
              <div className="text-center">
                {isDragging ? (
                  <p className="text-sm font-semibold text-teal-800">שחרר כאן</p>
                ) : file ? (
                  <>
                    <p className="text-sm font-semibold text-teal-800">{file.name}</p>
                    <p className="text-xs text-teal-600 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
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
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileChange}
              disabled={isExtracting}
              className="sr-only"
            />
            <button
              onClick={handleImport}
              disabled={!file || isExtracting}
              className={cn(
                'w-full py-4 rounded-2xl font-bold text-base transition-all min-h-[56px] shadow-sm',
                !file || isExtracting
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white shadow-teal-200'
              )}
            >
              {isExtracting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {t('syllabus.extracting')}
                </span>
              ) : (
                t('syllabus.extract')
              )}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            Stage: review
            ════════════════════════════════════════════════════════════ */}
        {stage === 'review' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-xl px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full me-2">
                    {t('syllabus.chunk_label').replace('{n}', String(chunkNum))}
                  </span>
                  <span className="text-sm font-bold text-stone-800">
                    {candidates.length === 0
                      ? t('syllabus.no_new')
                      : t('syllabus.found').replace('{n}', String(candidates.length))}
                  </span>
                </div>
                <button onClick={reset} className="text-xs text-stone-400 underline shrink-0">
                  {t('syllabus.reset')}
                </button>
              </div>

              {/* Progress summary if we've already imported from earlier batches */}
              {totalImported > 0 && (
                <p className="text-xs text-stone-500 mt-1">
                  {t('syllabus.total_imported').replace('{n}', String(totalImported))}
                </p>
              )}
              {skipped > 0 && (
                <p className="text-xs text-stone-400 mt-0.5">
                  ({skipped} פריטים לא מזוהים דולגו)
                </p>
              )}
              {hasMore && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-1.5 mt-2">
                  ⚠ {t('syllabus.has_more')}
                </p>
              )}

              {candidates.length > 0 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={selectAll}
                    className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl hover:bg-teal-100 transition-colors"
                  >
                    {t('syllabus.select_all')}
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl hover:bg-stone-200 transition-colors"
                  >
                    {t('syllabus.deselect_all')}
                  </button>
                </div>
              )}
            </div>

            {/* Activity cards */}
            {candidates.map((activity, i) => {
              const isSelected = selectedIdx.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleIndex(i)}
                  className={cn(
                    'w-full text-start p-4 rounded-3xl transition-all shadow-sm',
                    isSelected
                      ? 'bg-teal-50 border-2 border-teal-500 shadow-teal-100'
                      : 'bg-white border-2 border-stone-200 hover:border-stone-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 shrink-0">{isSelected ? '☑️' : '⬜'}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-semibold text-sm leading-tight',
                          isSelected ? 'text-teal-900' : 'text-stone-800'
                        )}
                        dir="auto"
                      >
                        {activity.title_he ?? activity.title}
                      </p>
                      {(activity.description_he ?? activity.description) && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2" dir="auto">
                          {activity.description_he ?? activity.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {activity.duration_minutes > 0 && (
                          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                            ⏱ {activity.duration_minutes} דק׳
                          </span>
                        )}
                        {activity.energy_level && (
                          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                            {activity.energy_level === 'calm' ? '🔵' : activity.energy_level === 'medium' ? '🟡' : '🔴'}{' '}
                            {activity.energy_level}
                          </span>
                        )}
                        {activity.topics?.slice(0, 2).map((topic) => (
                          <span key={topic} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Action buttons */}
            <button
              onClick={handleSave}
              disabled={candidates.length > 0 && selectedIdx.size === 0 && !hasMore}
              className={cn(
                'w-full py-4 rounded-2xl font-bold text-base transition-all min-h-[56px] shadow-sm sticky bottom-[88px]',
                candidates.length > 0 && selectedIdx.size === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white shadow-teal-200'
              )}
            >
              {selectedIdx.size === 0
                ? (hasMore ? t('syllabus.skip_chunk') : t('syllabus.finish'))
                : t('syllabus.import').replace('{n}', String(selectedIdx.size))}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            Stage: saving
            ════════════════════════════════════════════════════════════ */}
        {stage === 'saving' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center gap-4 animate-fade-in-up">
            <span className="w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
            <p className="text-stone-700 font-semibold text-center">{t('syllabus.importing')}</p>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            Stage: batch_done — shows this batch result + continues
            ════════════════════════════════════════════════════════════ */}
        {stage === 'batch_done' && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-xl p-5">
              {/* Batch summary */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-green-800">
                  {lastBatchSaved.length > 0
                    ? `✅ ${t('syllabus.batch_saved').replace('{n}', String(lastBatchSaved.length))}`
                    : t('syllabus.skip_chunk')}
                </p>
                <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  {t('syllabus.chunk_label').replace('{n}', String(chunkNum))}
                </span>
              </div>
              {totalImported > 0 && (
                <p className="text-sm text-stone-600 mb-3">
                  {t('syllabus.total_imported').replace('{n}', String(totalImported))}
                </p>
              )}

              {/* Saved list for this batch */}
              {lastBatchSaved.length > 0 && (
                <div className="space-y-1 mb-4">
                  {lastBatchSaved.map((activity, i) => (
                    <div
                      key={activity.id ?? i}
                      className="flex items-center justify-between gap-2 py-1.5 border-b border-stone-100 last:border-0"
                    >
                      <p className="text-xs font-medium text-stone-700 flex-1 leading-tight" dir="auto">
                        {activity.title_he ?? activity.title}
                      </p>
                      {activity.id && (
                        <Link href={`/bank/${activity.id}`} className="text-xs text-teal-700 underline shrink-0">
                          {t('syllabus.open')}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Next actions */}
              <div className="space-y-2">
                {hasMore && (
                  <button
                    onClick={handleNextChunk}
                    className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-sm"
                  >
                    {t('syllabus.import_more')}
                  </button>
                )}
                <button
                  onClick={() => setStage('done')}
                  className={cn(
                    'w-full py-3 rounded-2xl font-semibold text-sm transition-colors',
                    hasMore
                      ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                  )}
                >
                  {t('syllabus.finish')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            Stage: done — final summary
            ════════════════════════════════════════════════════════════ */}
        {stage === 'done' && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-xl p-5">
              <p className="text-base font-bold text-green-800 mb-3">
                {t('syllabus.done').replace('{n}', String(allSaved.length))}
              </p>
              <div className="space-y-1.5">
                {allSaved.map((activity, i) => (
                  <div
                    key={activity.id ?? i}
                    className="flex items-center justify-between gap-2 py-2 border-b border-stone-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-stone-800 flex-1 leading-tight" dir="auto">
                      {activity.title_he ?? activity.title}
                    </p>
                    {activity.id && (
                      <Link href={`/bank/${activity.id}`} className="text-xs text-teal-700 underline shrink-0">
                        {t('syllabus.open')}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/bank"
              className="block text-center w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base hover:bg-teal-700 transition-colors shadow-sm"
            >
              {t('syllabus.go_bank')}
            </Link>

            <button
              onClick={reset}
              className="block w-full text-center py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold text-sm hover:bg-stone-200 transition-colors"
            >
              {t('syllabus.new_upload')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
