'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/components/layout/LanguageProvider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/',        key: 'nav.home',    icon: '🏕️' },
  { href: '/magic',   key: 'nav.magic',   icon: '✨' },
  { href: '/bank',    key: 'nav.bank',    icon: '📋' },
  { href: '/profile', key: 'nav.profile', icon: '👤' },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.09)]">
      <div className="flex items-center h-[72px] max-w-lg mx-auto px-2 gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 gap-1 text-[11px] font-bold transition-all rounded-2xl py-2 min-h-[52px]',
                active ? 'text-white' : 'text-stone-400 hover:text-stone-600'
              )}
            >
              {active && (
                <span className="absolute inset-0 bg-green-700 rounded-2xl -z-10 shadow-sm" />
              )}
              <span className={cn('text-xl leading-none transition-transform', active && 'scale-110')}>
                {item.icon}
              </span>
              <span className="leading-none tracking-tight">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
