import { describe, expect, test } from "vitest";
import { ToWords } from "../src/ToWords";
import huHu from "../src/locales/hu-HU.js";

const localeCode = "hu-HU";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(huHu);
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
  [0, "Nulla"],
  [1, "Egy"],
  [2, "Kettő"],
  [3, "Három"],
  [4, "Négy"],
  [5, "Öt"],
  [6, "Hat"],
  [7, "Hét"],
  [8, "Nyolc"],
  [9, "Kilenc"],
  [10, "Tíz"],
  [11, "Tizenegy"],
  [12, "Tizenkettő"],
  [13, "Tizenhárom"],
  [14, "Tizennégy"],
  [15, "Tizenöt"],
  [16, "Tizenhat"],
  [17, "Tizenhét"],
  [18, "Tizennyolc"],
  [19, "Tizenkilenc"],
  [20, "Húsz"],
  [21, "Huszonegy"],
  [22, "Huszonkettő"],
  [23, "Huszonhárom"],
  [24, "Huszonnégy"],
  [25, "Huszonöt"],
  [26, "Huszonhat"],
  [27, "Huszonhét"],
  [28, "Huszonnyolc"],
  [29, "Huszonkilenc"],
  [30, "Harminc"],
  [35, "Harmincöt"],
  [40, "Negyven"],
  [50, "Ötven"],
  [60, "Hatvan"],
  [70, "Hetven"],
  [80, "Nyolcvan"],
  [90, "Kilencven"],
  [99, "Kilencvenkilenc"],
  [100, "Száz"],
  [137, "Százharminchét"],
  [200, "Kétszáz"],
  [300, "Háromszáz"],
  [400, "Négyszáz"],
  [500, "Ötszáz"],
  [600, "Hatszáz"],
  [700, "Hétszáz"],
  [800, "Nyolcszáz"],
  [900, "Kilencszáz"],
  [1000, "Ezer"],
  [1100, "Ezerszáz"],
  [2000, "Kétezer"],
  [3000, "Háromezer"],
  [4680, "Négyezerhatszáznyolcvan"],
  [10000, "Tízezer"],
  [63892, "Hatvanháromezernyolcszázkilencvenkettő"],
  [100000, "Százezer"],
  [1000000, "Egymillió"],
  [2000000, "Kétmillió"],
  [2741034, "Kétmillióhétszáznegyvenegyezerharmincnégy"],
  [1000000000, "Egymilliárd"],
  [2000000000, "Kétmilliárd"],
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
    row[1] = `Mínusz ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "Nulla"],
  [0.04, "Nulla Egész Nulla Négy"],
  [0.4, "Nulla Egész Négy"],
  [0.63, "Nulla Egész Hatvanhárom"],
  [37.06, "Harminchét Egész Nulla Hat"],
  [37.68, "Harminchét Egész Hatvannyolc"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// Ordinal Tests
const testOrdinalNumbers: [number, string][] = [
  [0, "Nulladik"],
  [1, "Első"],
  [2, "Második"],
  [3, "Harmadik"],
  [4, "Negyedik"],
  [5, "Ötödik"],
  [6, "Hatodik"],
  [7, "Hetedik"],
  [8, "Nyolcadik"],
  [9, "Kilencedik"],
  [10, "Tizedik"],
  [11, "Tizenegyedik"],
  [12, "Tizenkettedik"],
  [13, "Tizenharmadik"],
  [14, "Tizennegyedik"],
  [15, "Tizenötödik"],
  [16, "Tizenhatodik"],
  [17, "Tizenhetedik"],
  [18, "Tizennyolcadik"],
  [19, "Tizenkilencedik"],
  [20, "Huszadik"],
  [21, "Huszonegyedik"],
  [22, "Huszonkettedik"],
  [30, "Harmincadik"],
  [40, "Negyvenedik"],
  [50, "Ötvenedik"],
  [60, "Hatvanadik"],
  [70, "Hetvenedik"],
  [80, "Nyolcvanadik"],
  [90, "Kilencvenedik"],
  [100, "Századik"],
  [101, "Százelső"],
  [200, "Kétszázadik"],
  [1000, "Ezredik"],
  [1001, "Ezerelső"],
  [1000000, "Egymilliomodik"],
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

describe("Test Hungarian-specific numbers", () => {
  test("Twenties with special prefix (Huszon-)", () => {
    expect(toWords.convert(21)).toBe("Huszonegy");
    expect(toWords.convert(22)).toBe("Huszonkettő");
    expect(toWords.convert(23)).toBe("Huszonhárom");
    expect(toWords.convert(24)).toBe("Huszonnégy");
    expect(toWords.convert(25)).toBe("Huszonöt");
    expect(toWords.convert(26)).toBe("Huszonhat");
    expect(toWords.convert(27)).toBe("Huszonhét");
    expect(toWords.convert(28)).toBe("Huszonnyolc");
    expect(toWords.convert(29)).toBe("Huszonkilenc");
  });

  test("Large numbers", () => {
    expect(toWords.convert(1000000)).toBe("Egymillió");
    expect(toWords.convert(1000000000)).toBe("Egymilliárd");
  });
});

// Powers of Ten Tests
const testPowersOfTen: [number, string][] = [
  [10, "Tíz"],
  [100, "Száz"],
  [1000, "Ezer"],
  [10000, "Tízezer"],
  [100000, "Százezer"],
  [1000000, "Egymillió"],
];

describe("Test Powers of Ten", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "Nulla"],
  [1n, "Egy"],
  [100n, "Száz"],
  [1000n, "Ezer"],
];

describe("Test BigInt", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Mínusz Egy"],
  [-100n, "Mínusz Száz"],
  [-1000n, "Mínusz Ezer"],
];

describe("Test Negative BigInt", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "Nulla"],
  ["1", "Egy"],
  ["100", "Száz"],
  ["-100", "Mínusz Száz"],
];

describe("Test String Inputs", () => {
  test.concurrent.each(testStringInputs)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input as string)).toBe(expected);
  });
});

// Zero Variants Tests
describe("Test Zero Variants", () => {
  test("convert 0 => Nulla", () => {
    expect(toWords.convert(0)).toBe("Nulla");
  });

  test("convert -0 => Nulla", () => {
    expect(toWords.convert(-0)).toBe("Nulla");
  });

  test("convert 0.0 => Nulla", () => {
    expect(toWords.convert(0.0)).toBe("Nulla");
  });

  test("convert 0n => Nulla", () => {
    expect(toWords.convert(0n)).toBe("Nulla");
  });

  test('convert "0" => Nulla', () => {
    expect(toWords.convert("0")).toBe("Nulla");
  });
});

// Invalid Input Tests
describe("Test Invalid Inputs", () => {
  test("should throw error for NaN", () => {
    expect(() => toWords.convert(Number.NaN)).toThrow('Invalid Number "NaN"');
  });

  test("should throw error for Infinity", () => {
    expect(() => toWords.convert(Infinity)).toThrow('Invalid Number "Infinity"');
  });

  test("should throw error for -Infinity", () => {
    expect(() => toWords.convert(-Infinity)).toThrow('Invalid Number "-Infinity"');
  });

  test("should throw error for empty string", () => {
    expect(() => toWords.convert("")).toThrow('Invalid Number ""');
  });

  test("should throw error for non-numeric string", () => {
    expect(() => toWords.convert("abc")).toThrow('Invalid Number "abc"');
  });
});
