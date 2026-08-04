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
  [100, "Einhundert"],
  [137, "Einhundertsiebenunddreißig"],
  [200, "Zweihundert"],
  [700, "Siebenhundert"],
  [1000, "Eintausend"],
  [1100, "Eintausendeinhundert"],
  [4680, "Viertausendsechshundertachtzig"],
  [63892, "Dreiundsechzigtausendachthundertzweiundneunzig"],
  [86100, "Sechsundachtzigtausendeinhundert"],
  [792581, "Siebenhundertzweiundneunzigtausendfünfhunderteinundachtzig"],
  [1000000, "Eine Million"],
  [2000000, "Zwei Millionen"],
  [2741034, "Zwei Millionen Siebenhunderteinundvierzigtausendvierunddreißig"],
  [
    86429753,
    "Sechsundachtzig Millionen Vierhundertneunundzwanzigtausendsiebenhundertdreiundfünfzig",
  ],
  [
    975310864,
    "Neunhundertfünfundsiebzig Millionen Dreihundertzehntausendachthundertvierundsechzig",
  ],
  [1000000000, "Eine Milliarde"],
  [
    9876543210,
    "Neun Milliarden Achthundertsechsundsiebzig Millionen Fünfhundertdreiundvierzigtausendzweihundertzehn",
  ],
  [
    98765432101,
    "Achtundneunzig Milliarden Siebenhundertfünfundsechzig Millionen Vierhundertzweiunddreißigtausendeinhunderteins",
  ],
  [
    987654321012,
    "Neunhundertsiebenundachtzig Milliarden Sechshundertvierundfünfzig Millionen Dreihunderteinundzwanzigtausendzwölf",
  ],
  [
    9876543210123,
    "Neun Billionen Achthundertsechsundsiebzig Milliarden Fünfhundertdreiundvierzig Millionen Zweihundertzehntausendeinhundertdreiundzwanzig",
  ],
  [
    98765432101234,
    "Achtundneunzig Billionen Siebenhundertfünfundsechzig Milliarden Vierhundertzweiunddreißig Millionen Einhunderteintausendzweihundertvierunddreißig",
  ],
];

describe("Test Integers with options = {}", () => {
  test.concurrent.each(testIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

describe("Test Negative Integers with options = {}", () => {
  const testNegativeIntegers = structuredClone(testIntegers);
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
  [0.973, "Null Komma Neunhundertdreiundsiebzig"],
  [0.999, "Null Komma Neunhundertneunundneunzig"],
  [37.06, "Siebenunddreißig Komma Null Sechs"],
  [37.068, "Siebenunddreißig Komma Null Sechs Acht"],
  [37.68, "Siebenunddreißig Komma Achtundsechzig"],
  [37.683, "Siebenunddreißig Komma Sechshundertdreiundachtzig"],
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
  [100, "Einhundertste"],
  [200, "Zweihundertste"],
  [300, "Dreihundertste"],
  [1000, "Eintausendste"],
  [2000, "Zweitausendste"],
  [1000000, "Millionste"],
  [2000000, "Zweimillionste"],
  // Complex numbers
  [101, "Einhunderterste"],
  [102, "Einhundertzweite"],
  [111, "Einhundertelfte"],
  [123, "Einhundertdreiundzwanzigste"],
  [150, "Einhundertfünfzigste"],
  [1001, "Eintausenderste"],
  [1234, "Eintausendzweihundertvierunddreißigste"],
  [1500, "Eintausendfünfhundertste"],
  [10000, "Zehntausendste"],
  [100000, "Einhunderttausendste"],
  [1000001, "Eine Million Erste"],
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
  [100, "Einhundert"],
  [1000, "Eintausend"],
  [10000, "Zehntausend"],
  [100000, "Einhunderttausend"],
  [1000000, "Eine Million"],
  [10000000, "Zehn Millionen"],
  [100000000, "Einhundert Millionen"],
  [1000000000, "Eine Milliarde"],
  [10000000000, "Zehn Milliarden"],
  [100000000000, "Einhundert Milliarden"],
  [1000000000000, "Eine Billion"],
];

describe("Test Powers of Ten (German System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Boundary Values
const testBoundaries: [number, string][] = [
  [99, "Neunundneunzig"],
  [100, "Einhundert"],
  [101, "Einhunderteins"],
  [999, "Neunhundertneunundneunzig"],
  [1000, "Eintausend"],
  [1001, "Eintausendeins"],
  [9999, "Neuntausendneunhundertneunundneunzig"],
  [10000, "Zehntausend"],
  [99999, "Neunundneunzigtausendneunhundertneunundneunzig"],
  [100000, "Einhunderttausend"],
  [999999, "Neunhundertneunundneunzigtausendneunhundertneunundneunzig"],
  [1000000, "Eine Million"],
  [1000001, "Eine Million Eins"],
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
  [-100.01, "Minus Einhundert Komma Null Eins"],
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
  [100n, "Einhundert"],
  [1000n, "Eintausend"],
  [1000000n, "Eine Million"],
  [1000000000n, "Eine Milliarde"],
  [1000000000000n, "Eine Billion"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Minus Eins"],
  [-100n, "Minus Einhundert"],
  [-1000n, "Minus Eintausend"],
  [-1000000n, "Minus Eine Million"],
  [-1000000000n, "Minus Eine Milliarde"],
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
  ["100", "Einhundert"],
  ["1000", "Eintausend"],
  ["-100", "Minus Einhundert"],
  ["3.14", "Drei Komma Vierzehn"],
  ["-3.14", "Minus Drei Komma Vierzehn"],
  ["  100  ", "Einhundert"],
  ["1000000", "Eine Million"],
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
