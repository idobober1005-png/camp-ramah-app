'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnergyLevel, Location, CoordinationLevel, TOPIC_OPTIONS, EQUIPMENT_OPTIONS } from '@/types/activity';
import { getCreatorId } from '@/lib/mock-auth';
import { useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

interface Variation {
  name: string;
  description: string;
}

interface FormState {
  title_he: string;
  description_he: string;
  instructions_he: string;
  why_it_works_he: string;
  educational_goal_he: string;
  title: string;
  description: string;
  instructions: string;
  duration_minutes: string;
  energy_level: EnergyLevel | '';
  location: Location | '';
  group_size_min: string;
  group_size_max: string;
  age_min: string;
  age_max: string;
  hebrew_element: string;
  safety_notes: string;
  topics: string[];
  materials: string[];
  counselors_min: string;
  location_type: string;
  coordination_level: CoordinationLevel | '';
  variations: Variation[];
}

const INITIAL_STATE: FormState = {
  title_he: '', description_he: '', instructions_he: '',
  why_it_works_he: '', educational_goal_he: '',
  title: '', description: '', instructions: '',
  duration_minutes: '', energy_level: '', location: '',
  group_size_min: '', group_size_max: '', age_min: '', age_max: '',
  hebrew_element: '', safety_notes: '',
  topics: [], materials: [],
  counselors_min: '', location_type: '', coordination_level: '',
  variations: [],
};

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

export default function AddActivityPage() {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState('');

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

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleTopic(topic: string) {
    set('topics', form.topics.includes(topic)
      ? form.topics.filter((t) => t !== topic)
      : [...form.topics, topic]
    );
  }

  function toggleMaterial(value: string) {
    set('materials', form.materials.includes(value)
      ? form.materials.filter((m) => m !== value)
      : [...form.materials, value]
    );
  }

  function addMaterial() {
    const val = newMaterial.trim();
    if (val && !form.materials.includes(val)) {
      set('materials', [...form.materials, val]);
    }
    setNewMaterial('');
  }

  function addVariation() {
    if (form.variations.length >= 2) return;
    set('variations', [...form.variations, { name: '', description: '' }]);
  }

  function updateVariation(index: number, field: keyof Variation, value: string) {
    const updated = form.variations.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    set('variations', updated);
  }

  function removeVariation(index: number) {
    set('variations', form.variations.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title_he.trim()) newErrors.title_he = t('activity.err.title_he');
    if (!form.description_he.trim()) newErrors.description_he = t('activity.err.desc_he');
    if (!form.instructions_he.trim()) newErrors.instructions_he = t('activity.err.instr_he');
    if (!form.duration_minutes || parseInt(form.duration_minutes) <= 0)
      newErrors.duration_minutes = t('activity.err.duration');
    if (!form.energy_level) newErrors.energy_level = t('activity.err.energy');
    if (!form.location) newErrors.location = t('activity.err.location');
    if (form.location === 'waterfront' && !form.safety_notes.trim())
      newErrors.safety_notes = t('activity.err.safety_wf');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      title: form.title.trim() || form.title_he.trim(),
      title_he: form.title_he.trim(),
      description: form.description.trim() || form.description_he.trim(),
      description_he: form.description_he.trim(),
      instructions: form.instructions.trim() || form.instructions_he.trim(),
      instructions_he: form.instructions_he.trim(),
      why_it_works_he: form.why_it_works_he.trim() || undefined,
      educational_goal_he: form.educational_goal_he.trim() || undefined,
      duration_minutes: parseInt(form.duration_minutes),
      energy_level: form.energy_level as EnergyLevel,
      location: form.location as Location,
      group_size_min: form.group_size_min ? parseInt(form.group_size_min) : undefined,
      group_size_max: form.group_size_max ? parseInt(form.group_size_max) : undefined,
      age_min: form.age_min ? parseInt(form.age_min) : undefined,
      age_max: form.age_max ? parseInt(form.age_max) : undefined,
      hebrew_element: form.hebrew_element.trim() || undefined,
      safety_notes: form.safety_notes.trim() || undefined,
      topics: form.topics,
      materials: form.materials,
      tags: [],
      variations: form.variations.filter((v) => v.name.trim()),
      counselors_min: form.counselors_min ? parseInt(form.counselors_min) : undefined,
      location_type: form.location_type.trim() || undefined,
      coordination_level: (form.coordination_level || undefined) as CoordinationLevel | undefined,
      source: 'manual' as const,
      creator_id: getCreatorId(),
    };

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t('activity.saving'));
      router.push(`/bank/${json.activity.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('activity.saving'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pt-4 pb-10 max-w-lg mx-auto">
      <div className="mb-4">
        <Link href="/bank" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
          {t('activity.add.back')}
        </Link>
      </div>

      <h1 className="text-xl font-bold text-stone-900 mb-1">{t('activity.add.title')}</h1>
      <p className="text-sm text-stone-500 mb-5">{t('activity.add.subtitle')}</p>

      <form onSubmit={handleSubmit} noValidate>

        <SectionTitle>{t('activity.sec.hebrew')}</SectionTitle>

        <Field label={t('activity.field.title_he')} required hint={t('activity.field.title_he.hint')}>
          <input
            type="text"
            value={form.title_he}
            onChange={(e) => set('title_he', e.target.value)}
            placeholder="לדוגמה: קפא במקום"
            className={cn(inputCls, errors.title_he && 'border-red-400 ring-1 ring-red-400')}
            dir="rtl"
          />
          {errors.title_he && <p className="text-xs text-red-500 mt-1">{errors.title_he}</p>}
        </Field>

        <Field label={t('activity.field.desc_he')} required hint={t('activity.field.desc_he.hint')}>
          <textarea
            rows={2}
            value={form.description_he}
            onChange={(e) => set('description_he', e.target.value)}
            placeholder="לדוגמה: כולם קופאים בתנוחה כשהמדריך מוחא כף — האחרון לקפוא הופך לקורא הבא."
            className={cn(textareaCls, errors.description_he && 'border-red-400 ring-1 ring-red-400')}
            dir="rtl"
          />
          {errors.description_he && <p className="text-xs text-red-500 mt-1">{errors.description_he}</p>}
        </Field>

        <Field label={t('activity.field.instr_he')} required hint={t('activity.field.instr_he.hint')}>
          <textarea
            rows={6}
            value={form.instructions_he}
            onChange={(e) => set('instructions_he', e.target.value)}
            placeholder={'1. הסבירו את החוקים לקבוצה...\n2. ...\n3. ...'}
            className={cn(textareaCls, errors.instructions_he && 'border-red-400 ring-1 ring-red-400')}
            dir="rtl"
          />
          {errors.instructions_he && <p className="text-xs text-red-500 mt-1">{errors.instructions_he}</p>}
        </Field>

        <Field label={t('activity.field.why_he')} hint={t('activity.field.why_he.hint')}>
          <textarea
            rows={2}
            value={form.why_it_works_he}
            onChange={(e) => set('why_it_works_he', e.target.value)}
            placeholder="מנתב את האנרגיה הטבעית של הקבוצה..."
            className={textareaCls}
            dir="rtl"
          />
        </Field>

        <Field label={t('activity.field.goal_he')} hint={t('activity.field.goal_he.hint')}>
          <input
            type="text"
            value={form.educational_goal_he}
            onChange={(e) => set('educational_goal_he', e.target.value)}
            placeholder="שיתוף פעולה, הקשבה, שמחה משותפת"
            className={inputCls}
            dir="rtl"
          />
        </Field>

        <SectionTitle>{t('activity.sec.params')}</SectionTitle>

        <Field label={t('activity.field.duration')} required>
          <input
            type="number"
            min={1}
            max={240}
            value={form.duration_minutes}
            onChange={(e) => set('duration_minutes', e.target.value)}
            placeholder="15"
            className={cn(inputCls, 'w-28', errors.duration_minutes && 'border-red-400 ring-1 ring-red-400')}
          />
          {errors.duration_minutes && <p className="text-xs text-red-500 mt-1">{errors.duration_minutes}</p>}
        </Field>

        <Field label={t('activity.field.energy')} required>
          <div className="flex gap-2 flex-wrap">
            {ENERGY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('energy_level', opt.value)}
                className={cn(
                  'px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
                  form.energy_level === opt.value
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-stone-600 border-stone-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.energy_level && <p className="text-xs text-red-500 mt-1">{errors.energy_level}</p>}
        </Field>

        <Field label={t('activity.field.location')} required>
          <div className="flex gap-2 flex-wrap">
            {LOCATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('location', opt.value)}
                className={cn(
                  'px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
                  form.location === opt.value
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-stone-600 border-stone-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.age_min')}</label>
            <input type="number" min={5} max={20} value={form.age_min}
              onChange={(e) => set('age_min', e.target.value)}
              placeholder="10" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.age_max')}</label>
            <input type="number" min={5} max={20} value={form.age_max}
              onChange={(e) => set('age_max', e.target.value)}
              placeholder="16" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.group_min')}</label>
            <input type="number" min={2} value={form.group_size_min}
              onChange={(e) => set('group_size_min', e.target.value)}
              placeholder="8" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.group_max')}</label>
            <input type="number" min={2} value={form.group_size_max}
              onChange={(e) => set('group_size_max', e.target.value)}
              placeholder="30" className={inputCls} />
          </div>
        </div>

        <SectionTitle>{t('activity.sec.topics')}</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-4">
          {TOPIC_OPTIONS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
                form.topics.includes(topic)
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-stone-600 border-stone-200'
              )}
            >
              {topic}
            </button>
          ))}
        </div>

        <SectionTitle>{t('activity.sec.equipment')}</SectionTitle>
        <p className="text-xs text-stone-400 mb-2">{t('activity.field.equipment_hint')}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {EQUIPMENT_OPTIONS.map((eq) => (
            <button
              key={eq.value}
              type="button"
              onClick={() => toggleMaterial(eq.value)}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
                form.materials.includes(eq.value)
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-600 border-stone-200'
              )}
            >
              {eq.icon} {eq.value}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }}
            placeholder={t('activity.field.equipment_other')}
            className={cn(inputCls, 'flex-1')}
            dir="rtl"
          />
          <button
            type="button"
            onClick={addMaterial}
            className="px-3 py-2 bg-stone-100 rounded-xl text-sm text-stone-700 border border-stone-200"
          >
            ➕
          </button>
        </div>
        {form.materials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {form.materials.map((m) => (
              <span key={m} className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full text-xs text-stone-700">
                {m}
                <button type="button" onClick={() => set('materials', form.materials.filter((x) => x !== m))}
                  className="text-stone-400 hover:text-red-500 mr-1">×</button>
              </span>
            ))}
          </div>
        )}

        <SectionTitle>{t('activity.sec.variations')}</SectionTitle>
        {form.variations.map((v, i) => (
          <div key={i} className="mb-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-stone-500">{t('activity.variation.label')} {i + 1}</span>
              <button type="button" onClick={() => removeVariation(i)}
                className="text-xs text-red-500">{t('activity.variation.remove')}</button>
            </div>
            <input
              type="text"
              value={v.name}
              onChange={(e) => updateVariation(i, 'name', e.target.value)}
              placeholder={t('activity.variation.name')}
              className={cn(inputCls, 'mb-2')}
              dir="rtl"
            />
            <textarea
              rows={2}
              value={v.description}
              onChange={(e) => updateVariation(i, 'description', e.target.value)}
              placeholder={t('activity.variation.desc')}
              className={textareaCls}
              dir="rtl"
            />
          </div>
        ))}
        {form.variations.length < 2 && (
          <button
            type="button"
            onClick={addVariation}
            className="text-sm text-green-700 underline mb-4"
          >
            {t('activity.variation.add')}
          </button>
        )}

        <SectionTitle>{t('activity.sec.safety')}</SectionTitle>

        <Field
          label={t('activity.field.safety')}
          required={form.location === 'waterfront'}
          hint={form.location === 'waterfront' ? t('activity.field.safety.waterfront') : t('activity.field.safety.optional')}
        >
          <textarea
            rows={3}
            value={form.safety_notes}
            onChange={(e) => set('safety_notes', e.target.value)}
            placeholder={form.location === 'waterfront'
              ? 'שיטת חברים, ייעוד אזורים, מיקום מציל...'
              : 'שטח ישר ופנוי מעצמים, מגרש ללא שקעים...'
            }
            className={cn(textareaCls, errors.safety_notes && 'border-red-400 ring-1 ring-red-400')}
            dir="rtl"
          />
          {errors.safety_notes && <p className="text-xs text-red-500 mt-1">{errors.safety_notes}</p>}
        </Field>

        <Field label={t('activity.field.hebrew_el')} hint={t('activity.field.hebrew_el.hint')}>
          <textarea
            rows={2}
            value={form.hebrew_element}
            onChange={(e) => set('hebrew_element', e.target.value)}
            placeholder="ניתן לקשר לערך השבתי של מנוחה ועצירה..."
            className={textareaCls}
            dir="rtl"
          />
        </Field>

        <SectionTitle>{t('activity.sec.logistics')}</SectionTitle>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.counselors')}</label>
            <input type="number" min={1} value={form.counselors_min}
              onChange={(e) => set('counselors_min', e.target.value)}
              placeholder="1" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1">{t('activity.field.loc_type')}</label>
            <input type="text" value={form.location_type}
              onChange={(e) => set('location_type', e.target.value)}
              placeholder="חדר גדול, מגרש שטוח"
              className={inputCls} dir="rtl" />
          </div>
        </div>

        <Field label={t('activity.field.coordination')}>
          <div className="flex gap-2 flex-wrap">
            {COORDINATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('coordination_level', opt.value)}
                className={cn(
                  'px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
                  form.coordination_level === opt.value
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-stone-600 border-stone-200'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <SectionTitle>{t('activity.sec.english')}</SectionTitle>
        <p className="text-xs text-stone-400 mb-3">{t('activity.field.english_hint')}</p>
        <Field label={t('activity.field.title_en')}>
          <input type="text" value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Freeze Frame"
            className={inputCls} dir="ltr" />
        </Field>
        <Field label={t('activity.field.desc_en')}>
          <textarea rows={2} value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="e.g. Everyone freezes when the counselor claps..."
            className={textareaCls} dir="ltr" />
        </Field>
        <Field label={t('activity.field.instr_en')}>
          <textarea rows={4} value={form.instructions}
            onChange={(e) => set('instructions', e.target.value)}
            placeholder={'1. Explain the rules...\n2. ...'}
            className={textareaCls} dir="ltr" />
        </Field>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl text-sm disabled:opacity-60 mt-2"
        >
          {submitting ? t('activity.saving') : t('activity.save')}
        </button>
      </form>
    </div>
  );
}
