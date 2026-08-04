import { describe, expect, test } from "vitest";
import { createLocaleVariant } from "../src/createLocaleVariant";
import { ToWordsCore } from "../src/ToWordsCore";
import type { LocaleConfig, LocaleInterface } from "../src/types";

/**
 * A small self-contained base locale, so these exercise the variant machinery
 * itself rather than any real language's quirks.
 */
class BaseLocale implements LocaleInterface {
  public config: LocaleConfig = {
    localeCode: "xx-XX",
    texts: { minus: "Minus", point: "Point" },
    numberWordsMapping: [
      { number: 1000000, value: "Scaleword" },
      { number: 200, value: "Twohundred" },
      { number: 100, value: "Hundred" },
      { number: 2, value: "Two" },
      { number: 1, value: "One" },
      { number: 0, value: "Zero" },
    ],
    exactWordsMapping: [{ number: 1, value: ["One", "Onealone"] }],
    ignoreOneForWords: ["Hundred", "Twohundred"],
    ordinalWordsMapping: [
      { number: 1000000, value: "Scalewordo" },
      { number: 200, value: "Twohundredo" },
      { number: 100, value: "Hundredo" },
      { number: 2, value: "Twoo" },
      { number: 1, value: "Oneo" },
      { number: 0, value: "Zeroo" },
    ],
    ordinalDerivation: { rules: [{ match: /$/, replace: "o" }] },
  };
}

const build = (overrides: Parameters<typeof createLocaleVariant>[1]) =>
  new ToWordsCore().setLocale(createLocaleVariant(BaseLocale, overrides));

describe("transformOrdinalWords", () => {
  test("rewrites every ordinal table entry", () => {
    const tw = build({ transformOrdinalWords: (v) => v.replace(/o$/, "a") });
    expect(tw.toOrdinal(1)).toBe("Onea");
    expect(tw.toOrdinal(2)).toBe("Twoa");
    expect(tw.toOrdinal(100)).toBe("Hundreda");
  });

  test("explicit ordinalWordsMapping overrides win over the transform", () => {
    const tw = build({
      transformOrdinalWords: (v) => v.replace(/o$/, "a"),
      ordinalWordsMapping: [{ number: 1, value: "Irregular" }],
    });
    expect(tw.toOrdinal(1)).toBe("Irregular");
    expect(tw.toOrdinal(2)).toBe("Twoa"); // transform still applies elsewhere
  });
});

describe("transformOrdinalDerivation", () => {
  test("rewrites the derivation rules' replacements", () => {
    const tw = build({
      transformOrdinalWords: (v) => v.replace(/o$/, "a"),
      transformOrdinalDerivation: (r) => r.replace(/o$/, "a"),
    });
    // 101 has no table entry, so it goes through the derivation rule.
    expect(tw.toOrdinal(101)).toBe("Hundred Onea");
  });
});

describe("agreementOverrides", () => {
  test("applies in final position but not in front of a scale noun", () => {
    const tw = build({ agreementOverrides: [{ number: 200, value: "Twohundredfem" }] });
    expect(tw.convert(200), "final position agrees").toBe("Twohundredfem");
    expect(tw.convert(200000000), "multiplier position does not").toBe("Twohundred Scaleword");
  });

  test("pairs with the base value automatically, including an existing tuple", () => {
    const tw = build({ agreementOverrides: [{ number: 1, value: "Onefem" }] });
    // Base had ["One", "Onealone"]; the multiplier form "One" must survive.
    expect(tw.convert(1), "standalone").toBe("Onefem");
    expect(tw.convert(1000000), "multiplier").toBe("One Scaleword");
  });

  test("a number absent from the base is left alone", () => {
    const tw = build({ agreementOverrides: [{ number: 7, value: "Sevenfem" }] });
    expect(tw.convert(2)).toBe("Two");
  });

  test("does not mutate the base locale", () => {
    build({ agreementOverrides: [{ number: 200, value: "Mutated" }] });
    expect(new BaseLocale().config.numberWordsMapping.find((m) => m.number === 200)?.value).toBe(
      "Twohundred"
    );
    expect(new ToWordsCore().setLocale(BaseLocale).convert(200)).toBe("Twohundred");
  });

  test("composes with the ordinal transforms", () => {
    const tw = build({
      agreementOverrides: [{ number: 200, value: "Twohundredfem" }],
      transformOrdinalWords: (v) => v.replace(/o$/, "a"),
    });
    expect(tw.convert(200)).toBe("Twohundredfem");
    expect(tw.toOrdinal(200)).toBe("Twohundreda");
  });
});
