import en from './locales/en.json';
import zhHant from './locales/zh-Hant.json';

export type AppLanguage = 'zh-Hant' | 'en';

export type TranslationParams = Record<string, string | number>;

export type TranslationDictionary = Record<string, string>;

export const DEFAULT_LANGUAGE: AppLanguage = 'zh-Hant';
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['zh-Hant', 'en'];

// Translators should edit JSON files under src/app/i18n/locales.
export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  'zh-Hant': zhHant as TranslationDictionary,
  en: en as TranslationDictionary
};
