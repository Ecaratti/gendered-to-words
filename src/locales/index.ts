// this file is adapted from https://github.com/mastermunj/to-words/ -- see THIRD_PARTY_LICENSES.md for license
import { type ConstructorOf, type LocaleInterface } from "../types.js";

import arSa from "./ar-SA.js";
import bgBg from "./bg-BG.js";
import caEs from "./ca-ES.js";
import caEsF from "./ca-ES-f.js";
import csCz from "./cs-CZ.js";
import daDk from "./da-DK.js";
import deDe from "./de-DE.js";
import elGr from "./el-GR.js";
import enGb from "./en-GB.js";
import enUs from "./en-US.js";
import esEs from "./es-ES.js";
import esEsF from "./es-ES-f.js";
import fiFi from "./fi-FI.js";
import frBe from "./fr-BE.js";
import frBeF from "./fr-BE-f.js";
import frFrF from "./fr-FR-f.js";
import frFr from "./fr-FR.js";
import heIl from "./he-IL.js";
import hiIn from "./hi-IN.js";
import hrHr from "./hr-HR.js";
import huHu from "./hu-HU.js";
import isIs from "./is-IS.js";
import itIt from "./it-IT.js";
import itItF from "./it-IT-f.js";
import jaJp from "./ja-JP.js";
import koKr from "./ko-KR.js";
import ltLt from "./lt-LT.js";
import lvLv from "./lv-LV.js";
import nbNo from "./nb-NO.js";
import nlNl from "./nl-NL.js";
import plPl from "./pl-PL.js";
import ptBR from "./pt-BR.js";
import ptBRF from "./pt-BR-f.js";
import ptPT from "./pt-PT.js";
import ptPTF from "./pt-PT-f.js";
import roRo from "./ro-RO.js";
import ruRu from "./ru-RU.js";
import skSk from "./sk-SK.js";
import slSi from "./sl-SI.js";
import sqAl from "./sq-AL.js";
import srRs from "./sr-RS.js";
import svSe from "./sv-SE.js";
import swTz from "./sw-TZ.js";
import trTr from "./tr-TR.js";
import ukUa from "./uk-UA.js";
import zhCn from "./zh-CN.js";
import zhTw from "./zh-TW.js";

const LOCALES: { [key: string]: ConstructorOf<LocaleInterface> } = {
  "ar-SA": arSa,
  "bg-BG": bgBg,
  "ca-ES": caEs,
  "cs-CZ": csCz,
  "da-DK": daDk,
  "de-DE": deDe,
  "el-GR": elGr,
  // Where a language has several regions, the one meant to answer the bare
  // language code is listed FIRST — the prefix fallback takes the first match,
  // so alphabetical order would otherwise pick the wrong default (it made "fr"
  // resolve to Belgian French, which uses the minority septante/nonante forms).
  "en-US": enUs,
  "en-GB": enGb,
  "es-ES": esEs,
  "fi-FI": fiFi,
  "fr-FR": frFr,
  "fr-BE": frBe,
  "he-IL": heIl,
  "hi-IN": hiIn,
  "hr-HR": hrHr,
  "hu-HU": huHu,
  "is-IS": isIs,
  "it-IT": itIt,
  "ja-JP": jaJp,
  "ko-KR": koKr,
  "lt-LT": ltLt,
  "lv-LV": lvLv,
  "nb-NO": nbNo,
  "nl-NL": nlNl,
  "pl-PL": plPl,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "ro-RO": roRo,
  "ru-RU": ruRu,
  "sk-SK": skSk,
  "sl-SI": slSi,
  "sq-AL": sqAl,
  "sr-RS": srRs,
  "sv-SE": svSe,
  "sw-TZ": swTz,
  "tr-TR": trTr,
  "uk-UA": ukUa,
  "zh-CN": zhCn,
  "zh-TW": zhTw,
};

export default LOCALES;

export const GENDER_VARIANTS: Record<string, Record<string, ConstructorOf<LocaleInterface>>> = {
  fr: { feminine: frFrF },
  "fr-BE": { feminine: frBeF },
  it: { feminine: itItF },
  es: { feminine: esEsF },
  ca: { feminine: caEsF },
  pt: { feminine: ptPTF },
  "pt-BR": { feminine: ptBRF },
};
