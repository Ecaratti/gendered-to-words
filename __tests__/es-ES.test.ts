import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords.js";
import esES from "../src/locales/es-ES.js";

const localeCode = "es-ES";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(esES);
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
  [0, "Cero"],
  [1, "Uno"],
  [137, "Ciento Treinta Y Siete"],
  [700, "Setecientos"],
  [1100, "Mil Cien"],
  [4680, "Cuatro Mil Seiscientos Ochenta"],
  [63892, "Sesenta Y Tres Mil Ochocientos Noventa Y Dos"],
  [86100, "Ochenta Y Seis Mil Cien"],
  [792581, "Setecientos Noventa Y Dos Mil Quinientos Ochenta Y Uno"],
  [2741034, "Dos Millones Setecientos Cuarenta Y Un Mil Treinta Y Cuatro"],
  [86429753, "Ochenta Y Seis Millones Cuatrocientos Veintinueve Mil Setecientos Cincuenta Y Tres"],
  [
    975310864,
    "Novecientos Setenta Y Cinco Millones Trescientos Diez Mil Ochocientos Sesenta Y Cuatro",
  ],
  [
    9876543210,
    "Nueve Mil Ochocientos Setenta Y Seis Millones Quinientos Cuarenta Y Tres Mil Doscientos Diez",
  ],
  [
    98765432101,
    "Noventa Y Ocho Mil Setecientos Sesenta Y Cinco Millones Cuatrocientos Treinta Y Dos Mil Ciento Uno",
  ],
  [
    987654321012,
    "Novecientos Ochenta Y Siete Mil Seiscientos Cincuenta Y Cuatro Millones Trescientos Veintiuno Mil Doce",
  ],
  [
    9876543210123,
    "Nueve Billones Ochocientos Setenta Y Seis Mil Quinientos Cuarenta Y Tres Millones Doscientos Diez Mil Ciento Veintitrés",
  ],
  [
    98765432101234,
    "Noventa Y Ocho Billones Setecientos Sesenta Y Cinco Mil Cuatrocientos Treinta Y Dos Millones Ciento Un Mil Doscientos Treinta Y Cuatro",
  ],
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
    row[1] = `Menos ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});


const testFloats: [number, string][] = [
  [0.0, "Cero"],
  [0.04, "Cero Punto Cero Cuatro"],
  [0.0468, "Cero Punto Cero Cuatro Seis Ocho"],
  [0.4, "Cero Punto Cuatro"],
  [0.63, "Cero Punto Sesenta Y Tres"],
  [0.973, "Cero Punto Novecientos Setenta Y Tres"],
  [0.999, "Cero Punto Novecientos Noventa Y Nueve"],
  [37.06, "Treinta Y Siete Punto Cero Seis"],
  [37.068, "Treinta Y Siete Punto Cero Seis Ocho"],
  [37.68, "Treinta Y Siete Punto Sesenta Y Ocho"],
  [37.683, "Treinta Y Siete Punto Seiscientos Ochenta Y Tres"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});


// Ordinal Tests
const testOrdinals: [number, string][] = [
  // Numbers 1-20
  [1, "Primero"],
  [2, "Segundo"],
  [3, "Tercero"],
  [4, "Cuarto"],
  [5, "Quinto"],
  [6, "Sexto"],
  [7, "Séptimo"],
  [8, "Octavo"],
  [9, "Noveno"],
  [10, "Décimo"],
  [11, "Decimoprimero"],
  [12, "Decimosegundo"],
  [13, "Decimotercero"],
  [14, "Decimocuarto"],
  [15, "Decimoquinto"],
  [16, "Decimosexto"],
  [17, "Decimoséptimo"],
  [18, "Decimoctavo"],
  [19, "Decimonoveno"],
  [20, "Vigésimo"],
  // Composite numbers (21-29)
  [21, "Veintiuno"],
  [22, "Veintidós"],
  [23, "Veintitrés"],
  [24, "Veinticuatro"],
  [25, "Veinticinco"],
  // Tens
  [30, "Trigésimo"],
  [40, "Cuadragésimo"],
  [50, "Quincuagésimo"],
  [60, "Sexagésimo"],
  [70, "Septuagésimo"],
  [80, "Octogésimo"],
  [90, "Nonagésimo"],
  // Round numbers
  [100, "Centésimo"],
  [200, "Ducentésimo"],
  [300, "Tricentésimo"],
  [400, "Cuadringentésimo"],
  [500, "Quingentésimo"],
  [600, "Sexcentésimo"],
  [700, "Septingentésimo"],
  [800, "Octingentésimo"],
  [900, "Noningentésimo"],
  [1000, "Milésimo"],
  [1000000, "Un Millonésimo"],
  // Complex numbers
  [101, "Ciento Primero"],
  [110, "Ciento Décimo"],
  [111, "Ciento Decimoprimero"],
  [123, "Ciento Veintitrés"],
  [150, "Ciento Quincuagésimo"],
  [199, "Ciento Noventa Y Noveno"],
  [256, "Doscientos Cincuenta Y Sexto"],
  [1001, "Mil Primero"],
  [1010, "Mil Décimo"],
  [1100, "Mil Centésimo"],
  [1234, "Mil Doscientos Treinta Y Cuarto"],
  [2000, "Dos Milésimo"],
  [10000, "Diez Milésimo"],
  [100000, "Cien Milésimo"],
  [1000001, "Un Millon Primero"],
];

describe("Test Ordinals", () => {
  test.concurrent.each(testOrdinals)("toOrdinal %d => %s", (input, expected) => {
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

  test("should throw error for negative decimal numbers", () => {
    expect(() => toWords.toOrdinal(-3.14)).toThrow("Ordinal numbers must be non-negative integers");
  });
});

// ============================================================
// COMPREHENSIVE TEST ADDITIONS FOR es-ES
// ============================================================

// Extended Integer Tests (1-30 covering Spanish complexities)
const testIntegersExtended: [number, string][] = [
  [1, "Uno"],
  [2, "Dos"],
  [3, "Tres"],
  [4, "Cuatro"],
  [5, "Cinco"],
  [6, "Seis"],
  [7, "Siete"],
  [8, "Ocho"],
  [9, "Nueve"],
  [10, "Diez"],
  [11, "Once"],
  [12, "Doce"],
  [13, "Trece"],
  [14, "Catorce"],
  [15, "Quince"],
  [16, "Dieciséis"],
  [17, "Diecisiete"],
  [18, "Dieciocho"],
  [19, "Diecinueve"],
  [20, "Veinte"],
  [21, "Veintiuno"],
  [22, "Veintidós"],
  [23, "Veintitrés"],
  [24, "Veinticuatro"],
  [25, "Veinticinco"],
  [26, "Veintiséis"],
  [27, "Veintisiete"],
  [28, "Veintiocho"],
  [29, "Veintinueve"],
  [30, "Treinta"],
  [40, "Cuarenta"],
  [50, "Cincuenta"],
  [60, "Sesenta"],
  [70, "Setenta"],
  [80, "Ochenta"],
  [90, "Noventa"],
  [100, "Cien"],
  [101, "Ciento Uno"],
];

describe("Test Extended Integers (1-100)", () => {
  test.concurrent.each(testIntegersExtended)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Powers of Ten (Spanish)
const testPowersOfTen: [number, string][] = [
  [10, "Diez"],
  [100, "Cien"],
  [1000, "Mil"],
  [10000, "Diez Mil"],
  [100000, "Cien Mil"],
  [1000000, "Un Millon"],
  [10000000, "Diez Millones"],
  [100000000, "Cien Millones"],
  [1000000000, "Mil Millones"],
  [10000000000, "Diez Mil Millones"],
  [100000000000, "Cien Mil Millones"],
  [1000000000000, "Un Billon"],
];

describe("Test Powers of Ten (Spanish System)", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Boundary Values
const testBoundaries: [number, string][] = [
  [99, "Noventa Y Nueve"],
  [100, "Cien"],
  [101, "Ciento Uno"],
  [999, "Novecientos Noventa Y Nueve"],
  [1000, "Mil"],
  [1001, "Mil Uno"],
  [9999, "Nueve Mil Novecientos Noventa Y Nueve"],
  [10000, "Diez Mil"],
  [99999, "Noventa Y Nueve Mil Novecientos Noventa Y Nueve"],
  [100000, "Cien Mil"],
  [999999, "Novecientos Noventa Y Nueve Mil Novecientos Noventa Y Nueve"],
  [1000000, "Un Millon"],
  [1000001, "Un Millon Uno"],
];

describe("Test Boundary Values", () => {
  test.concurrent.each(testBoundaries)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative Floats
const testNegativeFloats: [number, string][] = [
  [-0.5, "Menos Cero Punto Cinco"],
  [-0.25, "Menos Cero Punto Veinticinco"],
  [-0.99, "Menos Cero Punto Noventa Y Nueve"],
  [-1.5, "Menos Uno Punto Cinco"],
  [-3.14, "Menos Tres Punto Catorce"],
  [-99.99, "Menos Noventa Y Nueve Punto Noventa Y Nueve"],
  [-100.01, "Menos Cien Punto Cero Uno"],
];

describe("Test Negative Floats", () => {
  test.concurrent.each(testNegativeFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// BigInt Tests
const testBigInts: [bigint, string][] = [
  [0n, "Cero"],
  [1n, "Uno"],
  [100n, "Cien"],
  [1000n, "Mil"],
  [1000000n, "Un Millon"],
  [1000000000n, "Mil Millones"],
  [1000000000000n, "Un Billon"],
];

describe("Test BigInt Values", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Negative BigInt Tests
const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Menos Uno"],
  [-100n, "Menos Cien"],
  [-1000n, "Menos Mil"],
  [-1000000n, "Menos Un Millon"],
  [-1000000000n, "Menos Mil Millones"],
];

describe("Test Negative BigInt Values", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});


// String Input Tests
const testStringInputs: [string, string][] = [
  ["0", "Cero"],
  ["1", "Uno"],
  ["100", "Cien"],
  ["1000", "Mil"],
  ["-100", "Menos Cien"],
  ["3.14", "Tres Punto Catorce"],
  ["-3.14", "Menos Tres Punto Catorce"],
  ["  100  ", "Cien"],
  ["1000000", "Un Millon"],
];

describe("Test String Number Inputs", () => {
  test.concurrent.each(testStringInputs)('convert "%s" => %s', (input, expected) => {
    expect(toWords.convert(input)).toBe(expected);
  });
});

// Zero Variants
describe("Test Zero Variants", () => {
  test("converts 0 correctly", () => {
    expect(toWords.convert(0)).toBe("Cero");
  });

  test("converts -0 as Cero", () => {
    expect(toWords.convert(-0)).toBe("Cero");
  });

  test("converts 0.0 as Cero", () => {
    expect(toWords.convert(0.0)).toBe("Cero");
  });

  test("converts 0n as Cero", () => {
    expect(toWords.convert(0n)).toBe("Cero");
  });

  test('converts "0" as Cero', () => {
    expect(toWords.convert("0")).toBe("Cero");
  });


});


// All Options Combinations


// Invalid Input Tests
describe("Test Invalid Inputs for es-ES", () => {
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
