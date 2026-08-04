import { describe, expect, test } from "vitest";
import { GENDER_VARIANTS, ToWords, toOrdinal, toWords } from "../src/ToWords";

describe("feminine ordinals", () => {
  test.each([
    ["it-IT", 1, "Prima"],
    ["it-IT", 2, "Seconda"],
    ["it-IT", 21, "Ventunesima"],
    ["it-IT", 42, "Quarantaduesima"],
    ["es-ES", 1, "Primera"],
    ["es-ES", 21, "Vigésima Primera"],
    ["es-ES", 42, "Cuadragésima Segunda"],
    ["pt-PT", 1, "Primeira"],
    ["pt-PT", 42, "Quadragésima Segunda"],
    ["pt-BR", 42, "Quadragésima Segunda"],
    ["ca-ES", 1, "Primera"],
    ["ca-ES", 2, "Segona"],
    ["ca-ES", 5, "Cinquena"],
    ["ca-ES", 21, "Vint-I-Unena"],
    ["ca-ES", 42, "Quaranta-Dosena"], // feminine cardinal "dues", masculine ordinal stem
    ["fr-FR", 1, "Première"],
  ] as [string, number, string][])("%s toOrdinal(%d, feminine) => %s", (code, n, expected) => {
    expect(toOrdinal(n, { localeCode: code, gender: "feminine" })).toBe(expected);
  });
});

describe("feminine cardinals, where the language agrees", () => {
  test.each([
    ["it-IT", 1, "Una"],
    ["es-ES", 1, "Una"],
    ["es-ES", 21, "Veintiuna"],
    ["es-ES", 200, "Doscientas"],
    ["pt-PT", 2, "Duas"],
    ["pt-PT", 200, "Duzentas"],
    ["ca-ES", 2, "Dues"],
    ["ca-ES", 21, "Vint-I-Una"],
    ["fr-FR", 21, "Vingt Et Une"],
  ] as [string, number, string][])("%s toWords(%d, feminine) => %s", (code, n, expected) => {
    expect(toWords(n, { localeCode: code, gender: "feminine" })).toBe(expected);
  });

  test("invariable numbers are unchanged", () => {
    expect(toWords(2, { localeCode: "it-IT", gender: "feminine" })).toBe("Due");
    expect(toWords(42, { localeCode: "fr-FR", gender: "feminine" })).toBe("Quarante-Deux");
  });
});

/**
 * The numeral agrees with what is being counted, but "million" and above are
 * themselves masculine *nouns* — so a feminine request must not reach the
 * multiplier standing in front of one. "Un milione di pagine", never
 * "una milione"; "dois milhões", never "duas milhões".
 */
describe("feminine agreement stops at masculine scale nouns", () => {
  test.each([
    ["it-IT", 1000000, "Un Milione"],
    ["it-IT", 1000000000, "Un Miliardo"],
    ["es-ES", 1000000, "Un Millon"],
    ["pt-PT", 1000000, "Um Milhão"],
    ["pt-PT", 2000000, "Dois Milhões"],
    ["pt-BR", 2000000, "Dois Milhões"],
    ["ca-ES", 1000000, "Un Milió"],
    ["ca-ES", 2000000, "Dos Milions"],
  ] as [string, number, string][])("%s toWords(%d, feminine) => %s", (code, n, expected) => {
    expect(toWords(n, { localeCode: code, gender: "feminine" })).toBe(expected);
  });

  test("the scale multiplier matches the masculine form exactly", () => {
    // Whatever these render as, gender must not change them.
    for (const [code, n] of [
      ["it-IT", 1000000],
      ["es-ES", 1000000],
      ["pt-PT", 2000000],
      ["ca-ES", 2000000],
    ] as [string, number][]) {
      expect(toWords(n, { localeCode: code, gender: "feminine" })).toBe(
        toWords(n, { localeCode: code })
      );
    }
  });

  test("but the final position still agrees", () => {
    expect(toWords(101, { localeCode: "it-IT", gender: "feminine" })).toBe("Centouna");
    expect(toWords(1001, { localeCode: "it-IT", gender: "feminine" })).toBe("Milleuna");
    expect(toWords(101, { localeCode: "es-ES", gender: "feminine" })).toBe("Ciento Una");
    expect(toWords(101, { localeCode: "pt-PT", gender: "feminine" })).toBe("Cento E Uma");
    expect(toWords(2, { localeCode: "pt-PT", gender: "feminine" })).toBe("Duas");
    expect(toWords(2, { localeCode: "ca-ES", gender: "feminine" })).toBe("Dues");
  });
});

/**
 * The [nonTrailing, trailing] tuple in the locale data is a *position*
 * distinction, not a gender one — it is what makes Italian "un milione" and
 * "uno" both correct. Gender variants build on top of it.
 */
describe("un/uno position handling (masculine baseline)", () => {
  test.each([
    ["it-IT", 1, "Uno"], // standalone: final position
    ["it-IT", 1000000, "Un Milione"], // multiplier position
    ["it-IT", 101, "Centouno"], // remainder keeps the final form
    ["it-IT", 1001, "Milleuno"],
    ["es-ES", 1, "Uno"],
    ["es-ES", 101, "Ciento Uno"],
    ["es-ES", 1000000, "Un Millon"],
  ] as [string, number, string][])("%s toWords(%d) => %s", (code, n, expected) => {
    expect(toWords(n, { localeCode: code })).toBe(expected);
  });
});

describe("gender resolution", () => {
  test("masculine is the default and matches an explicit masculine request", () => {
    for (const code of ["it-IT", "es-ES", "pt-PT", "ca-ES", "fr-FR"]) {
      expect(toOrdinal(21, { localeCode: code })).toBe(
        toOrdinal(21, { localeCode: code, gender: "masculine" })
      );
    }
  });

  test("languages without a variant fall back silently rather than throwing", () => {
    expect(toOrdinal(21, { localeCode: "de-DE", gender: "feminine" })).toBe(
      toOrdinal(21, { localeCode: "de-DE" })
    );
    expect(toWords(21, { localeCode: "en-US", gender: "neutral" })).toBe("Twenty-One");
  });

  test("per-call gender on a shared instance does not leak between calls", () => {
    const tw = new ToWords({ localeCode: "it-IT" });
    expect(tw.toOrdinal(1)).toBe("Primo");
    expect(tw.toOrdinal(1, { gender: "feminine" })).toBe("Prima");
    expect(tw.toOrdinal(1)).toBe("Primo");
  });

  test("constructor-level gender applies to every call", () => {
    const tw = new ToWords({ localeCode: "es-ES", converterOptions: { gender: "feminine" } });
    expect(tw.toOrdinal(42)).toBe("Cuadragésima Segunda");
    expect(tw.convert(200)).toBe("Doscientas");
  });

  test("gender composes with lowercase", () => {
    expect(toOrdinal(42, { localeCode: "it-IT", gender: "feminine", lowercase: true })).toBe(
      "quarantaduesima"
    );
  });

  test("GENDER_VARIANTS advertises exactly the languages with spelled-out forms", () => {
    expect(Object.keys(GENDER_VARIANTS).sort()).toEqual(
      ["ca", "es", "fr", "fr-BE", "it", "pt", "pt-BR"].sort()
    );
  });
});
