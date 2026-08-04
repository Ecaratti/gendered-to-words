import { describe, expect, test } from "vitest";
import { ToWordsCore, DefaultConverterOptions, DefaultToWordsOptions } from "../src/ToWordsCore";

describe("ToWordsCore - DefaultConverterOptions", () => {
  test("has correct default values", () => {
    expect(DefaultConverterOptions).toEqual({
      ignoreDecimal: false,
      lowercase: false,
    });
  });
});

describe("ToWordsCore - DefaultToWordsOptions", () => {
  test("has correct default values", () => {
    expect(DefaultToWordsOptions).toEqual({
      localeCode: "en-US",
      converterOptions: DefaultConverterOptions,
    });
  });
});

describe("ToWordsCore - Instantiation", () => {
  test("can be instantiated without options", () => {
    const core = new ToWordsCore();
    expect(core).toBeInstanceOf(ToWordsCore);
  });

  test("can be instantiated with options", () => {
    const core = new ToWordsCore({ localeCode: "en-US" });
    expect(core).toBeInstanceOf(ToWordsCore);
  });

  test("merges options with defaults", () => {
    const core = new ToWordsCore({
      converterOptions: { ignoreDecimal: true },
    });
    expect(core).toBeInstanceOf(ToWordsCore);
  });
});

describe("ToWordsCore - setLocale", () => {
  test("throws error when no locale is set", () => {
    const core = new ToWordsCore();
    expect(() => core.getLocaleClass()).toThrow(
      "No locale set. Use setLocale() or import from a locale-specific entry point"
    );
  });

  test("throws error when convert is called without locale", () => {
    const core = new ToWordsCore();
    expect(() => core.convert(123)).toThrow(
      "No locale set. Use setLocale() or import from a locale-specific entry point"
    );
  });

  test("setLocale returns this for chaining", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    const result = core.setLocale(EnUsLocale);
    expect(result).toBe(core);
  });

  test("setLocale allows chained convert call", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    const result = core.setLocale(EnUsLocale).convert(100);
    expect(result).toBe("One Hundred");
  });

  test("getLocaleClass returns set locale class", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);
    expect(core.getLocaleClass()).toBe(EnUsLocale);
  });

  test("getLocale returns locale instance", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);
    const locale = core.getLocale();
    expect(locale).toBeInstanceOf(EnUsLocale);
  });

  test("getLocale returns same instance on multiple calls", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);
    const locale1 = core.getLocale();
    const locale2 = core.getLocale();
    expect(locale1).toBe(locale2);
  });

  test("setLocale resets cached locale instance", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const { default: FrFrLocale } = await import("../src/locales/fr-FR");
    const core = new ToWordsCore();

    core.setLocale(EnUsLocale);
    const enLocale = core.getLocale();

    core.setLocale(FrFrLocale);
    const frLocale = core.getLocale();

    expect(enLocale).not.toBe(frLocale);
    expect(frLocale).toBeInstanceOf(FrFrLocale);
  });
});

describe("ToWordsCore - convert", () => {
  test("converts numbers correctly with en-US locale", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.convert(0)).toBe("Zero");
    expect(core.convert(1)).toBe("One");
    expect(core.convert(100)).toBe("One Hundred");
    expect(core.convert(1234)).toBe("One Thousand Two Hundred Thirty-Four");
  });

  test("converts negative numbers", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.convert(-100)).toBe("Minus One Hundred");
    expect(core.convert(-1)).toBe("Minus One");
  });

  test("converts decimal numbers", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.convert(1.5)).toBe("One Point Five");
    expect(core.convert(3.14)).toBe("Three Point Fourteen");
  });

  test("converts BigInt", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.convert(12345n)).toBe("Twelve Thousand Three Hundred Forty-Five");
    expect(core.convert(0n)).toBe("Zero");
    expect(core.convert(-100n)).toBe("Minus One Hundred");
  });

  test("throws error for invalid input", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(() => core.convert(Number.NaN)).toThrow("Invalid Number");
    expect(() => core.convert("" as unknown as number)).toThrow("Invalid Number");
  });

  test("respects ignoreDecimal option", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.convert(3.75, { ignoreDecimal: true })).toBe("Three");
  });
});

describe("ToWordsCore - toOrdinal", () => {
  test("converts to ordinal correctly", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.toOrdinal(1)).toBe("First");
    expect(core.toOrdinal(2)).toBe("Second");
    expect(core.toOrdinal(3)).toBe("Third");
    expect(core.toOrdinal(10)).toBe("Tenth");
    expect(core.toOrdinal(21)).toBe("Twenty-First");
    expect(core.toOrdinal(100)).toBe("One Hundredth");
  });

  test("throws for negative numbers", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(() => core.toOrdinal(-1)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("throws for non-integers", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(() => core.toOrdinal(1.5)).toThrow("Ordinal numbers must be non-negative integers");
  });

  test("throws for invalid input", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(() => core.toOrdinal(Number.NaN)).toThrow("Invalid Number");
  });
});

