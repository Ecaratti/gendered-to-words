import { describe, expect, test } from "vitest";
import enGb from "../src/locales/en-GB.js";
import enUs from "../src/locales/en-US.js";
import { ToWords, toOrdinal, toOrdinalIndicator, toWords } from "../src/ToWords";

const localeCode = "en-GB";
const tw = new ToWords({ localeCode });

describe("Test Locale", () => {
  test(`Locale Class: ${localeCode}`, () => {
    expect(tw.getLocaleClass()).toBe(enGb);
  });

  test("en-GB is its own locale, no longer folded into en-US", () => {
    expect(enGb).not.toBe(enUs);
    expect(new ToWords({ localeCode: "en-US" }).getLocaleClass()).toBe(enUs);
  });

  test("the bare language code 'en' still resolves to en-US", () => {
    expect(new ToWords({ localeCode: "en" }).getLocaleClass()).toBe(enUs);
  });
});

const testIntegers: [number, string][] = [
  [0, "Zero"],
  [1, "One"],
  [15, "Fifteen"],
  [21, "Twenty-One"],
  [99, "Ninety-Nine"],
  [100, "One Hundred"],
  [101, "One Hundred And One"],
  [110, "One Hundred And Ten"],
  [121, "One Hundred And Twenty-One"],
  [200, "Two Hundred"],
  [999, "Nine Hundred And Ninety-Nine"],
  [1000, "One Thousand"],
  [1001, "One Thousand And One"],
  [1100, "One Thousand One Hundred"],
  [1234, "One Thousand Two Hundred And Thirty-Four"],
  [63892, "Sixty-Three Thousand Eight Hundred And Ninety-Two"],
  [1000000, "One Million"],
  [1000001, "One Million And One"],
  // "And" belongs in every group that has a hundreds part, not just the last.
  [2741034, "Two Million Seven Hundred And Forty-One Thousand And Thirty-Four"],
  [
    123456789,
    "One Hundred And Twenty-Three Million Four Hundred And Fifty-Six Thousand Seven Hundred And Eighty-Nine",
  ],
  [120000, "One Hundred And Twenty Thousand"],
  [1000001, "One Million And One"],
];

describe("Test Integers", () => {
  test.each(testIntegers)("convert %d => %s", (input, expected) => {
    expect(tw.convert(input)).toBe(expected);
  });
});

describe("Test Negatives and Floats", () => {
  test.each([
    [-21, "Minus Twenty-One"],
    [-101, "Minus One Hundred And One"],
    [101.5, "One Hundred And One Point Five"],
    [0.63, "Zero Point Sixty-Three"],
    [37.68, "Thirty-Seven Point Sixty-Eight"],
  ] as [number, string][])("convert %d => %s", (input, expected) => {
    expect(tw.convert(input)).toBe(expected);
  });
});

const testOrdinals: [number, string][] = [
  [1, "First"],
  [21, "Twenty-First"],
  [42, "Forty-Second"],
  [100, "One Hundredth"],
  [101, "One Hundred And First"],
  [1000, "One Thousandth"],
  [1001, "One Thousand And First"],
];

describe("Test Ordinals", () => {
  test.each(testOrdinals)("toOrdinal %d => %s", (input, expected) => {
    expect(tw.toOrdinal(input)).toBe(expected);
  });
});

describe("Shared with en-US", () => {
  test("ordinal indicators are identical", () => {
    for (const n of [1, 2, 3, 4, 11, 21, 101]) {
      expect(toOrdinalIndicator(n, { localeCode: "en-GB" }).text).toBe(
        toOrdinalIndicator(n, { localeCode: "en-US" }).text
      );
    }
  });

  test("only the conjunction differs", () => {
    // Strip "And" from en-GB and the two dialects must agree exactly.
    for (let n = 0; n <= 2000; n++) {
      const gb = toWords(n, { localeCode: "en-GB" }).replace(/ And /g, " ");
      expect(gb, `n=${n}`).toBe(toWords(n, { localeCode: "en-US" }));
      const gbOrdinal = toOrdinal(n, { localeCode: "en-GB" }).replace(/ And /g, " ");
      expect(gbOrdinal, `ordinal n=${n}`).toBe(toOrdinal(n, { localeCode: "en-US" }));
    }
  });

  test("lowercase and BigInt behave the same", () => {
    expect(tw.convert(101, { lowercase: true })).toBe("one hundred and one");
    expect(tw.convert(101n)).toBe("One Hundred And One");
  });
});
