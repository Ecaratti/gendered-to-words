// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
export type Gender = "masculine" | "feminine" | "neutral";

export type ConverterOptions = {
  ignoreDecimal?: boolean;
  gender?: Gender;
  lowercase?: boolean;
};

export type OrdinalOptions = {
  gender?: Gender;
  lowercase?: boolean;
};

// CLDR plural categories as returned by Intl.PluralRules { type: "ordinal" }
export type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

export type OrdinalSuffixMap = Partial<Record<PluralCategory, string>> & { other: string };

export type OrdinalIndicatorConfig = {
  prefix?: string; // e.g. 第 (zh/ja), 제 (ko) — the indicator precedes the digits
  suffixes?: Partial<Record<Gender | "any", OrdinalSuffixMap>>;
  // Typographic convention: the suffix is conventionally rendered raised (e.g. French
  // 1er). The stored suffix text is always plain; raising it is the renderer's choice.
  superscript?: boolean;
};

export type OrdinalIndicatorOptions = {
  gender?: Gender;
};

export type OrdinalIndicatorParts = {
  text: string; // prefix + number + suffix, ready to use as a flat string
  prefix: string;
  number: string;
  suffix: string;
  superscript: boolean;
};

export type ToWordsOptions = {
  localeCode?: string;
  converterOptions?: ConverterOptions;
};

export interface ConstructorOf<T> {
  new (...args: unknown[]): T;
}

export type NumberWordMap = {
  number: number | bigint;
  value: string | [string, string];
  singularValue?: string;
};

export type OrdinalWordMap = {
  number: number | bigint;
  value: string;
};

/**
 * A rewrite applied to a cardinal token to produce its ordinal form.
 * `match` must not carry the /g flag — rules are applied with a single
 * String.replace and are expected to anchor at the end of the token.
 */
export type OrdinalDerivationRule = {
  match: RegExp;
  replace: string;
};

export type OrdinalDerivation = {
  /**
   * Where the ordinal inflection lands.
   *
   * - `"last"` (default): only the final cardinal token is inflected. Covers
   *   both languages that split compounds into tokens (English "Forty |
   *   Second", Turkish "Kırk | İkinci") and those that write the compound as
   *   one token (Italian "Quarantaduesimo", Dutch "Eenentwintigste") — in the
   *   latter the single token *is* the last token.
   * - `"whole"`: the cardinal is first written out in full (applying the
   *   locale's concatenation and hyphenation rules) and the inflection lands
   *   on that one word — Italian "Centouno" → "Centounesimo", Catalan
   *   "Quaranta-Dos" → "Quaranta-Dosè". Distinct from `"last"` because the
   *   ending being rewritten may belong to a token that is not itself the
   *   number's final component.
   * - `"components"`: every additive component is inflected and the cardinal
   *   tokens are discarded entirely (Spanish "Cuadragésimo Segundo",
   *   Portuguese "Quadragésimo Segundo"). Components are taken from
   *   `ordinalWordsMapping`, which therefore defines the atoms.
   */
  scope?: "last" | "whole" | "components";
  /**
   * Ordered rewrites tried against a cardinal token when
   * `ordinalWordsMapping` has no entry for it. First match wins.
   */
  rules?: OrdinalDerivationRule[];
  /**
   * Word placed between inflected components under `scope: "components"` —
   * Icelandic "tuttugasti og fyrsti", Arabic "الحادي و العشرون".
   */
  componentJoin?: string;
  /**
   * Component order. Defaults to `"descending"` (hundreds, then tens, then
   * units). Arabic names the unit first, matching its cardinal order.
   */
  componentOrder?: "descending" | "ascending";
};

export type ConcatenationConfig = {
  /**
   * Scale nouns that keep a space on either side. Germanic and Italian
   * numerals are written as one word up to (but excluding) "million", which
   * stays a separate noun: "einhunderteins", but "zwei Millionen einhundert".
   */
  separateWords?: string[];
  /**
   * Locale data stores every token Title Cased. When gluing tokens into one
   * word, lowercase all but the first so "Hundert" + "Eins" reads
   * "Hunderteins" rather than "HundertEins".
   */
  lowercaseAfterFirst?: boolean;
  /**
   * Rewrites applied once to the glued result, for vowel collisions that only
   * exist after joining: Italian "centoottanta" elides to "centottanta".
   */
  elisions?: OrdinalDerivationRule[];
};

export type JoinConfig = {
  /**
   * Hyphenate a tens word directly followed by a units word: English
   * "Twenty-One", "Forty-Second". Applies to ordinal units words too.
   */
  hyphenateTensUnits?: boolean;
  /**
   * Word inserted before a trailing sub-hundred group when a larger group
   * precedes it: en-GB "One Hundred And One", "One Thousand And Thirty Four".
   */
  andWord?: string;
};

export type NumberInput = number | bigint | string;

export type PluralFormsMapping = {
  [scaleNumber: number]: {
    dual?: string;
    paucal?: string;
    plural?: string;
  };
};

export type PaucalConfig = {
  min: number;
  max: number;
};

export type LocaleConfig = {
  // Canonical BCP 47 code of this locale's data. Used for locale-sensitive
  // operations (Intl.PluralRules category selection, lowercasing) so behavior
  // never depends on the ambient runtime locale or a mismatched option.
  localeCode?: string;
  ordinalIndicator?: OrdinalIndicatorConfig;
  texts: {
    minus: string;
    point: string;
  };
  numberWordsMapping: NumberWordMap[];
  exactWordsMapping?: NumberWordMap[];
  ordinalWordsMapping?: OrdinalWordMap[];
  ordinalSuffix?: string;
  ordinalExactWordsMapping?: OrdinalWordMap[];
  ordinalDerivation?: OrdinalDerivation;
  /**
   * Languages that mark ordinals with a particle before the whole numeral
   * rather than by inflecting it (Chinese/Japanese 第, Korean 제). When set,
   * the ordinal is this prefix followed by the cardinal, written solid.
   */
  ordinalPrefix?: string;
  concatenation?: ConcatenationConfig;
  join?: JoinConfig;
  namedLessThan1000?: boolean;
  splitWord?: string;
  ignoreZeroInDecimals?: boolean;
  decimalLengthWordMapping?: Record<number, string>;
  ignoreOneForWords?: string[];
  pluralMark?: string;
  pluralWords?: string[];
  pluralWordsOnlyWhenTrailing?: string[]; // Words that only get pluralMark when not followed by another number
  pluralForms?: PluralFormsMapping;
  paucalConfig?: PaucalConfig;
  noSplitWordAfter?: string[];
  trim?: boolean;
};

export interface LocaleInterface {
  config: LocaleConfig;
}

export type DeepPartialLocaleConfig = {
  texts?: Partial<LocaleConfig["texts"]>;
  numberWordsMapping?: NumberWordMap[];
  exactWordsMapping?: NumberWordMap[];
  ordinalWordsMapping?: OrdinalWordMap[];
  ordinalExactWordsMapping?: OrdinalWordMap[];
} & Partial<
  Omit<
    LocaleConfig,
    | "texts"
    | "numberWordsMapping"
    | "exactWordsMapping"
    | "ordinalWordsMapping"
    | "ordinalExactWordsMapping"
  >
>;
