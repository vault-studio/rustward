// Mini-i18n propio: mismos ficheros es.json/en.json que usará la versión Android.
import es from './es.json';
import en from './en.json';
import { useMetaStore, type Language } from '../store/useMetaStore';

const dictionaries: Record<Language, unknown> = { es, en };

function lookup(dict: unknown, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>(
    (node, part) =>
      node && typeof node === 'object'
        ? (node as Record<string, unknown>)[part]
        : undefined,
    dict,
  );
  return typeof value === 'string' ? value : undefined;
}

export function translate(language: Language, key: string): string {
  return lookup(dictionaries[language], key) ?? lookup(dictionaries.en, key) ?? key;
}

export function useT(): (key: string) => string {
  const language = useMetaStore((s) => s.language);
  return (key: string) => translate(language, key);
}
