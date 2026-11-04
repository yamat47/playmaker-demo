import {
  FORMATION_PRESETS,
  type Formation,
  PLAY_PRESETS,
  type PlayCategory,
  type PlayDataInput,
  type PlayPreset,
  type TeamSide,
} from "@yamat47/playmaker";
import { type Lang, t } from "./i18n.js";
import { SHOWCASE_PLAYS, type ShowcasePlay } from "./showcase.js";

/**
 * One row of the left rail. The library presets and the showcase plays are adapted into this shape
 * here, and nothing else on the page reads the library's preset arrays. When the library stops
 * shipping presets, the data moves into this repository and only this file changes.
 */
export interface RailItem {
  readonly id: string;
  readonly name: string;
  readonly tag: string;
  readonly tagColor: string;
  readonly personnel: string;
  readonly summary: string;
  readonly side: TeamSide;
  readonly load:
    | { readonly kind: "play"; readonly data: PlayDataInput }
    | {
        readonly kind: "formation";
        readonly formation: Formation;
      };
}

const CATEGORY_TAG: Record<PlayCategory, { label: string; color: string }> = {
  "run-zone": { label: "RUN", color: "var(--cat-run)" },
  "run-gap": { label: "RUN", color: "var(--cat-run)" },
  "pass-quick": { label: "PASS", color: "var(--cat-pass)" },
  "pass-dropback": { label: "PASS", color: "var(--cat-pass)" },
  "pass-deep": { label: "PASS", color: "var(--cat-pass)" },
  pa: { label: "PA", color: "var(--cat-pass)" },
  rpo: { label: "RPO", color: "var(--cat-rpo)" },
  coverage: { label: "COV", color: "var(--cat-cov)" },
  pressure: { label: "PRES", color: "var(--cat-pres)" },
};

function fromShowcase(play: ShowcasePlay, lang: Lang): RailItem {
  return {
    id: play.id,
    name: play.name[lang],
    tag: "PLAY",
    tagColor: "var(--cat-showcase)",
    personnel: play.personnel,
    summary: play.summary[lang],
    side: "offense",
    load: { kind: "play", data: play.data },
  };
}

function fromPlayPreset(preset: PlayPreset): RailItem {
  const tag = CATEGORY_TAG[preset.category];
  return {
    id: preset.id,
    name: preset.name,
    tag: tag.label,
    tagColor: tag.color,
    personnel: preset.personnel,
    summary: preset.summary,
    side: preset.side,
    load: { kind: "play", data: preset.data },
  };
}

function fromFormation(formation: Formation, lang: Lang): RailItem {
  const offense = formation.side === "offense";
  return {
    id: formation.id,
    name: formation.name,
    tag: offense ? "OFF" : "DEF",
    tagColor: offense ? "var(--off)" : "var(--def)",
    personnel: t(lang, "formation"),
    summary: t(lang, "formationLoaded"),
    side: formation.side,
    load: { kind: "formation", formation },
  };
}

export interface RailSections {
  readonly showcase: readonly RailItem[];
  readonly formations: readonly RailItem[];
  readonly plays: readonly RailItem[];
}

export function railSections(lang: Lang): RailSections {
  return {
    showcase: SHOWCASE_PLAYS.map((play) => fromShowcase(play, lang)),
    formations: FORMATION_PRESETS.map((formation) => fromFormation(formation, lang)),
    plays: PLAY_PRESETS.map(fromPlayPreset),
  };
}
