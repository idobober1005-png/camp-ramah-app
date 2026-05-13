'use client';

import Link from 'next/link';
import { useT } from '@/components/layout/LanguageProvider';

export function EmergencyFAB() {
  const t = useT();
  return (
    <Link
      href="/emergency"
      className="fixed bottom-[88px] left-4 z-50 flex items-center gap-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-4 py-3 rounded-2xl shadow-lg shadow-red-600/40 transition-all active:scale-95"
      aria-label={t('fab.aria')}
    >
      <span className="text-lg leading-none">🚨</span>
      <span className="text-sm leading-tight">
        {t('fab.line1')}<br />{t('fab.line2')}
      </span>
    </Link>
  );
}
