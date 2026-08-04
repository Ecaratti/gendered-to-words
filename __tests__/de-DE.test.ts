import { cloneDeep } from "lodash";
import { describe, expect, test } from "vitest";
import { ToWords } from "../src/ToWords";
import deDe from "../src/locales/de-DE.js";

const localeCode = "de-DE";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(deDe);
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
  [0, "Null"],
  [1, "Eins"],
  [2, "Zwei"],
  [3, "Drei"],
  [4, "Vier"],
  [5, "Fünf"],
  [6, "Sechs"],
  [7, "Sieben"],
  [8, "Acht"],
  [9, "Neun"],
  [10, "Zehn"],
  [11, "Elf"],
  [12, "Zwölf"],
  [13, "Dreizehn"],
  [14, "Vierzehn"],
  [15, "Fünfzehn"],
  [16, "Sechzehn"],
  [17, "Siebzehn"],
  [18, "Achtzehn"],
  [19, "Neunzehn"],
  [20, "Zwanzig"],
  [21, "Einundzwanzig"],
  [22, "Zweiundzwanzig"],
  [30, "Dreißig"],
  [31, "Einunddreißig"],
  [40, "Vierzig"],
  [42, "Zweiundvierzig"],
  [50, "Fünfzig"],
  [60, "Sechzig"],
  [70, "Siebzig"],
  [80, "Achtzig"],
  [90, "Neunzig"],
  [99, "Neunundneunzig"],
  [100, "Hundert"],
  [137, "Hundert Siebenunddreißig"],
  [200, "Zwei Hundert"],
  [700, "Sieben Hundert"],
  [1000, "Tausend"],
  [1100, "Tausend Hundert"],
  [4680, "Vier Tausend Sechs Hundert Achtzig"],
  [63892, "Dreiundsechzig Tausend Acht Hundert Zweiundneunzig"],
  [86100, "Sechsundachtzig Tausend Hundert"],
  [792581, "Sieben Hundert Zweiundneunzig Tausend Fünf Hundert Einundachtzig"],
  [1000000, "Eins Million"],
  [2000000, "Zwei Million"],
  [2741034, "Zwei Million Sieben Hundert Einundvierzig Tausend Vierunddreißig"],
  [
    86429753,
    "Sechsundachtzig Million Vier Hundert Neunundzwanzig Tausend Sieben Hundert Dreiundfünfzig",
  ],
  [
    975310864,
    "Neun Hundert Fünfundsiebzig Million Drei Hundert Zehn Tausend Acht Hundert Vierundsechzig",
  ],
  [1000000000, "Eins Milliarde"],
  [
    9876543210,
    "Neun Milliarde Acht Hundert Sechsundsiebzig Million Fünf Hundert Dreiundvierzig Tausend Zwei Hundert Zehn",
  ],
  [
    98765432101,
    "Achtundneunzig Milliarde Sieben Hundert Fünfundsechzig Million Vier Hundert Zweiunddreißig Tausend Hundert Eins",
  ],
  [
    987654321012,
    "Neun Hundert Siebenundachtzig Milliarde Sechs Hundert Vierundfünfzig Million Drei Hundert Einundzwanzig Tausend Zwölf",
  ],
  [
    9876543210123,
    "Neun Billion Acht Hundert Sechsundsiebzig Milliarde Fünf Hundert Dreiundvierzig Million Zwei Hundert Zehn Tausend Hundert Dreiundzwanzig",
  ],
  [
    98765432101234,
    "Achtundneunzig Billion Sieben Hundert Fünfundsechzig Milliarde Vier Hundert Zweiunddreißig Million Hundert Eins Tausend Zwei Hundert Vierunddreißig",
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
  [0.0, "Null"],
  [0.04, "Null Komma Null Vier"],
  [0.0468, "Null Komma Null Vier Sechs Acht"],
  [0.4, "Null Komma Vier"],
  [0.973, "Null Komma Neun Hundert Dreiundsiebzig"],
  [0.999, "Null Komma Neun Hundert Neunundneunzig"],
  [37.06, "Siebenunddreißig Komma Null Sechs"],
  [37.068, "Siebenunddreißig Komma Null Sechs Acht"],
  [37.68, "Siebenunddreißig Komma Achtundsechzig"],
  [37.683, "Siebenunddreißig Komma Sechs Hundert Dreiundachtzig"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});


