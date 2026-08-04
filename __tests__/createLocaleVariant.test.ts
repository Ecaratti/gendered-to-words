import { describe, expect, test } from "vitest";
import { createLocaleVariant } from "../src/createLocaleVariant";
import { ToWordsCore } from "../src/ToWordsCore";
import EnUsLocale from "../src/locales/en-US";

function configOf(Variant: ReturnType<typeof createLocaleVariant>) {
  return new Variant().config;
}

describe("createLocaleVariant", () => {
  test("returns base config unchanged when no overrides given", () => {
    const Variant = createLocaleVariant(EnUsLocale, {});
    const base = new EnUsLocale().config;
    const merged = configOf(Variant);
    expect(merged.texts).toEqual(base.texts);
    expect(merged.numberWordsMapping).toEqual(base.numberWordsMapping);
  });

  test("merges texts partially", () => {
    const Variant = createLocaleVariant(EnUsLocale, {
      texts: { minus: "Negative" },
    });
    const merged = configOf(Variant);
    expect(merged.texts.minus).toBe("Negative");
    expect(merged.texts.point).toBe("Point"); // untouched base value
  });

  test("overrides an existing numberWordsMapping entry by number key", () => {
    const Variant = createLocaleVariant(EnUsLocale, {
      numberWordsMapping: [{ number: 1, value: "Une" }],
    });
    const merged = configOf(Variant);
    expect(merged.numberWordsMapping.find((m) => m.number === 1)?.value).toBe("Une");
    // other entries untouched
    expect(merged.numberWordsMapping.find((m) => m.number === 2)?.value).toBe("Two");
  });

  test("appends numberWordsMapping entries that do not exist in base", () => {
    const base = new EnUsLocale().config;
    const Variant = createLocaleVariant(EnUsLocale, {
      numberWordsMapping: [{ number: 42, value: "FortyTwoAtomic" }],
    });
    const merged = configOf(Variant);
    expect(merged.numberWordsMapping).toHaveLength(base.numberWordsMapping.length + 1);
    expect(merged.numberWordsMapping.find((m) => m.number === 42)?.value).toBe("FortyTwoAtomic");
  });

  test("merges exactWordsMapping (override + append)", () => {
    const Variant = createLocaleVariant(EnUsLocale, {
      exactWordsMapping: [{ number: 100, value: "Exactly One Hundred" }],
    });
    const merged = configOf(Variant);
    expect(merged.exactWordsMapping?.find((m) => m.number === 100)?.value).toBe(
      "Exactly One Hundred"
    );
  });

  test("overrides an existing ordinalWordsMapping entry", () => {
    const Variant = createLocaleVariant(EnUsLocale, {
      ordinalWordsMapping: [{ number: 1, value: "Firstess" }],
    });
    const merged = configOf(Variant);
    expect(merged.ordinalWordsMapping?.find((m) => m.number === 1)?.value).toBe("Firstess");
    expect(merged.ordinalWordsMapping?.find((m) => m.number === 2)?.value).toBe("Second");
  });

  test("appends ordinalWordsMapping entries missing from base", () => {
    const base = new EnUsLocale().config;
    const baseLen = base.ordinalWordsMapping?.length ?? 0;
    const Variant = createLocaleVariant(EnUsLocale, {
      ordinalWordsMapping: [{ number: 999999937, value: "LargePrimeth" }],
    });
    const merged = configOf(Variant);
    expect(merged.ordinalWordsMapping).toHaveLength(baseLen + 1);
    expect(merged.ordinalWordsMapping?.find((m) => m.number === 999999937)?.value).toBe(
      "LargePrimeth"
    );
  });

  test("merges ordinalExactWordsMapping even when base has none", () => {
    const Variant = createLocaleVariant(EnUsLocale, {
      ordinalExactWordsMapping: [{ number: 7, value: "LuckySeventh" }],
    });
    const merged = configOf(Variant);
    expect(merged.ordinalExactWordsMapping?.find((m) => m.number === 7)?.value).toBe(
      "LuckySeventh"
    );
  });

  test("applies scalar overrides (splitWord, ordinalSuffix)", () => {
    const Variant = createLocaleVariant(EnUsLocale, {
      splitWord: "y",
      ordinalSuffix: "eth",
    });
    const merged = configOf(Variant);
    expect(merged.splitWord).toBe("y");
    expect(merged.ordinalSuffix).toBe("eth");
  });

  test("variant class works end-to-end with ToWordsCore", () => {
    const Variant = createLocaleVariant(EnUsLocale, {
      numberWordsMapping: [{ number: 1, value: "Une" }],
    });
    const tw = new ToWordsCore().setLocale(Variant);
    expect(tw.convert(1)).toBe("Une");
    expect(tw.convert(21)).toBe("Twenty Une");
    // base class remains unmodified
    const twBase = new ToWordsCore().setLocale(EnUsLocale);
    expect(twBase.convert(1)).toBe("One");
  });

  test("does not mutate the base locale config", () => {
    createLocaleVariant(EnUsLocale, {
      texts: { minus: "Changed" },
      numberWordsMapping: [{ number: 1, value: "Changed" }],
      splitWord: "changed",
    });
    const base = new EnUsLocale().config;
    expect(base.texts.minus).toBe("Minus");
    expect(base.numberWordsMapping.find((m) => m.number === 1)?.value).toBe("One");
    expect(base.splitWord).toBeUndefined();
  });
});