describe("ToWordsCore - utility methods", () => {
  test("isFloat detects floats correctly", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.isFloat(1.5)).toBe(true);
    expect(core.isFloat(1)).toBe(false);
    expect(core.isFloat(0)).toBe(false);
    expect(core.isFloat(0.0)).toBe(false);
    expect(core.isFloat("1.5")).toBe(false);
    expect(core.isFloat("1")).toBe(false);
  });

  test("isValidNumber validates correctly", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.isValidNumber(123)).toBe(true);
    expect(core.isValidNumber(0)).toBe(true);
    expect(core.isValidNumber(-50)).toBe(true);
    expect(core.isValidNumber(3.14)).toBe(true);
    expect(core.isValidNumber("123")).toBe(true);
    expect(core.isValidNumber(123n)).toBe(true);
    expect(core.isValidNumber(Number.NaN)).toBe(false);
    expect(core.isValidNumber(Infinity)).toBe(false);
    expect(core.isValidNumber(-Infinity)).toBe(false);
    expect(core.isValidNumber("")).toBe(false);
  });

  test("isNumberZero detects zero correctly", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.isNumberZero(0)).toBe(true);
    expect(core.isNumberZero(0n)).toBe(true);
    expect(core.isNumberZero(0.0)).toBe(true);
    expect(core.isNumberZero(0.5)).toBe(true);
    expect(core.isNumberZero(1)).toBe(false);
    expect(core.isNumberZero(-1)).toBe(false);
  });
});

describe("ToWordsCore - different locales", () => {
  test("works with en-US locale", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.convert(1000000)).toBe("One Million");
    expect(core.convert(1000000000)).toBe("One Billion");
  });

  test("works with fr-FR locale", async () => {
    const { default: FrFrLocale } = await import("../src/locales/fr-FR");
    const core = new ToWordsCore();
    core.setLocale(FrFrLocale);

    expect(core.convert(21)).toBe("Vingt Et Un");
    expect(core.convert(80)).toBe("Quatre-Vingts");
  });

  test("works with de-DE locale", async () => {
    const { default: DeDeLocale } = await import("../src/locales/de-DE");
    const core = new ToWordsCore();
    core.setLocale(DeDeLocale);

    expect(core.convert(21)).toBe("Einundzwanzig");
  });

  test("works with ar-SA locale", async () => {
    const { default: ArSaLocale } = await import("../src/locales/ar-SA");
    const core = new ToWordsCore();
    core.setLocale(ArSaLocale);

    expect(core.convert(1)).toBe("واحد");
    expect(core.convert(2)).toBe("اثنان");
  });

  test("works with zh-CN locale", async () => {
    const { default: ZhCnLocale } = await import("../src/locales/zh-CN");
    const core = new ToWordsCore();
    core.setLocale(ZhCnLocale);

    expect(core.convert(1)).toBe("一");
    expect(core.convert(10)).toBe("十");
  });
});

describe("ToWordsCore - Edge Cases for Coverage", () => {
  test("ordinal throws for locales without ordinal support", async () => {
    const MinimalLocale = class {
      config = {
        texts: { minus: "Minus", point: "Point" },
        numberWordsMapping: [
          { number: 1000, value: "Thousand" },
          { number: 100, value: "Hundred" },
          { number: 10, value: "Ten" },
          { number: 1, value: "One" },
          { number: 0, value: "Zero" },
        ],
      };
    };

    const core = new ToWordsCore();
    core.setLocale(MinimalLocale as never);

    expect(() => core.toOrdinal(1)).toThrow("Ordinal conversion not supported");
  });

  test("ordinal with decade numbers (20, 30, etc) for getLastNumberComponent", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.toOrdinal(20)).toBe("Twentieth");
    expect(core.toOrdinal(30)).toBe("Thirtieth");
    expect(core.toOrdinal(120)).toBe("One Hundred Twentieth");
    expect(core.toOrdinal(1030)).toBe("One Thousand Thirtieth");
  });

  test("ordinal with numbers having atomic words (like 11, 12 in locales)", async () => {
    const { default: HiInLocale } = await import("../src/locales/hi-IN");
    const core = new ToWordsCore();
    core.setLocale(HiInLocale);

    expect(core.toOrdinal(11)).toBeDefined();
    expect(core.toOrdinal(21)).toBeDefined();
  });

  test("handles very large numbers for ordinal", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    expect(core.toOrdinal(1000)).toBe("One Thousandth");
    expect(core.toOrdinal(1000000)).toBe("One Millionth");
  });

  test("locale cache is reused across multiple getLocale calls", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);

    const locale1 = core.getLocale();
    const locale2 = core.getLocale();

    expect(locale1).toBe(locale2);
  });

  test("getLocaleCache initializes cache if not present", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");

    const core1 = new ToWordsCore();
    core1.setLocale(EnUsLocale);
    const result1 = core1.convert(100);

    const core2 = new ToWordsCore();
    core2.setLocale(EnUsLocale);
    const result2 = core2.convert(100);

    expect(result1).toBe(result2);
    expect(result1).toBe("One Hundred");
  });

  test("ordinal with decade in locale without atomic decade words uses decade branch", async () => {
    const MinimalOrdinalLocale = class {
      config = {
        texts: { minus: "Minus", point: "Point" },
        numberWordsMapping: [
          { number: 1000, value: "Thousand" },
          { number: 100, value: "Hundred" },
          { number: 10, value: "Ten" },
          { number: 9, value: "Nine" },
          { number: 8, value: "Eight" },
          { number: 7, value: "Seven" },
          { number: 6, value: "Six" },
          { number: 5, value: "Five" },
          { number: 4, value: "Four" },
          { number: 3, value: "Three" },
          { number: 2, value: "Two" },
          { number: 1, value: "One" },
          { number: 0, value: "Zero" },
        ],
        ordinalSuffix: "th",
      };
    };

    const core = new ToWordsCore();
    core.setLocale(MinimalOrdinalLocale as never);

    const result = core.toOrdinal(120);
    expect(result).toContain("th");
  });

  test("ordinal with ones digit fallback when no decade word exists", async () => {
    const MinimalLocale = class {
      config = {
        texts: { minus: "Minus", point: "Point" },
        numberWordsMapping: [
          { number: 1000, value: "Thousand" },
          { number: 100, value: "Hundred" },
          { number: 10, value: "Ten" },
          { number: 9, value: "Nine" },
          { number: 8, value: "Eight" },
          { number: 7, value: "Seven" },
          { number: 6, value: "Six" },
          { number: 5, value: "Five" },
          { number: 4, value: "Four" },
          { number: 3, value: "Three" },
          { number: 2, value: "Two" },
          { number: 1, value: "One" },
          { number: 0, value: "Zero" },
        ],
        ordinalSuffix: "th",
      };
    };

    const core = new ToWordsCore();
    core.setLocale(MinimalLocale as never);

    const result = core.toOrdinal(121);
    expect(result).toContain("th");
  });
});

