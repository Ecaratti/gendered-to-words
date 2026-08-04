import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import trTr from "../src/locales/tr-TR.js";

const localeCode = "tr-TR";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(trTr);
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
  [0, "Sıfır"],
  [137, "Yüz Otuz Yedi"],
  [700, "Yedi Yüz"],
  [4680, "Dört Bin Altı Yüz Seksen"],
  [63892, "Altmış Üç Bin Sekiz Yüz Doksan İki"],
  [792581, "Yedi Yüz Doksan İki Bin Beş Yüz Seksen Bir"],
  [2741034, "İki Milyon Yedi Yüz Kırk Bir Bin Otuz Dört"],
  [86429753, "Seksen Altı Milyon Dört Yüz Yirmi Dokuz Bin Yedi Yüz Elli Üç"],
  [975310864, "Dokuz Yüz Yetmiş Beş Milyon Üç Yüz On Bin Sekiz Yüz Altmış Dört"],
  [9876543210, "Dokuz Milyar Sekiz Yüz Yetmiş Altı Milyon Beş Yüz Kırk Üç Bin İki Yüz On"],
  [98765432101, "Doksan Sekiz Milyar Yedi Yüz Altmış Beş Milyon Dört Yüz Otuz İki Bin Yüz Bir"],
  [
    987654321012,
    "Dokuz Yüz Seksen Yedi Milyar Altı Yüz Elli Dört Milyon Üç Yüz Yirmi Bir Bin On İki",
  ],
  [
    9876543210123,
    "Dokuz Trilyon Sekiz Yüz Yetmiş Altı Milyar Beş Yüz Kırk Üç Milyon İki Yüz On Bin Yüz Yirmi Üç",
  ],
  [
    98765432101234,
    "Doksan Sekiz Trilyon Yedi Yüz Altmış Beş Milyar Dört Yüz Otuz İki Milyon Yüz Bir Bin İki Yüz Otuz Dört",
  ],
];

describe("Test Integers with options = {}", () => {
  test.each(testIntegers)("convert %d => %s", (input, expected) => {
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
    row[1] = `Eksi ${row[1]}`;
  });

  test.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "Sıfır"],
  [0.04, "Dört Yüzüncü"],
  [0.0468, "Dört Yüz Altmış Sekiz On Bininci"],
  [0.4, "Dört Onuncu"],
  [0.63, "Altmış Üç Yüzüncü"],
  [0.973, "Dokuz Yüz Yetmiş Üç Bininci"],
  [0.999, "Dokuz Yüz Doksan Dokuz Bininci"],
  [37.06, "Otuz Yedi Virgül Altı Yüzüncü"],
  [37.068, "Otuz Yedi Virgül Altmış Sekiz Bininci"],
  [37.68, "Otuz Yedi Virgül Altmış Sekiz Yüzüncü"],
  [37.683, "Otuz Yedi Virgül Altı Yüz Seksen Üç Bininci"],
];

describe("Test Floats with options = {}", () => {
  test.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testOrdinals: [number, string][] = [
  // Numbers 1-20
  [1, "Birinci"],
  [2, "İkinci"],
  [3, "Üçüncü"],
  [4, "Dördüncü"],
  [5, "Beşinci"],
  [6, "Altıncı"],
  [7, "Yedinci"],
  [8, "Sekizinci"],
  [9, "Dokuzuncu"],
  [10, "Onuncu"],
  [11, "On Birinci"],
  [12, "On İkinci"],
  [13, "On Üçüncü"],
  [14, "On Dördüncü"],
  [15, "On Beşinci"],
  [16, "On Altıncı"],
  [17, "On Yedinci"],
  [18, "On Sekizinci"],
  [19, "On Dokuzuncu"],
  [20, "Yirminci"],
  // Composite numbers (21, 22, etc.)
  [21, "Yirmi Birinci"],
  [22, "Yirmi İkinci"],
  // Decade numbers (30, 40, 50, etc.)
  [30, "Otuzuncu"],
  [40, "Kırkıncı"],
  [50, "Ellinci"],
  [60, "Altmışıncı"],
  [70, "Yetmişinci"],
  [80, "Sekseninci"],
  [90, "Doksanıncı"],
  // Round numbers (100, 200, 1000, etc.)
  [100, "Yüzüncü"],
  [200, "İki Yüzüncü"],
  [1000, "Bir Bininci"],
  [1000000, "Bir Milyonuncu"],
  // Complex numbers
  [101, "Yüz Birinci"],
  [123, "Yüz Yirmi Üçüncü"],
  [1234, "Bir Bin İki Yüz Otuz Dördüncü"],
];

describe("Test Ordinals", () => {
  test.each(testOrdinals)("toOrdinal(%d) => %s", (input, expected) => {
    expect(toWords.toOrdinal(input)).toBe(expected);
  });
});

describe("Test Ordinal Error Cases", () => {
  test("should throw error for negative numbers", () => {
    expect(() => toWords.toOrdinal(-1)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("should throw error for decimal numbers", () => {
    expect(() => toWords.toOrdinal(1.5)).toThrow("Ordinal numbers must be non-negative integers");
  });
});

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR tr-TR
// ============================================================

// Powers of Ten (Turkish)
const testPowersOfTen: [number, string][] = [
  [10, "On"],
  [100, "Yüz"],
  [1000, "Bir Bin"],
  [10000, "On Bin"],
  [100000, "Yüz Bin"],
  [1000000, "Bir Milyon"],
  [10000000, "On Milyon"],
  [100000000, "Yüz Milyon"],
  [1000000000, "Bir Milyar"],
  [10000000000, "On Milyar"],
  [100000000000, "Yüz Milyar"],
  [1000000000000, "Bir Trilyon"],
];

describe("Test Powers of Ten (Turkish System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "Sıfır"],
  [1n, "Bir"],
  [100n, "Yüz"],
  [1000n, "Bir Bin"],
  [1000000n, "Bir Milyon"],
  [1000000000n, "Bir Milyar"],
  [1000000000000n, "Bir Trilyon"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Eksi Bir"],
  [-100n, "Eksi Yüz"],
  [-1000n, "Eksi Bir Bin"],
  [-1000000n, "Eksi Bir Milyon"],
  [-1000000000n, "Eksi Bir Milyar"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "Sıfır"],
  ["1", "Bir"],
  ["100", "Yüz"],
  ["1000", "Bir Bin"],
  ["-100", "Eksi Yüz"],
  ["  100  ", "Yüz"],
  ["1000000", "Bir Milyon"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("Sıfır");
  });

  test("converts -0 as sıfır", () => {
    expect(toWords.convert(-0)).toBe("Sıfır");
  });

  test("converts 0.0 as sıfır", () => {
    expect(toWords.convert(0.0)).toBe("Sıfır");
  });

  test("converts 0n as sıfır", () => {
    expect(toWords.convert(0n)).toBe("Sıfır");
  });

  test('converts "0" as sıfır', () => {
    expect(toWords.convert("0")).toBe("Sıfır");
  });
});

// Invalid Input Tests
describe("Test Invalid Inputs for tr-TR", () => {
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
