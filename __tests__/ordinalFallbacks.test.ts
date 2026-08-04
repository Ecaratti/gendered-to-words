import { describe, expect, test } from "vitest";
import { ToWordsCore } from "../src/ToWordsCore";
import type { LocaleConfig, LocaleInterface } from "../src/types";

const baseNumbers: LocaleConfig["numberWordsMapping"] = [
  { number: 1000, value: "Thousand" },
  { number: 100, value: "Hundred" },
  { number: 40, value: "Forty" },
  { number: 20, value: "Twenty" },
  { number: 2, value: "Two" },
  { number: 1, value: "One" },
  { number: 0, value: "Zero" },
];

function locale(config: Partial<LocaleConfig>): new () => LocaleInterface {
  return class implements LocaleInterface {
    public config: LocaleConfig = {
      localeCode: "xx-XX",
      texts: { minus: "Minus", point: "Point" },
      numberWordsMapping: baseNumbers,
      ...config,
    };
  };
}

const build = (config: Partial<LocaleConfig>) =>
  new ToWordsCore().setLocale(locale(config) as never);

/**
 * The contract these lock in: a missing ordinal form is an error, never a
 * cardinal returned as though it were an ordinal. That silent fallback is what
 * made Italian 21st render as "Ventuno" and Greek 200th as "hundredth".
 */
describe("missing ordinal data is an error, not a silent cardinal", () => {
  test("throws when no table entry, derivation rule or suffix applies", () => {
    const tw = build({ ordinalWordsMapping: [{ number: 1, value: "Oneth" }] });
    expect(() => tw.toOrdinal(40)).toThrow(/Ordinal conversion not supported for "40"/);
  });

  test("the error names the locale and says what is missing", () => {
    const tw = build({ ordinalWordsMapping: [{ number: 1, value: "Oneth" }] });
    expect(() => tw.toOrdinal(40)).toThrow(/xx-XX/);
    expect(() => tw.toOrdinal(40)).toThrow(/ordinalWordsMapping entry, derivation rule/);
  });

  test("it never returns the cardinal instead", () => {
    const tw = build({ ordinalWordsMapping: [{ number: 1, value: "Oneth" }] });
    let result: string | undefined;
    try {
      result = tw.toOrdinal(40);
    } catch {
      result = undefined;
    }
    expect(result).toBeUndefined();
  });

  test("a locale with no ordinal data at all is rejected up front", () => {
    expect(() => build({}).toOrdinal(1)).toThrow(/Ordinal conversion not supported for locale/);
  });

  test("an ordinalSuffix is enough to satisfy any component", () => {
    const tw = build({ ordinalWordsMapping: [{ number: 1, value: "Oneth" }], ordinalSuffix: "th" });
    expect(tw.toOrdinal(40)).toBe("Fortyth");
    expect(tw.toOrdinal(1)).toBe("Oneth");
  });

  test("a derivation rule is enough, and is tried before the suffix", () => {
    const tw = build({
      ordinalWordsMapping: [{ number: 1, value: "Oneth" }],
      ordinalSuffix: "-SUFFIX",
      ordinalDerivation: { rules: [{ match: /y$/, replace: "ieth" }] },
    });
    expect(tw.toOrdinal(40)).toBe("Fortieth");
    // No rule matches "Two", so the suffix still catches it.
    expect(tw.toOrdinal(2)).toBe("Two-SUFFIX");
  });
});

describe("components scope falls back rather than producing nonsense", () => {
  test("an empty ordinal table falls through to the last-token strategy", () => {
    const tw = build({
      ordinalWordsMapping: [],
      ordinalSuffix: "th",
      ordinalDerivation: { scope: "components" },
    });
    expect(tw.toOrdinal(42)).toBe("Forty Twoth");
  });

  test("a table whose smallest atom exceeds the remainder falls back too", () => {
    // Only 100 is available, so 42 cannot be decomposed additively.
    const tw = build({
      ordinalWordsMapping: [{ number: 100, value: "Hundredth" }],
      ordinalSuffix: "th",
      ordinalDerivation: { scope: "components" },
    });
    expect(tw.toOrdinal(42)).toBe("Forty Twoth");
  });

  test("zero is handled without entering the decomposition loop", () => {
    const tw = build({
      ordinalWordsMapping: [
        { number: 20, value: "Twentieth" },
        { number: 2, value: "Second" },
        { number: 0, value: "Zeroth" },
      ],
      ordinalDerivation: { scope: "components" },
    });
    expect(tw.toOrdinal(0)).toBe("Zeroth");
    expect(tw.toOrdinal(22)).toBe("Twentieth Second");
  });
});
