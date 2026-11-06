import { type PlayData, Playmaker, type PlaymakerMode } from "@yamat47/playmaker";
import "@yamat47/playmaker/styles.css";
import { version as libraryVersion } from "@yamat47/playmaker/package.json";
import { applyPageStrings, isLang, type Lang, t } from "./i18n.js";
import { type RailItem, railSections } from "./presets.js";
import {
  forgetDiagram,
  loadDiagram,
  loadLang,
  loadMode,
  saveDiagram,
  saveLang,
  saveMode,
} from "./storage.js";
import "./styles.css";

function need<T extends HTMLElement>(id: string, type: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof type)) {
    throw new Error(`#${id} is not a ${type.name}`);
  }
  return el;
}

const mountPoint = need("stage", HTMLElement);
const railScroll = need("library-scroll", HTMLElement);
const statusEl = need("status", HTMLElement);
const infoName = need("playinfo-name", HTMLElement);
const infoChip = need("playinfo-chip", HTMLElement);
const infoPers = need("playinfo-pers", HTMLElement);
const infoSummary = need("playinfo-summary", HTMLElement);
const modeButton = need("mode-toggle", HTMLButtonElement);
const langButton = need("lang-toggle", HTMLButtonElement);
need("library-version", HTMLElement).textContent = `v${libraryVersion}`;

// ?lang=ja wins over the remembered choice, so a link can open the page in Japanese.
function initialLang(): Lang {
  const fromQuery = new URLSearchParams(location.search).get("lang");
  if (isLang(fromQuery)) {
    return fromQuery;
  }
  return loadLang() ?? "en";
}

let lang = initialLang();
let mode: PlaymakerMode = loadMode() ?? "edit";

/** What the "Now showing" card describes: a rail item, the visitor's own diagram, or a blank field. */
type Shown = { kind: "item"; id: string } | { kind: "own" } | { kind: "blank" };
let shown: Shown = { kind: "blank" };
let activeButton: HTMLButtonElement | null = null;

const sections = () => railSections(lang);

function itemById(id: string): RailItem {
  const { showcase, formations, plays } = sections();
  const item = [...showcase, ...formations, ...plays].find((candidate) => candidate.id === id);
  if (item === undefined) {
    throw new Error(`no rail item ${id}`);
  }
  return item;
}

function show(next: Shown): void {
  shown = next;
  renderShown();
}

function onChange(data: PlayData): void {
  // An empty field is not kept, so a reload after Clear opens the first showcase play, as on a
  // first visit. A line needs its start player, so no players means an empty field.
  const empty = data.players.length === 0;
  if (empty) {
    forgetDiagram();
  } else {
    saveDiagram(data);
  }
  // onChange does not tell an Undo from an edit, so the card cannot know which pick an Undo
  // returned to. Any change makes the diagram the visitor's own; a pick or Clear names it again
  // right after.
  show(empty ? { kind: "blank" } : { kind: "own" });
}

// The library fixes the locale at construction, so switching the language rebuilds the editor
// with the current diagram. The first instance starts from the remembered diagram, else the
// first showcase play.
function createEditor(initialData: unknown): Playmaker {
  return new Playmaker(mountPoint, { initialData, onChange, mode, locale: lang });
}

const remembered = loadDiagram();
const firstShowcase = sections().showcase[0];
let playmaker = createEditor(
  remembered ?? (firstShowcase?.load.kind === "play" ? firstShowcase.load.data : undefined),
);

function setActive(button: HTMLButtonElement | null): void {
  activeButton?.classList.remove("is-active");
  button?.classList.add("is-active");
  activeButton = button;
}

function renderInfo(): void {
  infoChip.hidden = true;
  switch (shown.kind) {
    case "item": {
      const item = itemById(shown.id);
      infoName.textContent = item.name;
      infoChip.hidden = false;
      infoChip.textContent = item.tag;
      infoChip.style.background = item.tagColor;
      infoPers.textContent = item.personnel;
      infoSummary.textContent = item.summary;
      break;
    }
    case "own":
      infoName.textContent = t(lang, "yourDiagram");
      infoPers.textContent = "";
      infoSummary.textContent = t(lang, "yourDiagramSummary");
      break;
    case "blank":
      infoName.textContent = t(lang, "blank");
      infoPers.textContent = "";
      infoSummary.textContent = t(lang, "blankSummary");
      break;
  }
}

