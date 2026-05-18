import { getContext, setContext } from "svelte";
import { t, tFormat, type Locale, type TranslationKey, defaultLocale } from "./dictionary";

const I18N_KEY = Symbol("i18n");

export type I18nContext = {
  locale: Locale;
  t: (key: TranslationKey) => string;
  tFormat: (key: TranslationKey, values: Record<string, string | number>) => string;
};

export function createI18nContext(locale: Locale = defaultLocale): I18nContext {
  const ctx: I18nContext = {
    locale,
    t: (key: TranslationKey) => t(key, locale),
    tFormat: (key: TranslationKey, values: Record<string, string | number>) => tFormat(key, values, locale),
  };
  setContext(I18N_KEY, ctx);
  return ctx;
}

export function getI18n(): I18nContext {
  return getContext(I18N_KEY) ?? createI18nContext();
}
