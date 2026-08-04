import { describe, expect, test } from "vitest";
import { ToWords, toOrdinalIndicator } from "../src/ToWords";
import { ToWordsCore } from "../src/ToWordsCore";

// ---------------------------------------------------------------------------
// Per-locale expectations at CLDR-interesting numbers
// ---------------------------------------------------------------------------

describe("toOrdinalIndicator - en-US (st/nd/rd/th by category)", () => {
  const cases: [number, string][] = [
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [11, "11th"],
    [12, "12th"],
    [13, "13th"],
    [21, "21st"],
    [22, "22nd"],
    [23, "23rd"],
    [101, "101st"],
    [111, "111th"],
    [0, "0th"],
  ];
  test.each(cases)("%d → %s", (n, expected) => {
    expect(toOrdinalIndicator(n, { localeCode: "en-US" }).text).toBe(expected);
  });
});

describe("toOrdinalIndicator - French (er/re → e, superscript convention)", () => {
  test("masculine default", () => {
    expect(toOrdinalIndicator(1, { localeCode: "fr-FR" }).text).toBe("1er");
    expect(toOrdinalIndicator(2, { localeCode: "fr-FR" }).text).toBe("2e");
    expect(toOrdinalIndicator(21, { localeCode: "fr-FR" }).text).toBe("21e");
  });

  test("feminine", () => {
    expect(toOrdinalIndicator(1, { localeCode: "fr-FR", gender: "feminine" }).text).toBe("1re");
    expect(toOrdinalIndicator(2, { localeCode: "fr-FR", gender: "feminine" }).text).toBe("2e");
  });

  test("superscript flag is set, suffix stored plain", () => {
    const parts = toOrdinalIndicator(1, { localeCode: "fr-FR" });
    expect(parts).toEqual({
      text: "1er",
      prefix: "",
      number: "1",
      suffix: "er",
      superscript: true,
    });
  });

  test("fr-BE inherits French indicators with its own locale code", () => {
    expect(toOrdinalIndicator(1, { localeCode: "fr-BE", gender: "feminine" }).text).toBe("1re");
  });
});

describe("toOrdinalIndicator - Romance º/ª (precomposed, NOT flagged superscript)", () => {
  test.each(["es-ES", "it-IT", "pt-PT", "pt-BR"])("%s", (localeCode) => {
    expect(toOrdinalIndicator(1, { localeCode }).text).toBe("1º");
    expect(toOrdinalIndicator(1, { localeCode, gender: "feminine" }).text).toBe("1ª");
    expect(toOrdinalIndicator(1, { localeCode }).superscript).toBe(false);
  });
});

describe("toOrdinalIndicator - Catalan (category- and gender-dependent)", () => {
  const masc: [number, string][] = [
    [1, "1r"],
    [2, "2n"],
    [3, "3r"],
    [4, "4t"],
    [5, "5è"],
    [11, "11è"],
  ];
  test.each(masc)("masculine %d → %s", (n, expected) => {
    expect(toOrdinalIndicator(n, { localeCode: "ca-ES" }).text).toBe(expected);
  });

  test("feminine is uniformly -a", () => {
    expect(toOrdinalIndicator(1, { localeCode: "ca-ES", gender: "feminine" }).text).toBe("1a");
    expect(toOrdinalIndicator(4, { localeCode: "ca-ES", gender: "feminine" }).text).toBe("4a");
  });
});

describe("toOrdinalIndicator - Swedish (:a for one, :e otherwise)", () => {
  const cases: [number, string][] = [
    [1, "1:a"],
    [2, "2:a"],
    [3, "3:e"],
    [11, "11:e"],
    [12, "12:e"],
    [21, "21:a"],
    [22, "22:a"],
  ];
  test.each(cases)("%d → %s", (n, expected) => {
    expect(toOrdinalIndicator(n, { localeCode: "sv-SE" }).text).toBe(expected);
  });
});

describe("toOrdinalIndicator - three-gender locales", () => {
  test("Greek ος/η/ο", () => {
    expect(toOrdinalIndicator(1, { localeCode: "el-GR" }).text).toBe("1ος");
    expect(toOrdinalIndicator(1, { localeCode: "el-GR", gender: "feminine" }).text).toBe("1η");
    expect(toOrdinalIndicator(1, { localeCode: "el-GR", gender: "neutral" }).text).toBe("1ο");
  });

  test("Russian -й/-я/-е", () => {
    expect(toOrdinalIndicator(1, { localeCode: "ru-RU" }).text).toBe("1-й");
    expect(toOrdinalIndicator(2, { localeCode: "ru-RU", gender: "feminine" }).text).toBe("2-я");
    expect(toOrdinalIndicator(3, { localeCode: "ru-RU", gender: "neutral" }).text).toBe("3-е");
  });

  test("Ukrainian: masculine only; other genders fall back to masculine", () => {
    expect(toOrdinalIndicator(3, { localeCode: "uk-UA" }).text).toBe("3-й");
    expect(toOrdinalIndicator(3, { localeCode: "uk-UA", gender: "feminine" }).text).toBe("3-й");
  });
});

