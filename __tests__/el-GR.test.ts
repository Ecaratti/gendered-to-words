import { describe, expect, test } from "vitest";
import { cloneDeep } from "lodash";
import { ToWords } from "../src/ToWords";
import elGr from "../src/locales/el-GR.js";

const localeCode = "el-GR";
const toWords = new ToWords({
  localeCode,
});

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(toWords.getLocaleClass()).toBe(elGr);
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
  [0, "Μηδέν"],
  [1, "Ένα"],
  [2, "Δύο"],
  [3, "Τρία"],
  [4, "Τέσσερα"],
  [5, "Πέντε"],
  [6, "Έξι"],
  [7, "Επτά"],
  [8, "Οκτώ"],
  [9, "Εννέα"],
  [10, "Δέκα"],
  [11, "Έντεκα"],
  [12, "Δώδεκα"],
  [13, "Δεκατρία"],
  [14, "Δεκατέσσερα"],
  [15, "Δεκαπέντε"],
  [16, "Δεκαέξι"],
  [17, "Δεκαεπτά"],
  [18, "Δεκαοκτώ"],
  [19, "Δεκαεννέα"],
  [20, "Είκοσι"],
  [21, "Είκοσι Ένα"],
  [22, "Είκοσι Δύο"],
  [25, "Είκοσι Πέντε"],
  [30, "Τριάντα"],
  [40, "Σαράντα"],
  [50, "Πενήντα"],
  [60, "Εξήντα"],
  [70, "Εβδομήντα"],
  [80, "Ογδόντα"],
  [90, "Ενενήντα"],
  [99, "Ενενήντα Εννέα"],
  [100, "Εκατό"],
  [101, "Εκατό Ένα"],
  [110, "Εκατό Δέκα"],
  [137, "Εκατό Τριάντα Επτά"],
  [700, "Επτακόσια"],
  [1100, "Χίλια Εκατό"],
  [4680, "Τέσσερα Χιλιάδες Εξακόσια Ογδόντα"],
  [63892, "Εξήντα Τρία Χιλιάδες Οκτακόσια Ενενήντα Δύο"],
  [86100, "Ογδόντα Έξι Χιλιάδες Εκατό"],
  [792581, "Επτακόσια Ενενήντα Δύο Χιλιάδες Πεντακόσια Ογδόντα Ένα"],
  [2741034, "Δύο Εκατομμύρια Επτακόσια Σαράντα Ένα Χιλιάδες Τριάντα Τέσσερα"],
  [86429753, "Ογδόντα Έξι Εκατομμύρια Τετρακόσια Είκοσι Εννέα Χιλιάδες Επτακόσια Πενήντα Τρία"],
  [
    975310864,
    "Εννιακόσια Εβδομήντα Πέντε Εκατομμύρια Τριακόσια Δέκα Χιλιάδες Οκτακόσια Εξήντα Τέσσερα",
  ],
  [
    9876543210,
    "Εννέα Δισεκατομμύρια Οκτακόσια Εβδομήντα Έξι Εκατομμύρια Πεντακόσια Σαράντα Τρία Χιλιάδες Διακόσια Δέκα",
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
    row[1] = `Μείον ${row[1]}`;
  });

  test.concurrent.each(testNegativeIntegers)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testFloats: [number, string][] = [
  [0.0, "Μηδέν"],
  [0.04, "Μηδέν Κόμμα Μηδέν Τέσσερα"],
  [0.4, "Μηδέν Κόμμα Τέσσερα"],
  [0.63, "Μηδέν Κόμμα Εξήντα Τρία"],
  [0.973, "Μηδέν Κόμμα Εννιακόσια Εβδομήντα Τρία"],
  [37.06, "Τριάντα Επτά Κόμμα Μηδέν Έξι"],
  [37.68, "Τριάντα Επτά Κόμμα Εξήντα Οκτώ"],
];

describe("Test Floats with options = {}", () => {
  test.concurrent.each(testFloats)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

// Ordinal Tests
const testOrdinalNumbers: [number, string][] = [
  [1, "Πρώτο"],
  [2, "Δεύτερο"],
  [3, "Τρίτο"],
  [4, "Τέταρτο"],
  [5, "Πέμπτο"],
  [6, "Έκτο"],
  [7, "Έβδομο"],
  [8, "Όγδοο"],
  [9, "Ένατο"],
  [10, "Δέκατο"],
  [11, "Ενδέκατο"],
  [12, "Δωδέκατο"],
  [13, "Δέκατο Τρίτο"],
  [14, "Δέκατο Τέταρτο"],
  [15, "Δέκατο Πέμπτο"],
  [16, "Δέκατο Έκτο"],
  [17, "Δέκατο Έβδομο"],
  [18, "Δέκατο Όγδοο"],
  [19, "Δέκατο Ένατο"],
  [20, "Εικοστό"],
  [21, "Είκοσι Πρώτο"],
  [22, "Είκοσι Δεύτερο"],
  [25, "Είκοσι Πέμπτο"],
  [30, "Τριακοστό"],
  [50, "Πεντηκοστό"],
  [100, "Εκατοστό"],
  [1000, "Χιλιοστό"],
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

  test("should throw error for decimal numbers", () => {
    expect(() => toWords.toOrdinal(1.5)).toThrow("Ordinal numbers must be non-negative integers");
  });
});

const testPowersOfTen: [number, string][] = [
  [10, "Δέκα"],
  [100, "Εκατό"],
  [1000, "Χίλια"],
  [10000, "Δέκα Χιλιάδες"],
  [100000, "Εκατό Χιλιάδες"],
  [1000000, "Ένα Εκατομμύριο"],
];

describe("Test Powers of Ten", () => {
  test.concurrent.each(testPowersOfTen)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as number)).toBe(expected);
  });
});

const testBigInts: [bigint, string][] = [
  [0n, "Μηδέν"],
  [1n, "Ένα"],
  [100n, "Εκατό"],
  [1000n, "Χίλια"],
];

describe("Test BigInt", () => {
  test.concurrent.each(testBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

const testNegativeBigInts: [bigint, string][] = [
  [-1n, "Μείον Ένα"],
  [-100n, "Μείον Εκατό"],
  [-1000n, "Μείον Χίλια"],
];

describe("Test Negative BigInt", () => {
  test.concurrent.each(testNegativeBigInts)("convert %d => %s", (input, expected) => {
    expect(toWords.convert(input as bigint)).toBe(expected);
  });
});

const testStringInputs: [string, string][] = [
  ["0", "Μηδέν"],
  ["1", "Ένα"],
  ["100", "Εκατό"],
  ["-100", "Μείον Εκατό"],
];

describe("Test String Input", () => {
  test.concurrent.each(testStringInputs)("convert %s => %s", (input, expected) => {
    expect(toWords.convert(input as string)).toBe(expected);
  });
});

describe("Test Zero Variants", () => {
  test("convert 0 => Μηδέν", () => {
    expect(toWords.convert(0)).toBe("Μηδέν");
  });

  test("convert -0 => Μηδέν", () => {
    expect(toWords.convert(-0)).toBe("Μηδέν");
  });

  test("convert 0.0 => Μηδέν", () => {
    expect(toWords.convert(0.0)).toBe("Μηδέν");
  });

  test("convert 0n => Μηδέν", () => {
    expect(toWords.convert(0n)).toBe("Μηδέν");
  });

  test('convert "0" => Μηδέν', () => {
    expect(toWords.convert("0")).toBe("Μηδέν");
  });
});

describe("Test Invalid Input", () => {
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
