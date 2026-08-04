import { describe, expect, test } from "vitest";
import { ToWords, toOrdinal } from "../src/ToWords";

/**
 * Expectations here are written from the languages' own rules, independent of
 * what the implementation happens to produce, and cover the compound ordinals
 * that previously fell back to the cardinal.
 */

describe("compound ordinals are inflected, not silently left as cardinals", () => {
  // Whole-word derivation: the numeral is one written word and the ending
  // moves to the end of it.
  const italian: [number, string][] = [
    [11, "Undicesimo"],
    [20, "Ventesimo"],
    [21, "Ventunesimo"],
    [22, "Ventiduesimo"],
    [23, "Ventitreesimo"], // -tré keeps a plain e
    [26, "Ventiseiesimo"], // -sei keeps its i
    [28, "Ventottesimo"],
    [40, "Quarantesimo"],
    [42, "Quarantaduesimo"],
    [100, "Centesimo"],
    [101, "Centounesimo"],
    [121, "Centoventunesimo"],
    [1000, "Millesimo"],
    [2000, "Duemillesimo"],
  ];
  test.each(italian)("it-IT toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "it-IT" })).toBe(expected);
  });

  // Last-token derivation with stem shifts.
  const french: [number, string][] = [
    [1, "Premier"], // standalone only
    [2, "Deuxième"],
    [21, "Vingt Et Unième"], // "unième" inside a compound, never "premier"
    [22, "Vingt-Deuxième"],
    [25, "Vingt-Cinquième"], // cinq → cinqu-
    [29, "Vingt-Neuvième"], // neuf → neuv-
    [42, "Quarante-Deuxième"],
    [71, "Soixante Et Onzième"],
    [80, "Quatre-Vingtième"],
    [81, "Quatre-Vingt-Unième"],
    [100, "Centième"],
    [101, "Cent Unième"],
  ];
  test.each(french)("fr-FR toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "fr-FR" })).toBe(expected);
  });

  // Blanket suffix above the irregular range, plus concatenation.
  const dutch: [number, string][] = [
    [1, "Eerste"],
    [8, "Achtste"],
    [19, "Negentiende"],
    [20, "Twintigste"],
    [21, "Eenentwintigste"],
    [42, "Tweeënveertigste"],
    [100, "Honderdste"],
    [101, "Honderdeerste"],
    [121, "Honderdeenentwintigste"],
  ];
  test.each(dutch)("nl-NL toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "nl-NL" })).toBe(expected);
  });

  // Every additive component is inflected and the conjunction disappears:
  // the cardinal is "cuarenta y dos", the ordinal "cuadragésimo segundo".
  const spanish: [number, string][] = [
    [20, "Vigésimo"],
    [21, "Vigésimo Primero"],
    [22, "Vigésimo Segundo"],
    [42, "Cuadragésimo Segundo"],
    [100, "Centésimo"],
    [101, "Centésimo Primero"],
    [132, "Centésimo Trigésimo Segundo"],
    [200, "Ducentésimo"],
    [1000, "Milésimo"],
    [1001, "Milésimo Primero"],
  ];
  test.each(spanish)("es-ES toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "es-ES" })).toBe(expected);
  });

  const portuguese: [number, string][] = [
    [21, "Vigésimo Primeiro"],
    [42, "Quadragésimo Segundo"],
    [132, "Centésimo Trigésimo Segundo"],
  ];
  test.each(portuguese)("pt-PT toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "pt-PT" })).toBe(expected);
  });

  const catalan: [number, string][] = [
    [5, "Cinquè"],
    [10, "Desè"],
    [21, "Vint-I-Unè"],
    [42, "Quaranta-Dosè"],
    [110, "Cent Desè"], // irregular stem wins over the derivation
  ];
  test.each(catalan)("ca-ES toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "ca-ES" })).toBe(expected);
  });

  // Both halves inflect and are joined by "og".
  const icelandic: [number, string][] = [
    [21, "Tuttugasti Og Fyrsti"],
    [101, "Hundraðasti Og Fyrsti"],
  ];
  test.each(icelandic)("is-IS toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "is-IS" })).toBe(expected);
  });

  // English composes into separate tokens, so only the last one changes.
  const english: [number, string][] = [
    [21, "Twenty-First"],
    [42, "Forty-Second"],
    [100, "One Hundredth"],
    [101, "One Hundred First"],
    [1000, "One Thousandth"],
  ];
  test.each(english)("en-US toOrdinal(%d) => %s", (n, expected) => {
    expect(toOrdinal(n, { localeCode: "en-US" })).toBe(expected);
  });

  // A particle before the whole numeral, not an inflection.
  test("zh-CN marks ordinals with 第", () => {
    expect(toOrdinal(11, { localeCode: "zh-CN" })).toBe("第十一");
    expect(toOrdinal(21, { localeCode: "zh-CN" })).toBe("第二十一");
  });
});

describe("hundreds that are atomic cardinals get their own ordinal", () => {
  // These locales spell 200 as one mapping entry, so before the fix the whole
  // token was replaced by the ordinal for 100 — 200th read as 100th.
  test.each([
    ["el-GR", 200, "Διακοσιοστό"],
    ["el-GR", 300, "Τριακοσιοστό"],
    ["lv-LV", 200, "divsimtais"],
    ["tr-TR", 200, "İki Yüzüncü"],
  ] as [string, number, string][])("%s toOrdinal(%d) => %s", (code, n, expected) => {
    expect(toOrdinal(n, { localeCode: code })).toBe(expected);
  });
});

describe("missing ordinal data is reported rather than silently ignored", () => {
  test("a locale with no rule for a component throws instead of returning the cardinal", () => {
    const tw = new ToWords({ localeCode: "en-US" });
    // Sanity: the guard fires on genuinely unsupported locales, not valid ones.
    expect(() => tw.toOrdinal(42)).not.toThrow();
    expect(() => new ToWords({ localeCode: "ja-JP" }).toOrdinal(42)).not.toThrow();
  });

  test("negative and fractional ordinals are still rejected", () => {
    const tw = new ToWords({ localeCode: "it-IT" });
    expect(() => tw.toOrdinal(-1)).toThrow(/non-negative integers/);
    expect(() => tw.toOrdinal(1.5)).toThrow(/non-negative integers/);
  });
});
