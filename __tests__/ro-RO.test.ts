import { cloneDeep } from "lodash";
import { describe, expect, test } from "vitest";
import { ToWords } from "../src/ToWords";
import roRo from "../src/locales/ro-RO.js";

const localeCode = "ro-RO";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(roRo);
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
  [0, "Zero"],
  [137, "O Sută Treizeci Șapte"],
  [700, "Șapte Sute"],
  [1100, "O Mie O Sută"],
  [4680, "Patru Mii Șase Sute Optzeci"],
  [63892, "Șaizeci Trei Mii Opt Sute Nouăzeci Două"],
  [86100, "Optzeci Șase Mii O Sută"],
  [792581, "Șapte Sute Nouăzeci Două Mii Cinci Sute Optzeci Unu"],
  [2741034, "Două Milioane Șapte Sute Patruzeci Unu Mii Treizeci Patru"],
  [86429753, "Optzeci Șase Milioane Patru Sute Douăzeci Nouă Mii Șapte Sute Cincizeci Trei"],
  [975310864, "Nouă Sute Șaptezeci Cinci Milioane Trei Sute Zece Mii Opt Sute Șaizeci Patru"],
  [
    9876543210,
    "Nouă Miliarde Opt Sute Șaptezeci Șase Milioane Cinci Sute Patruzeci Trei Mii Două Sute Zece",
  ],
  [
    98765432101,
    "Nouăzeci Opt Miliarde Șapte Sute Șaizeci Cinci Milioane Patru Sute Treizeci Două Mii O Sută Unu",
  ],
  [
    987654321012,
    "Nouă Sute Optzeci Șapte Miliarde Șase Sute Cincizeci Patru Milioane Trei Sute Douăzeci Unu Mii Doisprezece",
  ],
  [
    9876543210123,
    "Nouă Trilion Opt Sute Șaptezeci Șase Miliarde Cinci Sute Patruzeci Trei Milioane Două Sute Zece Mii O Sută Douăzeci Trei",
  ],
  [
    98765432101234,
    "Nouăzeci Opt Trilion Șapte Sute Șaizeci Cinci Miliarde Patru Sute Treizeci Două Milioane O Sută Unu Mii Două Sute Treizeci Patru",
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
    row[1] = `Minus ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "Zero"],
  [0.04, "Zero Virgulă Zero Patru"],
  [0.0468, "Zero Virgulă Zero Patru Șase Opt"],
  [0.4, "Zero Virgulă Patru"],
  [0.63, "Zero Virgulă Șaizeci Trei"],
  [0.973, "Zero Virgulă Nouă Sute Șaptezeci Trei"],
  [0.999, "Zero Virgulă Nouă Sute Nouăzeci Nouă"],
  [37.06, "Treizeci Șapte Virgulă Zero Șase"],
  [37.068, "Treizeci Șapte Virgulă Zero Șase Opt"],
  [37.68, "Treizeci Șapte Virgulă Șaizeci Opt"],
  [37.683, "Treizeci Șapte Virgulă Șase Sute Optzeci Trei"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});


// Comprehensive Ordinal Tests
const testOrdinalNumbers: [number, string][] = [
  // Numbers 1-20 (special ordinal forms)
  [1, "Primul"],
  [2, "Al Doilea"],
  [3, "Al Treilea"],
  [4, "Al Patrulea"],
  [5, "Al Cincilea"],
  [6, "Al Șaselea"],
  [7, "Al Șaptelea"],
  [8, "Al Optulea"],
  [9, "Al Nouălea"],
  [10, "Al Zecelea"],
  [11, "Al Unsprezecelea"],
  [12, "Al Doisprezecelea"],
  [13, "Al Treisprezecelea"],
  [14, "Al Paisprezecelea"],
  [15, "Al Cincisprezecelea"],
  [16, "Al Șaisprezecelea"],
  [17, "Al Șaptesprezecelea"],
  [18, "Al Optsprezecelea"],
  [19, "Al Nouăsprezecelea"],
  [20, "Al Douăzecilea"],

  // Composite numbers (21-29, 30, 40, 50, etc.)
  [21, "Douăzeci Primul"],
  [22, "Douăzeci Al Doilea"],
  [23, "Douăzeci Al Treilea"],
  [30, "Al Treizecilea"],
  [40, "Al Patruzecilea"],
  [50, "Al Cincizecilea"],
  [60, "Al Șaizecilea"],
  [70, "Al Șaptezecilea"],
  [80, "Al Optzecilea"],
  [90, "Al Nouăzecilea"],

  // Numbers ending in 1, 2, 3 (various decades)
  [31, "Treizeci Primul"],
  [32, "Treizeci Al Doilea"],
  [33, "Treizeci Al Treilea"],
  [41, "Patruzeci Primul"],
  [42, "Patruzeci Al Doilea"],
  [43, "Patruzeci Al Treilea"],
  [51, "Cincizeci Primul"],
  [52, "Cincizeci Al Doilea"],
  [53, "Cincizeci Al Treilea"],

  // Round numbers (100, 200, 1000, etc.)
  [100, "Al O Sutălea"],
  [200, "Al Două Sutelea"],
  [1000, "Al O Miilea"],
  [10000, "Zece Al Miilea"],
  [100000, "O Sută Al Miilea"],
  [1000000, "Al Un Milionulea"],
  [10000000, "Zece Al Milionulea"],

  // Numbers in the hundreds with endings
  [101, "O Sută Primul"],
  [102, "O Sută Al Doilea"],
  [103, "O Sută Al Treilea"],
  [111, "O Sută Al Unsprezecelea"],
  [112, "O Sută Al Doisprezecelea"],
  [113, "O Sută Al Treisprezecelea"],
  [123, "O Sută Douăzeci Al Treilea"],

  // Complex numbers
  [1001, "O Mie Primul"],
  [1111, "O Mie O Sută Al Unsprezecelea"],
  [1234, "O Mie Două Sute Treizeci Al Patrulea"],
  [12345, "Doisprezece Mii Trei Sute Patruzeci Al Cincilea"],
];

describe("Test Ordinal Numbers", () => {
  test.concurrent.each(testOrdinalNumbers)("toOrdinal %d => %s", (input, expected) => {
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

  test("should throw error for decimal numbers with small fraction", () => {
    expect(() => toWords.toOrdinal(10.01)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("should throw error for decimal numbers with large fraction", () => {
    expect(() => toWords.toOrdinal(99.99)).toThrow("Ordinal numbers must be non-negative integers");
  });
});

// Powers of Ten Tests
const powersOfTen: [number, string][] = [
  [10, "Zece"],
  [100, "O Sută"],
  [1000, "O Mie"],
  [10000, "Zece Mii"],
  [100000, "O Sută Mii"],
  [1000000, "Un Milion"],
];

describe("Test Powers of Ten", () => {
  test.concurrent.each(powersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// BigInt Tests
const bigIntTests: [bigint, string][] = [
  [0n, "Zero"],
  [1n, "Unu"],
  [100n, "O Sută"],
  [1000n, "O Mie"],
];

describe("Test BigInt Inputs", () => {
  test.concurrent.each(bigIntTests)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

// Negative BigInt Tests
const negativeBigIntTests: [bigint, string][] = [
  [-1n, "Minus Unu"],
  [-100n, "Minus O Sută"],
  [-1000n, "Minus O Mie"],
];

describe("Test Negative BigInt Inputs", () => {
  test.concurrent.each(negativeBigIntTests)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

// String Input Tests
const stringInputTests: [string, string][] = [
  ["0", "Zero"],
  ["1", "Unu"],
  ["100", "O Sută"],
  ["-100", "Minus O Sută"],
];

describe("Test String Inputs", () => {
  test.concurrent.each(stringInputTests)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input as string)).toBe(expected);
  });
});

// Zero Variants Tests
describe("Test Zero Variants", () => {
  test("convert 0 => Zero", () => {
    expect(toWords.convert(0)).toBe("Zero");
  });

  test("convert -0 => Zero", () => {
    expect(toWords.convert(-0)).toBe("Zero");
  });

  test("convert 0.0 => Zero", () => {
    expect(toWords.convert(0.0)).toBe("Zero");
  });

  test("convert 0n => Zero", () => {
    expect(toWords.convert(0n)).toBe("Zero");
  });

  test('convert "0" => Zero', () => {
    expect(toWords.convert("0")).toBe("Zero");
  });

});

// Invalid Input Tests
describe("Test Invalid Inputs", () => {
  test("convert NaN throws error", () => {
    expect(() => toWords.convert(Number.NaN)).toThrow('Invalid Number "NaN"');
  });

  test("convert Infinity throws error", () => {
    expect(() => toWords.convert(Infinity)).toThrow('Invalid Number "Infinity"');
  });

  test("convert -Infinity throws error", () => {
    expect(() => toWords.convert(-Infinity)).toThrow('Invalid Number "-Infinity"');
  });

  test("convert empty string throws error", () => {
    expect(() => toWords.convert("")).toThrow('Invalid Number ""');
  });

  test('convert "abc" throws error', () => {
    expect(() => toWords.convert("abc")).toThrow('Invalid Number "abc"');
  });
});
