import { describe, expect, test } from "vitest";
import EsEsF from "../src/locales/es-ES-f.js";
import ItItF from "../src/locales/it-IT-f.js";
import { ToWordsCore } from "../src/ToWordsCore";
import { GENDER_VARIANTS, LOCALES, ToWords, toOrdinal, toWords } from "../src/ToWords";

const GENDERED = ["it-IT", "es-ES", "pt-PT", "pt-BR", "ca-ES", "fr-FR", "fr-BE"];

/**
 * Gender bugs hide at the seams — in positions a spot-check of small numbers
 * never reaches. These sweeps assert the *shape* of the difference between
 * genders across a wide range, rather than enumerating outputs.
 */
describe("gender sweep", () => {
  test.each(GENDERED)("%s: scale-noun multipliers are gender-invariant", (code) => {
    // "Million" and up are masculine nouns in every one of these languages, so
    // no feminine form may appear in front of one — at any multiplier.
    const scales = [1e6, 1e9, 1e12];
    for (const scale of scales) {
      for (const multiplier of [1, 2, 3, 21, 100]) {
        const n = scale * multiplier;
        if (!Number.isSafeInteger(n)) {
          continue;
        }
        expect(
          toWords(n, { localeCode: code, gender: "feminine" }),
          `${code} toWords(${n}) must not change with gender`
        ).toBe(toWords(n, { localeCode: code }));
      }
    }
  });

  test.each(GENDERED)("%s: gender never produces empty or malformed output", (code) => {
    for (let n = 0; n <= 1000; n++) {
      for (const gender of ["masculine", "feminine", "neutral"] as const) {
        const cardinal = toWords(n, { localeCode: code, gender });
        const ordinal = toOrdinal(n, { localeCode: code, gender });
        for (const [label, value] of [
          ["cardinal", cardinal],
          ["ordinal", ordinal],
        ] as const) {
          expect(value.length, `${code} ${label} ${n} ${gender} empty`).toBeGreaterThan(0);
          expect(value, `${code} ${label} ${n} ${gender}`).not.toMatch(
            /undefined|NaN|\[object|\s\s|^\s|\s$/
          );
        }
      }
    }
  });

  test.each(GENDERED)("%s: feminine differs from masculine somewhere in 0-100", (code) => {
    // Guards against a variant silently resolving back to its base — the
    // failure mode that made `GENDER_VARIANTS` look supported when it wasn't.
    const differs = Array.from({ length: 101 }, (_, n) => n).some(
      (n) =>
        toOrdinal(n, { localeCode: code, gender: "feminine" }) !==
        toOrdinal(n, { localeCode: code })
    );
    expect(differs, `${code} feminine ordinals are identical to masculine`).toBe(true);
  });

  test("every locale advertised in GENDER_VARIANTS resolves to a distinct class", () => {
    for (const [lang, variants] of Object.entries(GENDER_VARIANTS)) {
      for (const [gender, VariantClass] of Object.entries(variants)) {
        const base = LOCALES[lang] ?? LOCALES[`${lang}-${lang.toUpperCase()}`];
        expect(VariantClass, `${lang}/${gender}`).toBeTypeOf("function");
        if (base) {
          expect(VariantClass, `${lang}/${gender}`).not.toBe(base);
        }
      }
    }
  });
});

describe("gender composes with the other input and output paths", () => {
  test("string and BigInt inputs respect gender", () => {
    expect(toWords("101", { localeCode: "es-ES", gender: "feminine" })).toBe("Ciento Una");
    expect(toWords(101n, { localeCode: "es-ES", gender: "feminine" })).toBe("Ciento Una");
    expect(toWords(101n, { localeCode: "es-ES" })).toBe("Ciento Uno");
  });

  test("decimals respect gender in both the integer and fractional part", () => {
    expect(toWords(1.1, { localeCode: "it-IT", gender: "feminine" })).toBe("Una Virgola Una");
    expect(toWords(1.1, { localeCode: "it-IT" })).toBe("Uno Virgola Uno");
  });

  test("negative numbers respect gender", () => {
    expect(toWords(-1, { localeCode: "it-IT", gender: "feminine" })).toBe("Meno Una");
  });

  test("ignoreDecimal composes with gender", () => {
    expect(toWords(1.9, { localeCode: "it-IT", gender: "feminine", ignoreDecimal: true })).toBe(
      "Una"
    );
  });

  test("gendered locale classes work through the tree-shaken core entry point", () => {
    expect(new ToWordsCore().setLocale(ItItF).toOrdinal(42)).toBe("Quarantaduesima");
    expect(new ToWordsCore().setLocale(EsEsF).toOrdinal(42)).toBe("Cuadragésima Segunda");
    // setLocale is respected as-is: a per-call gender must not override it.
    expect(new ToWordsCore().setLocale(ItItF).toOrdinal(42, { gender: "masculine" })).toBe(
      "Quarantaduesima"
    );
  });

  test("a gendered instance is reusable and stateless across calls", () => {
    const tw = new ToWords({ localeCode: "pt-PT" });
    const sequence = [
      tw.convert(2, { gender: "feminine" }),
      tw.convert(2),
      tw.convert(2000000, { gender: "feminine" }),
      tw.convert(2, { gender: "feminine" }),
    ];
    expect(sequence).toEqual(["Duas", "Dois", "Dois Milhões", "Duas"]);
  });
});