// ---------------------------------------------------------------------------
// Internal implementation coverage — protected methods via subclass
// ---------------------------------------------------------------------------

describe("ToWordsCore - internal coverage via subclass", () => {
  class TestableCore extends ToWordsCore {
    callConvertInternal(
      number: bigint,
      trailing: boolean,
      overrides: Record<number, string> | undefined,
      localeInstance: InstanceType<any>
    ): string[] {
      return this.convertInternal(number, trailing, overrides, localeInstance);
    }

    callConvertInternalNoInst(number: bigint, trailing: boolean): string[] {
      return this.convertInternal(number, trailing);
    }

    callGetLastNumberComponent(
      number: number,
      localeConfig: any,
      localeInstance?: InstanceType<any>
    ): number {
      return this.getLastNumberComponent(number, localeConfig, localeInstance);
    }
  }

  test("getLocaleCache initialises cache on first access for a fresh locale instance (lines 180-181)", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new TestableCore();
    const freshLocale = new EnUsLocale();
    const result = core.callConvertInternal(1n, false, undefined, freshLocale);
    expect(result).toEqual(["One"]);
  });

  test("convertInternal falls back to getLocale() when localeInstance is not provided (line 532 ?? branch)", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new TestableCore();
    core.setLocale(EnUsLocale);
    const result = core.callConvertInternalNoInst(1n, false);
    expect(result).toEqual(["One"]);
  });

  test("getLastNumberComponent uses filter+sort fallback when localeInstance is omitted (lines 328-329)", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new TestableCore();
    const locale = new EnUsLocale();
    const result = core.callGetLastNumberComponent(1000, locale.config);
    expect(result).toBe(1000);
  });

  test("convertInternal applies overrides when the number matches (lines 538-540)", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new TestableCore();
    const localeInstance = new EnUsLocale();
    const result = core.callConvertInternal(1n, false, { 1: "Custom One" }, localeInstance);
    expect(result).toEqual(["Custom One"]);
  });

  test("convertInternal skips overrides when number exceeds MAX_SAFE_INTEGER (lines 538-539 ternary branch)", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new TestableCore();
    const localeInstance = new EnUsLocale();
    const bigNum = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
    const result = core.callConvertInternal(bigNum, false, { 1: "Override" }, localeInstance);
    expect(typeof result[0]).toBe("string");
  });

  test("convertInternal skips overrides when number has no matching override entry (line 539 && short-circuit)", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new TestableCore();
    const localeInstance = new EnUsLocale();
    const result = core.callConvertInternal(2n, false, { 1: "Override" }, localeInstance);
    expect(result).toEqual(["Two"]);
  });

  test("toOrdinal accepts BigInt input", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore();
    core.setLocale(EnUsLocale);
    expect(core.toOrdinal(1n as unknown as number)).toBe("First");
    expect(core.toOrdinal(21n as unknown as number)).toBe("Twenty-First");
  });

  test("convert uses false fallback for fields absent from both call options and constructor options (lines 193-196)", async () => {
    const { default: EnUsLocale } = await import("../src/locales/en-US");
    const core = new ToWordsCore({ converterOptions: {} as any });
    core.setLocale(EnUsLocale);
    const result = core.convert(100, { lowercase: false });
    expect(result).toBe("One Hundred");
  });
});