describe("toOrdinalIndicator - CJK prefix locales", () => {
  test.each([
    ["zh-CN", "第3"],
    ["zh-TW", "第3"],
    ["ja-JP", "第3"],
    ["ko-KR", "제3"],
  ] as [string, string][])("%s → %s", (localeCode, expected) => {
    const parts = toOrdinalIndicator(3, { localeCode });
    expect(parts.text).toBe(expected);
    expect(parts.prefix).toBe(expected[0]);
    expect(parts.suffix).toBe("");
  });
});

describe("toOrdinalIndicator - period locales", () => {
  test.each(["de-DE", "cs-CZ", "fi-FI", "tr-TR", "da-DK", "pl-PL", "hu-HU"])(
    "%s → '1.'",
    (localeCode) => {
      expect(toOrdinalIndicator(1, { localeCode }).text).toBe("1.");
    }
  );

  test("gender is irrelevant for genderless maps", () => {
    expect(toOrdinalIndicator(1, { localeCode: "de-DE", gender: "feminine" }).text).toBe("1.");
  });
});

// ---------------------------------------------------------------------------
// Fallback + error behavior
// ---------------------------------------------------------------------------

describe("toOrdinalIndicator - fallback behavior", () => {
  test("locales without indicator data return plain digits (never throw, unlike toOrdinal)", () => {
    for (const localeCode of ["ar-SA", "he-IL", "hi-IN", "sw-TZ", "sq-AL", "ro-RO", "bg-BG"]) {
      const parts = toOrdinalIndicator(7, { localeCode });
      expect(parts).toEqual({ text: "7", prefix: "", number: "7", suffix: "", superscript: false });
    }
  });

  test("custom locale without localeCode uses the 'other' category (never ambient locale)", () => {
    const CustomLocale = class {
      config = {
        // no localeCode on purpose
        ordinalIndicator: { suffixes: { any: { one: "SHOULD-NOT-APPEAR", other: "x" } } },
        texts: { minus: "Minus", point: "Point" },
        numberWordsMapping: [
          { number: 1, value: "One" },
          { number: 0, value: "Zero" },
        ],
      };
    };
    const core = new ToWordsCore();
    core.setLocale(CustomLocale as never);
    expect(core.toOrdinalIndicator(1).text).toBe("1x");
  });

  test("invalid localeCode in custom locale data degrades to 'other' category", () => {
    const BadCodeLocale = class {
      config = {
        localeCode: "not a bcp47 code!!",
        ordinalIndicator: { suffixes: { any: { one: "SHOULD-NOT-APPEAR", other: "y" } } },
        texts: { minus: "Minus", point: "Point" },
        numberWordsMapping: [
          { number: 1, value: "One" },
          { number: 0, value: "Zero" },
        ],
      };
    };
    const core = new ToWordsCore();
    core.setLocale(BadCodeLocale as never);
    expect(core.toOrdinalIndicator(1).text).toBe("1y");
    // second call exercises the negative cache
    expect(core.toOrdinalIndicator(1).text).toBe("1y");
  });

  test("throws for invalid input, negatives, and non-integers (same as toOrdinal)", () => {
    expect(() => toOrdinalIndicator(Number.NaN, { localeCode: "en-US" })).toThrow(/Invalid Number/);
    expect(() => toOrdinalIndicator(-1, { localeCode: "en-US" })).toThrow(/non-negative integers/);
    expect(() => toOrdinalIndicator(1.5, { localeCode: "en-US" })).toThrow(/non-negative integers/);
    expect(() => toOrdinalIndicator(1, { localeCode: "xx-INVALID" })).toThrow(/Unknown Locale/);
  });

  test("accepts string and bigint input", () => {
    expect(toOrdinalIndicator("21", { localeCode: "en-US" }).text).toBe("21st");
    expect(toOrdinalIndicator(21n, { localeCode: "en-US" }).text).toBe("21st");
  });
});

describe("toOrdinalIndicator - class API", () => {
  test("works via ToWords instance", () => {
    const tw = new ToWords({ localeCode: "fr-FR" });
    expect(tw.toOrdinalIndicator(1, { gender: "feminine" }).text).toBe("1re");
  });

  test("category selection uses the locale data's own code, not options.localeCode", () => {
    // Core with default options (localeCode "en-US") but French locale class set:
    // English categories would make 21 "one" → "21er"; French rules give "21e".
    const core = new ToWords({ localeCode: "en-US" });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return import("../src/locales/fr-FR").then(({ default: FrFr }) => {
      core.setLocale(FrFr);
      expect(core.toOrdinalIndicator(21).text).toBe("21e");
      expect(core.toOrdinalIndicator(1).text).toBe("1er");
    });
  });
});
