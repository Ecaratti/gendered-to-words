import { describe, expect, test } from "vitest";
import { toOrdinal, toWords } from "../src/ToWords";

describe("English hyphenates compound tens", () => {
  test.each([
    [21, "Twenty-One"],
    [42, "Forty-Two"],
    [99, "Ninety-Nine"],
    [100, "One Hundred"], // no units word follows
    [110, "One Hundred Ten"], // tens word is last
    [121, "One Hundred Twenty-One"],
    [1000, "One Thousand"],
    [21000, "Twenty-One Thousand"],
    [63892, "Sixty-Three Thousand Eight Hundred Ninety-Two"],
  ] as [number, string][])("toWords(%d) => %s", (n, expected) => {
    expect(toWords(n, { localeCode: "en-US" })).toBe(expected);
  });

  test("hyphenation applies to ordinals too", () => {
    expect(toOrdinal(42, { localeCode: "en-US" })).toBe("Forty-Second");
    expect(toOrdinal(121, { localeCode: "en-US" })).toBe("One Hundred Twenty-First");
  });

  test("hyphenation applies inside the fractional part", () => {
    expect(toWords(37.68, { localeCode: "en-US" })).toBe("Thirty-Seven Point Sixty-Eight");
  });
});

describe("en-GB inserts 'and' before a trailing sub-hundred group", () => {
  test.each([
    [101, "One Hundred And One"],
    [1001, "One Thousand And One"],
    [1234, "One Thousand Two Hundred And Thirty-Four"],
    [63892, "Sixty-Three Thousand Eight Hundred And Ninety-Two"],
  ] as [number, string][])("toWords(%d) => %s", (n, expected) => {
    expect(toWords(n, { localeCode: "en-GB" })).toBe(expected);
  });

  test.each([
    [21, "Twenty-One"], // nothing larger precedes
    [100, "One Hundred"], // no trailing group
    [1100, "One Thousand One Hundred"], // trailing group is itself a hundred
    [1000000, "One Million"],
  ] as [number, string][])("toWords(%d) => %s (no 'and')", (n, expected) => {
    expect(toWords(n, { localeCode: "en-GB" })).toBe(expected);
  });

  test("applies to ordinals", () => {
    expect(toOrdinal(101, { localeCode: "en-GB" })).toBe("One Hundred And First");
  });

  test("applies to the integer part only, and after the sign", () => {
    expect(toWords(101.5, { localeCode: "en-GB" })).toBe("One Hundred And One Point Five");
    expect(toWords(-21, { localeCode: "en-GB" })).toBe("Minus Twenty-One");
    expect(toWords(-101, { localeCode: "en-GB" })).toBe("Minus One Hundred And One");
  });

  test("en-US is unaffected", () => {
    expect(toWords(101, { localeCode: "en-US" })).toBe("One Hundred One");
  });

  test("the bare language code 'en' still resolves to en-US", () => {
    expect(toWords(101, { localeCode: "en" })).toBe("One Hundred One");
  });
});

describe("concatenating locales write the numeral as one word", () => {
  test.each([
    ["de-DE", 100, "Einhundert"],
    ["de-DE", 101, "Einhunderteins"],
    ["de-DE", 200, "Zweihundert"],
    ["de-DE", 1000, "Eintausend"],
    ["de-DE", 4680, "Viertausendsechshundertachtzig"],
    ["nl-NL", 101, "Honderdeen"],
    ["nl-NL", 137, "Honderdzevenendertig"],
    ["it-IT", 101, "Centouno"],
    ["it-IT", 200, "Duecento"],
    ["it-IT", 1001, "Milleuno"],
    ["it-IT", 2000, "Duemila"],
  ] as [string, number, string][])("%s toWords(%d) => %s", (code, n, expected) => {
    expect(toWords(n, { localeCode: code })).toBe(expected);
  });

  test("scale nouns from a million up stay separate and keep their plural", () => {
    expect(toWords(1000000, { localeCode: "de-DE" })).toBe("Eine Million");
    expect(toWords(2000000, { localeCode: "de-DE" })).toBe("Zwei Millionen");
    expect(toWords(2741034, { localeCode: "de-DE" })).toBe(
      "Zwei Millionen Siebenhunderteinundvierzigtausendvierunddreißig"
    );
    // Previously the dual plural form swallowed the multiplier entirely.
    expect(toWords(2000000, { localeCode: "it-IT" })).toBe("Due Milioni");
  });

  test("Italian elides the linking vowel before otto/ottanta", () => {
    expect(toWords(108, { localeCode: "it-IT" })).toBe("Centotto");
    expect(toWords(4680, { localeCode: "it-IT" })).toBe("Quattromilaseicentottanta");
  });

  test("the decimal point and sign are separate written words", () => {
    expect(toWords(0.04, { localeCode: "de-DE" })).toBe("Null Komma Null Vier");
    expect(toWords(0.973, { localeCode: "de-DE" })).toBe("Null Komma Neunhundertdreiundsiebzig");
    expect(toWords(-101, { localeCode: "de-DE" })).toBe("Minus Einhunderteins");
    expect(toWords(37.68, { localeCode: "it-IT" })).toBe("Trentasette Virgola Sessantotto");
  });
});

describe("solid-numeral locales added in 0.2.0", () => {
  test.each([
    // Chinese numerals never contain spaces, and take 一 before 百/千.
    ["zh-CN", 11, "十一"],
    ["zh-CN", 21, "二十一"],
    ["zh-CN", 100, "一百"],
    ["zh-CN", 123, "一百二十三"],
    ["zh-CN", 456, "四百五十六"],
    ["zh-CN", 1000, "一千"],
    ["zh-TW", 123, "一百二十三"],
    // Japanese shares the spacing rule but omits 一 before 百/千.
    ["ja-JP", 11, "十一"],
    ["ja-JP", 100, "百"],
    ["ja-JP", 123, "百二十三"],
    // Finnish writes the whole numeral as one word.
    ["fi-FI", 21, "Kaksikymmentäyksi"],
    ["fi-FI", 123, "Satakaksikymmentäkolme"],
    ["fi-FI", 456, "Neljäsataaviisikymmentäkuusi"],
    ["fi-FI", 1234, "Tuhatkaksisataakolmekymmentäneljä"],
    // Hungarian likewise, below two thousand.
    ["hu-HU", 21, "Huszonegy"],
    ["hu-HU", 123, "Százhuszonhárom"],
    ["hu-HU", 456, "Négyszázötvenhat"],
    ["hu-HU", 1234, "Ezerkétszázharmincnégy"],
  ] as [string, number, string][])("%s toWords(%d) => %s", (code, n, expected) => {
    expect(toWords(n, { localeCode: code })).toBe(expected);
  });

  test("a numeral above one takes the Finnish partitive", () => {
    expect(toWords(2000, { localeCode: "fi-FI" })).toBe("Kaksituhatta");
    expect(toWords(2000000, { localeCode: "fi-FI" })).toBe("Kaksi Miljoonaa");
  });

  test("Hungarian uses két before a noun and kettő standing alone", () => {
    expect(toWords(2, { localeCode: "hu-HU" })).toBe("Kettő");
    expect(toWords(2000, { localeCode: "hu-HU" })).toBe("Kétezer");
    expect(toWords(2000000, { localeCode: "hu-HU" })).toBe("Kétmillió");
  });

  test("the sign word still stands apart from the numeral", () => {
    expect(toWords(-123, { localeCode: "fi-FI" })).toBe("Miinus Satakaksikymmentäkolme");
    expect(toWords(-123, { localeCode: "hu-HU" })).toBe("Mínusz Százhuszonhárom");
  });
});
