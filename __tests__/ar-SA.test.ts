import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import arSa from "../src/locales/ar-SA.js";

const localeCode = "ar-SA";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(arSa);
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
  [0, "صفر"],
  [1, "واحد"],
  [2, "اثنان"],
  [3, "ثلاثة"],
  [4, "أربعة"],
  [5, "خمسة"],
  [6, "ستة"],
  [7, "سبعة"],
  [8, "ثمانية"],
  [9, "تسعة"],
  [10, "عشرة"],
  [11, "أحد عشر"],
  [12, "اثنا عشر"],
  [13, "ثلاثة عشر"],
  [14, "أربعة عشر"],
  [15, "خمسة عشر"],
  [16, "ستة عشر"],
  [17, "سبعة عشر"],
  [18, "ثمانية عشر"],
  [19, "تسعة عشر"],
  [20, "عشرون"],
  [21, "واحد و عشرون"],
  [25, "خمسة و عشرون"],
  [30, "ثلاثون"],
  [42, "اثنان و أربعون"],
  [50, "خمسون"],
  [99, "تسعة و تسعون"],
  [100, "مائة"],
  [137, "مائة و سبعة و ثلاثون"],
  [200, "مائتان"],
  [300, "ثلاثمائة"],
  [500, "خمسمائة"],
  [700, "سبعمائة"],
  [999, "تسعمائة و تسعة و تسعون"],
  [1000, "ألف"],
  [1001, "ألف و واحد"],
  [1234, "ألف و مائتان و أربعة و ثلاثون"],
  [4680, "أربعة آلاف و ستمائة و ثمانون"],
  [10000, "عشرة آلاف"],
  [63892, "ثلاثة و ستون ألف و ثمانمائة و اثنان و تسعون"],
  [100000, "مائة ألف"],
  [792581, "سبعمائة و اثنان و تسعون ألف و خمسمائة و واحد و ثمانون"],
  [1000000, "مليون"],
  [2741034, "مليونان و سبعمائة و واحد و أربعون ألف و أربعة و ثلاثون"],
  [86429753, "ستة و ثمانون مليون و أربعمائة و تسعة و عشرون ألف و سبعمائة و ثلاثة و خمسون"],
  [975310864, "تسعمائة و خمسة و سبعون مليون و ثلاثمائة و عشرة آلاف و ثمانمائة و أربعة و ستون"],
  [1000000000, "مليار"],
  [
    9876543210,
    "تسعة مليارات و ثمانمائة و ستة و سبعون مليون و خمسمائة و ثلاثة و أربعون ألف و مائتان و عشرة",
  ],
  [
    98765432101,
    "ثمانية و تسعون مليار و سبعمائة و خمسة و ستون مليون و أربعمائة و اثنان و ثلاثون ألف و مائة و واحد",
  ],
  [
    987654321012,
    "تسعمائة و سبعة و ثمانون مليار و ستمائة و أربعة و خمسون مليون و ثلاثمائة و واحد و عشرون ألف و اثنا عشر",
  ],
  [
    9876543210123,
    "تسعة تريليونات و ثمانمائة و ستة و سبعون مليار و خمسمائة و ثلاثة و أربعون مليون و مائتان و عشرة آلاف و مائة و ثلاثة و عشرون",
  ],
  [
    98765432101234,
    "ثمانية و تسعون تريليون و سبعمائة و خمسة و ستون مليار و أربعمائة و اثنان و ثلاثون مليون و مائة و واحد ألف و مائتان و أربعة و ثلاثون",
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
    row[1] = `سالب ${row[1]}`;
  });

  test.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "صفر"],
  [0.4, "صفر فاصلة أربعة"],
  [0.04, "صفر فاصلة صفر أربعة"],
  [0.63, "صفر فاصلة ثلاثة و ستون"],
  [0.973, "صفر فاصلة تسعمائة و ثلاثة و سبعون"],
  [0.999, "صفر فاصلة تسعمائة و تسعة و تسعون"],
  [37.06, "سبعة و ثلاثون فاصلة صفر ستة"],
  [37.68, "سبعة و ثلاثون فاصلة ثمانية و ستون"],
  [37.683, "سبعة و ثلاثون فاصلة ستمائة و ثلاثة و ثمانون"],
];

describe("Test Floats with options = {}", () => {
  test.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});


