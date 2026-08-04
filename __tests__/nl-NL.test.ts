import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import nlNl from "../src/locales/nl-NL.js";

const localeCode = "nl-NL";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(nlNl);
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
  [0, "Nul"],
  [137, "Een Honderd Zevenendertig"],
  [700, "Zeven Honderd"],
  [1100, "Een Duizend Honderd"],
  [4680, "Vier Duizend Zes Honderd Tachtig"],
  [63892, "Drieënzestig Duizend Acht Honderd Tweeënnegentig"],
  [86100, "Zesentachtig Duizend Honderd"],
  [792581, "Zeven Honderd Tweeënnegentig Duizend Vijf Honderd Eenentachtig"],
  [2741034, "Twee Miljoen Zeven Honderd Eenenveertig Duizend Vierendertig"],
  [
    86429753,
    "Zesentachtig Miljoen Vier Honderd Negenentwintig Duizend Zeven Honderd Drieënvijftig",
  ],
  [
    975310864,
    "Negen Honderd Vijfenzeventig Miljoen Drie Honderd Tien Duizend Acht Honderd Vierenzestig",
  ],
  [
    9876543210,
    "Negen Miljard Acht Honderd Zesenzeventig Miljoen Vijf Honderd Drieënveertig Duizend Twee Honderd Tien",
  ],
  [
    98765432101,
    "Achtennegentig Miljard Zeven Honderd Vijfenzestig Miljoen Vier Honderd Tweeëndertig Duizend Een Honderd Een",
  ],
  [
    987654321012,
    "Negen Honderd Zevenentachtig Miljard Zes Honderd Vierenvijftig Miljoen Drie Honderd Eenentwintig Duizend Twaalf",
  ],
  [
    9876543210123,
    "Negen Biljoen Acht Honderd Zesenzeventig Miljard Vijf Honderd Drieënveertig Miljoen Twee Honderd Tien Duizend Een Honderd Drieëntwintig",
  ],
  [
    98765432101234,
    "Achtennegentig Biljoen Zeven Honderd Vijfenzestig Miljard Vier Honderd Tweeëndertig Miljoen Een Honderd Een Duizend Twee Honderd Vierendertig",
  ],
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
    row[1] = `Negatief ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "Nul"],
  [0.04, "Nul Punt Nul Vier"],
  [0.0468, "Nul Punt Nul Vier Zes Acht"],
  [0.4, "Nul Punt Vier"],
  [0.973, "Nul Punt Negen Honderd Drieënzeventig"],
  [0.999, "Nul Punt Negen Honderd Negenennegentig"],
  [37.06, "Zevenendertig Punt Nul Zes"],
  [37.068, "Zevenendertig Punt Nul Zes Acht"],
  [37.68, "Zevenendertig Punt Achtenzestig"],
  [37.683, "Zevenendertig Punt Zes Honderd Drieëntachtig"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});


const testOrdinals: [number, string][] = [
  // Numbers 0-10
  [0, "Nulde"],
  [1, "Eerste"],
  [2, "Tweede"],
  [3, "Derde"],
  [4, "Vierde"],
  [5, "Vijfde"],
  [6, "Zesde"],
  [7, "Zevende"],
  [8, "Achtste"],
  [9, "Negende"],
  [10, "Tiende"],
  [11, "Elfde"],
  [12, "Twaalfde"],
  [13, "Dertiende"],
  [14, "Veertiende"],
  [15, "Vijftiende"],
  [16, "Zestiende"],
  [17, "Zeventiende"],
  [18, "Achttiende"],
  [19, "Negentiende"],
  [20, "Twintigste"],
  // Composite numbers (21, 22, etc.)
  [21, "Eenentwintig"],
  [22, "Tweeëntwintig"],
  [23, "Drieëntwintig"],
  [24, "Vierentwintig"],
  [25, "Vijfentwintig"],
  // Tens
  [30, "Dertigste"],
  [40, "Veertigste"],
  [50, "Vijftigste"],
  [60, "Zestigste"],
  [70, "Zeventigste"],
  [80, "Tachtigste"],
  [90, "Negentigste"],
  // Round numbers (100, 200, 1000, etc.)
  [100, "Honderdste"],
  [200, "Twee Honderdste"],
  [300, "Drie Honderdste"],
  [1000, "Een Duizendste"],
  [2000, "Twee Duizendste"],
  [1000000, "Een Miljoenste"],
  [2000000, "Twee Miljoenste"],
  // Complex numbers
  [101, "Een Honderd Eerste"],
  [102, "Een Honderd Tweede"],
  [111, "Een Honderd Elfde"],
  [123, "Een Honderd Drieëntwintig"],
  [150, "Een Honderd Vijftigste"],
  [1001, "Een Duizend Eerste"],
  [1234, "Een Duizend Twee Honderd Vierendertig"],
  [1500, "Een Duizend Vijf Honderdste"],
  [10000, "Tien Duizendste"],
  [100000, "Honderd Duizendste"],
  [1000001, "Een Miljoen Eerste"],
];

describe("Test Ordinals with toOrdinal()", () => {
  test.concurrent.each(testOrdinals)("toOrdinal(%d) => %s", (input, expected) => {
    expect(toWords.toOrdinal(input as number)).toBe(expected);
  });
});

describe("Test Ordinal Error Cases", () => {
  test("should throw error for negative numbers", () => {
    expect(() => toWords.toOrdinal(-1)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("should throw error for negative large numbers", () => {
    expect(() => toWords.toOrdinal(-100)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("should throw error for decimal numbers", () => {
    expect(() => toWords.toOrdinal(1.5)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("should throw error for small decimal numbers", () => {
    expect(() => toWords.toOrdinal(0.5)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("should throw error for large decimal numbers", () => {
    expect(() => toWords.toOrdinal(100.25)).toThrow(
      "Ordinal numbers must be non-negative integers"
    );
  });
});

// Powers of Ten
const testPowersOfTen: [number, string][] = [
  [10, "Tien"],
  [100, "Honderd"],
  [1000, "Een Duizend"],
  [10000, "Tien Duizend"],
  [100000, "Honderd Duizend"],
  [1000000, "Een Miljoen"],
  [10000000, "Tien Miljoen"],
  [100000000, "Honderd Miljoen"],
  [1000000000, "Een Miljard"],
  [10000000000, "Tien Miljard"],
  [100000000000, "Honderd Miljard"],
  [1000000000000, "Een Biljoen"],
];

describe("Test Powers of Ten", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Boundary Values
const testBoundaries: [number, string][] = [
  [99, "Negenennegentig"],
  [100, "Honderd"],
  [101, "Een Honderd Een"],
  [999, "Negen Honderd Negenennegentig"],
  [1000, "Een Duizend"],
  [1001, "Een Duizend Een"],
  [9999, "Negen Duizend Negen Honderd Negenennegentig"],
  [10000, "Tien Duizend"],
  [10001, "Tien Duizend Een"],
  [99999, "Negenennegentig Duizend Negen Honderd Negenennegentig"],
  [100000, "Honderd Duizend"],
  [100001, "Honderd Duizend Een"],
  [999999, "Negen Honderd Negenennegentig Duizend Negen Honderd Negenennegentig"],
  [1000000, "Een Miljoen"],
  [1000001, "Een Miljoen Een"],
  [9999999, "Negen Miljoen Negen Honderd Negenennegentig Duizend Negen Honderd Negenennegentig"],
  [10000000, "Tien Miljoen"],
  [10000001, "Tien Miljoen Een"],
];

describe("Test Boundary Values", () => {
  test.concurrent.each(testBoundaries)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative Floats
const testNegativeFloats: [number, string][] = [
  [-0.5, "Negatief Nul Punt Vijf"],
  [-0.25, "Negatief Nul Punt Vijfentwintig"],
  [-0.99, "Negatief Nul Punt Negenennegentig"],
  [-1.5, "Negatief Een Punt Vijf"],
  [-3.14, "Negatief Drie Punt Veertien"],
  [-99.99, "Negatief Negenennegentig Punt Negenennegentig"],
  [-100.01, "Negatief Honderd Punt Nul Een"],
  [-1000.999, "Negatief Een Duizend Punt Negen Honderd Negenennegentig"],
];

describe("Test Negative Floats", () => {
  test.concurrent.each(testNegativeFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "Nul"],
  [1n, "Een"],
  [100n, "Honderd"],
  [1000n, "Een Duizend"],
  [1000000n, "Een Miljoen"],
  [1000000000n, "Een Miljard"],
  [1000000000000n, "Een Biljoen"],
  [1000000000000000n, "Een Biljard"],
  [
    1234567890123n,
    "Een Biljoen Twee Honderd Vierendertig Miljard Vijf Honderd Zevenenzestig Miljoen Acht Honderd Negentig Duizend Een Honderd Drieëntwintig",
  ],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Negatief Een"],
  [-100n, "Negatief Honderd"],
  [-1000n, "Negatief Een Duizend"],
  [-1000000n, "Negatief Een Miljoen"],
  [-1000000000n, "Negatief Een Miljard"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "Nul"],
  ["1", "Een"],
  ["100", "Honderd"],
  ["1000", "Een Duizend"],
  ["-100", "Negatief Honderd"],
  ["3.14", "Drie Punt Veertien"],
  ["-3.14", "Negatief Drie Punt Veertien"],
  ["  100  ", "Honderd"],
  ["1000000", "Een Miljoen"],
  ["1000000000", "Een Miljard"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("Nul");
  });

  test("converts -0 as Nul", () => {
    expect(toWords.convert(-0)).toBe("Nul");
  });

  test("converts 0.0 as Nul", () => {
    expect(toWords.convert(0.0)).toBe("Nul");
  });

  test("converts 0n as Nul", () => {
    expect(toWords.convert(0n)).toBe("Nul");
  });

  test('converts "0" as Nul', () => {
    expect(toWords.convert("0")).toBe("Nul");
  });


});


// All Options Combinations


// Invalid Input Tests
describe("Test Invalid Inputs for nl-NL", () => {
  test("throws for NaN", () => {
    expect(() => toWords.convert(Number.NaN)).toThrow(/Invalid Number/);
  });

  test("throws for Infinity", () => {
    expect(() => toWords.convert(Infinity)).toThrow(/Invalid Number/);
  });

  test("throws for -Infinity", () => {
    expect(() => toWords.convert(-Infinity)).toThrow(/Invalid Number/);
  });

  test("throws for empty string", () => {
    expect(() => toWords.convert("")).toThrow(/Invalid Number/);
  });

  test("throws for invalid string", () => {
    expect(() => toWords.convert("abc")).toThrow(/Invalid Number/);
  });
});
