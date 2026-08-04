// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { createLocaleVariant } from "../createLocaleVariant.js";
import BaseLocale from "./en-US.js";

/**
 * British English differs from American only in the conjunction: a trailing
 * group below one hundred is introduced by "and" whenever a larger group
 * precedes it — "one hundred and one", "one thousand and thirty-four" — while
 * American English omits it. Everything else is shared with en-US.
 */
const Locale = createLocaleVariant(BaseLocale, {
  localeCode: "en-GB",
  join: { hyphenateTensUnits: true, andWord: "And" },
});

export default Locale;
