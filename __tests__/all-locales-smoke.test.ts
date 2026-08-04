import { describe, expect, test } from "vitest";
import { LOCALES, ToWords, toOrdinal, toOrdinalIndicator, toWords } from "../src/ToWords";

// Exhaustive sanity sweep: every bundled locale must produce non-empty output
// with no leaked "undefined"/"NaN" for a broad range of inputs. This catches
// data holes in locale mappings (missing atomic words, broken plural rules)
// that per-locale expectation tests may not cover.

const codes = Object.keys(LOCALES);

const cardinalInputs: (number | bigint | string)[] = [
  ...Array.from({ length: 131 }, (_, i) => i), // 0-130
  200,
  999,
  1000,
  1001,
  2345,
  9999,
  100000,
  123456,
  1000001,
  -1,
  -42,
  -100000,
  0.5,
  3.14,
  "12345",
  "0.001",
  12345678901n,
  -98765432109n,
];

const ordinalInputs: number[] = [
  ...Array.from({ length: 130 }, (_, i) => i + 1), // 1-130
  200,
  1000,
  2000,
  100000,
  1000000,
];

describe.each(codes)("locale %s produces sane output", (code) => {
  const tw = new ToWords({ localeCode: code });

  test("cardinals", () => {
    for (const n of cardinalInputs) {
      const words = tw.convert(n);
      expect(words, `convert(${n})`).toBeTypeOf("string");
      expect(words.length, `convert(${n}) empty`).toBeGreaterThan(0);
      expect(words, `convert(${n})`).not.toMatch(/undefined|NaN|\[object/);
    }
  });

  test("ordinals", () => {
    for (const n of ordinalInputs) {
      const words = tw.toOrdinal(n);
      expect(words, `toOrdinal(${n})`).toBeTypeOf("string");
      expect(words.length, `toOrdinal(${n}) empty`).toBeGreaterThan(0);
      expect(words, `toOrdinal(${n})`).not.toMatch(/undefined|NaN|\[object/);
    }
  });

  test("ordinal indicators are sane for all genders", () => {
    for (const n of [0, 1, 2, 3, 4, 11, 21, 101]) {
      for (const gender of [undefined, "masculine", "feminine", "neutral"] as const) {
        const parts = toOrdinalIndicator(n, { localeCode: code, gender });
        expect(parts.text, `toOrdinalIndicator(${n}, ${gender})`).toBe(
          parts.prefix + parts.number + parts.suffix
        );
        expect(parts.number).toBe(String(n));
        expect(parts.text).not.toMatch(/undefined|NaN/);
      }
    }
  });

  test("lowercase option produces well-formed Unicode (no combining artifacts)", () => {
    const words = toWords(21, { localeCode: code, lowercase: true });
    const ordinal = toOrdinal(21, { localeCode: code, lowercase: true });
    // U+0307 combining dot above appears when Turkish İ is lowercased with
    // non-Turkish rules — output must already be NFC-normalized.
    expect(words).toBe(words.normalize("NFC"));
    expect(ordinal).toBe(ordinal.normalize("NFC"));
  });
});

describe("locale-aware lowercasing", () => {
  test("Turkish dotted İ lowercases to plain i (no combining dot)", () => {
    const ordinal = toOrdinal(2, { localeCode: "tr-TR", lowercase: true });
    expect(ordinal).toBe("ikinci");
    expect(ordinal).not.toContain("̇");
  });

  test("ordinal lowercase option works (en-US)", () => {
    expect(toOrdinal(21, { localeCode: "en-US", lowercase: true })).toBe("twenty-first");
  });

  test("ordinal lowercase composes with gender (fr-FR feminine)", () => {
    expect(toOrdinal(1, { localeCode: "fr-FR", gender: "feminine", lowercase: true })).toBe(
      "première"
    );
  });

  test("class API ordinal lowercase", () => {
    const tw = new ToWords({ localeCode: "de-DE" });
    expect(tw.toOrdinal(3, { lowercase: true })).toBe("dritte");
  });
});
