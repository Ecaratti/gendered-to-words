import { describe, expect, test } from "vitest";
import { toWords } from "../src/ToWords";

/**
 * Languages differ in *where* the linking word goes, not just whether they
 * have one. Each set below is written from the language's own rule.
 */

describe("Romanian links tens to units only", () => {
  test.each([
    [20, "Douăzeci"],
    [21, "Douăzeci Și Unu"],
    [25, "Douăzeci Și Cinci"],
    [100, "O Sută"],
    // No conjunction after the hundreds, only inside the final pair.
    [123, "O Sută Douăzeci Și Trei"],
    [456, "Patru Sute Cincizeci Și Șase"],
    [789, "Șapte Sute Optzeci Și Nouă"],
    [1234, "O Mie Două Sute Treizeci Și Patru"],
    [1000000, "Un Milion"],
  ] as [number, string][])("toWords(%d) => %s", (n, expected) => {
    expect(toWords(n, { localeCode: "ro-RO" })).toBe(expected);
  });
});

describe("Albanian links every part", () => {
  test.each([
    [20, "Njëzet"],
    [21, "Njëzet E Një"],
    [100, "Njëqind"],
    [123, "Njëqind E Njëzet E Tre"],
    [456, "Katërqind E Pesëdhjetë E Gjashtë"],
    [1100, "Një Mijë E Njëqind"],
    [1000000, "Një Milion"],
  ] as [number, string][])("toWords(%d) => %s", (n, expected) => {
    expect(toWords(n, { localeCode: "sq-AL" })).toBe(expected);
  });
});

describe("Norwegian links the hundreds but not the larger scales", () => {
  test.each([
    [21, "Tjueen"], // atomic, no conjunction
    [100, "Hundre"],
    [123, "Hundre Og Tjuetre"],
    [789, "Sju Hundre Og Åttini"],
    // "og" after "hundre", none after "tusen".
    [1234, "Tusen To Hundre Og Trettifire"],
    [1000000, "En Million"],
  ] as [number, string][])("toWords(%d) => %s", (n, expected) => {
    expect(toWords(n, { localeCode: "nb-NO" })).toBe(expected);
  });
});

describe("Swahili links every part and names the scale first", () => {
  test.each([
    [11, "Kumi Na Moja"],
    [21, "Ishirini Na Moja"],
    [55, "Hamsini Na Tano"],
    // "mia moja", never "moja mia" — the scale word leads.
    [100, "Mia Moja"],
    [123, "Mia Moja Na Ishirini Na Tatu"],
    [200, "Mia Mbili"],
    [456, "Mia Nne Na Hamsini Na Sita"],
    [999, "Mia Tisa Na Tisini Na Tisa"],
    [1000, "Elfu Moja"],
    [1234, "Elfu Moja Na Mia Mbili Na Thelathini Na Nne"],
  ] as [number, string][])("toWords(%d) => %s", (n, expected) => {
    expect(toWords(n, { localeCode: "sw-TZ" })).toBe(expected);
  });
});

describe("scale nouns pluralise from two up", () => {
  test.each([
    // Swedish scale nouns are common gender: "en miljon", not "ett miljon".
    ["sv-SE", 1000000, "En Miljon"],
    ["sv-SE", 2000000, "Två Miljoner"],
    ["sv-SE", 123000000, "Hundra Tjugotre Miljoner"],
    ["sv-SE", 1000000000, "En Miljard"],
    ["sv-SE", 2000000000, "Två Miljarder"],
    ["el-GR", 1000000, "Ένα Εκατομμύριο"],
    ["el-GR", 2000000, "Δύο Εκατομμύρια"],
    ["el-GR", 123000000, "Εκατό Είκοσι Τρία Εκατομμύρια"],
    ["el-GR", 1000000000, "Ένα Δισεκατομμύριο"],
    ["el-GR", 2000000000, "Δύο Δισεκατομμύρια"],
  ] as [string, number, string][])("%s toWords(%d) => %s", (code, n, expected) => {
    expect(toWords(n, { localeCode: code })).toBe(expected);
  });
});
