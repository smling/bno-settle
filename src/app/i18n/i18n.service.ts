import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  TranslationParams
} from './translations';

export const LANGUAGE_OVERRIDE_STORAGE_KEY = 'bno-settle.language.override';

function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
}

function mapBrowserLanguage(value: string): AppLanguage | null {
  const normalized = value.toLowerCase();
  if (normalized.startsWith('en')) {
    return 'en';
  }
  if (normalized.startsWith('zh')) {
    return 'zh-Hant';
  }
  return null;
}

function isSupportedLanguage(value: string): value is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(value as AppLanguage);
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly overrideLanguage = signal<AppLanguage | null>(this.readStoredOverride());
  private readonly systemLanguageState = signal<AppLanguage>(this.detectSystemLanguage());

  public readonly language = computed<AppLanguage>(
    () => this.overrideLanguage() ?? this.systemLanguageState()
  );
  public readonly hasOverride = computed<boolean>(() => this.overrideLanguage() !== null);

  constructor() {
    effect(() => {
      this.document.documentElement.lang = this.language();
    });
  }

  public t(key: string, params: TranslationParams = {}): string {
    const activeLanguage = this.language();
    const activeDictionary = TRANSLATIONS[activeLanguage];
    const englishDictionary = TRANSLATIONS.en;
    const template = activeDictionary[key] ?? englishDictionary[key] ?? key;
    return interpolate(template, params);
  }

  public setLanguage(language: AppLanguage): void {
    this.overrideLanguage.set(language);
    this.persistOverride(language);
  }

  public clearOverride(): void {
    this.overrideLanguage.set(null);
    this.persistOverride(null);
    this.systemLanguageState.set(this.detectSystemLanguage());
  }

  public currentLanguage(): AppLanguage {
    return this.language();
  }

  public systemLanguage(): AppLanguage {
    return this.systemLanguageState();
  }

  private detectSystemLanguage(): AppLanguage {
    if (typeof navigator === 'undefined') {
      return DEFAULT_LANGUAGE;
    }
    const browserLanguages =
      Array.isArray(navigator.languages) && navigator.languages.length > 0
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : [];

    for (const language of browserLanguages) {
      const mapped = mapBrowserLanguage(language);
      if (mapped) {
        return mapped;
      }
    }

    return DEFAULT_LANGUAGE;
  }

  private readStoredOverride(): AppLanguage | null {
    try {
      const value = localStorage.getItem(LANGUAGE_OVERRIDE_STORAGE_KEY);
      if (value !== null && isSupportedLanguage(value)) {
        return value;
      }
      return null;
    } catch {
      return null;
    }
  }

  private persistOverride(language: AppLanguage | null): void {
    try {
      if (language === null) {
        localStorage.removeItem(LANGUAGE_OVERRIDE_STORAGE_KEY);
        return;
      }
      localStorage.setItem(LANGUAGE_OVERRIDE_STORAGE_KEY, language);
    } catch {
      // Ignore storage failures (privacy mode or restricted environments).
    }
  }
}