describe("Ordinal Tests", () => {
  const toWordsOrdinal = new ToWords({
    localeCode: "ar-SA",
  });

  const testOrdinals: [number, string][] = [
    // Numbers 1-10
    [1, "الأول"],
    [2, "الثاني"],
    [3, "الثالث"],
    [4, "الرابع"],
    [5, "الخامس"],
    [6, "السادس"],
    [7, "السابع"],
    [8, "الثامن"],
    [9, "التاسع"],
    [10, "العاشر"],
    // Numbers 11-20
    [11, "الحادي عشر"],
    [12, "الثاني عشر"],
    [13, "الثالث عشر"],
    [14, "الرابع عشر"],
    [15, "الخامس عشر"],
    [16, "السادس عشر"],
    [17, "السابع عشر"],
    [18, "الثامن عشر"],
    [19, "التاسع عشر"],
    [20, "العشرون"],
    // Composite numbers
    [21, "واحد و عشرون"],
    [25, "خمسة و عشرون"],
    [30, "الثلاثون"],
    [42, "اثنان و أربعون"],
    [50, "الخمسون"],
    [99, "تسعة و تسعون"],
    // Round numbers
    [100, "المائة"],
    [1000, "الألف"],
    [1000000, "المليون"],
    // Complex numbers
    [123, "مائة و ثلاثة و عشرون"],
    [1001, "ألف و الأول"],
  ];

  test.each(testOrdinals)("Number: %d => %s", (input, expected) => {
    expect(toWordsOrdinal.toOrdinal(input as number)).toBe(expected);
  });

  test("should throw error for negative numbers", () => {
    expect(() => toWordsOrdinal.toOrdinal(-1)).toThrow(
      "Ordinal numbers must be non-negative integers"
    );
  });

  test("should throw error for decimal numbers", () => {
    expect(() => toWordsOrdinal.toOrdinal(1.5)).toThrow(
      "Ordinal numbers must be non-negative integers"
    );
  });
});

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR ar-SA
// ============================================================

// Powers of Ten (Arabic)
const testPowersOfTen: [number, string][] = [
  [10, "عشرة"],
  [100, "مائة"],
  [1000, "ألف"],
  [10000, "عشرة آلاف"],
  [100000, "مائة ألف"],
  [1000000, "مليون"],
  [10000000, "عشرة ملايين"],
  [100000000, "مائة مليون"],
  [1000000000, "مليار"],
  [10000000000, "عشرة مليارات"],
  [100000000000, "مائة مليار"],
  [1000000000000, "تريليون"],
];

describe("Test Powers of Ten (Arabic System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Boundary Values
const testBoundaries: [number, string][] = [
  [99, "تسعة و تسعون"],
  [100, "مائة"],
  [101, "مائة و واحد"],
  [999, "تسعمائة و تسعة و تسعون"],
  [1000, "ألف"],
  [1001, "ألف و واحد"],
  [9999, "تسعة آلاف و تسعمائة و تسعة و تسعون"],
  [10000, "عشرة آلاف"],
  [99999, "تسعة و تسعون ألف و تسعمائة و تسعة و تسعون"],
  [100000, "مائة ألف"],
  [1000000, "مليون"],
  [1000001, "مليون و واحد"],
];

describe("Test Boundary Values", () => {
  test.concurrent.each(testBoundaries)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative Numbers
const testNegativeInts: [number, string][] = [
  [-1, "سالب واحد"],
  [-10, "سالب عشرة"],
  [-100, "سالب مائة"],
  [-1000, "سالب ألف"],
  [-1000000, "سالب مليون"],
];

describe("Test Negative Integers", () => {
  test.concurrent.each(testNegativeInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative Floats
const testNegativeFloats: [number, string][] = [
  [-0.5, "سالب صفر فاصلة خمسة"],
  [-0.99, "سالب صفر فاصلة تسعة و تسعون"],
  [-1.5, "سالب واحد فاصلة خمسة"],
  [-3.14, "سالب ثلاثة فاصلة أربعة عشر"],
  [-99.99, "سالب تسعة و تسعون فاصلة تسعة و تسعون"],
];

describe("Test Negative Floats", () => {
  test.concurrent.each(testNegativeFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "صفر"],
  [1n, "واحد"],
  [100n, "مائة"],
  [1000n, "ألف"],
  [1000000n, "مليون"],
  [1000000000n, "مليار"],
  [1000000000000n, "تريليون"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "سالب واحد"],
  [-100n, "سالب مائة"],
  [-1000n, "سالب ألف"],
  [-1000000n, "سالب مليون"],
  [-1000000000n, "سالب مليار"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "صفر"],
  ["1", "واحد"],
  ["100", "مائة"],
  ["1000", "ألف"],
  ["-100", "سالب مائة"],
  ["3.14", "ثلاثة فاصلة أربعة عشر"],
  ["-3.14", "سالب ثلاثة فاصلة أربعة عشر"],
  ["  100  ", "مائة"],
  ["1000000", "مليون"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("صفر");
  });

  test("converts -0 as صفر", () => {
    expect(toWords.convert(-0)).toBe("صفر");
  });

  test("converts 0.0 as صفر", () => {
    expect(toWords.convert(0.0)).toBe("صفر");
  });

  test("converts 0n as صفر", () => {
    expect(toWords.convert(0n)).toBe("صفر");
  });

  test('converts "0" as صفر', () => {
    expect(toWords.convert("0")).toBe("صفر");
  });


});


// All Options Combinations


// Invalid Input Tests
describe("Test Invalid Inputs for ar-SA", () => {
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
