import type {
  FieldPosition,
  Line,
  LineInterpolation,
  LineKind,
  PlayDataInput,
  Player,
  PlayerFill,
  PlayerShape,
} from "@yamat47/playmaker";
import type { Localized } from "./i18n.js";

/**
 * Plays drawn for this site, denser than the library presets: motion, play action, curved routes,
 * blocks, and the defense's reaction in one diagram. They are the first thing a visitor sees.
 */
export interface ShowcasePlay {
  readonly id: string;
  readonly name: Localized;
  readonly personnel: string;
  readonly summary: Localized;
  readonly data: PlayDataInput;
}

// The library's default swatch colors, so the panel shows these lines as a chosen color.
const RED = "#d32f2f";
const BLUE = "#1976d2";
const GREEN = "#388e3c";

const pt = (lateralYard: number, downfieldYard: number): FieldPosition => ({
  lateralYard,
  downfieldYard,
});

interface PlayerStyle {
  readonly shape?: PlayerShape;
  readonly fill?: PlayerFill;
}

function player(
  id: string,
  label: string,
  position: FieldPosition,
  { shape = "circle", fill }: PlayerStyle = {},
): Player {
  return fill === undefined ? { id, label, position, shape } : { id, label, position, shape, fill };
}

/** Offensive linemen are squares; the defense is drawn solid so the two sides read at a glance. */
const lineman = (id: string, label: string, position: FieldPosition): Player =>
  player(id, label, position, { shape: "square" });
const defender = (id: string, label: string, position: FieldPosition): Player =>
  player(id, label, position, { fill: "solid" });

function line(
  id: string,
  kind: LineKind,
  startPlayerId: string,
  waypoints: readonly FieldPosition[],
  end: FieldPosition,
  interpolation: LineInterpolation,
  color?: string,
): Line {
  const base = { id, kind, startPlayerId, waypoints, end, interpolation };
  return color === undefined ? base : { ...base, color };
}

const route = (
  id: string,
  start: string,
  waypoints: readonly FieldPosition[],
  end: FieldPosition,
  interpolation: LineInterpolation = "bezier",
): Line => line(id, "route", start, waypoints, end, interpolation, BLUE);
const block = (
  id: string,
  start: string,
  end: FieldPosition,
  waypoints: FieldPosition[] = [],
): Line => line(id, "block", start, waypoints, end, waypoints.length === 0 ? "straight" : "bezier");
const motion = (id: string, start: string, waypoints: FieldPosition[], end: FieldPosition): Line =>
  line(id, "motion", start, waypoints, end, "bezier", RED);
const reaction = (
  id: string,
  start: string,
  waypoints: FieldPosition[],
  end: FieldPosition,
  interpolation: LineInterpolation = "bezier",
): Line => line(id, "route", start, waypoints, end, interpolation, GREEN);

// The middle zone shows 15 yards on each side of the LOS, so every position stays within ±15
// (the library snaps loaded positions to the grid but does not clamp them to the window).
function play(players: Player[], lines: Line[]): PlayDataInput {
  return { version: 2, field: { zone: "middle" }, players, lines };
}

// The offensive line sits 1 yard behind the LOS and the defensive line 1.5 yards in front of it,
// as in the library presets, so a showcase and a preset look the same on the field.
const offensiveLine = (): Player[] => [
  lineman("lt", "LT", pt(21.5, -1)),
  lineman("lg", "LG", pt(24, -1)),
  lineman("c", "C", pt(26.5, -1)),
  lineman("rg", "RG", pt(29, -1)),
  lineman("rt", "RT", pt(31.5, -1)),
];

const front4 = (): Player[] => [
  defender("e-l", "E", pt(20, 1.5)),
  defender("n", "N", pt(25, 1.5)),
  defender("t", "T", pt(30, 1.5)),
  defender("e-r", "E", pt(36, 1.5)),
];

