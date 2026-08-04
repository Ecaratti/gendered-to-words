// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license

/**
 * ToWordsCore - Lightweight core class without bundled locales.
 *
 * This is the base class that contains all conversion logic but does NOT import
 * any locale files. It's designed for tree-shaking when used with per-locale entry points.
 *
 * For the full package with all locales, use `ToWords` from the main entry point.
 * For tree-shaken single-locale imports, use `ToWords` from a locale entry point:
 *
 * @example
 * // Full package (all locales)
 * import { ToWords } from 'gendered-to-words';
 * const tw = new ToWords({ localeCode: 'en-US' });
 *
 * // Single locale (tree-shaken) - SAME API!
 * import { ToWordsCore } from 'gendered-to-words/core';
 * import EnUs from 'gendered-to-words/en-US';
 * const tw = new ToWordsCore().setLocale(EnUs);
 */

import {
  type ConstructorOf,
  type ConverterOptions,
  type Gender,
  type LocaleInterface,
  type NumberInput,
  type NumberWordMap,
  type OrdinalIndicatorOptions,
  type OrdinalIndicatorParts,
  type OrdinalOptions,
  type PluralCategory,
  type ToWordsOptions,
} from "./types.js";

export const DefaultConverterOptions: ConverterOptions = {
  ignoreDecimal: false,
  lowercase: false,
};

export const DefaultToWordsOptions: ToWordsOptions = {
  localeCode: "en-US",
  converterOptions: DefaultConverterOptions,
};

// Cached BigInt mappings per locale to avoid repeated conversions
interface CachedNumberWordMap extends NumberWordMap {
  numberBigInt: bigint;
  resolvedValue: string; // Pre-resolved value (first element if array)
}

interface LocaleCache {
  numberWordsMappingBigInt: CachedNumberWordMap[];
  exactWordsMap: Map<bigint, CachedNumberWordMap>; // O(1) lookup for exact matches
  smallNumbersMap: Map<bigint, CachedNumberWordMap>; // Direct lookup for 0-100
  // Pre-computed unit thresholds for faster iteration
  unitMappings: CachedNumberWordMap[]; // Numbers >= 100, sorted descending
  smallNumbersBoundary: bigint; // The largest "small number" that has an atomic word
  // O(1) lookup sets for plural/ignore words
  pluralWordsSet: Set<string>;
  pluralWordsOnlyWhenTrailingSet: Set<string>;
  ignoreOneForWordsSet: Set<string>;
  noSplitWordAfterSet: Set<string>;
  // Word classes used by the join step (hyphenation, "and" insertion). Built
  // from the locale's own data so no language list is hard-coded here.
  tensWordsSet: Set<string>; // cardinal words for 20, 30, … 90
  unitsWordsSet: Set<string>; // cardinal + ordinal words for 1–9
  subHundredWordsSet: Set<string>; // cardinal + ordinal words for 1–99
  largeWordsSet: Set<string>; // cardinal + ordinal words for 100 and above
  scaleWordsSet: Set<string>; // words for 1000 and above, which end a group
  separateWordsSet: Set<string>; // scale nouns exempt from concatenation
  // Ordinal lookup, mirroring exactWordsMap/smallNumbersMap for cardinals
  ordinalWordsMap: Map<number, string>;
  ordinalExactWordsMap: Map<number, string>;
  ordinalComponentNumbers: number[]; // ordinalWordsMapping numbers, descending
}

// Global cache for all locales (computed once per locale)
const localeCache = new WeakMap<InstanceType<ConstructorOf<LocaleInterface>>, LocaleCache>();

// Intl.PluralRules instances are expensive to construct; cache per locale code.
// `null` marks a code the runtime rejected so we don't retry every call.
const pluralRulesCache = new Map<string, Intl.PluralRules | null>();

function getOrdinalPluralRules(localeCode: string): Intl.PluralRules | null {
  let rules = pluralRulesCache.get(localeCode);
  if (rules === undefined) {
    try {
      rules = new Intl.PluralRules(localeCode, { type: "ordinal" });
    } catch {
      rules = null;
    }
    pluralRulesCache.set(localeCode, rules);
  }
  return rules;
}

// Pre-computed BigInt constants to avoid repeated creation
const BIGINT_0 = 0n;
const BIGINT_1 = 1n;
const BIGINT_2 = 2n;
const BIGINT_10 = 10n;
const BIGINT_11 = 11n;
const BIGINT_100 = 100n;
const BIGINT_1000 = 1000n;
const BIGINT_MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

export class ToWordsCore {
  protected options: ToWordsOptions = {};

  protected locale: InstanceType<ConstructorOf<LocaleInterface>> | undefined = undefined;

  protected localeClass: ConstructorOf<LocaleInterface> | undefined = undefined;

  // Per-gender locale classes, populated when setLocale() is handed a map.
  // This is what lets the tree-shaken path answer a per-call gender: the full
  // ToWords class resolves variants through GENDER_VARIANTS, which the core
  // deliberately does not import.
  protected genderedLocaleClasses: Partial<Record<Gender, ConstructorOf<LocaleInterface>>> = {};

  private genderedLocaleInstances = new Map<Gender, InstanceType<ConstructorOf<LocaleInterface>>>();

