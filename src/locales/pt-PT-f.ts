// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./pt-PT.js";

/**
 * Portuguese feminine forms. Ordinals swap a final -o for -a
 * ("primeiro"/"primeira", "quadragésimo"/"quadragésima"). Cardinals agree for
 * 1, 2 and the hundreds from 200 up ("uma", "duas", "duzentas") — but only in
 * final position, so "dois milhões" keeps the masculine that "milhão" demands.
 */
const Locale = createLocaleVariant(BaseLocale, {
  localeCode: "pt-PT",
  // Each word of a multi-word ordinal agrees: "décimo primeiro" becomes
  // "décima primeira", not "décimo primeira".
  transformOrdinalWords: (value) => value.replace(/o(?=\s|$)/g, "a"),
  agreementOverrides: [
    { number: 900, value: "Novecentas" },
    { number: 800, value: "Oitocentas" },
    { number: 700, value: "Setecentas" },
    { number: 600, value: "Seiscentas" },
    { number: 500, value: "Quinhentas" },
    { number: 400, value: "Quatrocentas" },
    { number: 300, value: "Trezentas" },
    { number: 200, value: "Duzentas" },
    { number: 2, value: "Duas" },
    { number: 1, value: "Uma" },
  ],
});

export default Locale;