function presetButton(item: RailItem): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "preset";
  button.dataset.presetId = item.id;
  const tagEl = document.createElement("span");
  tagEl.className = "preset__tag";
  tagEl.textContent = item.tag;
  tagEl.style.background = item.tagColor;
  const nameEl = document.createElement("span");
  nameEl.className = "preset__name";
  nameEl.textContent = item.name;
  button.append(tagEl, nameEl);
  button.addEventListener("click", () => select(item));
  return button;
}

function heading(className: string, text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  return el;
}

// A play from the rail replaces the diagram as an edit rather than opening it as a new one, so a
// visitor who picks one by mistake gets their own diagram back with Undo.
function select(item: RailItem): void {
  const { load } = item;
  if (load.kind === "formation") {
    if (!playmaker.loadFormation(load.formation)) {
      statusEl.textContent = t(lang, "formationTooMany", { name: item.name });
      return;
    }
  } else {
    playmaker.replacePlayData(load.data);
  }
  statusEl.textContent = "";
  show({ kind: "item", id: item.id });
}

/** Points the card and the rail highlight at what is showing. */
function renderShown(): void {
  setActive(
    shown.kind === "item"
      ? railScroll.querySelector<HTMLButtonElement>(`[data-preset-id="${shown.id}"]`)
      : null,
  );
  renderInfo();
}

function renderRail(): void {
  const { showcase, formations, plays } = sections();
  railScroll.replaceChildren();
  railScroll.append(heading("group__title", t(lang, "showcase")));
  for (const item of showcase) {
    railScroll.append(presetButton(item));
  }
  railScroll.append(heading("group__title", t(lang, "formations")));
  appendSide(formations);
  railScroll.append(heading("group__title", t(lang, "plays")));
  appendSide(plays);
}

function appendSide(items: readonly RailItem[]): void {
  for (const side of ["offense", "defense"] as const) {
    const matching = items.filter((item) => item.side === side);
    if (matching.length === 0) {
      continue;
    }
    const className = side === "offense" ? "group__sub group__sub--off" : "group__sub";
    railScroll.append(heading(className, t(lang, side)));
    for (const item of matching) {
      railScroll.append(presetButton(item));
    }
  }
}

function renderChrome(): void {
  applyPageStrings(lang);
  modeButton.textContent = t(lang, mode === "edit" ? "switchToView" : "switchToEdit");
  langButton.textContent = t(lang, "language");
  langButton.lang = lang === "en" ? "ja" : "en";
}

// Showcase names and summaries change with the language, so the rail and the card are rebuilt.
function setLang(next: Lang): void {
  lang = next;
  saveLang(next);
  const data = playmaker.getPlayData();
  playmaker.dispose();
  playmaker = createEditor(data);
  renderChrome();
  renderRail();
  renderShown();
}

modeButton.addEventListener("click", () => {
  mode = mode === "edit" ? "view" : "edit";
  saveMode(mode);
  playmaker.setMode(mode);
  renderChrome();
});

langButton.addEventListener("click", () => setLang(lang === "en" ? "ja" : "en"));

need("clear", HTMLButtonElement).addEventListener("click", () => {
  playmaker.replacePlayData({
    version: 2,
    field: { zone: playmaker.fieldZone },
    players: [],
    lines: [],
  });
  statusEl.textContent = "";
  show({ kind: "blank" });
});

async function downloadPng(): Promise<void> {
  const blob = await playmaker.exportToPng();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `playmaker-${Date.now()}.png`;
  a.click();
  // click() downloads asynchronously in some environments, and a synchronous revoke drops the
  // download there, so it is delayed.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  statusEl.textContent = t(lang, "exported", { size: String(Math.round(blob.size / 1024)) });
}

need("export-png", HTMLButtonElement).addEventListener("click", () => {
  downloadPng().catch((error: unknown) => {
    const reason = error instanceof Error ? error.message : String(error);
    statusEl.textContent = t(lang, "exportFailed", { reason });
  });
});

shown =
  remembered !== undefined
    ? { kind: "own" }
    : firstShowcase === undefined
      ? { kind: "blank" }
      : { kind: "item", id: firstShowcase.id };
renderChrome();
renderRail();
renderShown();
