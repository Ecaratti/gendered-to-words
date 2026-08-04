// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license

import {
  type ConstructorOf,
  type ConverterOptions,
  type LocaleInterface,
  type NumberInput,
  type OrdinalIndicatorOptions,
  type OrdinalIndicatorParts,
  type OrdinalOptions,
} from "./types.js";
import { ToWordsCore, DefaultConverterOptions, DefaultToWordsOptions } from "./ToWordsCore.js";
import LOCALES, { GENDER_VARIANTS } from "./locales/index.js";

export { DefaultConverterOptions, DefaultToWordsOptions };
export { LOCALES, GENDER_VARIANTS };

const instanceCache = new Map<string, ToWords>();

// ---------------------------------------------------------------------------
// Locale resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a locale code to a key that exists in LOCALES.
 *
 * Resolution chain:
 *  1. Exact match (e.g. "fr-FR")
 *  2. Strip BCP 47 script tag (e.g. "zh-Hant-TW" → "zh-TW")
 *  3. Language-prefix fallback (e.g. "en-GB" → first "en-*" in LOCALES → "en-US")
 *
 * Returns undefined if nothing matches.
 */
function resolveLocaleCode(input: string): string | undefined {
  // 1. Exact match
  if (input in LOCALES) {
    return input;
  }

  const parts = input.split("-");

  // 2. Strip script tag, upper-case region (e.g. zh-Hant-TW → zh-TW)
  if (parts.length >= 2) {
    const normalized = `${parts[0]}-${parts[parts.length - 1].toUpperCase()}`;
    if (normalized in LOCALES) {
      return normalized;
    }
  }

  // 3. Language-prefix fallback (e.g. en-GB → en-US, fr → fr-FR)
  //    Only for 1-part (language only) or 2-part (language-region) codes.
  //    3+ part codes that didn't match step 2 are considered invalid.
  if (parts.length > 2) {
    return undefined;
  }
  const lang = parts[0].toLowerCase();
  return Object.keys(LOCALES).find((code) => code.toLowerCase().startsWith(`${lang}-`));
}

/**
 * Resolve a gender variant for a given locale code.
 *
 * Resolution chain:
 *  1. Exact locale match in GENDER_VARIANTS (e.g. "fr-BE" feminine)
 *  2. Language-level fallback (e.g. "fr-BE" → check "fr" in GENDER_VARIANTS)
 *  3. Fall back to base locale class (genderless languages ignore gender)
 */
function resolveGenderVariant(
  resolvedLocaleCode: string,
  gender: string | undefined,
  baseLocaleClass: ConstructorOf<LocaleInterface>
): ConstructorOf<LocaleInterface> {
  if (!gender || gender === "masculine") {
    return baseLocaleClass;
  }

  // Check exact locale match
  const exactVariants = GENDER_VARIANTS[resolvedLocaleCode];
  if (exactVariants?.[gender]) {
    return exactVariants[gender];
  }

  // Check language-level fallback
  const lang = resolvedLocaleCode.split("-")[0].toLowerCase();
  const langVariants = GENDER_VARIANTS[lang];
  if (langVariants?.[gender]) {
    return langVariants[gender];
  }

  return baseLocaleClass;
}

// ---------------------------------------------------------------------------
// Locale detection
// ---------------------------------------------------------------------------

function readRawLocale(): string {
  try {
    const nav = (globalThis as { navigator?: { language?: string } }).navigator;
    if (nav?.language) {
      return nav.language;
    }
  } catch {
    // noop
  }

  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale) {
      return locale;
    }
  } catch {
    // noop
  }

  return "";
}

let _localeDetector: (() => string) | null = null;

export function setLocaleDetector(fn: (() => string) | null): void {
  _localeDetector = fn;
}

export function detectLocale(fallback: string = DefaultToWordsOptions.localeCode!): string {
  const candidate = _localeDetector ? _localeDetector() : readRawLocale();
  if (!candidate) {
    return fallback;
  }
  return resolveLocaleCode(candidate) ?? fallback;
}

// ---------------------------------------------------------------------------
// ToWords class
// ---------------------------------------------------------------------------

export class ToWords extends ToWordsCore {
  // Sibling instances for per-call gender overrides, created lazily.
  private genderSiblings = new Map<string, ToWords>();

