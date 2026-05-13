'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from '@/types/activity';
import { t } from '@/lib/ui-strings';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'he',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('he');

  useEffect(() => {
    const stored = localStorage.getItem('ramah_lang') as Language | null;
    const initial = stored === 'en' || stored === 'he' ? stored : 'he';
    setLangState(initial);
    document.documentElement.dir = initial === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = initial === 'en' ? 'en' : 'he';
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem('ramah_lang', l);
    // Flip document direction for LTR English
    document.documentElement.dir = l === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = l === 'en' ? 'en' : 'he';
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { lang } = useLanguage();
  return useCallback((key: string) => t(key, lang), [lang]);
}
