import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import heIl from "../src/locales/he-IL.js";

const localeCode = "he-IL";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(heIl);
  });

  const wrongLocaleCode = localeCode + "-wrong";
  test(`Wrong Locale: ${wrongLocaleCode}`, () => {
    const toWordsWrongLocale = new ToWords({
      localeCode: wrongLocaleCode,
    });
    expect(() => toWordsWrongLocale.convert(1)).toThrow(/Unknown Locale/);
  });
});

const testIntegers: [number, string][] = [
  [0, "אפס"],
  [1, "אחת"],
  [2, "שתיים"],
  [3, "שלוש"],
  [4, "ארבע"],
  [5, "חמש"],
  [6, "שש"],
  [7, "שבע"],
  [8, "שמונה"],
  [9, "תשע"],
  [10, "עשר"],
  [11, "אחת עשרה"],
  [12, "שתים עשרה"],
  [13, "שלוש עשרה"],
  [14, "ארבע עשרה"],
  [15, "חמש עשרה"],
  [16, "שש עשרה"],
  [17, "שבע עשרה"],
  [18, "שמונה עשרה"],
  [19, "תשע עשרה"],
  [20, "עשרים"],
  [21, "עשרים ו אחת"],
  [25, "עשרים ו חמש"],
  [30, "שלושים"],
  [42, "ארבעים ו שתיים"],
  [50, "חמישים"],
  [99, "תשעים ו תשע"],
  [100, "מאה"],
  [137, "אחת מאה ו שלושים ו שבע"],
  [200, "מאתיים"],
  [300, "שלוש מאה"],
  [500, "חמש מאה"],
  [700, "שבע מאה"],
  [999, "תשע מאה ו תשעים ו תשע"],
  [1000, "אלף"],
  [1001, "אלף ו אחת"],
  [1234, "אלף ו שתיים מאה ו שלושים ו ארבע"],
  [2000, "אלפיים"],
  [4680, "ארבע אלף ו שש מאה ו שמונים"],
  [10000, "עשר אלף"],
  [63892, "שישים ו שלוש אלף ו שמונה מאה ו תשעים ו שתיים"],
  [100000, "מאה אלף"],
  [792581, "שבע מאה ו תשעים ו שתיים אלף ו חמש מאה ו שמונים ו אחת"],
  [1000000, "מיליון"],
  [2741034, "שתיים מיליון ו שבע מאה ו ארבעים ו אחת אלף ו שלושים ו ארבע"],
  [86429753, "שמונים ו שש מיליון ו ארבע מאה ו עשרים ו תשע אלף ו שבע מאה ו חמישים ו שלוש"],
  [1000000000, "מיליארד"],
];

describe("Test Integers with options = {}", () => {
  test.concurrent.each(testIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

describe("Test Negative Integers with options = {}", () => {
  const testNegativeIntegers = cloneDeep(testIntegers);
  testNegativeIntegers.map((row, i) => {
    if (i === 0) {
      return;
    }
    row[0] = -row[0];
    row[1] = `מינוס ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "אפס"],
  [0.4, "אפס נקודה ארבע"],
  [0.04, "אפס נקודה אפס ארבע"],
  [0.63, "אפס נקודה שישים ו שלוש"],
  [0.973, "אפס נקודה תשע מאה ו שבעים ו שלוש"],
  [0.999, "אפס נקודה תשע מאה ו תשעים ו תשע"],
  [37.06, "שלושים ו שבע נקודה אפס שש"],
  [37.68, "שלושים ו שבע נקודה שישים ו שמונה"],
  [37.683, "שלושים ו שבע נקודה שש מאה ו שמונים ו שלוש"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});


const testOrdinals: [number, string][] = [
  [0, "האפס"],
  [1, "הראשון"],
  [2, "השני"],
  [3, "השלישי"],
  [4, "הרביעי"],
  [5, "החמישי"],
  [6, "השישי"],
  [7, "השביעי"],
  [8, "השמיני"],
  [9, "התשיעי"],
  [10, "העשירי"],
  [11, "האחת עשרה"],
  [12, "השתים עשרה"],
  [19, "התשע עשרה"],
  [20, "העשרים"],
  [21, "עשרים ו הראשון"],
  [25, "עשרים ו החמישי"],
  [30, "השלושים"],
  [99, "תשעים ו התשיעי"],
  [100, "המאה"],
  [200, "המאתיים"],
  [1000, "האלף"],
  [2000, "האלפיים"],
];

describe("Test Ordinals", () => {
  test.concurrent.each(testOrdinals)("toOrdinal %d => %s", (input, expected) => {
    expect(toWords.toOrdinal(input)).toBe(expected);
  });
});

const testPowersOfTen: [number, string][] = [
  [10, "עשר"],
  [100, "מאה"],
  [1000, "אלף"],
  [10000, "עשר אלף"],
  [100000, "מאה אלף"],
  [1000000, "מיליון"],
];

describe("Test Powers of Ten", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

const testBigInts: [bigint, string][] = [
  [0n, "אפס"],
  [1n, "אחת"],
  [100n, "מאה"],
  [1000n, "אלף"],
];

describe("Test BigInt", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

const testNegativeBigInts: [bigint, string][] = [
  [-1n, "מינוס אחת"],
  [-100n, "מינוס מאה"],
  [-1000n, "מינוס אלף"],
];

describe("Test Negative BigInt", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

const testStringInputs: [string, string][] = [
  ["0", "אפס"],
  ["1", "אחת"],
  ["100", "מאה"],
  ["-100", "מינוס מאה"],
];

describe("Test String Inputs", () => {
  test.concurrent.each(testStringInputs)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

describe("Test Zero Variants", () => {
  const testZeroVariants: [number | bigint | string, string][] = [
    [0, "אפס"],
    [-0, "אפס"],
    [0.0, "אפס"],
    [0n, "אפס"],
    ["0", "אפס"],
  ];

  test.concurrent.each(testZeroVariants)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });

});

describe("Test Invalid Inputs", () => {
  const testInvalidInputs: [number | string, string][] = [
    [Number.NaN, 'Invalid Number "NaN"'],
    [Infinity, 'Invalid Number "Infinity"'],
    [-Infinity, 'Invalid Number "-Infinity"'],
    ["", 'Invalid Number ""'],
    ["abc", 'Invalid Number "abc"'],
  ];

  test.concurrent.each(testInvalidInputs)("convert %s throws error", (input, expectedMessage) => {
    expect(() => toWords.convert(input)).toThrow(expectedMessage);
  });
});
