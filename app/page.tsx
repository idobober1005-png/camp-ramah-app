'use client';

import Link from 'next/link';
import { useAuth } from '@/components/layout/MockAuthProvider';
import { useT, useLanguage } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { user, profileComplete, hydrated } = useAuth();
  const t = useT();
  const { lang } = useLanguage();
  const isWaterfront = user.role === 'waterfront_instructor';

  const greeting = lang === 'he' ? `שלום, ${user.name}!` : `Hello, ${user.name}!`;
  const roleLabel = isWaterfront ? t('home.role.waterfront') : t('home.role.social');

  type Action = { href: string; icon: string; label: string; description: string; color: string };

  const otherActions: Action[] = isWaterfront
    ? [
        { href: '/magic',    icon: '✨', label: 'MAGIC',                           description: t('home.action.magic.desc.water'), color: 'bg-violet-50 text-violet-600' },
        { href: '/bank',     icon: '🌊', label: t('home.action.bank.label.water'), description: t('home.action.bank.desc.water'),  color: 'bg-sky-50 text-sky-600' },
        { href: '/syllabus', icon: '📄', label: t('home.action.syllabus.label'),   description: t('home.action.syllabus.desc'),    color: 'bg-amber-50 text-amber-600' },
      ]
    : [
        { href: '/magic',    icon: '✨', label: 'MAGIC',                         description: t('home.action.magic.desc'),    color: 'bg-violet-50 text-violet-600' },
        { href: '/bank',     icon: '📋', label: t('home.action.bank.label'),     description: t('home.action.bank.desc'),     color: 'bg-sky-50 text-sky-600' },
        { href: '/syllabus', icon: '📄', label: t('home.action.syllabus.label'), description: t('home.action.syllabus.desc'), color: 'bg-amber-50 text-amber-600' },
      ];

  const isLastAlone = otherActions.length % 2 !== 0;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 px-4 pt-10 pb-24">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0 shadow-inner">
            {isWaterfront ? '🌊' : '🏕️'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-white leading-tight truncate">{greeting}</h1>
            <p className="text-green-200 text-xs mt-0.5">
              {roleLabel}&nbsp;·&nbsp;{t('home.age_prefix')}&nbsp;{user.defaultAgeGroup}
            </p>
          </div>
          <Link
            href="/profile"
            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-base hover:bg-white/30 transition-colors shrink-0"
            aria-label="Profile settings"
          >
            ⚙️
          </Link>
        </div>
      </div>

      {/* ── Floating content ──────────────────────────────────────── */}
      <div className="-mt-14 px-4 pb-6 max-w-lg mx-auto space-y-3">

        {/* Profile nudge */}
        {hydrated && !profileComplete && (
          <Link
            href="/profile"
            className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-3xl shadow-lg"
          >
            <span className="text-2xl shrink-0">👋</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800">{t('home.nudge.title')}</p>
              <p className="text-xs text-amber-600 mt-0.5">{t('home.nudge.sub')}</p>
            </div>
            <span className="text-amber-400 shrink-0">{lang === 'he' ? '←' : '→'}</span>
          </Link>
        )}

        {/* Emergency — primary featured card */}
        <Link
          href="/emergency"
          className="flex items-center gap-4 p-5 bg-red-600 hover:bg-red-700 text-white rounded-3xl shadow-xl shadow-red-500/30 transition-all active:scale-[0.98]"
        >
          <span className="text-4xl leading-none shrink-0">🚨</span>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-base leading-tight">{t('home.action.emergency.label')}</p>
            <p className="text-red-200 text-xs mt-0.5">
              {isWaterfront ? t('home.action.emergency.desc.water') : t('home.action.emergency.desc')}
            </p>
          </div>
          <span className="text-red-300 text-xl shrink-0">{lang === 'he' ? '←' : '→'}</span>
        </Link>

        {/* Section label */}
        <p className="text-xs font-extrabold text-stone-400 uppercase tracking-widest px-1">
          {t('home.section')}
        </p>

        {/* Other quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {otherActions.map((action, i) => {
            const isFullWidth = isLastAlone && i === otherActions.length - 1;
            return isFullWidth ? (
              <Link
                key={action.href}
                href={action.href}
                className="col-span-2 flex items-center gap-4 p-4 rounded-3xl bg-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0', action.color)}>
                  {action.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-stone-800 leading-tight">{action.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-snug">{action.description}</p>
                </div>
                <span className="text-stone-300 shrink-0">{lang === 'he' ? '←' : '→'}</span>
              </Link>
            ) : (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-3 p-4 rounded-3xl bg-white shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
              >
                <span className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-2xl', action.color)}>
                  {action.icon}
                </span>
                <div>
                  <p className="font-bold text-sm text-stone-800 leading-tight">{action.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-snug">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Camp tip */}
        <div className="flex items-start gap-3 p-4 bg-white rounded-3xl shadow-sm border-l-4 border-l-amber-400">
          <span className="text-base leading-none shrink-0 mt-0.5">💡</span>
          <p className="text-xs text-stone-600 leading-relaxed">{t('home.tip')}</p>
        </div>

      </div>
    </div>
  );
}
