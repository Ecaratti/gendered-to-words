import type {
  ConstructorOf,
  DeepPartialLocaleConfig,
  LocaleConfig,
  LocaleInterface,
  NumberWordMap,
  OrdinalWordMap,
} from "./types.js";

function mergeNumberWordMappings(
  base: NumberWordMap[],
  overrides: NumberWordMap[]
): NumberWordMap[] {
  const overrideMap = new Map<string, NumberWordMap>();
  for (const entry of overrides) {
    overrideMap.set(String(entry.number), entry);
  }

  const merged = base.map((baseEntry) => {
    const key = String(baseEntry.number);
    return overrideMap.get(key) ?? baseEntry;
  });

  // Add any override entries that don't exist in base
  for (const [key, entry] of overrideMap) {
    if (!base.some((b) => String(b.number) === key)) {
      merged.push(entry);
    }
  }

  return merged;
}

function mergeOrdinalWordMappings(
  base: OrdinalWordMap[],
  overrides: OrdinalWordMap[]
): OrdinalWordMap[] {
  const overrideMap = new Map<string, OrdinalWordMap>();
  for (const entry of overrides) {
    overrideMap.set(String(entry.number), entry);
  }

  const merged = base.map((baseEntry) => {
    const key = String(baseEntry.number);
    return overrideMap.get(key) ?? baseEntry;
  });

  for (const [key, entry] of overrideMap) {
    if (!base.some((b) => String(b.number) === key)) {
      merged.push(entry);
    }
  }

  return merged;
}

/**
 * Wholesale rewrites applied to a base locale's word lists before the explicit
 * overrides are merged in.
 *
 * Grammatical gender is largely regular — Italian and Spanish ordinals swap a
 * final -o for -a across the board — so a variant is better expressed as one
 * rule plus a handful of irregulars than as a duplicated table that has to be
 * kept in sync with the base by hand.
 */
export type LocaleVariantTransforms = {
  transformOrdinalWords?: (value: string) => string;
  transformOrdinalExactWords?: (value: string) => string;
  /** Also rewrites the derivation rules' replacements, e.g. -esimo → -esima. */
  transformOrdinalDerivation?: (replacement: string) => string;
  /**
   * Number-word overrides that apply **only in final position**.
   *
   * A numeral standing in front of a scale noun agrees with that noun, not
   * with whatever is being counted — and "million" and up are masculine nouns
   * in every language with a variant here. So "un milione di pagine" and
   * "dois milhões de pessoas" keep the masculine even in a feminine variant,
   * while "centouna" and "cento e uma" agree.
   *
   * Each entry is paired with the base locale's own value to produce a
   * `[multiplier, final]` tuple, so the multiplier form can never drift out of
   * sync with the base the way a hand-written pair can.
   */
  agreementOverrides?: OrdinalWordMap[];
};

/** The form a mapping value takes when it multiplies a scale noun. */
function multiplierForm(value: NumberWordMap["value"]): string {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Rewrite `entries` so each listed number resolves to the base locale's value
 * in multiplier position and the variant's value in final position. Applied to
 * whichever mapping the base defines the number in, so lookup order is
 * preserved.
 */
function applyAgreementOverrides(
  base: NumberWordMap[] | undefined,
  overrides: OrdinalWordMap[]
): NumberWordMap[] | undefined {
  if (!base) {
    return base;
  }
  const byNumber = new Map(overrides.map((entry) => [String(entry.number), entry.value]));
  return base.map((entry) => {
    const agreeing = byNumber.get(String(entry.number));
    return agreeing === undefined
      ? entry
      : { ...entry, value: [multiplierForm(entry.value), agreeing] as [string, string] };
  });
}

export function createLocaleVariant(
  BaseLocale: ConstructorOf<LocaleInterface>,
  overrides: DeepPartialLocaleConfig & LocaleVariantTransforms
): ConstructorOf<LocaleInterface> {
  const baseInstance = new BaseLocale();
  const baseConfig = baseInstance.config;

  const mergedConfig: LocaleConfig = {
    ...baseConfig,
    texts: {
      ...baseConfig.texts,
      ...overrides.texts,
    },
  };

  // Transforms run first so explicit overrides can still correct irregulars.
  if (overrides.agreementOverrides) {
    mergedConfig.numberWordsMapping =
      applyAgreementOverrides(baseConfig.numberWordsMapping, overrides.agreementOverrides) ??
      baseConfig.numberWordsMapping;
    mergedConfig.exactWordsMapping = applyAgreementOverrides(
      baseConfig.exactWordsMapping,
      overrides.agreementOverrides
    );
  }
  if (overrides.transformOrdinalWords && baseConfig.ordinalWordsMapping) {
    const transform = overrides.transformOrdinalWords;
    mergedConfig.ordinalWordsMapping = baseConfig.ordinalWordsMapping.map((entry) => ({
      ...entry,
      value: transform(entry.value),
    }));
  }
  if (overrides.transformOrdinalExactWords && baseConfig.ordinalExactWordsMapping) {
    const transform = overrides.transformOrdinalExactWords;
    mergedConfig.ordinalExactWordsMapping = baseConfig.ordinalExactWordsMapping.map((entry) => ({
      ...entry,
      value: transform(entry.value),
    }));
  }
  if (overrides.transformOrdinalDerivation && baseConfig.ordinalDerivation?.rules) {
    const transform = overrides.transformOrdinalDerivation;
    mergedConfig.ordinalDerivation = {
      ...baseConfig.ordinalDerivation,
      rules: baseConfig.ordinalDerivation.rules.map((rule) => ({
        ...rule,
        replace: transform(rule.replace),
      })),
    };
  }

  // Merge array mappings by number key
  if (overrides.numberWordsMapping) {
    mergedConfig.numberWordsMapping = mergeNumberWordMappings(
      mergedConfig.numberWordsMapping,
      overrides.numberWordsMapping
    );
  }
  if (overrides.exactWordsMapping) {
    mergedConfig.exactWordsMapping = mergeNumberWordMappings(
      mergedConfig.exactWordsMapping ?? [],
      overrides.exactWordsMapping
    );
  }
  if (overrides.ordinalWordsMapping) {
    mergedConfig.ordinalWordsMapping = mergeOrdinalWordMappings(
      mergedConfig.ordinalWordsMapping ?? [],
      overrides.ordinalWordsMapping
    );
  }
  if (overrides.ordinalExactWordsMapping) {
    mergedConfig.ordinalExactWordsMapping = mergeOrdinalWordMappings(
      mergedConfig.ordinalExactWordsMapping ?? [],
      overrides.ordinalExactWordsMapping
    );
  }

  // Apply remaining scalar/array overrides
  const handledKeys = [
    "numberWordsMapping",
    "exactWordsMapping",
    "ordinalWordsMapping",
    "ordinalExactWordsMapping",
    "texts",
    "transformOrdinalWords",
    "transformOrdinalExactWords",
    "transformOrdinalDerivation",
    "agreementOverrides",
  ] as const;
  const overrideRecord = overrides as Record<string, unknown>;
  for (const key of Object.keys(overrides)) {
    if (!(handledKeys as readonly string[]).includes(key) && overrideRecord[key] !== undefined) {
      (mergedConfig as Record<string, unknown>)[key] = overrideRecord[key];
    }
  }

  // Return a class with the merged config
  return class implements LocaleInterface {
    public config: LocaleConfig = mergedConfig;
  } as ConstructorOf<LocaleInterface>;
}
