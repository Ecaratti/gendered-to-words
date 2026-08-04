import { describe, expect, test } from "vitest";
import { ToWords } from "../src/ToWords";
import hiIn from "../src/locales/hi-IN.js";

const localeCode = "hi-IN";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(hiIn);
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
  [0, "शून्य"],
  [137, "एक सौ सैंतीस"],
  [700, "सात सौ"],
  [4680, "चार हज़ार छह सौ अस्सी"],
  [63892, "तिरसठ हज़ार आठ सौ बानवे"],
  [792581, "सात लाख बानवे हज़ार पांच सौ इक्यासी"],
  [2741034, "सत्ताईस लाख इकतालीस हज़ार चौंतीस"],
  [86429753, "आठ करोड़ चौंसठ लाख उनतीस हज़ार सात सौ तिरेपन"],
  [975310864, "सत्तानवे करोड़ तिरेपन लाख दस हज़ार आठ सौ चौंसठ"],
  [9876543210, "नौ अरब सतासी करोड़ पैंसठ लाख तैंतालीस हज़ार दो सौ दस"],
  [98765432101, "अट्ठानवे अरब छिहत्तर करोड़ चौवन लाख बत्तीस हज़ार एक सौ एक"],
  [987654321012, "नौ खरब सतासी अरब पैंसठ करोड़ तैंतालीस लाख इक्कीस हज़ार बारह"],
  [9876543210123, "अट्ठानवे खरब छिहत्तर अरब चौवन करोड़ बत्तीस लाख दस हज़ार एक सौ तेईस"],
  [98765432101234, "नौ नील सतासी खरब पैंसठ अरब तैंतालीस करोड़ इक्कीस लाख एक हज़ार दो सौ चौंतीस"],
];

describe("Test Integers with options = {}", () => {
  test.each(testIntegers)("convert %d => %s", (input, expected) => {
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
    row[1] = `ऋण ${row[1]}`;
  });

  test.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "शून्य"],
  [0.04, "शून्य दशांश शून्य चार"],
  [0.0468, "शून्य दशांश शून्य चार छह आठ"],
  [0.4, "शून्य दशांश चार"],
  [0.63, "शून्य दशांश तिरसठ"],
  [0.973, "शून्य दशांश नौ सौ तिहत्तर"],
  [0.999, "शून्य दशांश नौ सौ निन्यानवे"],
  [37.06, "सैंतीस दशांश शून्य छह"],
  [37.068, "सैंतीस दशांश शून्य छह आठ"],
  [37.68, "सैंतीस दशांश अड़सठ"],
  [37.683, "सैंतीस दशांश छह सौ तिरासी"],
];

describe("Test Floats with options = {}", () => {
  test.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testOrdinals: [number, string][] = [
  [0, "शून्यवां"],
  [1, "पहला"],
  [2, "दूसरा"],
  [3, "तीसरा"],
  [4, "चौथा"],
  [5, "पांचवां"],
  [6, "छठा"],
  [7, "सातवां"],
  [8, "आठवां"],
  [9, "नौवां"],
  [10, "दसवां"],
  [11, "ग्यारहवां"],
  [12, "बारहवां"],
  [13, "तेरहवां"],
  [14, "चौदहवां"],
  [15, "पंद्रहवां"],
  [16, "सोलहवां"],
  [17, "सत्रहवां"],
  [18, "अठारहवां"],
  [19, "उन्नीसवां"],
  [20, "बीसवां"],
  [21, "इक्कीसवां"],
  [22, "बाईसवां"],
  [23, "तेईसवां"],
  [24, "चौबीसवां"],
  [25, "पच्चीसवां"],
  [30, "तीसवां"],
  [40, "चालीसवां"],
  [50, "पचासवां"],
  [60, "साठवां"],
  [70, "सत्तरवां"],
  [80, "अस्सीवां"],
  [90, "नब्बेवां"],
  [99, "निन्यानवेवां"],
  [100, "सौवां"],
  [101, "एक सौ पहला"],
  [111, "एक सौ ग्यारहवां"],
  [123, "एक सौ तेईसवां"],
  [199, "एक सौ निन्यानवेवां"],
  [200, "दो सौवां"],
  [500, "पांच सौवां"],
  [1000, "एक हज़ारवां"],
  [1001, "एक हज़ार पहला"],
  [1100, "एक हज़ार सौवां"],
  [1234, "एक हज़ार दो सौ चौंतीसवां"],
  [10000, "दस हज़ारवां"],
  [100000, "एक लाखवां"],
  [100001, "एक लाख पहला"],
  [1000000, "दस लाखवां"],
  [10000000, "एक करोड़वां"],
];

describe("Test Ordinals", () => {
  test.each(testOrdinals)("toOrdinal(%d) => %s", (input, expected) => {
    expect(toWords.toOrdinal(input)).toBe(expected);
  });
});

describe("Test Ordinal Error Cases", () => {
  test("should throw error for negative numbers", () => {
    expect(() => toWords.toOrdinal(-1)).toThrow(/must be non-negative/);
  });

  test("should throw error for decimal numbers", () => {
    expect(() => toWords.toOrdinal(1.5)).toThrow(/must be non-negative integers/);
  });
});

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR hi-IN
// ============================================================

// Powers of Ten (Indian System: लाख, करोड़, अरब, खरब)
const testPowersOfTen: [number, string][] = [
  [10, "दस"],
  [100, "सौ"],
  [1000, "एक हज़ार"],
  [10000, "दस हज़ार"],
  [100000, "एक लाख"],
  [1000000, "दस लाख"],
  [10000000, "एक करोड़"],
  [100000000, "दस करोड़"],
  [1000000000, "एक अरब"],
  [10000000000, "दस अरब"],
  [100000000000, "एक खरब"],
];

describe("Test Powers of Ten (Indian System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "शून्य"],
  [1n, "एक"],
  [100n, "सौ"],
  [1000n, "एक हज़ार"],
  [100000n, "एक लाख"],
  [10000000n, "एक करोड़"],
  [1000000000n, "एक अरब"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "ऋण एक"],
  [-100n, "ऋण सौ"],
  [-1000n, "ऋण एक हज़ार"],
  [-100000n, "ऋण एक लाख"],
  [-10000000n, "ऋण एक करोड़"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "शून्य"],
  ["1", "एक"],
  ["100", "सौ"],
  ["1000", "एक हज़ार"],
  ["-100", "ऋण सौ"],
  ["  100  ", "सौ"],
  ["100000", "एक लाख"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("शून्य");
  });

  test("converts -0 as शून्य", () => {
    expect(toWords.convert(-0)).toBe("शून्य");
  });

  test("converts 0.0 as शून्य", () => {
    expect(toWords.convert(0.0)).toBe("शून्य");
  });

  test("converts 0n as शून्य", () => {
    expect(toWords.convert(0n)).toBe("शून्य");
  });

  test('converts "0" as शून्य', () => {
    expect(toWords.convert("0")).toBe("शून्य");
  });
});

// Invalid Input Tests
describe("Test Invalid Inputs for hi-IN", () => {
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
