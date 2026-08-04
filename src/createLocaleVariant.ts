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

export function createLocaleVariant(
  BaseLocale: ConstructorOf<LocaleInterface>,
  overrides: DeepPartialLocaleConfig
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

  // Merge array mappings by number key
  if (overrides.numberWordsMapping) {
    mergedConfig.numberWordsMapping = mergeNumberWordMappings(
      baseConfig.numberWordsMapping,
      overrides.numberWordsMapping
    );
  }
  if (overrides.exactWordsMapping) {
    mergedConfig.exactWordsMapping = mergeNumberWordMappings(
      baseConfig.exactWordsMapping ?? [],
      overrides.exactWordsMapping
    );
  }
  if (overrides.ordinalWordsMapping) {
    mergedConfig.ordinalWordsMapping = mergeOrdinalWordMappings(
      baseConfig.ordinalWordsMapping ?? [],
      overrides.ordinalWordsMapping
    );
  }
  if (overrides.ordinalExactWordsMapping) {
    mergedConfig.ordinalExactWordsMapping = mergeOrdinalWordMappings(
      baseConfig.ordinalExactWordsMapping ?? [],
      overrides.ordinalExactWordsMapping
    );
  }

  // Apply remaining scalar/array overrides
  const arrayKeys = [
    "numberWordsMapping",
    "exactWordsMapping",
    "ordinalWordsMapping",
    "ordinalExactWordsMapping",
    "texts",
  ] as const;
  for (const key of Object.keys(overrides) as (keyof DeepPartialLocaleConfig)[]) {
    if (!(arrayKeys as readonly string[]).includes(key) && overrides[key] !== undefined) {
      (mergedConfig as Record<string, unknown>)[key] = overrides[key];
    }
  }

  // Return a class with the merged config
  return class implements LocaleInterface {
    public config: LocaleConfig = mergedConfig;
  } as ConstructorOf<LocaleInterface>;
}