  constructor(options: ToWordsOptions = {}) {
    this.options = Object.assign({}, DefaultToWordsOptions, options);
  }

  /**
   * Set the locale directly, either as a single class or as a map of gendered
   * variants.
   *
   * @example
   * import ItIt from "gendered-to-words/it-IT";
   * import ItItF from "gendered-to-words/it-IT-f";
   *
   * new ToWordsCore().setLocale({ masculine: ItIt, feminine: ItItF })
   *   .toOrdinal(42, { gender: "feminine" }); // "Quarantaduesima"
   *
   * A gender with no entry falls back to the masculine one, matching the
   * library-wide rule that an unsupported combination degrades rather than
   * throws.
   */
  public setLocale(
    locale: ConstructorOf<LocaleInterface> | Partial<Record<Gender, ConstructorOf<LocaleInterface>>>
  ): this {
    if (typeof locale === "function") {
      this.localeClass = locale;
      this.genderedLocaleClasses = {};
    } else {
      this.genderedLocaleClasses = locale;
      this.localeClass = locale.masculine ?? Object.values(locale)[0];
    }
    this.locale = undefined; // Reset cached locale instance
    this.genderedLocaleInstances.clear();
    return this;
  }

  /**
   * Get the locale class. Must be set via setLocale() or overridden in subclass.
   */
  public getLocaleClass(): ConstructorOf<LocaleInterface> {
    if (this.localeClass) {
      return this.localeClass;
    }
    throw new Error(
      'No locale set. Use setLocale() or import from a locale-specific entry point (e.g., "gendered-to-words/en-US")'
    );
  }

  public getLocale(): InstanceType<ConstructorOf<LocaleInterface>> {
    if (this.locale === undefined) {
      const LocaleClass = this.getLocaleClass();
      this.locale = new LocaleClass();
      // Initialize cache for this locale
      this.initLocaleCache(this.locale);
    }
    return this.locale;
  }

  /**
   * Locale instance for a requested gender, falling back to the default when
   * setLocale() was given a single class or the gender has no variant.
   */
  protected getLocaleFor(gender?: Gender): InstanceType<ConstructorOf<LocaleInterface>> {
    const LocaleClass = gender ? this.genderedLocaleClasses[gender] : undefined;
    if (!LocaleClass) {
      return this.getLocale();
    }
    let instance = this.genderedLocaleInstances.get(gender!);
    if (!instance) {
      instance = new LocaleClass();
      this.initLocaleCache(instance);
      this.genderedLocaleInstances.set(gender!, instance);
    }
    return instance;
  }

