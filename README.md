# gendered-to-words

Convert numbers to cardinal ("forty-two") and ordinal ("forty-second") words across 40+ locales, with grammatical gender support, BigInt handling, and zero runtime dependencies.

## Why this fork

This is a fork of [to-words](https://github.com/mastermunj/to-words) by Munjal Dhamecha, rebuilt for a different job: **numbering things** (list items, paragraphs, sections, chapters) **in whatever language the document is written in** — rather than spelling out currency amounts. That meant diverging in ways that didn't fit upstream:

- **Grammatical gender** — "Première partie" vs "Premier chapitre" requires feminine/masculine forms of the same number. Upstream has no gender concept; here it's a first-class option (`gender: 'masculine' | 'feminine' | 'neutral'`) on every API, with locale variants supplying the forms.
- **Ordinal indicators** — the digit forms lists actually use (`21st`, `1er`/`1re`, `1º`/`1ª`, `1.`, `1:a`, `第1`) with structured parts output for styling (e.g. superscripting `1ᵉʳ`). Upstream doesn't cover these.
- **Bundle size** — currency data, the CLI, and ~75 region-duplicate locales were removed, and per-locale entry points are the primary way to consume it (~2 KB core + ~0.5–1 KB per locale, gzipped, vs ~28 KB for everything).

See [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) for attribution.

## Install

```bash
npm install gendered-to-words
```

## Quick start

```ts
import { toWords, toOrdinal, toOrdinalIndicator } from 'gendered-to-words';

toWords(42, { localeCode: 'en-US' });                       // 'Forty Two'
toOrdinal(3, { localeCode: 'it-IT' });                      // 'Terzo'
toWords(21, { localeCode: 'fr-FR', gender: 'feminine' });   // 'Vingt Et Une'
toOrdinal(1, { localeCode: 'fr-FR', gender: 'feminine' });  // 'Première'
toWords(42);                                                // auto-detects locale (navigator.language / Intl)

toOrdinalIndicator(21, { localeCode: 'en-US' }).text;       // '21st'
toOrdinalIndicator(1, { localeCode: 'fr-FR', gender: 'feminine' });
// { text: '1re', prefix: '', number: '1', suffix: 're', superscript: true }
toOrdinalIndicator(3, { localeCode: 'zh-CN' }).text;        // '第3'
```

### Class API

For high-volume use, create an instance once:

```ts
import { ToWords } from 'gendered-to-words';

const tw = new ToWords({ localeCode: 'de-DE' });
tw.convert(21);      // 'Einundzwanzig'
tw.toOrdinal(21);    // 'Einundzwanzigste'
```

### Tree-shaken per-locale imports

**Anything imported from the main entry pulls in all locales (~28 KB gzipped)** — `toWords`/`toOrdinal` reference the full locale map, and no bundler setting can shake it. If bundle size matters, import only from `gendered-to-words/core` and per-locale subpaths (~2 KB core + ~0.5–1 KB gzipped per locale), and get types from `gendered-to-words/types`:

```ts
import { ToWordsCore } from 'gendered-to-words/core';
import EnUs from 'gendered-to-words/en-US';

const tw = new ToWordsCore().setLocale(EnUs);
tw.convert(42);                    // 'Forty Two'
tw.toOrdinal(42);                  // 'Forty Second'
tw.toOrdinalIndicator(42).text;    // '42nd'
```

In an app supporting several languages, keep a registry of just the locales you ship — static imports bundle only what's listed; dynamic `import()` additionally code-splits each locale into a lazy chunk:

```ts
const REGISTRY = {
  'en-US':   () => import('gendered-to-words/en-US'),
  'fr-FR':   () => import('gendered-to-words/fr-FR'),
  'fr-FR-f': () => import('gendered-to-words/fr-FR-f'), // feminine variant
};
```

## API

### `toWords(number, options?)`

Converts a number to cardinal words. `number` can be a `number`, `bigint`, or numeric `string`.

| Option          | Type                                        | Default    | Description                                    |
| --------------- | ------------------------------------------- | ---------- | ---------------------------------------------- |
| `localeCode`    | `string`                                    | auto-detect| BCP 47 locale (falls back smartly, see below)  |
| `gender`        | `'masculine' \| 'feminine' \| 'neutral'`    | masculine  | Grammatical gender, where the locale has forms |
| `ignoreDecimal` | `boolean`                                   | `false`    | Truncate the fractional part                   |
| `lowercase`     | `boolean`                                   | `false`    | Lowercase the result                           |

### `toOrdinal(number, options?)`

Converts a non-negative integer to ordinal words. Accepts `localeCode` and `gender`.

### `toOrdinalIndicator(number, options?)`

Formats a non-negative integer as digits plus the locale's ordinal indicator: `21st`, `1er`/`1re`, `1º`/`1ª`, `1.`, `1:a`, `第1`. Accepts `localeCode` and `gender`. Returns structured parts so renderers can style the indicator independently:

```ts
{ text: '1re', prefix: '', number: '1', suffix: 're', superscript: true }
```

- `superscript: true` means the locale's typographic convention renders the suffix raised (French `1ᵉʳ`); the stored suffix is always plain text — raising it is the renderer's choice. Locales whose indicator is a precomposed glyph (`º`/`ª`) are *not* flagged.
- Category selection (why 21 → `21st` but 12 → `12th`) uses `Intl.PluralRules` with the locale's canonical code — never the runtime's ambient locale.
- Unlike `toOrdinal()`, this **never throws for missing locale data**: bare digits are always valid output, so locales without indicator conventions (e.g. `ar-SA`, `he-IL`) return plain digits. `toOrdinal()` throws instead because spelled-out words have no acceptable fallback.

### Locale resolution

`localeCode` is resolved in order: exact match (`fr-FR`) → script tag stripped (`zh-Hant-TW` → `zh-TW`) → language-prefix fallback (`en-GB` → `en-US`, `fr` → `fr-FR`). When omitted, the environment locale is detected via `navigator.language`, then `Intl`. Override detection with `setLocaleDetector(() => 'fr-FR')`.

### Other exports

- `ToWords` — class with all locales bundled
- `ToWordsCore` (from `gendered-to-words/core`) — locale-free core for tree-shaking
- `detectLocale(fallback?)` / `setLocaleDetector(fn)` — environment locale detection
- `LOCALES` — map of all bundled locale classes

## Supported locales

ar-SA, bg-BG, ca-ES, cs-CZ, da-DK, de-DE, el-GR, en-US, es-ES, fi-FI, fr-BE, fr-FR, he-IL, hi-IN, hr-HR, hu-HU, is-IS, it-IT, ja-JP, ko-KR, lt-LT, lv-LV, nb-NO, nl-NL, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sk-SK, sl-SI, sq-AL, sr-RS, sv-SE, sw-TZ, tr-TR, uk-UA, zh-CN, zh-TW

### Gender semantics

- Spelled-out feminine variants currently exist for French (`fr-FR`, `fr-BE`); ordinal indicators are gendered for fr, es, it, pt, ca, el, ru. Query `GENDER_VARIANTS` to know which locales have spelled-out variants.
- `gender` works everywhere in the API: functional helpers, the class constructor (`new ToWords({ localeCode, converterOptions: { gender } })`), and per-call (`tw.convert(n, { gender })`).
- Unsupported combinations **fall back silently to the base (masculine) form** — never an error. `neutral` is accepted for forward compatibility but no locale implements it yet.

## Development

```bash
npm ci
npm test            # vitest
npm run checktypes  # tsc --noEmit
npm run lint        # oxlint
npm run build       # ESM + CJS + types into dist/
```

## License

[MIT](./LICENSE). Based on [to-words](https://github.com/mastermunj/to-words) (MIT, © 2017 Munjal Dhamecha) — see [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md).
