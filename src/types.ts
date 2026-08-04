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
