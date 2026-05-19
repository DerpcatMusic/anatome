// Svelte 5 rune wrapper for typesafe-i18n
// Loads Hebrew locale synchronously and exposes typed translation functions.

import { loadLocale } from './generated/i18n-util.sync';
import { i18nObject } from './generated/i18n-util';
import type { Locales, TranslationFunctions } from './generated/i18n-types';

// Load Hebrew locale immediately (sync)
loadLocale('he');

class I18nRune {
  locale = $state<Locales>('he');
  private _LL = $derived(i18nObject(this.locale));

  /** Typed translation functions — access via `t.landing.hero.headline()` */
  get t(): TranslationFunctions {
    return this._LL;
  }

  /** Switch locale at runtime */
  setLocale(locale: Locales) {
    loadLocale(locale);
    this.locale = locale;
  }
}

const globalI18n = new I18nRune();

/** Returns the global i18n rune instance. Safe to call anywhere in Svelte components. */
export function useI18n(): I18nRune {
  return globalI18n;
}

/** Re-export generated utilities for advanced use */
export { loadLocale } from './generated/i18n-util.sync';
export { i18nObject } from './generated/i18n-util';
export type { Locales, TranslationFunctions } from './generated/i18n-types';