const JET_MOTION_MESH: ShowcasePlay = {
  id: "showcase-jet-mesh",
  name: { en: "Jet Motion Mesh", ja: "ジェットモーション・メッシュ" },
  personnel: "11 pers · Shotgun",
  summary: {
    en: "The slot sprints across on jet motion and the QB fakes the hand-off. Behind it, X and Y cross at two yards (the mesh), Z runs the corner, and the RB swings to the flat. The defense is in Cover 1: the nickel chases the motion, and the free safety holds the middle.",
    ja: "スロットがジェットモーションで横切り、QB がハンドオフをフェイク。その裏で X と Y が 2 ヤード地点で交差（メッシュ）し、Z はコーナー、RB はフラットへスウィング。守備はカバー 1 で、ニッケルがモーションを追い、FS が中央を守る。",
  },
  data: play(
    [
      ...offensiveLine(),
      lineman("y", "Y", pt(34.5, -1)),
      player("qb", "QB", pt(26.5, -5)),
      player("rb", "RB", pt(29.5, -5)),
      player("x", "X", pt(6, -1)),
      player("h", "H", pt(14, -2)),
      player("z", "Z", pt(47, -1)),
      ...front4(),
      defender("w", "W", pt(21.5, 4.5)),
      defender("m", "M", pt(27.5, 4.5)),
      defender("nb", "NB", pt(14, 4.5)),
      defender("cb-l", "CB", pt(6, 7)),
      defender("cb-r", "CB", pt(47, 7)),
      defender("ss", "SS", pt(36, 9)),
      defender("fs", "FS", pt(26.5, 13)),
    ],
    [
      motion("mo-h", "h", [pt(22, -4), pt(31, -4.5)], pt(40, -3)),
      route("rt-x", "x", [pt(15, 1.5)], pt(36, 4)),
      route("rt-y", "y", [pt(29, 2.5)], pt(15, 4.5)),
      route("rt-z", "z", [pt(47, 8)], pt(51.5, 13.5)),
      route("rt-rb", "rb", [pt(37, -3.5), pt(45, 0)], pt(49, 6)),
      block("bl-lt", "lt", pt(20.5, 0.5)),
      block("bl-lg", "lg", pt(25, 0.5)),
      block("bl-c", "c", pt(27.5, 3.5), [pt(26.5, 1.5)]),
      block("bl-rg", "rg", pt(30, 0.5)),
      block("bl-rt", "rt", pt(35.5, 0.5)),
      reaction("rx-nb", "nb", [pt(24, 5), pt(33, 4.5)], pt(41, 2.5)),
      reaction("rx-cbl", "cb-l", [], pt(11, 3), "straight"),
      reaction("rx-cbr", "cb-r", [], pt(49, 11), "straight"),
      reaction("rx-ss", "ss", [], pt(31, 4.5), "straight"),
      reaction("rx-m", "m", [], pt(33, 1), "straight"),
      reaction("rx-w", "w", [], pt(25.5, 3), "straight"),
    ],
  ),
};

const COUNTER_ORBIT: ShowcasePlay = {
  id: "showcase-counter-orbit",
  name: { en: "GT Counter with Orbit Motion", ja: "GT カウンター + オービット" },
  personnel: "21 pers · I-formation",
  summary: {
    en: "Z orbits behind the backfield as a toss fake to the strong side. The play goes the other way: LT and LG block down, the backside guard pulls to kick out the end, the backside tackle wraps for the Mike, and the fullback fakes strong. The RB presses the fake, then cuts behind the pullers.",
    ja: "Z がバックフィールドの後ろをオービットしてストロング側へのトスをフェイク。プレーは逆サイドへ。LT と LG がダウンブロック、バックサイドのガードがプルしてエンドをキックアウト、タックルがラップして M を捕まえ、FB はストロング側へフェイク。RB はフェイクに合わせてから、プラーの後ろへ切り込む。",
  },
  data: play(
    [
      ...offensiveLine(),
      lineman("y", "Y", pt(34.5, -1)),
      player("qb", "QB", pt(26.5, -3)),
      player("fb", "FB", pt(26.5, -5.5)),
      player("rb", "RB", pt(26.5, -8)),
      player("x", "X", pt(6, -1)),
      player("z", "Z", pt(47, -2)),
      ...front4(),
      defender("w", "W", pt(21.5, 4.5)),
      defender("m", "M", pt(27, 4.5)),
      defender("s", "S", pt(33.5, 4.5)),
      defender("cb-l", "CB", pt(6, 7)),
      defender("cb-r", "CB", pt(47, 7)),
      defender("ss", "SS", pt(36, 9)),
      defender("fs", "FS", pt(26.5, 13)),
    ],
    [
      motion("mo-z", "z", [pt(40, -6), pt(31, -9.5)], pt(18, -7)),
      route("run-rb", "rb", [pt(24.5, -6), pt(22, -2.5)], pt(20.5, 5)),
      route("fake-fb", "fb", [], pt(31, -2), "straight"),
      block("bl-lt", "lt", pt(21.5, 3.5), [pt(21, 1)]),
      block("bl-lg", "lg", pt(25, 0.5)),
      block("bl-c", "c", pt(29.5, 0.5)),
      block("bl-rg", "rg", pt(19, 1), [pt(26, -3), pt(21.5, -2.5)]),
      block("bl-rt", "rt", pt(26, 4), [pt(27.5, -3.5), pt(23, -2), pt(23.5, 1.5)]),
      block("bl-y", "y", pt(35.5, 0.5)),
      reaction("rx-m", "m", [pt(25, 4)], pt(23.5, 2.5)),
      reaction("rx-w", "w", [], pt(19.5, 2.5), "straight"),
      reaction("rx-s", "s", [], pt(31, 3), "straight"),
      reaction("rx-ss", "ss", [], pt(34, 4), "straight"),
      reaction("rx-fs", "fs", [], pt(23, 8), "straight"),
    ],
  ),
};

