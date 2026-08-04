// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./pt-PT.js";

const Locale = createLocaleVariant(BaseLocale, {
  localeCode: "pt-BR",
  numberWordsMapping: [
    { number: 1000000000000000, value: "Quadrilhões" },
    { number: 1000000000, value: "Bilhões" },
    { number: 19, value: "Dezenove" },
    { number: 17, value: "Dezesete" },
    { number: 16, value: "Dezesseis" },
    { number: 14, value: "Quatorze" },
  ],
  exactWordsMapping: [
    { number: 1000000000000000, value: "Um Quadrilhão" },
    { number: 1000000000, value: "Um Bilhão" },
  ],
  noSplitWordAfter: ["Mil", "Milhões", "Mil Milhões", "Trilhões", "Quatrilhões"],
  ordinalWordsMapping: [{ number: 1000000000, value: "Milésimo Milionésimo" }],
});

export default Locale;
