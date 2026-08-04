import { describe, expect, test } from "vitest";
import { ToWords } from "../src/ToWords";
import sqAl from "../src/locales/sq-AL.js";

const localeCode = "sq-AL";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(sqAl);
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
  [0, "Zero"],
  [1, "Një"],
  [2, "Dy"],
  [3, "Tre"],
  [4, "Katër"],
  [5, "Pesë"],
  [6, "Gjashtë"],
  [7, "Shtatë"],
  [8, "Tetë"],
  [9, "Nëntë"],
  [10, "Dhjetë"],
  [11, "Njëmbëdhjetë"],
  [12, "Dymbëdhjetë"],
  [13, "Trembëdhjetë"],
  [14, "Katërmbëdhjetë"],
  [15, "Pesëmbëdhjetë"],
  [16, "Gjashtëmbëdhjetë"],
  [17, "Shtatëmbëdhjetë"],
  [18, "Tetëmbëdhjetë"],
  [19, "Nëntëmbëdhjetë"],
  [20, "Njëzet"],
  [21, "Njëzet E Një"],
  [22, "Njëzet E Dy"],
  [30, "Tridhjetë"],
  [35, "Tridhjetë E Pesë"],
  [40, "Dyzet"],
  [50, "Pesëdhjetë"],
  [60, "Gjashtëdhjetë"],
  [70, "Shtatëdhjetë"],
  [80, "Tetëdhjetë"],
  [90, "Nëntëdhjetë"],
  [99, "Nëntëdhjetë E Nëntë"],
  [100, "Njëqind"],
  [137, "Njëqind E Tridhjetë E Shtatë"],
  [200, "Dyqind"],
  [300, "Treqind"],
  [400, "Katërqind"],
  [500, "Pesëqind"],
  [600, "Gjashtëqind"],
  [700, "Shtatëqind"],
  [800, "Tetëqind"],
  [900, "Nëntëqind"],
  [1000, "Një Mijë"],
  [1100, "Një Mijë E Njëqind"],
  [2000, "Dy Mijë"],
  [3000, "Tre Mijë"],
  [4000, "Katër Mijë"],
  [5000, "Pesë Mijë"],
  [4680, "Katër Mijë E Gjashtëqind E Tetëdhjetë"],
  [10000, "Dhjetë Mijë"],
  [63892, "Gjashtëdhjetë E Tre Mijë E Tetëqind E Nëntëdhjetë E Dy"],
  [100000, "Njëqind Mijë"],
  [1000000, "Një Milion"],
  [2000000, "Dy Milion"],
  [5000000, "Pesë Milion"],
  [2741034, "Dy Milion E Shtatëqind E Dyzet E Një Mijë E Tridhjetë E Katër"],
  [1000000000, "Një Miliard"],
  [2000000000, "Dy Miliard"],
  [5000000000, "Pesë Miliard"],
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
  [0.0, "Zero"],
  [0.04, "Zero Presje Zero Katër"],
  [0.4, "Zero Presje Katër"],
  [0.63, "Zero Presje Gjashtëdhjetë E Tre"],
  [37.06, "Tridhjetë E Shtatë Presje Zero Gjashtë"],
  [37.68, "Tridhjetë E Shtatë Presje Gjashtëdhjetë E Tetë"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// Ordinal Tests
const testOrdinalNumbers: [number, string][] = [
  [1, "I Parë"],
  [2, "I Dytë"],
  [3, "I Tretë"],
  [4, "I Katërt"],
  [5, "I Pestë"],
  [6, "I Gjashtë"],
  [7, "I Shtatë"],
  [8, "I Tetë"],
  [9, "I Nëntë"],
  [10, "I Dhjetëti"],
  [11, "I Njëmbëdhjetëti"],
  [12, "I Dymbëdhjetëti"],
  [13, "I Trembëdhjetëti"],
  [14, "I Katërmbëdhjetëti"],
  [15, "I Pesëmbëdhjetëti"],
  [16, "I Gjashtëmbëdhjetëti"],
  [17, "I Shtatëmbëdhjetëti"],
  [18, "I Tetëmbëdhjetëti"],
  [19, "I Nëntëmbëdhjetëti"],
  [20, "I Njëzetti"],
  [21, "Njëzet E I Parë"],
  [22, "Njëzet E I Dytë"],
  [30, "I Tridhjetëti"],
  [40, "I Dyzetti"],
  [50, "I Pesëdhjetëti"],
  [60, "I Gjashtëdhjetëti"],
  [70, "I Shtatëdhjetëti"],
  [80, "I Tetëdhjetëti"],
  [90, "I Nëntëdhjetëti"],
  [100, "I Njëqindti"],
  [101, "Njëqind E I Parë"],
  [200, "I Dyqindti"],
  [300, "I Treqindti"],
  [1000, "I Mijëti"],
  [1001, "Një Mijë E I Parë"],
  [1000000, "I Milionti"],
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
describe("Test Powers of Ten", () => {
  const powersOfTen: [number, string][] = [
    [10, "Dhjetë"],
    [100, "Njëqind"],
    [1000, "Një Mijë"],
    [10000, "Dhjetë Mijë"],
    [100000, "Njëqind Mijë"],
    [1000000, "Një Milion"],
  ];

  test.concurrent.each(powersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// BigInt Tests
describe("Test BigInt Inputs", () => {
  const bigIntTests: [bigint, string][] = [
    [0n, "Zero"],
    [1n, "Një"],
    [100n, "Njëqind"],
    [1000n, "Një Mijë"],
  ];

  test.concurrent.each(bigIntTests)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

// Negative BigInt Tests
describe("Test Negative BigInt Inputs", () => {
  const negativeBigIntTests: [bigint, string][] = [
    [-1n, "Minus Një"],
    [-100n, "Minus Njëqind"],
    [-1000n, "Minus Një Mijë"],
  ];

  test.concurrent.each(negativeBigIntTests)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

// String Input Tests
describe("Test String Inputs", () => {
  const stringTests: [string, string][] = [
    ["0", "Zero"],
    ["1", "Një"],
    ["100", "Njëqind"],
    ["-100", "Minus Njëqind"],
  ];

  test.concurrent.each(stringTests)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input as string)).toBe(expected);
  });
});

// Zero Variants Tests
describe("Test Zero Variants", () => {
  test("convert 0 => Zero", () => {
    expect(toWords.convert(0)).toBe("Zero");
  });

  test("convert -0 => Zero", () => {
    expect(toWords.convert(-0)).toBe("Zero");
  });

  test("convert 0.0 => Zero", () => {
    expect(toWords.convert(0.0)).toBe("Zero");
  });

  test("convert 0n => Zero", () => {
    expect(toWords.convert(0n)).toBe("Zero");
  });

  test('convert "0" => Zero', () => {
    expect(toWords.convert("0")).toBe("Zero");
  });
});

// Invalid Input Tests
describe("Test Invalid Inputs", () => {
  const invalidInputs: [unknown, string][] = [
    [Number.NaN, 'Invalid Number "NaN"'],
    [Infinity, 'Invalid Number "Infinity"'],
    [-Infinity, 'Invalid Number "-Infinity"'],
    ["", 'Invalid Number ""'],
    ["abc", 'Invalid Number "abc"'],
  ];

  test.concurrent.each(invalidInputs)("convert %s throws error", (input, expectedMessage) => {
    expect(() => toWords.convert(input as number)).toThrow(expectedMessage);
  });
});
