import { describe, expect, test } from "vitest";
import { ToWords, toWords } from "../src/ToWords.js";
import frFrF from "../src/locales/fr-FR-f.js";

describe("French Feminine via GENDER_VARIANTS", () => {
  // Direct locale class usage (bypass LOCALES resolution)
  const tw = new ToWords();
  tw.setLocale(frFrF);

  describe("cardinal numbers - feminine overrides", () => {
    const cases: [number, string][] = [
      [1, "Une"],
      [21, "Vingt Et Une"],
      [31, "Trente Et Une"],
      [41, "Quarante Et Une"],
      [51, "Cinquante Et Une"],
      [61, "Soixante Et Une"],
      [81, "Quatre-Vingt-Une"],
    ];

    test.each(cases)("%d → %s", (input, expected) => {
      expect(tw.convert(input)).toBe(expected);
    });
  });

  describe("cardinal numbers - unchanged from base fr-FR", () => {
    const cases: [number, string][] = [
      [0, "Zéro"],
      [2, "Deux"],
      [10, "Dix"],
      [20, "Vingt"],
      [71, "Soixante Et Onze"],
      [80, "Quatre-Vingts"],
      [100, "Cent"],
      [1000, "Mille"],
      [1001, "Mille Une"],
      [2000, "Deux Mille"],
    ];

    test.each(cases)("%d → %s", (input, expected) => {
      expect(tw.convert(input)).toBe(expected);
    });
  });

  describe("ordinal - feminine", () => {
    test("1 → Première", () => {
      expect(tw.toOrdinal(1)).toBe("Première");
    });
  });
});

describe("Gender resolution via functional API", () => {
  test("feminine gender resolves French feminine variant", () => {
    expect(toWords(1, { localeCode: "fr-FR", gender: "feminine" })).toBe("Une");
  });

  test("masculine gender (default) uses base French", () => {
    expect(toWords(1, { localeCode: "fr-FR" })).toBe("Un");
  });

  test("gender on genderless locale falls back gracefully", () => {
    expect(toWords(1, { localeCode: "en-US", gender: "feminine" })).toBe("One");
  });

  test('language-level gender variant: "fr" with feminine', () => {
    expect(toWords(1, { localeCode: "fr", gender: "feminine" })).toBe("Une");
  });
});

describe("Locale fallback resolution", () => {
  test("en-GB falls back to en-US", () => {
    expect(toWords(1, { localeCode: "en-GB" })).toBe("One");
  });

  test("en falls back to en-US", () => {
    expect(toWords(1, { localeCode: "en" })).toBe("One");
  });

  test("fr falls back to fr-FR", () => {
    expect(toWords(80, { localeCode: "fr" })).toBe("Quatre-Vingts");
  });
});

describe("Lowercase option", () => {
  test("lowercase via direct instance", () => {
    const twLower = new ToWords();
    twLower.setLocale(frFrF);
    expect(twLower.convert(21, { lowercase: true })).toBe("vingt et une");
  });

  test("lowercase via functional API", () => {
    expect(toWords(1000, { localeCode: "fr-FR", lowercase: true })).toBe("mille");
  });
});

describe("Class API gender wiring", () => {
  test("constructor-level gender resolves the feminine variant", () => {
    const tw = new ToWords({ localeCode: "fr-FR", converterOptions: { gender: "feminine" } });
    expect(tw.convert(1)).toBe("Une");
    expect(tw.convert(21)).toBe("Vingt Et Une");
    expect(tw.toOrdinal(1)).toBe("Première");
  });

  test("per-call gender on a masculine instance delegates to a sibling", () => {
    const tw = new ToWords({ localeCode: "fr-FR" });
    expect(tw.convert(1, { gender: "feminine" })).toBe("Une");
    expect(tw.toOrdinal(1, { gender: "feminine" })).toBe("Première");
    expect(tw.convert(1)).toBe("Un"); // base instance unaffected
    expect(tw.convert(1, { gender: "feminine" })).toBe("Une"); // sibling cache reuse
  });

  test("per-call masculine on a feminine instance works symmetrically", () => {
    const tw = new ToWords({ localeCode: "fr-FR", converterOptions: { gender: "feminine" } });
    expect(tw.convert(1, { gender: "masculine" })).toBe("Un");
    expect(tw.convert(1)).toBe("Une");
  });

  test("neutral and genderless locales fall back gracefully (no sibling created)", () => {
    const tw = new ToWords({ localeCode: "fr-FR" });
    expect(tw.convert(1, { gender: "neutral" })).toBe("Un");
    const en = new ToWords({ localeCode: "en-US" });
    expect(en.convert(1, { gender: "feminine" })).toBe("One");
  });

  test("explicitly set locale class wins over per-call gender", () => {
    const tw = new ToWords();
    tw.setLocale(frFrF);
    expect(tw.convert(1, { gender: "masculine" })).toBe("Une");
  });

  test("unknown locale still throws through the gender path", () => {
    const tw = new ToWords({ localeCode: "xx-INVALID" });
    expect(() => tw.convert(1, { gender: "feminine" })).toThrow(/Unknown Locale/);
  });
});
