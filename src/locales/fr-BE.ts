// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./fr-FR.js";

const Locale = createLocaleVariant(BaseLocale, {
  localeCode: "fr-BE",
  numberWordsMapping: [
    { number: 99, value: "Nonante-Neuf" },
    { number: 98, value: "Nonante-Huit" },
    { number: 97, value: "Nonante-Sept" },
    { number: 96, value: "Nonante-Six" },
    { number: 95, value: "Nonante-Cinq" },
    { number: 94, value: "Nonante-Quatre" },
    { number: 93, value: "Nonante-Trois" },
    { number: 92, value: "Nonante-Deux" },
    { number: 91, value: "Nonante-Et-Un" },
    { number: 90, value: "Nonante" },
    { number: 79, value: "Septante-Neuf" },
    { number: 78, value: "Septante-Huit" },
    { number: 77, value: "Septante-Sept" },
    { number: 76, value: "Septante-Six" },
    { number: 75, value: "Septante-Cinq" },
    { number: 74, value: "Septante-Quatre" },
    { number: 73, value: "Septante-Trois" },
    { number: 72, value: "Septante-Deux" },
    { number: 71, value: "Septante-Et-Un" },
    { number: 70, value: "Septante" },
  ],
  ordinalWordsMapping: [
    { number: 90, value: "Nonantième" },
    { number: 70, value: "Septantième" },
  ],
});

export default Locale;
