import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import zhTw from "../src/locales/zh-TW.js";

const localeCode = "zh-TW";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(zhTw);
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
  [137, "一百三十七"],
  [700, "七百"],
  [1100, "一千一百"],
  [4680, "四千六百八十"],
  [63892, "六萬三千八百九十二"],
  [86100, "八萬六千一百"],
  [792581, "七十萬九萬二千五百八十一"],
  [2741034, "二百萬七十萬四萬一千三十四"],
  [86429753, "八千萬六百萬四十萬二萬九千七百五十三"],
  [975310864, "九億七千萬五百萬三十萬一萬八百六十四"],
  [1000000000, "十億"],
  [9876543210, "九十億八億七千萬六百萬五十萬四萬三千二百十"],
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
    row[1] = `負${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0, "零"],
  [0.04, "零點零四"],
  [0.0468, "零點零四六八"],
  [0.4, "零點四"],
  [0.63, "零點六十三"],
  [0.973, "零點九百七十三"],
  [0.999, "零點九百九十九"],
  [37.06, "三十七點零六"],
  [37.068, "三十七點零六八"],
  [37.68, "三十七點六十八"],
  [37.683, "三十七點六百八十三"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// Comprehensive Ordinal Tests
const testOrdinalNumbers: [number, string][] = [
  [1, "第一"],
  [2, "第二"],
  [3, "第三"],
  [4, "第四"],
  [5, "第五"],
  [6, "第六"],
  [7, "第七"],
  [8, "第八"],
  [9, "第九"],
  [10, "第十"],
  [11, "第十一"],
  [12, "第十二"],
  [13, "第十三"],
  [14, "第十四"],
  [15, "第十五"],
  [16, "第十六"],
  [17, "第十七"],
  [18, "第十八"],
  [19, "第十九"],
  [20, "第二十"],
  [21, "第二十一"],
  [22, "第二十二"],
  [23, "第二十三"],
  [30, "第三十"],
  [40, "第四十"],
  [50, "第五十"],
  [60, "第六十"],
  [70, "第七十"],
  [80, "第八十"],
  [90, "第九十"],
  [31, "第三十一"],
  [32, "第三十二"],
  [33, "第三十三"],
  [41, "第四十一"],
  [42, "第四十二"],
  [43, "第四十三"],
  [51, "第五十一"],
  [52, "第五十二"],
  [53, "第五十三"],
  [100, "第百"],
  [200, "第二百"],
  [1000, "第一千"],
  [10000, "第一萬"],
  [100000, "第十萬"],
  [1000000, "第百萬"],
  [100001, "第十萬一"],
  [100002, "第十萬二"],
  [100003, "第十萬三"],
  [101, "第一百一"],
  [102, "第一百二"],
  [103, "第一百三"],
  [111, "第一百十一"],
  [112, "第一百十二"],
  [113, "第一百十三"],
  [123, "第一百二十三"],
  [1001, "第一千一"],
  [1234, "第一千二百三十四"],
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
  test("should throw error for NaN", () => {
    expect(() => toWords.convert(Number.NaN)).toThrow();
  });

  test("should throw error for Infinity", () => {
    expect(() => toWords.convert(Infinity)).toThrow();
  });

  test("should throw error for -Infinity", () => {
    expect(() => toWords.convert(-Infinity)).toThrow();
  });
});

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR zh-TW
// ============================================================

// Powers of Ten (Traditional Chinese system: 萬, 億, 兆)
const testPowersOfTen: [number, string][] = [
  [10, "十"],
  [100, "一百"],
  [1000, "一千"],
  [10000, "一萬"],
  [100000, "十萬"],
  [1000000, "百萬"],
  [10000000, "千萬"],
  [100000000, "億"],
  [1000000000, "十億"],
  [10000000000, "百億"],
  [100000000000, "千億"],
  [1000000000000, "兆"],
];

describe("Test Powers of Ten (Chinese System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "零"],
  [1n, "一"],
  [100n, "一百"],
  [1000n, "一千"],
  [10000n, "一萬"],
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
  [-1n, "負一"],
  [-100n, "負一百"],
  [-1000n, "負一千"],
  [-10000n, "負一萬"],
  [-100000000n, "負億"],
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
  ["100", "一百"],
  ["1000", "一千"],
  ["-100", "負一百"],
  ["  100  ", "一百"],
  ["10000", "一萬"],
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
