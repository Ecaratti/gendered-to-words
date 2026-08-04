import { describe, expect, test } from "vitest";
import EnUs from "../src/locales/en-US.js";
import ItIt from "../src/locales/it-IT.js";
import ItItF from "../src/locales/it-IT-f.js";
import { LOCALES, resolveLocaleCode } from "../src/ToWords";
import { ToWordsCore } from "../src/ToWordsCore";

/**
 * The tree-shaken path must support gender without importing the locale
 * registry — that registry is exactly what consumers of `core` are avoiding.
 * `setLocale` therefore accepts a map of gendered variants.
 */
describe("ToWordsCore gender via setLocale map", () => {
  const tw = () => new ToWordsCore().setLocale({ masculine: ItIt, feminine: ItItF });

  test("per-call gender selects the variant", () => {
    expect(tw().toOrdinal(42)).toBe("Quarantaduesimo");
    expect(tw().toOrdinal(42, { gender: "feminine" })).toBe("Quarantaduesima");
    expect(tw().convert(1, { gender: "feminine" })).toBe("Una");
  });

  test("one instance serves both genders without leaking between calls", () => {
    const instance = tw();
    expect([
      instance.toOrdinal(42),
      instance.toOrdinal(42, { gender: "feminine" }),
      instance.toOrdinal(42),
      instance.convert(1, { gender: "feminine" }),
      instance.convert(1),
    ]).toEqual(["Quarantaduesimo", "Quarantaduesima", "Quarantaduesimo", "Una", "Uno"]);
  });

  test("constructor-level gender applies without a per-call option", () => {
    const instance = new ToWordsCore({ converterOptions: { gender: "feminine" } }).setLocale({
      masculine: ItIt,
      feminine: ItItF,
    });
    expect(instance.toOrdinal(42)).toBe("Quarantaduesima");
    expect(instance.convert(1)).toBe("Una");
  });

  test("a gender with no variant falls back rather than throwing", () => {
    expect(tw().toOrdinal(42, { gender: "neutral" })).toBe("Quarantaduesimo");
  });

  test("a single class still works and ignores gender, as before", () => {
    const single = new ToWordsCore().setLocale(ItIt);
    expect(single.toOrdinal(42, { gender: "feminine" })).toBe("Quarantaduesimo");
  });

  test("lowercase composes with the gendered variant", () => {
    expect(tw().toOrdinal(42, { gender: "feminine", lowercase: true })).toBe("quarantaduesima");
  });

  test("setLocale can be called again to swap locales", () => {
    const instance = tw();
    expect(instance.toOrdinal(42, { gender: "feminine" })).toBe("Quarantaduesima");
    instance.setLocale(EnUs);
    expect(instance.toOrdinal(42)).toBe("Forty-Second");
  });
});

/**
 * Callers holding free-form input (a document's proofing language) need to test
 * a code without wrapping convert() in a try/catch.
 */
describe("resolveLocaleCode", () => {
  test.each([
    ["it-IT", "it-IT"],
    ["en-AU", "en-US"],
    ["zh-Hant-TW", "zh-TW"],
    ["FR", "fr-FR"],
  ] as [string, string][])("resolves %s to %s", (input, expected) => {
    expect(resolveLocaleCode(input)).toBe(expected);
  });

  test.each(["klingon", "xx-XX", "en-US-POSIX-extra", ""])("returns undefined for %s", (input) => {
    expect(resolveLocaleCode(input)).toBeUndefined();
  });

  test("every resolved code is a real key in LOCALES", () => {
    for (const input of ["it", "fr", "pt", "zh", "en", "de-AT", "es-MX"]) {
      const resolved = resolveLocaleCode(input);
      if (resolved !== undefined) {
        expect(LOCALES, input).toHaveProperty(resolved);
      }
    }
  });

  test("a bare language resolves to the intended region, not the alphabetical first", () => {
    // Belgian French uses septante/nonante; it must not answer for bare "fr".
    expect(resolveLocaleCode("fr")).toBe("fr-FR");
    expect(resolveLocaleCode("en")).toBe("en-US");
    expect(resolveLocaleCode("zh")).toBe("zh-CN");
  });
});
