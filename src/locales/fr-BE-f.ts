// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./fr-BE.js";

const Locale = createLocaleVariant(BaseLocale, {
  agreementOverrides: [
    { number: 91, value: "Nonante Et Une" },
    { number: 81, value: "Quatre-Vingt-Une" },
    { number: 71, value: "Septante Et Une" },
    { number: 61, value: "Soixante Et Une" },
    { number: 51, value: "Cinquante Et Une" },
    { number: 41, value: "Quarante Et Une" },
    { number: 31, value: "Trente Et Une" },
    { number: 21, value: "Vingt Et Une" },
    { number: 1, value: "Une" },
  ],
  // "Unième" is invariable, so only the standalone form is gendered.
  ordinalExactWordsMapping: [{ number: 1, value: "Première" }],
});

export default Locale;
