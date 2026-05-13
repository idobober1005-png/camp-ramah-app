'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, EnergyLevel, Location, CoordinationLevel, TOPIC_OPTIONS, EQUIPMENT_OPTIONS } from '@/types/activity';
import { getCreatorId } from '@/lib/mock-auth';
import { useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

interface Variation { name: string; description: string; }

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-stone-900';
const textareaCls = inputCls + ' resize-none';

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-stone-700 mb-1">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {hint && <p className="text-xs text-stone-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide mt-6 mb-3 pb-1 border-b border-stone-100">
      {children}
    </h2>
  );
}

export function ActivityEditForm({ activity }: { activity: Activity }) {
  const t = useT();
  const router = useRouter();

  const [title_he, setTitleHe] = useState(activity.title_he ?? '');
  const [description_he, setDescriptionHe] = useState(activity.description_he ?? '');
  const [instructions_he, setInstructionsHe] = useState(activity.instructions_he ?? '');
  const [why_it_works_he, setWhyHe] = useState(activity.why_it_works_he ?? '');
  const [educational_goal_he, setGoalHe] = useState(activity.educational_goal_he ?? '');
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description);
  const [instructions, setInstructions] = useState(activity.instructions);
  const [duration_minutes, setDuration] = useState(String(activity.duration_minutes));
  const [energy_level, setEnergy] = useState<EnergyLevel>(activity.energy_level);
  const [location, setLocation] = useState<Location>(activity.location);
  const [group_size_min, setGroupMin] = useState(activity.group_size_min ? String(activity.group_size_min) : '');
  const [group_size_max, setGroupMax] = useState(activity.group_size_max ? String(activity.group_size_max) : '');
  const [age_min, setAgeMin] = useState(activity.age_min ? String(activity.age_min) : '');
  const [age_max, setAgeMax] = useState(activity.age_max ? String(activity.age_max) : '');
  const [hebrew_element, setHebrewElement] = useState(activity.hebrew_element ?? '');
  const [safety_notes, setSafetyNotes] = useState(activity.safety_notes ?? '');
  const [topics, setTopics] = useState<string[]>(activity.topics ?? []);
  const [materials, setMaterials] = useState<string[]>(activity.materials ?? []);
  const [newMaterial, setNewMaterial] = useState('');
  const [counselors_min, setCounselorsMin] = useState(activity.counselors_min ? String(activity.counselors_min) : '');
  const [location_type, setLocationType] = useState(activity.location_type ?? '');
  const [coordination_level, setCoordination] = useState<CoordinationLevel | ''>(activity.coordination_level ?? '');
  const [variations, setVariations] = useState<Variation[]>(
    (activity.variations_he && activity.variations_he.length > 0
      ? activity.variations_he
      : activity.variations) ?? []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const ENERGY_OPTIONS: { value: EnergyLevel; label: string }[] = [
    { value: 'calm', label: t('activity.energy.calm') },
    { value: 'medium', label: t('activity.energy.medium') },
    { value: 'energetic', label: t('activity.energy.energetic') },
  ];

  const LOCATION_OPTIONS: { value: Location; label: string }[] = [
    { value: 'indoor', label: t('activity.loc.indoor') },
    { value: 'outdoor', label: t('activity.loc.outdoor') },
    { value: 'waterfront', label: t('activity.loc.waterfront') },
    { value: 'cabin', label: t('activity.loc.cabin') },
    { value: 'field', label: t('activity.loc.field') },
    { value: 'any', label: t('activity.loc.any') },
  ];

  const COORDINATION_OPTIONS: { value: CoordinationLevel; label: string }[] = [
    { value: 'none', label: t('activity.coord.none') },
    { value: 'recommended', label: t('activity.coord.recommended') },
    { value: 'required', label: t('activity.coord.required') },
  ];

  function toggleTopic(topic: string) {
    setTopics((prev) => prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]);
  }

  function toggleMaterial(value: string) {
    setMaterials((prev) => prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]);
  }

  function addMaterial() {
    const val = newMaterial.trim();
    if (val && !materials.includes(val)) setMaterials((prev) => [...prev, val]);
    setNewMaterial('');
  }

  function updateVariation(i: number, field: keyof Variation, value: string) {
    setVariations((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title_he.trim()) e.title_he = t('activity.err.title_he');
    if (!description_he.trim()) e.description_he = t('activity.err.desc_he');
    if (!instructions_he.trim()) e.instructions_he = t('activity.err.instr_he');
    if (!duration_minutes || parseInt(duration_minutes) <= 0) e.duration_minutes = t('activity.err.duration');
    if (location === 'waterfront' && !safety_notes.trim()) e.safety_notes = t('activity.err.safety_wf');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      title: title.trim() || title_he.trim(),
      title_he: title_he.trim(),
      description: description.trim() || description_he.trim(),
      description_he: description_he.trim(),
      instructions: instructions.trim() || instructions_he.trim(),
      instructions_he: instructions_he.trim(),
      why_it_works_he: why_it_works_he.trim() || null,
      educational_goal_he: educational_goal_he.trim() || null,
      duration_minutes: parseInt(duration_minutes),
      energy_level,
      location,
      group_size_min: group_size_min ? parseInt(group_size_min) : null,
      group_size_max: group_size_max ? parseInt(group_size_max) : null,
      age_min: age_min ? parseInt(age_min) : null,
      age_max: age_max ? parseInt(age_max) : null,
      hebrew_element: hebrew_element.trim() || null,
      safety_notes: safety_notes.trim() || null,
      topics,
      materials,
      variations: variations.filter((v) => v.name.trim()),
      counselors_min: counselors_min ? parseInt(counselors_min) : null,
      location_type: location_type.trim() || null,
      coordination_level: coordination_level || null,
    };

    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Creator-Id': getCreatorId(),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t('activity.saving'));
      router.push(`/bank/${activity.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('activity.saving'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-10 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-stone-900 mb-1 mt-4">{t('activity.edit.title')}</h1>
      <p className="text-sm text-stone-500 mb-5">{t('activity.edit.subtitle')}</p>

      <form onSubmit={handleSubmit} noValidate>

        <SectionTitle>{t('activity.sec.hebrew')}</SectionTitle>

        <Field label={t('activity.field.title_he')} required>
          <input type="text" value={title_he} onChange={(e) => setTitleHe(e.target.value)}
            className={cn(inputCls, errors.title_he && 'border-red-400')} dir="rtl" />
          {errors.title_he && <p className="text-xs text-red-500 mt-1">{errors.title_he}</p>}
        </Field>

        <Field label={t('activity.field.desc_he')} required>
          <textarea rows={2} value={description_he} onChange={(e) => setDescriptionHe(e.target.value)}
            className={cn(textareaCls, errors.description_he && 'border-red-400')} dir="rtl" />
          {errors.description_he && <p className="text-xs text-red-500 mt-1">{errors.description_he}</p>}
        </Field>

        <Field label={t('activity.field.instr_he')} required>
          <textarea rows={6} value={instructions_he} onChange={(e) => setInstructionsHe(e.target.value)}
            className={cn(textareaCls, errors.instructions_he && 'border-red-400')} dir="rtl" />
          {errors.instructions_he && <p className="text-xs text-red-500 mt-1">{errors.instructions_he}</p>}
        </Field>

        <Field label={t('activity.field.why_he')}>
          <textarea rows={2} value={why_it_works_he} onChange={(e) => setWhyHe(e.target.value)}
            className={textareaCls} dir="rtl" />
        </Field>

        <Field label={t('activity.field.goal_he')}>
          <input type="text" value={educational_goal_he} onChange={(e) => setGoalHe(e.target.value)}
            className={inputCls} dir="rtl" />
        </Field>

        <SectionTitle>{t('activity.sec.params')}</SectionTitle>

        <Field label={t('activity.field.duration')} required>
          <input type="number" min={1} max={240} value={duration_minutes}
            onChange={(e) => setDuration(e.target.value)}
            className={cn(inputCls, 'w-28', errors.duration_minutes && 'border-red-400')} />
          {errors.duration_minutes && <p className="text-xs text-red-500 mt-1">{errors.duration_minutes}</p>}
        </Field>

        <Field label={t('activity.field.energy')} required>
          <div className="flex gap-2 flex-wrap">
            {ENERGY_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setEnergy(opt.value)}
                className={cn('px-3 py-2 rounded-xl border text-sm font-medium',
                  energy_level === opt.value ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200')}>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t('activity.field.location')} required>
          <div className="flex gap-2 flex-wrap">
            {LOCATION_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setLocation(opt.value)}
                className={cn('px-3 py-2 rounded-xl border text-sm font-medium',
                  location === opt.value ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200')}>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.age_min')}</label>
            <input type="number" min={1} value={age_min} onChange={(e) => setAgeMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.age_max')}</label>
            <input type="number" min={1} value={age_max} onChange={(e) => setAgeMax(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.group_min')}</label>
            <input type="number" min={1} value={group_size_min} onChange={(e) => setGroupMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.group_max')}</label>
            <input type="number" min={1} value={group_size_max} onChange={(e) => setGroupMax(e.target.value)} className={inputCls} />
          </div>
        </div>

        <SectionTitle>{t('activity.sec.topics')}</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-4">
          {TOPIC_OPTIONS.map((topic) => (
            <button key={topic} type="button" onClick={() => toggleTopic(topic)}
              className={cn('px-3 py-1.5 rounded-full border text-xs font-medium',
                topics.includes(topic) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-stone-600 border-stone-200')}>
              {topic}
            </button>
          ))}
        </div>

        <SectionTitle>{t('activity.sec.equipment')}</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-3">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button key={eq.value} type="button" onClick={() => toggleMaterial(eq.value)}
              className={cn('px-3 py-1.5 rounded-full border text-xs font-medium',
                materials.includes(eq.value) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200')}>
              {eq.icon} {eq.value}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input type="text" value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }}
            placeholder={t('activity.field.equipment_other')} className={cn(inputCls, 'flex-1')} dir="rtl" />
          <button type="button" onClick={addMaterial}
            className="px-3 py-2 bg-stone-100 rounded-xl text-sm text-stone-700 border border-stone-200">➕</button>
        </div>
        {materials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {materials.map((m) => (
              <span key={m} className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full text-xs text-stone-700">
                {m}
                <button type="button" onClick={() => setMaterials((prev) => prev.filter((x) => x !== m))}
                  className="text-stone-400 hover:text-red-500 mr-1">×</button>
              </span>
            ))}
          </div>
        )}

        <SectionTitle>{t('activity.sec.variations_short')}</SectionTitle>
        {variations.map((v, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-stone-500">{t('activity.variation.label')} {i + 1}</span>
              <button type="button" onClick={() => setVariations((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-xs text-red-500">{t('activity.variation.remove')}</button>
            </div>
            <input type="text" value={v.name} onChange={(e) => updateVariation(i, 'name', e.target.value)}
              placeholder={t('activity.variation.name')} className={cn(inputCls, 'mb-2')} dir="rtl" />
            <textarea rows={2} value={v.description} onChange={(e) => updateVariation(i, 'description', e.target.value)}
              placeholder={t('activity.variation.desc')} className={textareaCls} dir="rtl" />
          </div>
        ))}
        {variations.length < 2 && (
          <button type="button" onClick={() => setVariations((prev) => [...prev, { name: '', description: '' }])}
            className="text-sm text-green-700 underline mb-4">{t('activity.variation.add')}</button>
        )}

        <SectionTitle>{t('activity.sec.safety')}</SectionTitle>

        <Field label={t('activity.field.safety')} required={location === 'waterfront'}>
          <textarea rows={3} value={safety_notes} onChange={(e) => setSafetyNotes(e.target.value)}
            className={cn(textareaCls, errors.safety_notes && 'border-red-400')} dir="rtl" />
          {errors.safety_notes && <p className="text-xs text-red-500 mt-1">{errors.safety_notes}</p>}
        </Field>

        <Field label={t('activity.field.hebrew_el')}>
          <textarea rows={2} value={hebrew_element} onChange={(e) => setHebrewElement(e.target.value)}
            className={textareaCls} dir="rtl" />
        </Field>

        <SectionTitle>{t('activity.sec.logistics_short')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.counselors')}</label>
            <input type="number" min={1} value={counselors_min}
              onChange={(e) => setCounselorsMin(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.loc_type')}</label>
            <input type="text" value={location_type} onChange={(e) => setLocationType(e.target.value)}
              className={inputCls} dir="rtl" />
          </div>
        </div>
        <Field label={t('activity.field.coordination')}>
          <div className="flex gap-2 flex-wrap">
            {COORDINATION_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setCoordination(opt.value)}
                className={cn('px-3 py-2 rounded-xl border text-sm font-medium',
                  coordination_level === opt.value ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200')}>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <SectionTitle>{t('activity.sec.english')}</SectionTitle>
        <Field label={t('activity.field.title_en')}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className={inputCls} dir="ltr" />
        </Field>
        <Field label={t('activity.field.desc_en')}>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
            className={textareaCls} dir="ltr" />
        </Field>
        <Field label={t('activity.field.instr_en')}>
          <textarea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)}
            className={textareaCls} dir="ltr" />
        </Field>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl text-sm disabled:opacity-60 mt-2">
          {submitting ? t('activity.saving') : t('activity.save_changes')}
        </button>
      </form>
    </div>
  );
}
