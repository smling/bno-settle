import en from './locales/en.json';
import enCountry from './locales/en-country.json';
import zhHant from './locales/zh-Hant.json';
import zhHantCountry from './locales/zh-Hant-country.json';

export type AppLanguage = 'zh-Hant' | 'en';

export type TranslationParams = Record<string, string | number>;

export type TranslationDictionary = Record<string, string>;

export const DEFAULT_LANGUAGE: AppLanguage = 'zh-Hant';
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['zh-Hant', 'en'];

function mergeDictionaries(
  ...dictionaries: TranslationDictionary[]
): TranslationDictionary {
  return Object.assign({}, ...dictionaries);
}

// Translators should edit JSON files under src/app/i18n/locales.
export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  'zh-Hant': mergeDictionaries(
    zhHant as TranslationDictionary,
    zhHantCountry as TranslationDictionary
  ),
  en: mergeDictionaries(en as TranslationDictionary, enCountry as TranslationDictionary)
};
