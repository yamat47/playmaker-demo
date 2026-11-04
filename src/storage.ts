import type { PlaymakerMode } from "@yamat47/playmaker";
import { isLang, type Lang } from "./i18n.js";

// Everything the page remembers lives under one prefix, so it is easy to find in devtools.
const DIAGRAM_KEY = "playmaker-demo:diagram";
const LANG_KEY = "playmaker-demo:lang";
const MODE_KEY = "playmaker-demo:mode";

// Private browsing and strict settings make localStorage throw; the demo works without it.
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Nothing to do: the diagram simply is not remembered.
  }
}

/** The saved diagram as parsed JSON, or undefined. The library checks the shape itself. */
export function loadDiagram(): unknown {
  const raw = read(DIAGRAM_KEY);
  if (raw === null) {
    return undefined;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function saveDiagram(data: unknown): void {
  write(DIAGRAM_KEY, JSON.stringify(data));
}

export function forgetDiagram(): void {
  write(DIAGRAM_KEY, null);
}

export function loadLang(): Lang | undefined {
  const value = read(LANG_KEY);
  return isLang(value) ? value : undefined;
}

export function saveLang(lang: Lang): void {
  write(LANG_KEY, lang);
}

export function loadMode(): PlaymakerMode | undefined {
  const value = read(MODE_KEY);
  return value === "view" || value === "edit" ? value : undefined;
}

export function saveMode(mode: PlaymakerMode): void {
  write(MODE_KEY, mode);
}
