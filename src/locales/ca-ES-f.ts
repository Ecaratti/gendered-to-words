// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./ca-ES.js";

/**
 * Catalan feminine forms. The productive ordinal ending -è becomes -ena
 * ("cinquè"/"cinquena", "quaranta-dosè"/"quaranta-dosena") and the Latinate
 * -èsim becomes -èsima; the first four ordinals are irregular and are listed
 * explicitly.
 *
 * Cardinals agree for 1 and 2 ("una", "dues") and for the hundreds.
 */
const Locale = createLocaleVariant(BaseLocale, {
  localeCode: "ca-ES",
  transformOrdinalWords: (value) => value.replace(/è$/, "ena").replace(/m$/, "ma"),
  // Spelled out in full rather than transformed from the base, because the
  // feminine cardinal "dues" still takes the masculine ordinal stem:
  // "quaranta-dues" but "quaranta-dosena".
  ordinalDerivation: {
    scope: "whole",
    rules: [
      { match: /Dues$/, replace: "Dosena" },
      { match: /Una$/, replace: "Unena" },
      { match: /Cinc$/, replace: "Cinquena" },
      { match: /Nou$/, replace: "Novena" },
      { match: /Deu$/, replace: "Desena" },
      { match: /e$/, replace: "ena" },
      { match: /$/, replace: "ena" },
    ],
  },
  ordinalWordsMapping: [
    { number: 4, value: "Quarta" },
    { number: 3, value: "Tercera" },
    { number: 2, value: "Segona" },
    { number: 1, value: "Primera" },
  ],
  agreementOverrides: [
    { number: 900, value: "Nou-Centes" },
    { number: 800, value: "Vuit-Centes" },
    { number: 700, value: "Set-Centes" },
    { number: 600, value: "Sis-Centes" },
    { number: 500, value: "Cinc-Centes" },
    { number: 400, value: "Quatre-Centes" },
    { number: 300, value: "Tres-Centes" },
    { number: 200, value: "Dues-Centes" },
    { number: 22, value: "Vint-I-Dues" },
    { number: 21, value: "Vint-I-Una" },
    { number: 2, value: "Dues" },
    { number: 1, value: "Una" },
  ],
});

export default Locale;
