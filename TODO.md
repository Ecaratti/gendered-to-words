# Known issues / deferred work

Locale-data defects found during the 0.2.0 correctness pass but **not** fixed. All of them
predate 0.2.0 unless noted. The CHANGELOG's "Known limitations" and "Known pre-existing
issues" sections list the same items; this file is the working version, with enough detail
to pick any of them up cold.

## How these were prioritised

The library's job is **numbering things** — list items, paragraphs, sections, chapters —
so the range that matters in practice is roughly **1–200**, occasionally into the
thousands. Items were ranked by how much they break _in that range_, not by how wrong the
bug is in the abstract.

That reordering matters. Slavic paucal selection is a genuine bug in seven languages, but
it cannot fire below 1000, so it is worth less than a missing space rule that breaks 180
of the first 200 values. Everything ranked "high" by that measure has already been fixed
in 0.2.0; what remains is below the line.

A quick way to re-measure after any change:

```js
const { toWords } = require("./dist/cjs/ToWords.js");
let wrong = 0;
for (let n = 1; n <= 200; n++) if (toWords(n, { localeCode: "xx-XX" }).includes(" ")) wrong++;
```

(Spaces are only a defect in locales that write numerals solid — ru/pl legitimately use
them. Check the language before reading the count as breakage.)

---

## 1. CJK myriad scales above 9,999

**Locales:** zh-CN, zh-TW, ja-JP · **Range affected:** ≥ 10,000 · **Effort:** medium

`numberWordsMapping` carries redundant entries (十万, 百万, 千万, 十亿 …) alongside the
myriad units, so large values decompose against the wrong scale:

```
123456789 → 一亿二千万三百万四十万五万六千七百八十九
want        一亿二千三百四十五万六千七百八十九
```

**ko-KR is already correct** and is the model for the fix: it keeps only the myriad units
(만, 억) and lets the converter compose the multiplier. The likely fix is to drop the
composite scale entries from zh/ja and let 万/億 do the work, then check that the ordinal
prefix path and the 0–9,999 range (now correct) do not regress.

Everything below 10,000 was fixed in 0.2.0 — do not re-fix the spacing or the 一.

## 2. Slavic paucal selection

**Locales:** ru-RU, uk-UA, pl-PL, cs-CZ, sk-SK, sl-SI, lt-LT · **Range:** ≥ 1000 ·
**Effort:** high

`convertInternal` picks the plural form from `quotient % 100`, gated on
`lastTwoDigits >= 3 && lastTwoDigits <= 10`. That misses quotients whose _last digit_
should decide:

```
ru 123000000 → Сто Двадцать Три Миллионов
want            Сто Двадцать Три Миллиона   (last digit 3 → paucal)
```

The CLDR rule for Russian is: last two digits 11–14 → genitive plural; else last digit 1 →
nominative singular; last digit 2–4 → genitive singular (paucal); otherwise genitive
plural. **Each of the seven languages has its own variant of this** — Polish, Czech and
Slovenian in particular do not match Russian. Doing this properly means either encoding
per-language rules in `pluralForms`, or delegating to `Intl.PluralRules` with
`type: "cardinal"` and mapping the returned category onto the existing dual/paucal/plural
slots. The second is probably the right answer and would replace the hand-rolled logic.

Also spotted while investigating, unverified: ru 2000 renders `Два Тысячи`, but
`тысяча` is feminine and wants `Две`.

## 3. Hebrew

**Locale:** he-IL · **Range:** ≥ 101 · **Effort:** low for the first half, unknown for
the second

Two separate problems:

- **Redundant multiplier.** 100 and 200 are correct (`מאה`, `מאתיים`) but 123 gives
  `אחת מאה ו עשרים ו שלוש`. This is the same shape as the Dutch `Een Honderd` bug fixed in
  0.2.0 — an `ignoreOneForWords` entry for the hundreds. Mechanically safe.
- **Detached conjunction.** The output separates `ו` as its own word (`עשרים ו אחת`).
  Hebrew normally prefixes it to the following word (`ועשרים`). Whether that holds in every
  position, and whether the hundreds should be `מאות` rather than `מאה` when multiplied,
  **needs a Hebrew reader** — do not guess.

## 4. Hungarian hyphen above two thousand

**Locale:** hu-HU · **Range:** ≥ 2000 · **Effort:** low · **Introduced in 0.2.0**

Hungarian writes numerals solid up to 2000 and hyphenates at the scale boundary above it
(`kétezer-háromszáznegyvenöt`). 0.2.0 added concatenation, which is correct below 2000 but
writes `Kétezerháromszáznegyvenöt` above it. Needs a conditional separator in
`ConcatenationConfig` — something like a threshold above which scale boundaries take a
hyphen.

## 5. Swahili scale word order above 999

**Locale:** sw-TZ · **Range:** ≥ 2000 · **Effort:** medium · **Partially addressed in
0.2.0**

Swahili names the scale word _before_ its multiplier (`elfu mbili`, not `mbili elfu`). The
converter always emits multiplier-then-scale, so 0.2.0 worked around it with atomic
entries for the hundreds and `singularValue` for 1000–1999. That covers 0–1999; `2000`
still reads `Mbili Elfu`.

Atomic entries will **not** work for the thousands: adding 2000–9000 would make the binary
search resolve 10,000 against 9000. A real fix needs the converter to support
scale-before-multiplier ordering as a locale flag.

## 6. Cross-cutting: idiom in ordinals above ~1000

**Locales:** es, pt, is, ar · **Effort:** medium, needs native review

The `components` ordinal strategy inflects every additive component, which is right in the
practical range but reads awkwardly once a scale multiplier is involved:

```
es 2741034th → Dos Millonésimo Setecientos Cuarenta Y Un Milésimo Trigésimo Cuarto
is 456th     → Fjórir Hundraðasti Og Fimmtugasti Og Sjötti
ar 456th     → السادس و الخمسون و أربعة المائة
```

Arabic in particular wants `بعد المائة` ("after the hundred") rather than a bare
juxtaposition. Spelling out ordinals this large is rare, so this is low priority, but
**Arabic and Icelandic compound ordinals deserve a native-speaker review** even in the
range that is currently exercised.

---

## Testing notes for whoever picks these up

- `__tests__/invariants.test.ts` runs a property sweep over every locale. It has already
  caught one silent regression (adding Swahili hundreds broke its ordinals). **Run the full
  suite after any locale-data change** — the distinctness invariants are the cheap tripwire.
- Per-locale expectation tables are large and were regenerated mechanically during 0.2.0.
  If you change locale data, regenerate the affected table and **read the diff** rather
  than trusting it; that review is what caught two real bugs during 0.2.0.
- Hand-written tests that encode a language's _rule_ rather than its output live in
  `conjunctions.test.ts`, `join-rules.test.ts`, `gender.test.ts` and
  `ordinal-derivation.test.ts`. Prefer adding there.
