import { describe, expect, test } from "vitest";
import { LOCALES, ToWords, toOrdinal, toWords } from "../src/ToWords";
import { ToWordsCore } from "../src/ToWordsCore";

const CODES = Object.keys(LOCALES);
const SAMPLE = [0, 1, 7, 21, 42, 100, 137, 200, 999, 1000, 1001, 123456];

/**
 * Properties that must hold for every locale, asserted over a range rather
 * than enumerated. Per-locale expectation tables say what a number *is*;
 * these say what the converter may never do — which is what catches data
 * holes in languages the table's author does not read.
 */
describe.each(CODES)("%s invariants", (code) => {
  const tw = new ToWords({ localeCode: code });

  test("distinct numbers produce distinct cardinals", () => {
    // Two numbers sharing one spelling means a mapping hole: this is exactly
    // how el-GR/lv-LV/tr-TR rendered 200th as 100th.
    const seen = new Map<string, number>();
    for (let n = 0; n <= 1000; n++) {
      const words = tw.convert(n);
      const previous = seen.get(words);
      expect(previous, `${code}: ${previous} and ${n} both spell "${words}"`).toBeUndefined();
      seen.set(words, n);
    }
  });

  test("distinct numbers produce distinct ordinals", () => {
    const seen = new Map<string, number>();
    for (let n = 0; n <= 1000; n++) {
      const words = tw.toOrdinal(n);
      const previous = seen.get(words);
      expect(previous, `${code}: ${previous}th and ${n}th both spell "${words}"`).toBeUndefined();
      seen.set(words, n);
    }
  });

  test("output is never empty, padded, or leaking a placeholder", () => {
    for (let n = 0; n <= 300; n++) {
      for (const words of [tw.convert(n), tw.toOrdinal(n)]) {
        expect(words.length, `${code} ${n}`).toBeGreaterThan(0);
        expect(words, `${code} ${n}`).not.toMatch(/undefined|NaN|\[object/);
        expect(words, `${code} ${n} has padding or double spaces`).toBe(
          words.trim().replace(/\s{2,}/g, " ")
        );
      }
    }
  });

  test("spelled-out output never contains digits", () => {
    for (const n of SAMPLE) {
      expect(tw.convert(n), `${code} convert(${n})`).not.toMatch(/\d/);
      expect(tw.toOrdinal(n), `${code} toOrdinal(${n})`).not.toMatch(/\d/);
    }
  });

  test("number, numeric string and BigInt inputs agree", () => {
    for (const n of SAMPLE) {
      const expected = tw.convert(n);
      expect(tw.convert(String(n)), `${code} "${n}"`).toBe(expected);
      expect(tw.convert(BigInt(n)), `${code} ${n}n`).toBe(expected);
    }
  });

  test("functional, class and tree-shaken core APIs agree", () => {
    const core = new ToWordsCore().setLocale(LOCALES[code]);
    for (const n of SAMPLE) {
      const expected = tw.convert(n);
      expect(toWords(n, { localeCode: code }), `${code} functional`).toBe(expected);
      expect(core.convert(n), `${code} core`).toBe(expected);
      expect(toOrdinal(n, { localeCode: code }), `${code} functional ordinal`).toBe(
        tw.toOrdinal(n)
      );
      expect(core.toOrdinal(n), `${code} core ordinal`).toBe(tw.toOrdinal(n));
    }
  });

  test("lowercase matches the locale's own casing rules", () => {
    for (const n of SAMPLE) {
      expect(tw.convert(n, { lowercase: true }), `${code} ${n}`).toBe(
        tw.convert(n).toLocaleLowerCase(code)
      );
      expect(tw.toOrdinal(n, { lowercase: true }), `${code} ordinal ${n}`).toBe(
        tw.toOrdinal(n).toLocaleLowerCase(code)
      );
    }
  });

  test("a negative number is its positive form plus the sign word", () => {
    for (const n of SAMPLE.filter((v) => v !== 0)) {
      expect(tw.convert(-n), `${code} -${n}`).toContain(tw.convert(n));
    }
  });

  test("ignoreDecimal truncates to the integer form", () => {
    for (const n of SAMPLE) {
      expect(tw.convert(n + 0.9, { ignoreDecimal: true }), `${code} ${n}.9`).toBe(tw.convert(n));
    }
  });

  test("repeated calls are stable (locale caching does not mutate state)", () => {
    for (const n of SAMPLE) {
      expect(tw.convert(n)).toBe(tw.convert(n));
      expect(tw.toOrdinal(n)).toBe(tw.toOrdinal(n));
    }
  });
});
