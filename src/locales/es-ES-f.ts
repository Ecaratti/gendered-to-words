// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./es-ES.js";

/**
 * Spanish feminine forms. Ordinals swap a final -o for -a throughout
 * ("primero"/"primera", "cuadragésimo"/"cuadragésima").
 *
 * Unlike Italian, Spanish also agrees in the cardinals: "una", "veintiuna",
 * and the hundreds from 200 up ("doscientas"). All of them are agreement
 * overrides, so they apply to "doscientas páginas" but not to "doscientos
 * millones", where the numeral agrees with the masculine noun "millones".
 */
const Locale = createLocaleVariant(BaseLocale, {
  localeCode: "es-ES",
  // Each word of a multi-word ordinal agrees: "décimo primeiro" becomes
  // "décima primeira", not "décimo primeira".
  transformOrdinalWords: (value) => value.replace(/o(?=\s|$)/g, "a"),
  agreementOverrides: [
    { number: 900, value: "Novecientas" },
    { number: 800, value: "Ochocientas" },
    { number: 700, value: "Setecientas" },
    { number: 600, value: "Seiscientas" },
    { number: 500, value: "Quinientas" },
    { number: 400, value: "Cuatrocientas" },
    { number: 300, value: "Trescientas" },
    { number: 200, value: "Doscientas" },
    { number: 21, value: "Veintiuna" },
    { number: 1, value: "Una" },
  ],
});

export default Locale;
