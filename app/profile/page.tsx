'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/MockAuthProvider';
import { useLanguage, useT } from '@/components/layout/LanguageProvider';
import { AGE_GROUPS, ROLES } from '@/lib/mock-auth';
import { CounselorRole } from '@/types/activity';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUser, completeProfile } = useAuth();
  const { lang, setLang } = useLanguage();
  const t = useT();
  const router = useRouter();

  // Local state drives the form UI; auto-save writes through to localStorage immediately
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<CounselorRole>(user.role);
  const [ageGroup, setAgeGroup] = useState(user.defaultAgeGroup);
  const [saved, setSaved] = useState(false);

  function handleRoleClick(value: CounselorRole) {
    setRole(value);
    updateUser({ role: value });
  }

  function handleAgeGroupClick(value: string) {
    setAgeGroup(value);
    updateUser({ defaultAgeGroup: value });
  }

  function handleNameBlur() {
    const trimmed = name.trim();
    if (trimmed) updateUser({ name: trimmed });
  }

  function handleSave() {
    const trimmed = name.trim() || (lang === 'en' ? 'Counselor' : 'מדריך');
    updateUser({ name: trimmed, role, defaultAgeGroup: ageGroup });
    completeProfile();
    setName(trimmed);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push('/');
    }, 800);
  }

  return (
    <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">{t('profile.title')}</h1>
      <p className="text-sm text-stone-400 mb-6">{t('profile.subtitle')}</p>

      {/* Name */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          {t('profile.name_label')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          placeholder={lang === 'en' ? 'e.g. "Sarah" or "Eli"' : 'למשל: "שרה" או "אלי"'}
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-stone-200 bg-white text-base focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Role */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          {t('profile.role_label')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => handleRoleClick(r.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all',
                role === r.value
                  ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              )}
            >
              <span className="text-2xl leading-none">{r.icon}</span>
              <span className="text-center leading-tight text-xs font-medium">
                {lang === 'en' ? r.en : r.he}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          {t('profile.age_label')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AGE_GROUPS.map((ag) => (
            <button
              key={ag.value}
              onClick={() => handleAgeGroupClick(ag.value)}
              className={cn(
                'py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-start',
                ageGroup === ag.value
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-stone-200 bg-white text-stone-500'
              )}
            >
              {lang === 'en' ? ag.en : ag.he}
            </button>
          ))}
        </div>
      </div>

      {/* Language toggle */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          {t('profile.lang_label')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['he', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'py-3 px-4 rounded-2xl border-2 text-sm font-semibold transition-all',
                lang === l
                  ? 'border-green-500 bg-green-50 text-green-800 shadow-sm'
                  : 'border-stone-200 bg-white text-stone-500'
              )}
            >
              {l === 'he' ? '🇮🇱 עברית' : '🇺🇸 English'}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={cn(
          'w-full py-4 rounded-2xl font-bold text-base transition-all shadow-sm',
          saved
            ? 'bg-green-100 text-green-800'
            : 'bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white shadow-green-200'
        )}
      >
        {saved ? t('profile.saved') : t('profile.save')}
      </button>
    </div>
  );
}
