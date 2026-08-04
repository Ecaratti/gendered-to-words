# Changelog

## 0.1.0 (2026-08-04)

Initial release, forked from [to-words](https://github.com/mastermunj/to-words) v5.3.0.

- Removed currency conversion, the CLI, and most region-duplicate locales to minimize bundle size
- Added gendered locale variants (French feminine) resolvable via the `gender` option in `toWords()` / `toOrdinal()`
- Added `toOrdinalIndicator()` — digit + ordinal indicator formatting (21st, 1er/1re, 1º/1ª, 1., 1:a, 第1) with gender support, structured parts output, and a typographic `superscript` convention flag; category selection via `Intl.PluralRules`
- Locale data now carries its canonical BCP 47 code (`LocaleConfig.localeCode`) so plural-category selection and lowercasing never depend on the ambient runtime locale
- Kept: cardinal and ordinal conversion, BigInt and string inputs, locale auto-detection, per-locale tree-shakeable entry points