  public getLocaleClass(): ConstructorOf<LocaleInterface> {
    if (this.localeClass) {
      return this.localeClass;
    }

    const resolved = resolveLocaleCode(this.options.localeCode!);
    if (!resolved) {
      throw new Error(`Unknown Locale "${this.options.localeCode}"`);
    }
    // Constructor-level gender (converterOptions.gender) resolves to a gendered
    // variant class when the locale has one.
    return resolveGenderVariant(resolved, this.options.converterOptions?.gender, LOCALES[resolved]);
  }

  public convert(number: NumberInput, options: ConverterOptions = {}): string {
    const sibling = this.genderSibling(options.gender);
    return sibling ? sibling.convert(number, options) : super.convert(number, options);
  }

  public toOrdinal(number: NumberInput, options: OrdinalOptions = {}): string {
    const sibling = this.genderSibling(options.gender);
    return sibling ? sibling.toOrdinal(number, options) : super.toOrdinal(number, options);
  }

  /**
   * Per-call gender support: when a call requests a different gender than this
   * instance was constructed with, delegate to a cached sibling instance built
   * for that gender. Returns null when no delegation is needed: same gender,
   * no distinct variant for the locale (output would be identical), an
   * explicitly set locale class (setLocale() is respected as-is), or an
   * unresolvable locale (the caller surfaces the Unknown Locale error).
   */
  private genderSibling(gender: ConverterOptions["gender"]): ToWords | null {
    const ownGender = this.options.converterOptions?.gender ?? "masculine";
    if (!gender || gender === ownGender || this.localeClass) {
      return null;
    }

    let sibling = this.genderSiblings.get(gender);
    if (!sibling) {
      const resolved = resolveLocaleCode(this.options.localeCode!);
      if (!resolved) {
        return null;
      }
      const base = LOCALES[resolved];
      if (
        resolveGenderVariant(resolved, gender, base) ===
        resolveGenderVariant(resolved, ownGender, base)
      ) {
        return null;
      }
      sibling = new ToWords({
        ...this.options,
        converterOptions: { ...this.options.converterOptions, gender },
      });
      this.genderSiblings.set(gender, sibling);
    }
    return sibling;
  }
}

// ---------------------------------------------------------------------------
// Functional API
// ---------------------------------------------------------------------------

function getCachedInstance(localeCode?: string, gender?: string): ToWords {
  const baseCode = localeCode ?? detectLocale();
  const resolved = resolveLocaleCode(baseCode);
  if (!resolved) {
    throw new Error(`Unknown Locale "${baseCode}"`);
  }

  const cacheKey = gender && gender !== "masculine" ? `${resolved}+${gender}` : resolved;
  let inst = instanceCache.get(cacheKey);
  if (!inst) {
    // Constructor-level gender resolution (getLocaleClass) picks the gendered
    // variant class when the locale has one.
    inst = new ToWords({
      localeCode: resolved,
      converterOptions: gender ? { gender: gender as ConverterOptions["gender"] } : undefined,
    });
    instanceCache.set(cacheKey, inst);
  }
  return inst;
}

export function toWords(
  number: NumberInput,
  options?: ConverterOptions & { localeCode?: string }
): string {
  const { localeCode, ...converterOptions } = options ?? {};
  return getCachedInstance(localeCode, converterOptions.gender).convert(number, converterOptions);
}

export function toOrdinal(
  number: NumberInput,
  options?: OrdinalOptions & { localeCode?: string }
): string {
  const { localeCode, ...ordinalOptions } = options ?? {};
  return getCachedInstance(localeCode, ordinalOptions.gender).toOrdinal(number, ordinalOptions);
}

export function toOrdinalIndicator(
  number: NumberInput,
  options?: OrdinalIndicatorOptions & { localeCode?: string }
): OrdinalIndicatorParts {
  const { localeCode, ...indicatorOptions } = options ?? {};
  // Unlike toWords/toOrdinal, gender is deliberately NOT passed to instance
  // resolution: for indicators it is a data key inside the base locale config,
  // not a locale-variant selector, so resolving a gendered locale class here
  // would only pollute the instance cache with no behavioral difference.
  return getCachedInstance(localeCode).toOrdinalIndicator(number, indicatorOptions);
}
