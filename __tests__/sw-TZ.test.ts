import { describe, expect, test } from "vitest";
import { ToWords } from "../src/ToWords";
import swTz from "../src/locales/sw-TZ.js";

const localeCode = "sw-TZ";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(swTz);
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
  [0, "Sifuri"],
  [137, "Mia Moja Na Thelathini Na Saba"],
  [700, "Mia Saba"],
  [1100, "Elfu Moja Na Mia Moja"],
  [4680, "Nne Elfu Na Mia Sita Na Themanini"],
  [63892, "Sitini Na Tatu Elfu Na Mia Nane Na Tisini Na Mbili"],
  [86100, "Themanini Na Sita Elfu Na Mia Moja"],
  [792581, "Mia Saba Na Tisini Na Mbili Elfu Na Mia Tano Na Themanini Na Moja"],
  [2741034, "Mbili Milioni Na Mia Saba Na Arobaini Na Moja Elfu Na Thelathini Na Nne"],
  [
    86429753,
    "Themanini Na Sita Milioni Na Mia Nne Na Ishirini Na Tisa Elfu Na Mia Saba Na Hamsini Na Tatu",
  ],
  [
    975310864,
    "Mia Tisa Na Sabini Na Tano Milioni Na Mia Tatu Na Kumi Elfu Na Mia Nane Na Sitini Na Nne",
  ],
  [
    9876543210,
    "Tisa Bilioni Na Mia Nane Na Sabini Na Sita Milioni Na Mia Tano Na Arobaini Na Tatu Elfu Na Mia Mbili Na Kumi",
  ],
  [
    98765432101,
    "Tisini Na Nane Bilioni Na Mia Saba Na Sitini Na Tano Milioni Na Mia Nne Na Thelathini Na Mbili Elfu Na Mia Moja Na Moja",
  ],
  [
    987654321012,
    "Mia Tisa Na Themanini Na Saba Bilioni Na Mia Sita Na Hamsini Na Nne Milioni Na Mia Tatu Na Ishirini Na Moja Elfu Na Kumi Na Mbili",
  ],
  [
    9876543210123,
    "Tisa Trilioni Na Mia Nane Na Sabini Na Sita Bilioni Na Mia Tano Na Arobaini Na Tatu Milioni Na Mia Mbili Na Kumi Elfu Na Mia Moja Na Ishirini Na Tatu",
  ],
  [
    98765432101234,
    "Tisini Na Nane Trilioni Na Mia Saba Na Sitini Na Tano Bilioni Na Mia Nne Na Thelathini Na Mbili Milioni Na Mia Moja Na Moja Elfu Na Mia Mbili Na Thelathini Na Nne",
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
    row[1] = `Hasi ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "Sifuri"],
  [0.04, "Sifuri Nukta Sifuri Nne"],
  [0.0468, "Sifuri Nukta Sifuri Nne Sita Nane"],
  [0.4, "Sifuri Nukta Nne"],
  [0.63, "Sifuri Nukta Sitini Na Tatu"],
  [0.973, "Sifuri Nukta Mia Tisa Na Sabini Na Tatu"],
  [0.999, "Sifuri Nukta Mia Tisa Na Tisini Na Tisa"],
  [37.06, "Thelathini Na Saba Nukta Sifuri Sita"],
  [37.068, "Thelathini Na Saba Nukta Sifuri Sita Nane"],
  [37.68, "Thelathini Na Saba Nukta Sitini Na Nane"],
  [37.683, "Thelathini Na Saba Nukta Mia Sita Na Themanini Na Tatu"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// Comprehensive Ordinal Tests
const testOrdinalNumbers: [number, string][] = [
  // Numbers 1-20 (special ordinal forms)
  [1, "Wa Kwanza"],
  [2, "Wa Pili"],
  [3, "Wa Tatu"],
  [4, "Wa Nne"],
  [5, "Wa Tano"],
  [6, "Wa Sita"],
  [7, "Wa Saba"],
  [8, "Wa Nane"],
  [9, "Wa Tisa"],
  [10, "Wa Kumi"],
  [11, "Wa Kumi Na Moja"],
  [12, "Wa Kumi Na Mbili"],
  [13, "Wa Kumi Na Tatu"],
  [14, "Wa Kumi Na Nne"],
  [15, "Wa Kumi Na Tano"],
  [16, "Wa Kumi Na Sita"],
  [17, "Wa Kumi Na Saba"],
  [18, "Wa Kumi Na Nane"],
  [19, "Wa Kumi Na Tisa"],
  [20, "Wa Ishirini"],

  // Composite numbers (21-29, 30, 40, 50, etc.)
  [21, "Ishirini Na Wa Kwanza"],
  [22, "Ishirini Na Wa Pili"],
  [23, "Ishirini Na Wa Tatu"],
  [30, "Wa Thelathini"],
  [40, "Wa Arobaini"],
  [50, "Wa Hamsini"],
  [60, "Wa Sitini"],
  [70, "Wa Sabini"],
  [80, "Wa Themanini"],
  [90, "Wa Tisini"],

  // Numbers ending in 1, 2, 3 (various decades)
  [31, "Thelathini Na Wa Kwanza"],
  [32, "Thelathini Na Wa Pili"],
  [33, "Thelathini Na Wa Tatu"],
  [41, "Arobaini Na Wa Kwanza"],
  [42, "Arobaini Na Wa Pili"],
  [43, "Arobaini Na Wa Tatu"],
  [51, "Hamsini Na Wa Kwanza"],
  [52, "Hamsini Na Wa Pili"],
  [53, "Hamsini Na Wa Tatu"],

  // Round numbers (100, 200, 1000, etc.)
  [100, "Wa Mia Moja"],
  [200, "Wa Mia Mbili"],
  [1000, "Wa Elfu Moja"],
  [10000, "Kumi Wa Elfu"],
  [100000, "Mia Moja Wa Elfu"],
  [1000000, "Wa Milioni Moja"],
  [10000000, "Kumi Wa Milioni"],

  // Numbers in the hundreds with endings
  [101, "Mia Moja Na Wa Kwanza"],
  [102, "Mia Moja Na Wa Pili"],
  [103, "Mia Moja Na Wa Tatu"],
  [111, "Mia Moja Na Wa Kumi Na Moja"],
  [112, "Mia Moja Na Wa Kumi Na Mbili"],
  [113, "Mia Moja Na Wa Kumi Na Tatu"],
  [123, "Mia Moja Na Ishirini Na Wa Tatu"],

  // Complex numbers
  [1001, "Elfu Moja Na Wa Kwanza"],
  [1111, "Elfu Moja Na Mia Moja Na Wa Kumi Na Moja"],
  [1234, "Elfu Moja Na Mia Mbili Na Thelathini Na Wa Nne"],
  [12345, "Kumi Na Mbili Elfu Na Mia Tatu Na Arobaini Na Wa Tano"],
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
const testPowersOfTen: [number, string][] = [
  [10, "Kumi"],
  [100, "Mia Moja"],
  [1000, "Elfu Moja"],
  [10000, "Kumi Elfu"],
  [100000, "Mia Moja Elfu"],
  [1000000, "Milioni Moja"],
];

describe("Test Powers of Ten", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "Sifuri"],
  [1n, "Moja"],
  [100n, "Mia Moja"],
  [1000n, "Elfu Moja"],
];

describe("Test BigInt Inputs", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Hasi Moja"],
  [-100n, "Hasi Mia Moja"],
  [-1000n, "Hasi Elfu Moja"],
];

describe("Test Negative BigInt Inputs", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "Sifuri"],
  ["1", "Moja"],
  ["100", "Mia Moja"],
  ["-100", "Hasi Mia Moja"],
];

describe("Test String Inputs", () => {
  test.concurrent.each(testStringInputs)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants Tests
describe("Test Zero Variants", () => {
  test("convert 0 => Sifuri", () => {
    expect(toWords.convert(0)).toBe("Sifuri");
  });

  test("convert -0 => Sifuri", () => {
    expect(toWords.convert(-0)).toBe("Sifuri");
  });

  test("convert 0.0 => Sifuri", () => {
    expect(toWords.convert(0.0)).toBe("Sifuri");
  });

  test("convert 0n => Sifuri", () => {
    expect(toWords.convert(0n)).toBe("Sifuri");
  });

  test('convert "0" => Sifuri', () => {
    expect(toWords.convert("0")).toBe("Sifuri");
  });
});

// Invalid Input Tests
const testInvalidInputs: [unknown, string][] = [
  [Number.NaN, 'Invalid Number "NaN"'],
  [Infinity, 'Invalid Number "Infinity"'],
  [-Infinity, 'Invalid Number "-Infinity"'],
  ["", 'Invalid Number ""'],
  ["abc", 'Invalid Number "abc"'],
];

describe("Test Invalid Inputs", () => {
  test.concurrent.each(testInvalidInputs)("convert %s throws error", (input, expectedError) => {
    expect(() => toWords.convert(input as number)).toThrow(expectedError);
  });
});
