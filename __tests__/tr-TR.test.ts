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
  [0, "sıfır"],
  [137, "yüz otuz yedi"],
  [700, "yedi yüz"],
  [4680, "dört bin altı yüz seksen"],
  [63892, "altmış üç bin sekiz yüz doksan iki"],
  [792581, "yedi yüz doksan iki bin beş yüz seksen bir"],
  [2741034, "iki milyon yedi yüz kırk bir bin otuz dört"],
  [86429753, "seksen altı milyon dört yüz yirmi dokuz bin yedi yüz elli üç"],
  [975310864, "dokuz yüz yetmiş beş milyon üç yüz on bin sekiz yüz altmış dört"],
  [9876543210, "dokuz milyar sekiz yüz yetmiş altı milyon beş yüz kırk üç bin iki yüz on"],
  [98765432101, "doksan sekiz milyar yedi yüz altmış beş milyon dört yüz otuz iki bin yüz bir"],
  [
    987654321012,
    "dokuz yüz seksen yedi milyar altı yüz elli dört milyon üç yüz yirmi bir bin on iki",
  ],
  [
    9876543210123,
    "dokuz trilyon sekiz yüz yetmiş altı milyar beş yüz kırk üç milyon iki yüz on bin yüz yirmi üç",
  ],
  [
    98765432101234,
    "doksan sekiz trilyon yedi yüz altmış beş milyar dört yüz otuz iki milyon yüz bir bin iki yüz otuz dört",
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
    row[1] = `eksi ${row[1]}`;
  });

  test.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "sıfır"],
  [0.04, "dört yüzüncü"],
  [0.0468, "dört yüz altmış sekiz on bininci"],
  [0.4, "dört onuncu"],
  [0.63, "altmış üç yüzüncü"],
  [0.973, "dokuz yüz yetmiş üç bininci"],
  [0.999, "dokuz yüz doksan dokuz bininci"],
  [37.06, "otuz yedi virgül altı yüzüncü"],
  [37.068, "otuz yedi virgül altmış sekiz bininci"],
  [37.68, "otuz yedi virgül altmış sekiz yüzüncü"],
  [37.683, "otuz yedi virgül altı yüz seksen üç bininci"],
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
  [21, "yirmi Birinci"],
  [22, "yirmi İkinci"],
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
  [200, "iki yüz"],
  [1000, "bir Bininci"],
  [1000000, "bir Milyonuncu"],
  // Complex numbers
  [101, "yüz Birinci"],
  [123, "yüz yirmi Üçüncü"],
  [1234, "bir bin iki yüz otuz Dördüncü"],
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
  [10, "on"],
  [100, "yüz"],
  [1000, "bir bin"],
  [10000, "on bin"],
  [100000, "yüz bin"],
  [1000000, "bir milyon"],
  [10000000, "on milyon"],
  [100000000, "yüz milyon"],
  [1000000000, "bir milyar"],
  [10000000000, "on milyar"],
  [100000000000, "yüz milyar"],
  [1000000000000, "bir trilyon"],
];

describe("Test Powers of Ten (Turkish System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "sıfır"],
  [1n, "bir"],
  [100n, "yüz"],
  [1000n, "bir bin"],
  [1000000n, "bir milyon"],
  [1000000000n, "bir milyar"],
  [1000000000000n, "bir trilyon"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "eksi bir"],
  [-100n, "eksi yüz"],
  [-1000n, "eksi bir bin"],
  [-1000000n, "eksi bir milyon"],
  [-1000000000n, "eksi bir milyar"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "sıfır"],
  ["1", "bir"],
  ["100", "yüz"],
  ["1000", "bir bin"],
  ["-100", "eksi yüz"],
  ["  100  ", "yüz"],
  ["1000000", "bir milyon"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("sıfır");
  });

  test("converts -0 as sıfır", () => {
    expect(toWords.convert(-0)).toBe("sıfır");
  });

  test("converts 0.0 as sıfır", () => {
    expect(toWords.convert(0.0)).toBe("sıfır");
  });

  test("converts 0n as sıfır", () => {
    expect(toWords.convert(0n)).toBe("sıfır");
  });

  test('converts "0" as sıfır', () => {
    expect(toWords.convert("0")).toBe("sıfır");
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
