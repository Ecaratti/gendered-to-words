import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import jaJp from "../src/locales/ja-JP.js";

const localeCode = "ja-JP";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(jaJp);
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
  [0, "零"],
  [137, "百三十七"],
  [700, "七百"],
  [1100, "千百"],
  [4680, "四千六百八十"],
  [63892, "六万三千八百九十二"],
  [86100, "八万六千百"],
  [792581, "七十万九万二千五百八十一"],
  [2741034, "二百万七十万四万千三十四"],
  [86429753, "八千万六百万四十万二万九千七百五十三"],
  [975310864, "九億七千万五百万三十万万八百六十四"],
  [1000000000, "十億"],
  [9876543210, "九十億八億七千万六百万五十万四万三千二百十"],
  [10000000000, "百億"],
  [100000000000, "千億"],
  [1000000000000, "兆"],
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
    row[1] = `マイナス${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0, "零"],
  [0.04, "零点零四"],
  [0.0468, "零点零四六八"],
  [0.4, "零点四"],
  [0.63, "零点六十三"],
  [0.973, "零点九百七十三"],
  [0.999, "零点九百九十九"],
  [37.06, "三十七点零六"],
  [37.068, "三十七点零六八"],
  [37.68, "三十七点六十八"],
  [37.683, "三十七点六百八十三"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testOrdinalNumbers: [number, string][] = [
  // Basic ordinals 1-20
  [1, "一番目"],
  [2, "二番目"],
  [3, "三番目"],
  [4, "四番目"],
  [5, "五番目"],
  [6, "六番目"],
  [7, "七番目"],
  [8, "八番目"],
  [9, "九番目"],
  [10, "十番目"],
  [11, "十一番目"],
  [12, "十二番目"],
  [13, "十三番目"],
  [14, "十四番目"],
  [15, "十五番目"],
  [16, "十六番目"],
  [17, "十七番目"],
  [18, "十八番目"],
  [19, "十九番目"],
  [20, "二十番目"],

  // Composite numbers (21-29, 30, 40, 50, etc.)
  [21, "二十一番目"],
  [22, "二十二番目"],
  [23, "二十三番目"],
  [30, "三十番目"],
  [40, "四十番目"],
  [50, "五十番目"],
  [60, "六十番目"],
  [70, "七十番目"],
  [80, "八十番目"],
  [90, "九十番目"],

  // Numbers ending in 1, 2, 3 (various decades)
  [31, "三十一番目"],
  [32, "三十二番目"],
  [33, "三十三番目"],
  [41, "四十一番目"],
  [42, "四十二番目"],
  [43, "四十三番目"],
  [51, "五十一番目"],
  [52, "五十二番目"],
  [53, "五十三番目"],

  // Round numbers (100, 200, 1000, etc.)
  [100, "百番目"],
  [200, "二百番目"],
  [1000, "千番目"],
  [10000, "万番目"],

  // Larger numbers
  [100000, "十万番目"],
  [1000000, "百万番目"],
  [100001, "十万一番目"],
  [100002, "十万二番目"],
  [100003, "十万三番目"],

  // Numbers in the hundreds with endings
  [101, "百一番目"],
  [102, "百二番目"],
  [103, "百三番目"],
  [111, "百十一番目"],
  [112, "百十二番目"],
  [113, "百十三番目"],
  [123, "百二十三番目"],

  // Complex numbers
  [1001, "千一番目"],
  [1234, "千二百三十四番目"],
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

describe("Test Invalid Inputs", () => {
  const testInvalidInputs: [unknown, string][] = [
    ["abc", "Invalid Number"],
    ["", "Invalid Number"],
    [Number.NaN, "Invalid Number"],
    [Infinity, "Invalid Number"],
  ];

  test.concurrent.each(testInvalidInputs)("should throw error for %s", (input, message) => {
    expect(() => toWords.convert(input as number)).toThrow(message);
  });
});

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR ja-JP
// ============================================================

// Powers of Ten (Japanese system: 万, 億, 兆)
const testPowersOfTen: [number, string][] = [
  [10, "十"],
  [100, "百"],
  [1000, "千"],
  [10000, "万"],
  [100000, "十万"],
  [1000000, "百万"],
  [10000000, "千万"],
  [100000000, "億"],
  [1000000000, "十億"],
  [10000000000, "百億"],
  [100000000000, "千億"],
  [1000000000000, "兆"],
];

describe("Test Powers of Ten (Japanese System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "零"],
  [1n, "一"],
  [100n, "百"],
  [1000n, "千"],
  [10000n, "万"],
  [100000000n, "億"],
  [1000000000000n, "兆"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "マイナス一"],
  [-100n, "マイナス百"],
  [-1000n, "マイナス千"],
  [-10000n, "マイナス万"],
  [-100000000n, "マイナス億"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "零"],
  ["1", "一"],
  ["100", "百"],
  ["1000", "千"],
  ["-100", "マイナス百"],
  ["  100  ", "百"],
  ["10000", "万"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("零");
  });

  test("converts -0 as 零", () => {
    expect(toWords.convert(-0)).toBe("零");
  });

  test("converts 0.0 as 零", () => {
    expect(toWords.convert(0.0)).toBe("零");
  });

  test("converts 0n as 零", () => {
    expect(toWords.convert(0n)).toBe("零");
  });

  test('converts "0" as 零', () => {
    expect(toWords.convert("0")).toBe("零");
  });
});

// All Options Combinations
