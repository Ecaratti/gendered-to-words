import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import koKr from "../src/locales/ko-KR.js";

const localeCode = "ko-KR";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(koKr);
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
  [0, "영"],
  [137, "일백삼십칠"],
  [700, "칠백"],
  [1100, "일천백"],
  [4680, "사천육백팔십"],
  [63892, "육만삼천팔백구십이"],
  [86100, "팔만육천백"],
  [792581, "칠십구만이천오백팔십일"],
  [2741034, "이백칠십사만일천삼십사"],
  [86429753, "팔천육백사십이만구천칠백오십삼"],
  [975310864, "구억칠천오백삼십일만팔백육십사"],
  [9876543210, "구십팔억칠천육백오십사만삼천이백십"],
  [98765432101, "구백팔십칠억육천오백사십삼만이천일백일"],
  [987654321012, "구천팔백칠십육억오천사백삼십이만일천십이"],
  [9876543210123, "구조팔천칠백육십오억사천삼백이십일만일백이십삼"],
  [98765432101234, "구십팔조칠천육백오십사억삼천이백십만일천이백삼십사"],
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
    row[1] = `마이너스${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "영"],
  [0.04, "영점영사"],
  [0.0468, "영점영사육팔"],
  [0.4, "영점사"],
  [0.63, "영점육십삼"],
  [0.973, "영점구백칠십삼"],
  [0.999, "영점구백구십구"],
  [37.06, "삼십칠점영육"],
  [37.068, "삼십칠점영육팔"],
  [37.68, "삼십칠점육십팔"],
  [37.683, "삼십칠점육백팔십삼"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testOrdinals: [number, string][] = [
  [0, "영번째"],
  [1, "첫째"],
  [2, "둘째"],
  [3, "셋째"],
  [4, "넷째"],
  [5, "다섯째"],
  [6, "여섯째"],
  [7, "일곱째"],
  [8, "여덟째"],
  [9, "아홉째"],
  [10, "열째"],
  [11, "십일번째"],
  [12, "십이번째"],
  [19, "십구번째"],
  [20, "이십번째"],
  [21, "이십일번째"],
  [25, "이십오번째"],
  [30, "삼십번째"],
  [99, "구십구번째"],
  [100, "백번째"],
  [101, "일백일번째"],
  [1000, "일천번째"],
  [10000, "일만번째"],
];

describe("Test Ordinals", () => {
  test.concurrent.each(testOrdinals)("toOrdinal %d => %s", (input, expected) => {
    expect(toWords.toOrdinal(input)).toBe(expected);
  });
});

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR ko-KR
// ============================================================

// Powers of Ten (Korean system: 만, 억, 조)
const testPowersOfTen: [number, string][] = [
  [10, "십"],
  [100, "백"],
  [1000, "일천"],
  [10000, "일만"],
  [100000, "십만"],
  [1000000, "백만"],
  [10000000, "일천만"],
  [100000000, "일억"],
  [1000000000, "십억"],
  [10000000000, "백억"],
  [100000000000, "일천억"],
  [1000000000000, "일조"],
];

describe("Test Powers of Ten (Korean System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "영"],
  [1n, "일"],
  [100n, "백"],
  [1000n, "일천"],
  [10000n, "일만"],
  [100000000n, "일억"],
  [1000000000000n, "일조"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "마이너스일"],
  [-100n, "마이너스백"],
  [-1000n, "마이너스일천"],
  [-10000n, "마이너스일만"],
  [-100000000n, "마이너스일억"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "영"],
  ["1", "일"],
  ["100", "백"],
  ["1000", "일천"],
  ["-100", "마이너스백"],
  ["  100  ", "백"],
  ["10000", "일만"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("영");
  });

  test("converts -0 as 영", () => {
    expect(toWords.convert(-0)).toBe("영");
  });

  test("converts 0.0 as 영", () => {
    expect(toWords.convert(0.0)).toBe("영");
  });

  test("converts 0n as 영", () => {
    expect(toWords.convert(0n)).toBe("영");
  });

  test('converts "0" as 영', () => {
    expect(toWords.convert("0")).toBe("영");
  });
});

// Invalid Input Tests
describe("Test Invalid Inputs for ko-KR", () => {
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
