import { describe, expect, test } from "vitest";
import { ToWords } from "../src/ToWords";
import nbNo from "../src/locales/nb-NO.js";

const localeCode = "nb-NO";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(nbNo);
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
  [0, "Null"],
  [137, "Hundre Og Trettisju"],
  [700, "Sju Hundre"],
  [1100, "Tusen Hundre"],
  [4680, "Fire Tusen Seks Hundre Og Åtti"],
  [63892, "Sekstitre Tusen Åtte Hundre Og Nittito"],
  [86100, "Åttiseks Tusen Hundre"],
  [792581, "Sju Hundre Og Nittito Tusen Fem Hundre Og Åttien"],
  [2741034, "To Million Sju Hundre Og Førtien Tusen Trettifire"],
  [86429753, "Åttiseks Million Fire Hundre Og Tjueni Tusen Sju Hundre Og Femtitre"],
  [975310864, "Ni Hundre Og Syttifem Million Tre Hundre Og Ti Tusen Åtte Hundre Og Sekstifire"],
  [
    9876543210,
    "Ni Milliard Åtte Hundre Og Syttiseks Million Fem Hundre Og Førtitre Tusen To Hundre Og Ti",
  ],
  [
    98765432101,
    "Nittiåtte Milliard Sju Hundre Og Sekstifem Million Fire Hundre Og Trettito Tusen Hundre Og En",
  ],
  [
    987654321012,
    "Ni Hundre Og Åttisju Milliard Seks Hundre Og Femtifire Million Tre Hundre Og Tjueen Tusen Tolv",
  ],
  [
    9876543210123,
    "Ni Billion Åtte Hundre Og Syttiseks Milliard Fem Hundre Og Førtitre Million To Hundre Og Ti Tusen Hundre Og Tjuetre",
  ],
  [
    98765432101234,
    "Nittiåtte Billion Sju Hundre Og Sekstifem Milliard Fire Hundre Og Trettito Million Hundre Og En Tusen To Hundre Og Trettifire",
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
    row[1] = `Minus ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "Null"],
  [0.04, "Null Komma Null Fire"],
  [0.0468, "Null Komma Null Fire Seks Åtte"],
  [0.4, "Null Komma Fire"],
  [0.973, "Null Komma Ni Hundre Og Syttitre"],
  [0.999, "Null Komma Ni Hundre Og Nittini"],
  [37.06, "Trettisju Komma Null Seks"],
  [37.068, "Trettisju Komma Null Seks Åtte"],
  [37.68, "Trettisju Komma Sekstiåtte"],
  [37.683, "Trettisju Komma Seks Hundre Og Åttitre"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testOrdinals: [number, string][] = [
  // Numbers 0-10
  [0, "Nullte"],
  [1, "Første"],
  [2, "Andre"],
  [3, "Tredje"],
  [4, "Fjerde"],
  [5, "Femte"],
  [6, "Sjette"],
  [7, "Sjuende"],
  [8, "Åttende"],
  [9, "Niende"],
  [10, "Tiende"],
  [11, "Ellevte"],
  [12, "Tolvte"],
  [13, "Trettende"],
  [14, "Fjortende"],
  [15, "Femtende"],
  [16, "Sekstende"],
  [17, "Syttende"],
  [18, "Attende"],
  [19, "Nittende"],
  [20, "Tjuende"],
  // Composite numbers (21, 22, etc.)
  [21, "Tjueførste"],
  [22, "Tjueandre"],
  [23, "Tjuetredje"],
  [24, "Tjuefjerde"],
  [25, "Tjuefemte"],
  // Tens
  [30, "Trettiende"],
  [40, "Førtiende"],
  [50, "Femtiende"],
  [60, "Sekstiende"],
  [70, "Syttiende"],
  [80, "Åttiende"],
  [90, "Nittiende"],
  // Round numbers (100, 200, 1000, etc.)
  [100, "Hundrede"],
  [200, "To Hundrede"],
  [300, "Tre Hundrede"],
  [1000, "Tusende"],
  [2000, "To Tusende"],
  [1000000, "En Millionte"],
  [2000000, "To Millionte"],
  // Complex numbers
  [101, "Hundre Og Første"],
  [102, "Hundre Og Andre"],
  [111, "Hundre Og Ellevte"],
  [123, "Hundre Og Tjuetredje"],
  [150, "Hundre Og Femtiende"],
  [1001, "Tusen Første"],
  [1234, "Tusen To Hundre Og Trettifjerde"],
  [1500, "Tusen Fem Hundrede"],
  [10000, "Ti Tusende"],
  [100000, "Hundre Tusende"],
  [1000001, "En Million Første"],
];

describe("Test Ordinals with toOrdinal()", () => {
  test.concurrent.each(testOrdinals)("toOrdinal(%d) => %s", (input, expected) => {
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

  test("should throw error for small decimal numbers", () => {
    expect(() => toWords.toOrdinal(0.5)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("should throw error for large decimal numbers", () => {
    expect(() => toWords.toOrdinal(100.25)).toThrow(
      "Ordinal numbers must be non-negative integers"
    );
  });
});

describe("Test Norwegian-specific numbers", () => {
  test("Teens (11-19)", () => {
    expect(toWords.convert(11)).toBe("Elleve");
    expect(toWords.convert(12)).toBe("Tolv");
    expect(toWords.convert(13)).toBe("Tretten");
    expect(toWords.convert(14)).toBe("Fjorten");
    expect(toWords.convert(15)).toBe("Femten");
    expect(toWords.convert(16)).toBe("Seksten");
    expect(toWords.convert(17)).toBe("Sytten");
    expect(toWords.convert(18)).toBe("Atten");
    expect(toWords.convert(19)).toBe("Nitten");
  });

  test("Twenties", () => {
    expect(toWords.convert(20)).toBe("Tjue");
    expect(toWords.convert(21)).toBe("Tjueen");
    expect(toWords.convert(22)).toBe("Tjueto");
    expect(toWords.convert(25)).toBe("Tjuefem");
    expect(toWords.convert(28)).toBe("Tjueåtte");
  });

  test("Large numbers", () => {
    expect(toWords.convert(1000000)).toBe("En Million");
    expect(toWords.convert(1000000000)).toBe("En Milliard");
    expect(toWords.convert(2000000)).toBe("To Million");
    expect(toWords.convert(2000000000)).toBe("To Milliard");
  });
});

const testPowersOfTen: [number, string][] = [
  [10, "Ti"],
  [100, "Hundre"],
  [1000, "Tusen"],
  [10000, "Ti Tusen"],
  [100000, "Hundre Tusen"],
  [1000000, "En Million"],
];

describe("Test Powers of Ten", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testBigInt: [bigint, string][] = [
  [0n, "Null"],
  [1n, "En"],
  [100n, "Hundre"],
  [1000n, "Tusen"],
];

describe("Test BigInt", () => {
  test.concurrent.each(testBigInt)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

const testNegativeBigInt: [bigint, string][] = [
  [-1n, "Minus En"],
  [-100n, "Minus Hundre"],
  [-1000n, "Minus Tusen"],
];

describe("Test Negative BigInt", () => {
  test.concurrent.each(testNegativeBigInt)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

const testStringInput: [string, string][] = [
  ["0", "Null"],
  ["1", "En"],
  ["100", "Hundre"],
  ["-100", "Minus Hundre"],
];

describe("Test String Input", () => {
  test.concurrent.each(testStringInput)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input as string)).toBe(expected);
  });
});

describe("Test Zero Variants", () => {
  test("Zero as number", () => {
    expect(toWords.convert(0)).toBe("Null");
  });

  test("Negative zero", () => {
    expect(toWords.convert(-0)).toBe("Null");
  });

  test("Zero as float", () => {
    expect(toWords.convert(0.0)).toBe("Null");
  });

  test("Zero as BigInt", () => {
    expect(toWords.convert(0n)).toBe("Null");
  });

  test("Zero as string", () => {
    expect(toWords.convert("0")).toBe("Null");
  });
});

const testInvalidInputs: [unknown, string][] = [
  [Number.NaN, 'Invalid Number "NaN"'],
  [Infinity, 'Invalid Number "Infinity"'],
  [-Infinity, 'Invalid Number "-Infinity"'],
  ["", 'Invalid Number ""'],
  ["abc", 'Invalid Number "abc"'],
];

describe("Test Invalid Inputs", () => {
  test.concurrent.each(testInvalidInputs)("convert %s => throws %s", (input, expectedError) => {
    expect(() => toWords.convert(input as number)).toThrow(expectedError);
  });
});
