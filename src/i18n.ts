import { PLAYMAKER_LOCALE_VALUES, type PlaymakerLocale } from "@yamat47/playmaker";

/** The page follows the library's locales, so one switch changes both. */
export type Lang = PlaymakerLocale;

export const LANGS: readonly Lang[] = PLAYMAKER_LOCALE_VALUES;

export function isLang(value: unknown): value is Lang {
  return (LANGS as readonly unknown[]).includes(value);
}

/** A string in every language. Showcase names and summaries use this shape too. */
export type Localized = Readonly<Record<Lang, string>>;

const PAGE = {
  tagline: { en: "Play diagram editor", ja: "プレー図エディタ" },
  switchToView: { en: "Switch to view", ja: "閲覧モードへ" },
  switchToEdit: { en: "Switch to edit", ja: "編集モードへ" },
  exportPng: { en: "Export PNG", ja: "PNG を書き出す" },
  clear: { en: "Clear", ja: "白紙にする" },
  language: { en: "日本語", ja: "English" },
  nowShowing: { en: "Now showing", ja: "表示中" },
  showcase: { en: "Showcase", ja: "見どころ" },
  formations: { en: "Formations", ja: "隊形" },
  plays: { en: "Plays", ja: "プレー" },
  offense: { en: "Offense", ja: "オフェンス" },
  defense: { en: "Defense", ja: "ディフェンス" },
  formation: { en: "Formation", ja: "隊形" },
  formationLoaded: {
    en: "Added players to the current diagram. Offense and defense formations can be layered.",
    ja: "今の図に選手を足しました。攻守の隊形を重ねられます。",
  },
  formationTooMany: {
    en: "{name} was not placed because it would exceed the player limit.",
    ja: "{name} は選手の上限を超えるので置きませんでした。",
  },
  yourDiagram: { en: "Your diagram", ja: "あなたの図" },
  yourDiagramSummary: {
    en: "Restored from this browser. Pick a play on the left to start from a preset.",
    ja: "このブラウザに保存した図です。左の一覧から選ぶとプリセットから始められます。",
  },
  blank: { en: "Blank field", ja: "白紙" },
  blankSummary: {
    en: "Add players with the toolbar, or load a formation from the left.",
    ja: "ツールバーで選手を足すか、左の一覧から隊形を読み込みます。",
  },
  exported: { en: "Exported a PNG ({size} KB).", ja: "PNG を書き出しました（{size} KB）。" },
  exportFailed: { en: "PNG export failed: {reason}", ja: "PNG の書き出しに失敗しました: {reason}" },
  builtWith: { en: "Built with", ja: "このページは" },
  siteSource: { en: "Source of this page", ja: "このページのソース" },
  mobileNotice: {
    en: "This editor is built for a desktop browser with a mouse. Open it on a PC to try it.",
    ja: "このエディタは PC のブラウザとマウス向けです。PC で開いてお試しください。",
  },
} satisfies Record<string, Localized>;

export type PageKey = keyof typeof PAGE;

export function t(lang: Lang, key: PageKey, params: Record<string, string> = {}): string {
  let text: string = PAGE[key][lang];
  for (const [name, value] of Object.entries(params)) {
    text = text.replace(`{${name}}`, value);
  }
  return text;
}

/** Writes the page strings into every element marked with data-i18n. */
export function applyPageStrings(lang: Lang): void {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = el.dataset.i18n;
    if (key !== undefined && key in PAGE) {
      el.textContent = t(lang, key as PageKey);
    }
  }
}