  private initLocaleCache(locale: InstanceType<ConstructorOf<LocaleInterface>>): void {
    // The caller (getLocale / getLocaleCache) guarantees this locale is not yet cached;
    // the guard below is therefore always false and has been removed to keep coverage clean.
    const config = locale.config;

    // Pre-compute BigInt values and resolved string values for numberWordsMapping
    const numberWordsMappingBigInt: CachedNumberWordMap[] = config.numberWordsMapping.map(
      (elem) => ({
        ...elem,
        numberBigInt: BigInt(elem.number),
        resolvedValue: Array.isArray(elem.value) ? elem.value[0] : elem.value,
      })
    );

    // Create Map for O(1) exact match lookup
    const exactWordsMap = new Map<bigint, CachedNumberWordMap>();
    if (config.exactWordsMapping) {
      for (const elem of config.exactWordsMapping) {
        const cached: CachedNumberWordMap = {
          ...elem,
          numberBigInt: BigInt(elem.number),
          resolvedValue: Array.isArray(elem.value) ? elem.value[0] : elem.value,
        };
        exactWordsMap.set(cached.numberBigInt, cached);
      }
    }

    // Create direct lookup map for small numbers (0-100) for O(1) access
    const smallNumbersMap = new Map<bigint, CachedNumberWordMap>();
    let smallNumbersBoundary = BIGINT_0;
    for (const elem of numberWordsMappingBigInt) {
      if (elem.numberBigInt <= BIGINT_100) {
        smallNumbersMap.set(elem.numberBigInt, elem);
        if (elem.numberBigInt > smallNumbersBoundary) {
          smallNumbersBoundary = elem.numberBigInt;
        }
      }
    }

    // Pre-compute unit mappings (>= 100) for faster iteration - already sorted descending
    const unitMappings = numberWordsMappingBigInt.filter((m) => m.numberBigInt >= BIGINT_100);

    // Create Sets for O(1) lookup instead of array.includes()
    const pluralWordsSet = new Set<string>(config.pluralWords ?? []);
    const pluralWordsOnlyWhenTrailingSet = new Set<string>(
      config.pluralWordsOnlyWhenTrailing ?? []
    );
    const ignoreOneForWordsSet = new Set<string>(config.ignoreOneForWords ?? []);
    const noSplitWordAfterSet = new Set<string>(config.noSplitWordAfter ?? []);

    // Ordinal lookups, keyed by Number. Ordinals are capped at Number range by
    // toOrdinal(), so a number key is safe and avoids BigInt churn here.
    const ordinalWordsMap = new Map<number, string>();
    const ordinalComponentNumbers: number[] = [];
    for (const elem of config.ordinalWordsMapping ?? []) {
      const key = Number(elem.number);
      if (Number.isSafeInteger(key)) {
        ordinalWordsMap.set(key, elem.value);
        ordinalComponentNumbers.push(key);
      }
    }
    ordinalComponentNumbers.sort((a, b) => b - a);

    const ordinalExactWordsMap = new Map<number, string>();
    for (const elem of config.ordinalExactWordsMapping ?? []) {
      ordinalExactWordsMap.set(Number(elem.number), elem.value);
    }

    // Word classes for the join step. A cardinal `value` may be a
    // [nonTrailing, trailing] pair; both spellings must be recognised.
    const tensWordsSet = new Set<string>();
    const unitsWordsSet = new Set<string>();
    const subHundredWordsSet = new Set<string>();
    const addWord = (target: Set<string>, value: string | [string, string]): void => {
      if (Array.isArray(value)) {
        target.add(value[0]);
        target.add(value[1]);
      } else {
        target.add(value);
      }
    };
    const largeWordsSet = new Set<string>();
    const scaleWordsSet = new Set<string>();
    for (const elem of config.numberWordsMapping) {
      const key = Number(elem.number);
      if (key >= 1000 || elem.number >= BIGINT_1000) {
        addWord(scaleWordsSet, elem.value);
        if (elem.singularValue) {
          scaleWordsSet.add(elem.singularValue);
        }
      }
      if (key >= 1 && key <= 99) {
        addWord(subHundredWordsSet, elem.value);
        if (key <= 9) {
          addWord(unitsWordsSet, elem.value);
        } else if (key >= 20 && key % 10 === 0) {
          addWord(tensWordsSet, elem.value);
        }
      } else if (key >= 100 || elem.number > BIGINT_100) {
        addWord(largeWordsSet, elem.value);
        if (elem.singularValue) {
          largeWordsSet.add(elem.singularValue);
        }
      }
    }
    // Plural/scale spellings ("Millionen", "Milliarden") are large words too.
    for (const [scale, forms] of Object.entries(config.pluralForms ?? {})) {
      for (const form of [forms.dual, forms.paucal, forms.plural]) {
        if (form) {
          largeWordsSet.add(form);
          if (Number(scale) >= 1000) {
            scaleWordsSet.add(form);
          }
        }
      }
    }
    for (const [key, value] of ordinalWordsMap) {
      if (key >= 1 && key <= 99) {
        subHundredWordsSet.add(value);
        if (key <= 9) {
          unitsWordsSet.add(value);
        }
      } else if (key >= 100) {
        largeWordsSet.add(value);
      }
    }

    localeCache.set(locale, {
      numberWordsMappingBigInt,
      exactWordsMap,
      smallNumbersMap,
      unitMappings,
      smallNumbersBoundary,
      pluralWordsSet,
      pluralWordsOnlyWhenTrailingSet,
      ignoreOneForWordsSet,
      noSplitWordAfterSet,
      tensWordsSet,
      unitsWordsSet,
      subHundredWordsSet,
      largeWordsSet,
      scaleWordsSet,
      separateWordsSet: new Set<string>(config.concatenation?.separateWords ?? []),
      ordinalWordsMap,
      ordinalExactWordsMap,
      ordinalComponentNumbers,
    });
  }

  private getLocaleCache(locale: InstanceType<ConstructorOf<LocaleInterface>>): LocaleCache {
    let cache = localeCache.get(locale);
    if (!cache) {
      this.initLocaleCache(locale);
      cache = localeCache.get(locale)!;
    }
    return cache;
  }

  public convert(number: NumberInput, options: ConverterOptions = {}): string {
    // Fast path: merge options only when needed (avoid Object.assign in hot path)
    const baseOptions = this.options.converterOptions;
    const mergedOptions: ConverterOptions =
      Object.keys(options).length === 0
        ? (baseOptions ?? {})
        : {
            ignoreDecimal: options.ignoreDecimal ?? baseOptions?.ignoreDecimal ?? false,
            gender: options.gender ?? baseOptions?.gender,
            lowercase: options.lowercase ?? baseOptions?.lowercase ?? false,
          };

    if (!this.isValidNumber(number)) {
      throw new Error(`Invalid Number "${number}"`);
    }

    const isBigInt = typeof number === "bigint";
    let numericValue: number | bigint = isBigInt ? number : Number(number);

    if (mergedOptions.ignoreDecimal && !isBigInt) {
      numericValue = Math.trunc(numericValue as number);
    }

    const locale = this.getLocaleFor(mergedOptions.gender);
    const segments = this.convertNumberSegments(numericValue, locale);

    let result = this.formatSegments(segments, locale);

    if (mergedOptions.lowercase) {
      result = this.toLocaleLowercase(result, locale);
    }

    return result;
  }