const VERTS_VS_COVER3: ShowcasePlay = {
  id: "showcase-verts-cover3",
  name: { en: "Four Verticals vs. Cover 3 Match", ja: "4 バーツ vs カバー 3" },
  personnel: "11 pers · Trips right",
  summary: {
    en: "Both sides drawn on one field. From trips, the outside receivers run the sidelines, the #3 bends across to the far hash, and the #2 climbs the near seam; the RB checks and swings weak. Cover 3 answers with three deep thirds and four underneath, the Sam carrying #3 up the seam.",
    ja: "攻守を 1 枚に描いた図。トリップスから外のレシーバーはサイドライン沿いに、#3 は逆のハッシュへ曲がり、#2 は手前のシームを登る。RB はチェックしてウィークへスウィング。カバー 3 はディープ 3 人とアンダー 4 人で応じ、S が #3 をシーム上まで運ぶ。",
  },
  data: play(
    [
      ...offensiveLine(),
      lineman("y", "Y", pt(34.5, -1)),
      player("qb", "QB", pt(26.5, -5)),
      player("rb", "RB", pt(23.5, -5)),
      player("x", "X", pt(6, -1)),
      player("h", "H", pt(40, -2)),
      player("z", "Z", pt(47, -1)),
      ...front4(),
      defender("w", "W", pt(21.5, 4.5)),
      defender("m", "M", pt(27, 4.5)),
      defender("s", "S", pt(34, 4.5)),
      defender("nb", "NB", pt(41, 5)),
      defender("cb-l", "CB", pt(6, 7)),
      defender("cb-r", "CB", pt(47, 7)),
      defender("fs", "FS", pt(26.5, 13)),
    ],
    [
      route("rt-x", "x", [], pt(6, 14.5), "straight"),
      route("rt-z", "z", [], pt(47, 14.5), "straight"),
      route("rt-y", "y", [pt(31, 5)], pt(22, 14.5)),
      route("rt-h", "h", [pt(38, 7)], pt(35.5, 14.5)),
      route("rt-rb", "rb", [pt(16, -3)], pt(11, 2)),
      block("bl-lt", "lt", pt(20.5, 0.5)),
      block("bl-lg", "lg", pt(25, 0.5)),
      block("bl-c", "c", pt(27, 2), [pt(26.5, 0.5)]),
      block("bl-rg", "rg", pt(30, 0.5)),
      block("bl-rt", "rt", pt(35.5, 0.5)),
      reaction("rx-cbl", "cb-l", [pt(8, 11)], pt(10, 14)),
      reaction("rx-fs", "fs", [], pt(26.5, 14.5), "straight"),
      reaction("rx-cbr", "cb-r", [pt(45, 11)], pt(43, 14)),
      reaction("rx-nb", "nb", [pt(45, 6.5)], pt(49, 9)),
      reaction("rx-s", "s", [pt(34, 9)], pt(32, 14)),
      reaction("rx-m", "m", [], pt(26, 9), "straight"),
      reaction("rx-w", "w", [pt(18, 6)], pt(14, 7)),
    ],
  ),
};

export const SHOWCASE_PLAYS: readonly ShowcasePlay[] = [
  JET_MOTION_MESH,
  COUNTER_ORBIT,
  VERTS_VS_COVER3,
];
