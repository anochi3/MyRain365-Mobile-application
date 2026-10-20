import { useMemo } from 'react';

import { useProjectStore } from '@/data/store/ProjectProvider';
import type { Language } from '@/data/store/projectTypes';

import { en, type Dictionary } from './en';
import { fr } from './fr';

const DICTIONARIES: Record<Language, Dictionary> = { en, fr };
const LOCALES: Record<Language, string> = { en: 'en-GB', fr: 'fr-FR' };

type Params = Record<string, string | number>;

export function fill(template: string, params: Params = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function numberFormatter(language: Language) {
  const locale = LOCALES[language];
  const cache = new Map<number, Intl.NumberFormat>();
  return (value: number, digits = 0) => {
    if (!Number.isFinite(value)) return '∞';
    let formatter = cache.get(digits);
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
      cache.set(digits, formatter);
    }
    return formatter.format(value);
  };
}

export function useI18n() {
  const { preferences } = useProjectStore();
  const language = preferences.language;

  return useMemo(() => {
    const number = numberFormatter(language);
    const date = (iso: string, options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(LOCALES[language], options).format(new Date(`${iso}T12:00:00`));
    return { language, s: DICTIONARIES[language], fill, number, date };
  }, [language]);
}

export function stringsFor(language: Language): Dictionary {
  return DICTIONARIES[language];
}