  /**
   * Assemble converted tokens into the locale's written form.
   *
   * Three joining conventions are supported, all driven by locale data:
   *  - concatenation (German/Dutch/Italian: "Einhunderteins"), where scale
   *    nouns listed in `concatenation.separateWords` still take spaces;
   *  - `trim` (CJK), a plain zero-separator join;
   *  - spaced, optionally hyphenating tens+units (English "Twenty-One").
   */
  /**
   * Format independently-written segments and space-join them.
   *
   * The split matters only for concatenating locales: "null Komma null vier"
   * is four written words, while the numeral inside each segment glues into
   * one ("neunhundertdreiundsiebzig"). A flat token list cannot tell the two
   * apart — both arrive as several tokens.
   */
  protected formatSegments(
    segments: string[][],
    localeInstance: InstanceType<ConstructorOf<LocaleInterface>>
  ): string {
    return segments
      .filter((segment) => segment.length > 0)
      .map((segment) => this.formatWords(segment, localeInstance))
      .join(localeInstance.config.trim ? "" : " ");
  }

  protected formatWords(
    words: string[],
    localeInstance: InstanceType<ConstructorOf<LocaleInterface>>
  ): string {
    const config = localeInstance.config;

    if (config.concatenation) {
      return this.concatenateWords(words, localeInstance);
    }
    if (config.trim) {
      return words.join("");
    }
    if (config.join?.hyphenateTensUnits) {
      const cache = this.getLocaleCache(localeInstance);
      let result = words[0] ?? "";
      for (let i = 1; i < words.length; i++) {
        const hyphenate = cache.tensWordsSet.has(words[i - 1]) && cache.unitsWordsSet.has(words[i]);
        result += (hyphenate ? "-" : " ") + words[i];
      }
      return result;
    }
    return words.join(" ");
  }

  /**
   * Glue tokens into a single orthographic word. Locale data is Title Cased,
   * so every token after the one that opens a glued run is lowercased —
   * otherwise "Hundert" + "Eins" would read "HundertEins".
   */
  private concatenateWords(
    words: string[],
    localeInstance: InstanceType<ConstructorOf<LocaleInterface>>
  ): string {
    const { lowercaseAfterFirst, elisions } = localeInstance.config.concatenation!;
    const cache = this.getLocaleCache(localeInstance);

    let result = "";
    // True when the next token opens a new orthographic word and must keep
    // the casing the locale data supplies.
    let startsWord = true;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isSeparate = cache.separateWordsSet.has(word);

      if (i === 0) {
        result = word;
      } else if (isSeparate || startsWord) {
        result += ` ${word}`;
      } else {
        result += lowercaseAfterFirst ? this.toLocaleLowercase(word, localeInstance) : word;
      }
      // A separate word stands alone, so whatever follows opens a new word.
      startsWord = isSeparate;
    }

