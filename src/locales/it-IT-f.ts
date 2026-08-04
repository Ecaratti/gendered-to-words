// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./it-IT.js";

/**
 * Italian feminine forms. Ordinals are entirely regular — every masculine
 * ordinal ends in -o and its feminine counterpart in -a ("primo"/"prima",
 * "quarantaduesimo"/"quarantaduesima") — so both the table and the derivation
 * suffixes are rewritten by the same rule.
 *
 * Cardinals are almost invariable; only "uno" agrees ("una").
 */
const Locale = createLocaleVariant(BaseLocale, {
  localeCode: "it-IT",
  // Each word of a multi-word ordinal agrees: "décimo primeiro" becomes
  // "décima primeira", not "décimo primeira".
  transformOrdinalWords: (value) => value.replace(/o(?=\s|$)/g, "a"),
  transformOrdinalDerivation: (replacement) => replacement.replace(/o$/, "a"),
  agreementOverrides: [{ number: 1, value: "Una" }],
});

export default Locale;