const testOrdinals: [number, string][] = [
  // Numbers 0-10
  [0, "Nullte"],
  [1, "Erste"],
  [2, "Zweite"],
  [3, "Dritte"],
  [4, "Vierte"],
  [5, "Fünfte"],
  [6, "Sechste"],
  [7, "Siebte"],
  [8, "Achte"],
  [9, "Neunte"],
  [10, "Zehnte"],
  [11, "Elfte"],
  [12, "Zwölfte"],
  [13, "Dreizehnte"],
  [14, "Vierzehnte"],
  [15, "Fünfzehnte"],
  [16, "Sechzehnte"],
  [17, "Siebzehnte"],
  [18, "Achtzehnte"],
  [19, "Neunzehnte"],
  [20, "Zwanzigste"],
  // Composite numbers (21, 22, etc.)
  [21, "Einundzwanzigste"],
  [22, "Zweiundzwanzigste"],
  [23, "Dreiundzwanzigste"],
  [24, "Vierundzwanzigste"],
  [25, "Fünfundzwanzigste"],
  // Tens
  [30, "Dreißigste"],
  [40, "Vierzigste"],
  [50, "Fünfzigste"],
  [60, "Sechzigste"],
  [70, "Siebzigste"],
  [80, "Achtzigste"],
  [90, "Neunzigste"],
  // Round numbers (100, 200, 1000, etc.)
  [100, "Hundertste"],
  [200, "Zwei Hundertste"],
  [300, "Drei Hundertste"],
  [1000, "Tausendste"],
  [2000, "Zwei Tausendste"],
  [1000000, "Eins Millionste"],
  [2000000, "Zwei Millionste"],
  // Complex numbers
  [101, "Hundert Erste"],
  [102, "Hundert Zweite"],
  [111, "Hundert Elfte"],
  [123, "Hundert Dreiundzwanzigste"],
  [150, "Hundert Fünfzigste"],
  [1001, "Tausend Erste"],
  [1234, "Tausend Zwei Hundert Vierunddreißigste"],
  [1500, "Tausend Fünf Hundertste"],
  [10000, "Zehn Tausendste"],
  [100000, "Hundert Tausendste"],
  [1000001, "Eins Million Erste"],
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

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR de-DE
// ============================================================

// Powers of Ten (German International System)
const testPowersOfTen: [number, string][] = [
  [10, "Zehn"],
  [100, "Hundert"],
  [1000, "Tausend"],
  [10000, "Zehn Tausend"],
  [100000, "Hundert Tausend"],
  [1000000, "Eins Million"],
  [10000000, "Zehn Million"],
  [100000000, "Hundert Million"],
  [1000000000, "Eins Milliarde"],
  [10000000000, "Zehn Milliarde"],
  [100000000000, "Hundert Milliarde"],
  [1000000000000, "Eins Billion"],
];

describe("Test Powers of Ten (German System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Boundary Values
const testBoundaries: [number, string][] = [
  [99, "Neunundneunzig"],
  [100, "Hundert"],
  [101, "Hundert Eins"],
  [999, "Neun Hundert Neunundneunzig"],
  [1000, "Tausend"],
  [1001, "Tausend Eins"],
  [9999, "Neun Tausend Neun Hundert Neunundneunzig"],
  [10000, "Zehn Tausend"],
  [99999, "Neunundneunzig Tausend Neun Hundert Neunundneunzig"],
  [100000, "Hundert Tausend"],
  [999999, "Neun Hundert Neunundneunzig Tausend Neun Hundert Neunundneunzig"],
  [1000000, "Eins Million"],
  [1000001, "Eins Million Eins"],
];

describe("Test Boundary Values", () => {
  test.concurrent.each(testBoundaries)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative Floats
const testNegativeFloats: [number, string][] = [
  [-0.5, "Minus Null Komma Fünf"],
  [-0.25, "Minus Null Komma Fünfundzwanzig"],
  [-0.99, "Minus Null Komma Neunundneunzig"],
  [-1.5, "Minus Eins Komma Fünf"],
  [-3.14, "Minus Drei Komma Vierzehn"],
  [-99.99, "Minus Neunundneunzig Komma Neunundneunzig"],
  [-100.01, "Minus Hundert Komma Null Eins"],
];

describe("Test Negative Floats", () => {
  test.concurrent.each(testNegativeFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "Null"],
  [1n, "Eins"],
  [100n, "Hundert"],
  [1000n, "Tausend"],
  [1000000n, "Eins Million"],
  [1000000000n, "Eins Milliarde"],
  [1000000000000n, "Eins Billion"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Minus Eins"],
  [-100n, "Minus Hundert"],
  [-1000n, "Minus Tausend"],
  [-1000000n, "Minus Eins Million"],
  [-1000000000n, "Minus Eins Milliarde"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "Null"],
  ["1", "Eins"],
  ["100", "Hundert"],
  ["1000", "Tausend"],
  ["-100", "Minus Hundert"],
  ["3.14", "Drei Komma Vierzehn"],
  ["-3.14", "Minus Drei Komma Vierzehn"],
  ["  100  ", "Hundert"],
  ["1000000", "Eins Million"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("Null");
  });

  test("converts -0 as Null", () => {
    expect(toWords.convert(-0)).toBe("Null");
  });

  test("converts 0.0 as Null", () => {
    expect(toWords.convert(0.0)).toBe("Null");
  });

  test("converts 0n as Null", () => {
    expect(toWords.convert(0n)).toBe("Null");
  });

  test('converts "0" as Null', () => {
    expect(toWords.convert("0")).toBe("Null");
  });


});

// All Options Combinations


// Invalid Input Tests
describe("Test Invalid Inputs for de-DE", () => {
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