    for (const elision of elisions ?? []) {
      result = result.replace(elision.match, elision.replace);
    }
    return result;
  }

  /**
   * Insert the locale's "and" word before a trailing sub-hundred group, as in
   * en-GB "One Hundred And One". Requires a word for 100-or-more immediately
   * before the group, which keeps it off bare tens ("Twenty One") and off the
   * minus prefix ("Minus Twenty One").
   */
  protected applyAndWord(
    words: string[],
    localeInstance: InstanceType<ConstructorOf<LocaleInterface>>
  ): string[] {
    const andWord = localeInstance.config.join?.andWord;
    if (!andWord || words.length < 2) {
      return words;
    }
    const cache = this.getLocaleCache(localeInstance);
    const result: string[] = [];

    for (let i = 0; i < words.length; i++) {
      // A maximal run of sub-hundred words takes "and" when it is the tail of
      // its scale group: something 100-or-more precedes it, and it is followed
      // by a scale word or nothing. The trailing test is what separates the
      // remainder in "one thousand and one" from the multiplier in "one
      // thousand one hundred", which reads the same at token level.
      if (
        cache.subHundredWordsSet.has(words[i]) &&
        i > 0 &&
        cache.largeWordsSet.has(words[i - 1])
      ) {
        let end = i;
        while (end < words.length && cache.subHundredWordsSet.has(words[end])) {
          end++;
        }
        if (end === words.length || cache.scaleWordsSet.has(words[end])) {
          result.push(andWord);
        }
      }
      result.push(words[i]);
    }
    return result;
  }

  /**
   * Locale-aware lowercasing. Plain toLowerCase() mishandles e.g. Turkish
   * dotted İ ("İki".toLowerCase() yields "i" + combining dot above), so use
   * the locale's casing rules. The locale data's own canonical code wins over
   * options.localeCode, which defaults to "en-US" even when a different
   * locale class was set via setLocale().
   */
  protected toLocaleLowercase(
    text: string,
    localeInstance?: InstanceType<ConstructorOf<LocaleInterface>>
  ): string {
    const localeCode =
      (localeInstance ?? this.locale)?.config.localeCode ?? this.options.localeCode;
    return localeCode ? text.toLocaleLowerCase(localeCode) : text.toLowerCase();
  }

  /**
   * Format a number as digits plus the locale's ordinal indicator
   * (e.g. 1st / 1er / 1º / 第1). Returns structured parts so renderers can
   * style the indicator independently (superscript, etc.).
   *
   * Unlike toOrdinal(), this never throws for missing locale data: bare
   * digits are always valid output, so locales without indicator data fall
   * back to plain digits, whereas spelled-out ordinals have no acceptable
   * fallback and must throw.
   */
  public toOrdinalIndicator(
    number: NumberInput,
    options: OrdinalIndicatorOptions = {}
  ): OrdinalIndicatorParts {
    if (!this.isValidNumber(number)) {
      throw new Error(`Invalid Number "${number}"`);
    }

    const numValue = Number(number);
    if (!Number.isInteger(numValue) || numValue < 0) {
      throw new Error(`Ordinal numbers must be non-negative integers, got "${number}"`);
    }

    const localeConfig = this.getLocaleFor(options.gender).config;
    const digits = String(numValue);
    const indicator = localeConfig.ordinalIndicator;

    if (!indicator) {
      return { text: digits, prefix: "", number: digits, suffix: "", superscript: false };
    }

    const prefix = indicator.prefix ?? "";
    let suffix = "";

    const suffixes = indicator.suffixes;
    if (suffixes) {
      const gender = options.gender;
      // Omitted or unavailable gender degrades to masculine (the library-wide
      // default), then to the genderless "any" map.
      const map = (gender && suffixes[gender]) ?? suffixes.masculine ?? suffixes.any;
      if (map) {
        suffix = map[this.getOrdinalCategory(numValue, localeConfig.localeCode)] ?? map.other;
      }
    }

    return {
      text: prefix + digits + suffix,
      prefix,
      number: digits,
      suffix,
      superscript: indicator.superscript ?? false,
    };
  }

  /**
   * CLDR ordinal category for a number, resolved with the locale data's own
   * canonical code. Without one, returns "other" rather than consulting the
   * runtime's ambient locale, which could silently apply the wrong language's
   * rules (e.g. English categories to French data).
   */
  private getOrdinalCategory(number: number, localeCode: string | undefined): PluralCategory {
    if (!localeCode) {
      return "other";
    }
    const rules = getOrdinalPluralRules(localeCode);
    return (rules?.select(number) as PluralCategory) ?? "other";
  }

  public toOrdinal(number: NumberInput, options: OrdinalOptions = {}): string {
    if (!this.isValidNumber(number)) {
      throw new Error(`Invalid Number "${number}"`);
    }

    const locale = this.getLocaleFor(options.gender ?? this.options.converterOptions?.gender);
    const localeConfig = locale.config;

    // Convert to number (ordinals typically don't need BigInt support for practical use)
    const numValue = Number(number);

    if (!Number.isInteger(numValue) || numValue < 0) {
      throw new Error(`Ordinal numbers must be non-negative integers, got "${number}"`);
    }

    // Check if locale supports ordinals
    if (
      !localeConfig.ordinalWordsMapping &&
      !localeConfig.ordinalSuffix &&
      !localeConfig.ordinalPrefix
    ) {
      throw new Error(`Ordinal conversion not supported for locale "${this.options.localeCode}"`);
    }

    const words = this.applyAndWord(this.convertOrdinal(numValue, options, locale), locale);

    let result = this.formatWords(words, locale);

    if (options.lowercase) {
      result = this.toLocaleLowercase(result, locale);
    }

    return result;
  }

  protected convertOrdinal(
    number: number,
    _options: OrdinalOptions,
    localeInstance: InstanceType<ConstructorOf<LocaleInterface>>
  ): string[] {
    const localeConfig = localeInstance.config;
    const cache = this.getLocaleCache(localeInstance);

    // Exact mapping wins outright: it carries forms that are only correct
    // standalone (French "Premier" for 1, where compounds want "Unième").
    const exact = cache.ordinalExactWordsMap.get(number);
    if (exact !== undefined) {
      return [exact];
    }

    // Particle languages mark the whole numeral, not a component of it.
    if (localeConfig.ordinalPrefix) {
      const cardinal = this.convertInternal(BigInt(number), true, undefined, localeInstance);
      return [localeConfig.ordinalPrefix + cardinal.join("")];
    }

    // Languages that inflect every additive component ignore the cardinal
    // spelling entirely — Spanish "Cuadragésimo Segundo" shares no token with
    // the cardinal "Cuarenta Y Dos".
    if (localeConfig.ordinalDerivation?.scope === "components") {
      const components = this.decomposeOrdinalComponents(number, localeInstance);
      if (components) {
        return components;
      }
    }

    const cardinalWords = this.convertInternal(BigInt(number), true, undefined, localeInstance);

    // Languages that inflect the fully written-out numeral need it assembled
    // first: Italian 101 is "Centouno" → "Centounesimo", which no per-token
    // rewrite can reach because "Cento" and "Uno" are still separate here.
    if (localeConfig.ordinalDerivation?.scope === "whole") {
      const written = this.formatWords(cardinalWords, localeInstance);
      return [this.ordinalizeToken(number, written, localeInstance)];
    }

    // A single token means the whole number is written as one word, so the
    // inflection applies to it directly: German "Zweiundvierzigste" from the
    // table, Italian "Quarantaduesimo" derived from "Quarantadue".
    if (cardinalWords.length === 1) {
      return [this.ordinalizeToken(number, cardinalWords[0], localeInstance)];
    }

    // Otherwise only the final token carries the ordinal: "Forty | Second",
    // "One | Thousandth".
    const lastWordIndex = cardinalWords.length - 1;
    const lastNumberComponent = this.getLastNumberComponent(number, localeConfig, localeInstance);
    cardinalWords[lastWordIndex] = this.ordinalizeToken(
      lastNumberComponent,
      cardinalWords[lastWordIndex],
      localeInstance
    );
    return cardinalWords;
  }

  /**
   * Ordinal form of a single component.
   *
   * Tries the locale's table, then its derivation rules, then a blanket
   * `ordinalSuffix`. Throws when none apply: returning the cardinal unchanged
   * (the previous behaviour) produced silently wrong output — "Ventuno" for
   * Italian 21st — with no way for a caller to detect it.
   */
  protected ordinalizeToken(
    componentNumber: number,
    cardinalToken: string,
    localeInstance: InstanceType<ConstructorOf<LocaleInterface>>
  ): string {
    const localeConfig = localeInstance.config;
    const tableMatch = this.getLocaleCache(localeInstance).ordinalWordsMap.get(componentNumber);
    if (tableMatch !== undefined) {
      return tableMatch;
    }

    for (const rule of localeConfig.ordinalDerivation?.rules ?? []) {
      if (rule.match.test(cardinalToken)) {
        return cardinalToken.replace(rule.match, rule.replace);
      }
    }

    if (localeConfig.ordinalSuffix) {
      return cardinalToken + localeConfig.ordinalSuffix;
    }

    throw new Error(
      `Ordinal conversion not supported for "${componentNumber}" in locale "${
        localeConfig.localeCode ?? this.options.localeCode
      }": no ordinalWordsMapping entry, derivation rule, or ordinalSuffix applies`
    );
  }

  /**
   * Split a number into the additive components an "every component" language
   * inflects, and return each already in ordinal form.
   *
   * Atoms come from `ordinalWordsMapping`, which is what makes Spanish 21
   * decompose as 20 + 1 ("Vigésimo Primero") even though its cardinal 21 is
   * the single word "Veintiuno". Scale entries (1000 and up) take a cardinal
   * multiplier when the quotient exceeds one: 2001 → "Dos Milésimo Primero".
   *
   * Returns undefined when the number cannot be decomposed, letting the
   * caller fall back to the last-token strategy.
   */
  private decomposeOrdinalComponents(
    number: number,
    localeInstance: InstanceType<ConstructorOf<LocaleInterface>>
  ): string[] | undefined {
    const cache = this.getLocaleCache(localeInstance);
    const derivation = localeInstance.config.ordinalDerivation!;
    const atoms = cache.ordinalComponentNumbers;
    if (atoms.length === 0) {
      return undefined;
    }

    // Each entry is one component's words, kept grouped so the whole component
    // can be reordered and joined without splitting multi-word scale forms.
    const components: string[][] = [];
    let remainder = number;

    while (remainder > 0) {
      const atom = atoms.find((candidate) => candidate > 0 && candidate <= remainder);
      if (atom === undefined) {
        return undefined;
      }
      const ordinalWord = cache.ordinalWordsMap.get(atom)!;

      // Multipliable units (hundreds and up) take a cardinal quotient rather
      // than being subtracted repeatedly, which would turn 200 into
      // "hundredth and hundredth" wherever the table lacks its own 200 entry.
      if (atom >= 100) {
        const quotient = Math.floor(remainder / atom);
        const words =
          quotient > 1
            ? this.convertInternal(BigInt(quotient), false, undefined, localeInstance)
            : [];
        components.push([...words, ordinalWord]);
        remainder -= quotient * atom;
      } else {
        components.push([ordinalWord]);
        remainder -= atom;
      }
    }

    if (components.length === 0) {
      return undefined;
    }
    if (derivation.componentOrder === "ascending") {
      components.reverse();
    }

    const result: string[] = [];
    for (const component of components) {
      if (result.length > 0 && derivation.componentJoin) {
        result.push(derivation.componentJoin);
      }
      result.push(...component);
    }
    return result;
  }

  protected getLastNumberComponent(
    number: number,
    localeConfig: LocaleInterface["config"],
    localeInstance?: InstanceType<ConstructorOf<LocaleInterface>>
  ): number {
    // Find the last number component that makes up this number
    // This is locale-aware: Hindi/Indic locales have atomic words for 21-99,
    // while English composes them (Twenty + One)

    // For numbers 1-20, return the number itself
    if (number <= 20) {
      return number;
    }

    // Use pre-computed cache when the locale instance is available (avoids
    // re-filtering and re-sorting numberWordsMapping on every ordinal call)
    const unitMappings = localeInstance
      ? this.getLocaleCache(localeInstance).unitMappings
      : localeConfig.numberWordsMapping
          .filter((m) => Number(m.number) >= 100)
          .sort((a, b) => Number(b.number) - Number(a.number));

    // Find if this is a round number ending in a unit
    for (const mapping of unitMappings) {
      const unit = Number(mapping.number);
      if (number % unit === 0) {
        // This number is a multiple of this unit
        // Return the unit itself (e.g., for 1000000 = 10 × 100000, return 100000)
        return unit;
      }
    }

    // Get the last two digits
    const lastTwoDigits = number % 100;

    // Check if locale has atomic word for the last two digits (1-99)
    // This is true for Hindi, Bengali, Gujarati, Marathi, etc.
    // For numbers like 111 (last two digits = 11), check if locale has word for 11
    // Note: lastTwoDigits === 0 is impossible here — multiples of 100 are caught above by the
    // unit-mapping loop (e.g. 200 % 100 === 0 returns 100 early), so lastTwoDigits is always 1-99.
    const hasAtomicWord = localeConfig.numberWordsMapping.some(
      (m) => Number(m.number) === lastTwoDigits
    );
    if (hasAtomicWord) {
      return lastTwoDigits;
    }

    // For English-style locales that compose 21-99 (Twenty + One)
    // Check for decade (20, 30, 40, etc.)
    if (lastTwoDigits % 10 === 0) {
      return lastTwoDigits;
    }

    // Return the ones digit
    return number % 10;
  }

  /**
   * Convert a number into independently-written segments: the sign word, the
   * integer numeral, the decimal-point word, and the fractional part (whose
   * leading-zero form reads digit by digit, each its own written word).
   */
  protected convertNumberSegments(
    number: number | bigint,
    localeInstance?: InstanceType<ConstructorOf<LocaleInterface>>
  ): string[][] {
    const locale = localeInstance ?? this.getLocale();
    const localeConfig = locale.config;

    const isNegativeNumber = number < 0 || (typeof number === "bigint" && number < 0n);
    if (isNegativeNumber) {
      number = typeof number === "bigint" ? -number : Math.abs(number);
    }

    const isBigInt = typeof number === "bigint";
    const isFloat = !isBigInt && this.isFloat(number as number);
    let integerPart: bigint;
    let fractionalPart = "";

    if (isBigInt) {
      integerPart = number as bigint;
    } else if (isFloat) {
      const segments = number.toString().split(".");
      integerPart = BigInt(segments[0]);
      fractionalPart = segments[1];
    } else {
      integerPart = BigInt(Math.trunc(number as number));
    }

    const ignoreZero = this.isNumberZero(number) && localeConfig.ignoreZeroInDecimals;
    let words = this.convertInternal(integerPart, true, undefined, locale);
    if (isFloat && ignoreZero) {
      words = [];
    }

    const decimalSegments: string[][] = [];
    if (isFloat) {
      if (!ignoreZero) {
        decimalSegments.push([localeConfig.texts.point]);
      }
      if (fractionalPart.startsWith("0") && !localeConfig?.decimalLengthWordMapping) {
        // Read digit by digit; each digit is its own written word.
        for (const num of fractionalPart) {
          decimalSegments.push(this.convertInternal(BigInt(num), true, undefined, locale));
        }
      } else {
        decimalSegments.push(this.convertInternal(BigInt(fractionalPart), true, undefined, locale));
        const decimalLengthWord = localeConfig?.decimalLengthWordMapping?.[fractionalPart.length];
        if (decimalLengthWord) {
          decimalSegments.push([decimalLengthWord]);
        }
      }
    }
    // Applied to the integer part only: "one hundred and one point five",
    // never "point sixty and three".
    words = this.applyAndWord(words, locale);

    const segments: string[][] = [];
    const isEmpty = words.length <= 0;
    if (!isEmpty && isNegativeNumber) {
      segments.push([localeConfig.texts.minus]);
    }
    segments.push(words);
    segments.push(...decimalSegments);
    return segments;
  }

  protected convertInternal(
    number: bigint,
    trailing: boolean = false,
    overrides: Record<number, string> | undefined = undefined,
    localeInstance?: InstanceType<ConstructorOf<LocaleInterface>>
  ): string[] {
    const locale = localeInstance ?? this.getLocale();
    const localeConfig = locale.config;
    const cache = this.getLocaleCache(locale);

    // Check overrides - avoid Object.keys() when overrides is undefined/empty
    if (overrides) {
      const numberAsNum = number <= BIGINT_MAX_SAFE ? Number(number) : -1;
      if (numberAsNum !== -1 && overrides[numberAsNum]) {
        return [overrides[numberAsNum]];
      }
    }

    // Check exactWordsMapping using O(1) Map lookup
    const exactMatch = cache.exactWordsMap.get(number);
    if (exactMatch) {
      return [
        trailing && Array.isArray(exactMatch.value)
          ? exactMatch.value[1]
          : exactMatch.resolvedValue,
      ];
    }

    // Fast path: Use O(1) Map lookup for small numbers (0-100)
    let match: CachedNumberWordMap;
    if (number <= BIGINT_100) {
      const directMatch = cache.smallNumbersMap.get(number);
      if (directMatch) {
        return [
          trailing && Array.isArray(directMatch.value)
            ? directMatch.value[1]
            : directMatch.resolvedValue,
        ];
      }
      // Number not directly in map, use binary search (e.g., 21 = 20 + 1)
      match = this.binarySearchDescending(cache.numberWordsMappingBigInt, number);
    } else {
      // Use binary search on pre-computed BigInt values (array is sorted descending)
      match = this.binarySearchDescending(cache.numberWordsMappingBigInt, number);
    }

    const matchNumber = match.numberBigInt;
    const words: string[] = [];

    if (number <= BIGINT_100 || (number < BIGINT_1000 && localeConfig.namedLessThan1000)) {
      words.push(match.resolvedValue);
      const remainder = number - matchNumber;
      if (remainder > BIGINT_0) {
        if (localeConfig.splitWord) {
          words.push(localeConfig.splitWord);
        }
        const remainderWords = this.convertInternal(remainder, trailing, overrides, locale);
        for (const remainderWord of remainderWords) {
          words.push(remainderWord);
        }
      }
      return words;
    }

    const quotient = number / matchNumber;
    const remainder = number % matchNumber;
    let matchValue = match.resolvedValue;
    const originalMatchValue = match.resolvedValue;

    const matchNumberNum = Number(matchNumber);
    const pluralForms = localeConfig.pluralForms?.[matchNumberNum];
    let usedPluralForm = false;

    // Check if this word uses ignoreOneForWords - use O(1) Set lookup
    const usesIgnoreOne = cache.ignoreOneForWordsSet.has(originalMatchValue);

    if (pluralForms) {
      const lastTwoDigits = Number(quotient % BIGINT_100);
      const useLastDigits = quotient >= BIGINT_11 && lastTwoDigits >= 3 && lastTwoDigits <= 10;

      if (quotient === BIGINT_2 && pluralForms.dual) {
        matchValue = pluralForms.dual;
        usedPluralForm = true;
      } else if (
        (quotient >= BigInt(localeConfig.paucalConfig?.min ?? 3) &&
          quotient <= BigInt(localeConfig.paucalConfig?.max ?? 10)) ||
        useLastDigits
      ) {
        if (pluralForms.paucal) {
          matchValue = pluralForms.paucal;
        }
      } else if (quotient >= BIGINT_11 && pluralForms.plural) {
        matchValue = pluralForms.plural;
      }
    } else {
      // Check if this word should get plural mark - use O(1) Set lookup
      const matchValueStr = match.value as string;
      const isInPluralWords = cache.pluralWordsSet.has(matchValueStr);
      const isInTrailingOnlyPluralWords = cache.pluralWordsOnlyWhenTrailingSet.has(matchValueStr);

      if (
        quotient > BIGINT_1 &&
        localeConfig.pluralMark &&
        (isInPluralWords || (isInTrailingOnlyPluralWords && remainder === BIGINT_0))
      ) {
        matchValue += localeConfig.pluralMark;
      }
      // Apply singularValue only when quotient ends in 1 AND this word doesn't use ignoreOneForWords
      // For ignoreOneForWords words, singularValue is handled separately below
      if (quotient % BIGINT_10 === BIGINT_1 && !usesIgnoreOne) {
        // matchValue is always resolvedValue (a string), so the Array.isArray guard is not needed.
        matchValue = match.singularValue || matchValue;
      }
    }

    if ((quotient === BIGINT_1 && usesIgnoreOne) || usedPluralForm) {
      // A [multiplier, final] pair still distinguishes position here: Spanish
      // 200 is "doscientas" standing alone but "doscientos millones" in front
      // of a scale noun. Skipped when a plural form already replaced the word.
      const positional =
        trailing && !usedPluralForm && Array.isArray(match.value) ? match.value[1] : matchValue;
      // When ignoring "one" and quotient is exactly 1, use singularValue if available
      const valueToUse =
        quotient === BIGINT_1 && match.singularValue ? match.singularValue : positional;
      words.push(valueToUse);
    } else {
      const quotientWords = this.convertInternal(quotient, false, overrides, locale);
      for (const quotientWord of quotientWords) {
        words.push(quotientWord);
      }
      words.push(matchValue);
    }

    if (remainder > BIGINT_0) {
      if (localeConfig.splitWord) {
        // Use O(1) Set lookup instead of array.includes()
        if (!cache.noSplitWordAfterSet.has(match.resolvedValue)) {
          words.push(localeConfig.splitWord);
        }
      }
      const remainderWords = this.convertInternal(remainder, trailing, overrides, locale);
      for (const remainderWord of remainderWords) {
        words.push(remainderWord);
      }
    }
    return words;
  }

  /**
   * Binary search on a descending-sorted array of CachedNumberWordMap.
   * Finds the first element where numberBigInt <= target.
   */
  private binarySearchDescending(arr: CachedNumberWordMap[], target: bigint): CachedNumberWordMap {
    let left = 0;
    let right = arr.length - 1;
    let result = arr[right]; // Default to smallest (last element)

    while (left <= right) {
      const mid = (left + right) >> 1; // Faster than Math.floor
      if (arr[mid].numberBigInt <= target) {
        result = arr[mid];
        right = mid - 1; // Look for larger match in left half
      } else {
        left = mid + 1; // Look in right half
      }
    }

    return result;
  }

  public isFloat(number: number | string): boolean {
    return Number(number) === number && number % 1 !== 0;
  }

  public isValidNumber(number: NumberInput): boolean {
    // Fast path for common types
    const type = typeof number;
    if (type === "bigint") {
      return true;
    }
    if (type === "number") {
      return !Number.isNaN(number) && Number.isFinite(number as number);
    }
    // String case - reject empty/whitespace strings, then check if valid number
    // Empty string converts to 0 via Number() but should be invalid
    const str = number as string;
    if (str.trim() === "") {
      return false;
    }
    const converted = Number(str);
    return !Number.isNaN(converted) && Number.isFinite(converted);
  }

  public isNumberZero(number: number | bigint): boolean {
    if (typeof number === "bigint") {
      return number === BIGINT_0;
    }
    return number >= 0 && number < 1;
  }
}
