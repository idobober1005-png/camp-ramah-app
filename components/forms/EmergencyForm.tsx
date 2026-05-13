'use client';

import { useState } from 'react';
import { EnergyLevel, Location, EmergencyParams, EQUIPMENT_OPTIONS, TOPIC_OPTIONS } from '@/types/activity';
import { useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

interface EmergencyFormProps {
  onSubmit: (params: EmergencyParams) => void;
  loading: boolean;
}

export function EmergencyForm({ onSubmit, loading }: EmergencyFormProps) {
  const t = useT();
  const [time, setTime]           = useState<number>(15);
  const [location, setLocation]   = useState<Location>('outdoor');
  const [energy, setEnergy]       = useState<EnergyLevel>('medium');
  const [groupSize, setGroupSize] = useState<number>(12);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [topics, setTopics]       = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);

  const TIME_OPTIONS = [
    { value: 5,  label: t('eform.time.5') },
    { value: 15, label: t('eform.time.15') },
    { value: 30, label: t('eform.time.30') },
    { value: 60, label: t('eform.time.60') },
  ];

  const LOCATION_OPTIONS: { value: Location; label: string; icon: string }[] = [
    { value: 'indoor',     label: t('eform.loc.indoor'),     icon: '🏠' },
    { value: 'outdoor',    label: t('eform.loc.outdoor'),    icon: '🌳' },
    { value: 'waterfront', label: t('eform.loc.waterfront'), icon: '🌊' },
    { value: 'cabin',      label: t('eform.loc.cabin'),      icon: '🛖' },
    { value: 'field',      label: t('eform.loc.field'),      icon: '⛳' },
  ];

  const ENERGY_OPTIONS: { value: EnergyLevel; label: string; icon: string; active: string }[] = [
    { value: 'calm',      label: t('eform.energy.calm'),      icon: '😌', active: 'border-blue-400 bg-blue-50 text-blue-800' },
    { value: 'medium',    label: t('eform.energy.medium'),    icon: '😄', active: 'border-amber-400 bg-amber-50 text-amber-800' },
    { value: 'energetic', label: t('eform.energy.energetic'), icon: '🤪', active: 'border-red-400 bg-red-50 text-red-800' },
  ];

  const GROUP_SIZE_OPTIONS = [
    { value: 6,  label: t('eform.size.small') },
    { value: 12, label: t('eform.size.medium') },
    { value: 20, label: t('eform.size.large') },
    { value: 30, label: t('eform.size.xlarge') },
  ];

  function toggleEquipment(value: string) {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleSubmit() {
    onSubmit({
      time_available_minutes: time,
      location,
      energy_level: energy,
      group_size: groupSize,
      equipment_available: equipment,
      topics: topics.length > 0 ? topics : undefined,
    });
  }

  return (
    <div className="space-y-5">

      {/* Time */}
      <Field label={t('eform.time')}>
        <div className="grid grid-cols-4 gap-2">
          {TIME_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={time === opt.value} onClick={() => setTime(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </Field>

      {/* Location */}
      <Field label={t('eform.location')}>
        <div className="grid grid-cols-3 gap-2">
          {LOCATION_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={location === opt.value}
              onClick={() => setLocation(opt.value)}
              icon={opt.icon}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </Field>

      {/* Energy */}
      <Field label={t('eform.energy')}>
        <div className="grid grid-cols-3 gap-2">
          {ENERGY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEnergy(opt.value)}
              className={cn(
                'py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1.5 min-h-[72px]',
                energy === opt.value
                  ? opt.active
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              )}
            >
              <span className="text-2xl leading-none">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Group size */}
      <Field label={t('eform.group_size')}>
        <div className="grid grid-cols-4 gap-2">
          {GROUP_SIZE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={groupSize === opt.value}
              onClick={() => setGroupSize(opt.value)}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </Field>

      {/* Equipment */}
      <Field label={t('eform.equipment')}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEquipment([])}
            className={cn(
              'px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all',
              equipment.length === 0
                ? 'border-stone-500 bg-stone-100 text-stone-800'
                : 'border-stone-200 bg-white text-stone-400 hover:border-stone-300'
            )}
          >
            {t('eform.no_equipment')}
          </button>
          {EQUIPMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleEquipment(opt.value)}
              className={cn(
                'px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-1.5',
                equipment.includes(opt.value)
                  ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              )}
            >
              <span className="text-base leading-none">{opt.icon}</span>
              <span>{opt.value}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Topics — optional, collapsible */}
      <div>
        <button
          onClick={() => setShowTopics((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold text-stone-500 mb-2"
        >
          <span>{t('eform.topics')}</span>
          <span className="text-xs">{showTopics ? '▲' : '▼'}</span>
          {topics.length > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {topics.length} {t('common.selected')}
            </span>
          )}
        </button>
        {showTopics && (
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((topic) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={cn(
                  'px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all',
                  topics.includes(topic)
                    ? 'border-violet-500 bg-violet-50 text-violet-800'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={cn(
          'w-full py-4 rounded-2xl font-bold text-base transition-all min-h-[56px] shadow-sm',
          loading
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white shadow-red-200'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block">⏳</span>
            {t('eform.searching')}
          </span>
        ) : (
          t('eform.find')
        )}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-bold text-stone-700 mb-2">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  active, onClick, children, icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1 min-h-[52px]',
        active
          ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
          : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 active:bg-stone-50'
      )}
    >
      {icon && <span className="text-lg leading-none">{icon}</span>}
      <span className="leading-tight text-center">{children}</span>
    </button>
  );
}
