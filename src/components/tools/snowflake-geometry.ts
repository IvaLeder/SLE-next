/**
 * Geometry for the paper-snowflake designer (SnowflakeMaker.tsx). Pure maths,
 * no React, so it can be exercised from a plain node script.
 *
 * A six-armed paper snowflake is cut from a wedge that is one twelfth of the
 * finished shape: 30° wide, 12 layers thick. Everything here is described on
 * that one wedge, with its point (the centre of the snowflake) at the origin:
 *
 *   - the "spine" edge runs along +x. Unfolded, it is the middle of an arm.
 *   - the "valley" edge runs at 30°. Unfolded, it is the gap between two arms.
 *   - the paper is 1 unit long.
 *
 * Both edges are folds, so both are mirror lines. A design is the piece of the
 * wedge that is kept (everything inside the tip cut) minus the holes. The
 * on-screen snowflake and the cutting guide are two drawings of that same
 * data, which is why they can never disagree.
 */

export type Pt = readonly [number, number];

export type TipId = "star" | "petal" | "fork" | "fir" | "branches" | "hexagon";
export type ArmId = "none" | "diamonds" | "dots" | "heart" | "window";
export type GapId = "none" | "diamonds" | "dots" | "slit";
export type CentreId = "none" | "star" | "hexagon" | "circle";

export interface Design {
  tip: TipId;
  arm: ArmId;
  gap: GapId;
  centre: CentreId;
}

export const TIP_IDS: readonly TipId[] = ["star", "petal", "fork", "fir", "branches", "hexagon"];
export const ARM_IDS: readonly ArmId[] = ["none", "diamonds", "dots", "heart", "window"];
export const GAP_IDS: readonly GapId[] = ["none", "diamonds", "dots", "slit"];
export const CENTRE_IDS: readonly CentreId[] = ["none", "star", "hexagon", "circle"];

const RAD = Math.PI / 180;
export const WEDGE_DEG = 30;
const TAN30 = Math.tan(30 * RAD);

/** A point `r` along the ray at `deg` degrees. */
export function polar(r: number, deg: number): Pt {
  return [r * Math.cos(deg * RAD), r * Math.sin(deg * RAD)];
}

export function rotate(p: Pt, deg: number): Pt {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}

const mirrorX = (p: Pt): Pt => [p[0], -p[1]];

/* ------------------------------------------------------------------ */
/* The tip cut                                                         */
/* ------------------------------------------------------------------ */

interface Slot {
  /** distance from the centre, along the edge */
  at: number;
  /** size multiplier for the shape cut there */
  size: number;
}

interface TipSpec {
  /** The cut across the top of the wedge, from the spine edge to the valley edge. */
  cut: Pt[];
  /** Where decorations may sit on the spine edge (the middle of the arm). */
  arm: Slot[];
  /** Where decorations may sit on the valley edge (between two arms). */
  gap: Slot[];
  /** Where a slit between the arms starts. */
  slitFrom: number;
  /** Where the step number for this cut goes, when the middle of the cut is a poor spot. */
  label?: Pt;
}

/** Part of a circle centred on the spine edge, as a run of points. */
function arcOnSpine(cx: number, radius: number, fromDeg: number, toDeg: number, step = 8): Pt[] {
  const pts: Pt[] = [];
  for (let a = fromDeg; a < toDeg; a += step) {
    pts.push([cx + radius * Math.cos(a * RAD), radius * Math.sin(a * RAD)]);
  }
  pts.push([cx + radius * Math.cos(toDeg * RAD), radius * Math.sin(toDeg * RAD)]);
  return pts;
}

/* The long-branches shape: a thin arm with three side branches at 60°. */
const ARM_HALF = 0.05; // half the width of the arm (the fold doubles it)
const BRANCH_WIDTH = 0.055;
const SIN60 = Math.sin(60 * RAD);

/**
 * One side branch, walked from its outer foot, round its end, back to its
 * inner foot. `from` is where the inner foot stands on the arm. The end is cut
 * parallel to the arm. A branch must stop short of the valley fold, or it would
 * fuse with its mirror image from the next arm: len < from - ARM_HALF * √3.
 */
function branch(from: number, len: number): Pt[] {
  const foot = BRANCH_WIDTH / SIN60;
  const dx = len * 0.5;
  const dy = len * SIN60;
  return [
    [from + foot, ARM_HALF],
    [from + foot + dx, ARM_HALF + dy],
    [from + dx, ARM_HALF + dy],
    [from, ARM_HALF],
  ];
}

const TIPS: Record<TipId, TipSpec> = {
  // One straight, slanted snip: six sharp points.
  star: {
    cut: [[1, 0], polar(0.44, 30)],
    arm: [{ at: 0.33, size: 0.75 }, { at: 0.58, size: 1 }],
    gap: [{ at: 0.27, size: 0.8 }],
    slitFrom: 0.2,
  },
  // A rounded snip: six round petals.
  petal: {
    cut: [...arcOnSpine(0.72, 0.28, 0, 112), polar(0.46, 30)],
    arm: [{ at: 0.33, size: 0.75 }, { at: 0.72, size: 1.45 }],
    gap: [{ at: 0.28, size: 0.8 }],
    slitFrom: 0.2,
  },
  // A V snipped into the point: every arm ends in two prongs.
  fork: {
    cut: [[0.8, 0], polar(1, 8.5), polar(0.44, 30)],
    arm: [{ at: 0.33, size: 0.75 }, { at: 0.56, size: 1 }],
    gap: [{ at: 0.27, size: 0.8 }],
    slitFrom: 0.2,
  },
  // A zigzag: arms with side branches, like a fern or a real snow crystal.
  fir: {
    cut: [
      [1, 0],
      [0.88, 0.05],
      [0.9, 0.13],
      [0.72, 0.07],
      [0.76, 0.22],
      [0.56, 0.1],
      [0.6, 0.3],
      polar(0.45, 30),
    ],
    arm: [{ at: 0.3, size: 0.7 }, { at: 0.46, size: 0.8 }],
    gap: [{ at: 0.27, size: 0.8 }],
    slitFrom: 0.2,
  },
  // A thin arm with three side branches, like a snow crystal drawn with lines.
  // Nearly everything between the arms is cut away, so the arms only join in
  // a small star at the centre and there is nothing left to decorate between them.
  branches: {
    cut: [
      [1, 0],
      [0.9, ARM_HALF],
      ...branch(0.74, 0.15),
      ...branch(0.57, 0.23),
      ...branch(0.4, 0.27),
      polar(0.25, 30),
    ],
    // The arm is too thin to cut into, so its one decoration sits at its foot,
    // in the small star where the six arms join.
    arm: [{ at: 0.27, size: 0.65 }],
    gap: [],
    slitFrom: 0,
    label: polar(0.82, 23),
  },
  // One straight snip square to the valley edge: a plain hexagon to decorate.
  hexagon: {
    cut: [[1, 0], polar(Math.cos(30 * RAD), 30)],
    arm: [{ at: 0.33, size: 0.75 }, { at: 0.58, size: 1.1 }, { at: 0.82, size: 0.85 }],
    gap: [{ at: 0.3, size: 0.8 }, { at: 0.52, size: 1.1 }, { at: 0.72, size: 0.9 }],
    slitFrom: 0.3,
  },
};

/** The tip cut on its own, from the spine edge to the valley edge. */
export function tipCut(design: Design): Pt[] {
  return TIPS[design.tip].cut;
}

/** Where the step number for the tip cut goes, if the shape names a spot. */
export function tipLabelSpot(design: Design): Pt | null {
  return TIPS[design.tip].label ?? null;
}

/** False for shapes that cut away the whole space between the arms. */
export function hasGapCuts(tip: TipId): boolean {
  return TIPS[tip].gap.length > 0;
}

/** The piece of the wedge that is kept, as a closed polygon starting at the centre. */
export function keptPolygon(design: Design): Pt[] {
  return [[0, 0], ...TIPS[design.tip].cut];
}

/* ------------------------------------------------------------------ */
/* Holes                                                               */
/* ------------------------------------------------------------------ */

export type CutKind = "tip" | "centre" | "arm" | "gap";

export interface Hole {
  kind: "centre" | "arm" | "gap";
  /**
   * The whole shape as it appears in the unfolded paper. Shapes on a folded
   * edge are symmetric about that edge, so half of each lies outside the wedge:
   * that half is the mirror image the fold creates.
   */
  poly: Pt[];
  /** Where to put the step number on the cutting guide: just outside the wedge, beside the cut. */
  label: Pt;
}

function circle(cx: number, radius: number, n = 28): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI;
    return [cx + radius * Math.cos(a), radius * Math.sin(a)] as Pt;
  });
}

function diamond(cx: number, size: number): Pt[] {
  const a = 0.075 * size;
  const b = 0.045 * size;
  return [[cx - a, 0], [cx, b], [cx + a, 0], [cx, -b]];
}

/** A heart lying along the edge, its point towards the centre of the snowflake. */
function heart(cx: number, size: number, n = 40): Pt[] {
  const len = 0.15 * size;
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 2 * Math.PI;
    const across = 16 * Math.sin(t) ** 3;
    const along = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [cx + ((along + 2.5) / 29) * len, (across / 29) * len] as Pt;
  });
}

/** A long narrow window with pointed ends. */
function windowSlot(from: number, to: number): Pt[] {
  const b = 0.03;
  const taper = 0.05;
  return [
    [from, 0], [from + taper, b], [to - taper, b],
    [to, 0], [to - taper, -b], [from + taper, -b],
  ];
}

function armHoles(design: Design): Pt[][] {
  const slots = TIPS[design.tip].arm;
  switch (design.arm) {
    case "none":
      return [];
    case "diamonds":
      return slots.map((s) => diamond(s.at, s.size));
    case "dots":
      return slots.map((s) => circle(s.at, 0.042 * s.size));
    case "heart": {
      const big = slots.reduce((a, b) => (b.size > a.size ? b : a));
      return [heart(big.at, big.size)];
    }
    case "window":
      return [windowSlot(slots[0].at - 0.03, slots[slots.length - 1].at + 0.05)];
  }
}

function gapHoles(design: Design): Pt[][] {
  const spec = TIPS[design.tip];
  if (!spec.gap.length) return [];
  switch (design.gap) {
    case "none":
      return [];
    case "diamonds":
      return spec.gap.map((s) => diamond(s.at, s.size));
    case "dots":
      return spec.gap.map((s) => circle(s.at, 0.042 * s.size));
    case "slit": {
      // A long thin V that starts near the centre and runs out past the edge
      // of the paper, so it separates two arms instead of making a hole.
      const valleyEnd = spec.cut[spec.cut.length - 1];
      const end = Math.hypot(valleyEnd[0], valleyEnd[1]) + 0.12;
      return [[[spec.slitFrom, 0], [end, 0.035], [end, -0.035]]];
    }
  }
}

/** The snip across the very point of the wedge, from the spine to the valley edge. */
function centreCut(centre: CentreId): Pt[] | null {
  switch (centre) {
    case "none":
      return null;
    case "star":
      return [[0.16, 0], polar(0.09, 30)];
    case "hexagon":
      return [[0.14, 0], polar(0.14 * Math.cos(30 * RAD), 30)];
    case "circle":
      return Array.from({ length: 5 }, (_, i) => polar(0.12, (i / 4) * 30));
  }
}

/** How far outside the folded edge a step number sits. */
const LABEL_OFFSET = 0.075;

function centroid(poly: Pt[]): Pt {
  const n = poly.length;
  return [poly.reduce((s, p) => s + p[0], 0) / n, poly.reduce((s, p) => s + p[1], 0) / n];
}

/** Turn a cut across the wedge into the full closed shape it makes when unfolded. */
export function unfold(cut: Pt[]): Pt[] {
  // The cut plus its mirror image is one arm's worth (-30°..30°); six of those close the loop.
  const half = [...cut.slice().reverse().map(mirrorX), ...cut.slice(1)];
  const out: Pt[] = [];
  for (let k = 0; k < 6; k++) {
    // Skip the first point of each copy: it repeats the last point of the one before.
    for (const p of half.slice(1)) out.push(rotate(p, k * 60));
  }
  return out;
}

export function holes(design: Design): Hole[] {
  const out: Hole[] = [];
  const centre = centreCut(design.centre);
  if (centre) {
    out.push({
      kind: "centre",
      poly: unfold(centre),
      label: [0.1, -LABEL_OFFSET],
    });
  }
  for (const poly of armHoles(design)) {
    const c = centroid(poly);
    out.push({ kind: "arm", poly, label: [c[0], -LABEL_OFFSET] });
  }
  for (const flat of gapHoles(design)) {
    const c = centroid(flat);
    out.push({
      kind: "gap",
      poly: flat.map((p) => rotate(p, WEDGE_DEG)),
      label: rotate([c[0], LABEL_OFFSET], WEDGE_DEG),
    });
  }
  return out;
}

/** The outline of the whole unfolded snowflake. */
export function silhouette(design: Design): Pt[] {
  return unfold(TIPS[design.tip].cut);
}

/** Angles (degrees) at which a hole repeats around the unfolded snowflake. */
export function repeats(hole: Hole): number[] {
  return hole.kind === "centre" ? [0] : [0, 60, 120, 180, 240, 300];
}

/* ------------------------------------------------------------------ */
/* Will it hold together?                                              */
/* ------------------------------------------------------------------ */

export function inPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}

export interface Check {
  /** One piece, joined across both folds, with no bridge thinner than ~3.5 mm on A4. */
  holdsTogether: boolean;
  /** Loose bits that would fall out, or a snowflake that falls into pieces. */
  pieces: number;
}

const GRID = 0.0125; // about 1.2 mm on a 95 mm arm

/**
 * Draw the kept paper on a grid and see whether it is one sturdy piece.
 *
 * The wedge is one twelfth of the snowflake, and across each fold a piece of
 * paper only ever meets its own mirror image. So the whole snowflake is in one
 * piece exactly when the wedge holds a single piece that touches both folds.
 * Shaving one grid cell off every cut first makes sure the bridges that hold
 * it together are wide enough to survive scissors and unfolding.
 */
export function check(design: Design): Check {
  const kept = keptPolygon(design);
  const cut = holes(design).map((h) => h.poly);
  const nx = Math.ceil(1.02 / GRID);
  const ny = Math.ceil((1.02 * TAN30) / GRID);
  const idx = (i: number, j: number) => j * nx + i;
  const inWedge = new Uint8Array(nx * ny);
  const paper = new Uint8Array(nx * ny);

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const p: Pt = [(i + 0.5) * GRID, (j + 0.5) * GRID];
      if (p[1] > p[0] * TAN30) continue;
      inWedge[idx(i, j)] = 1;
      if (inPolygon(p, kept) && !cut.some((poly) => inPolygon(p, poly))) paper[idx(i, j)] = 1;
    }
  }

  // Shave one cell off every cut. Beyond a fold the paper carries on as a
  // mirror image, so a fold is not an edge and nothing is shaved there.
  const sturdy = new Uint8Array(nx * ny);
  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      if (!paper[idx(i, j)]) continue;
      let ok = true;
      for (const [di, dj] of steps) {
        const a = i + di;
        const b = j + dj;
        if (a < 0 || b < 0 || a >= nx || b >= ny || !inWedge[idx(a, b)]) continue; // across a fold
        if (!paper[idx(a, b)]) ok = false;
      }
      if (ok) sturdy[idx(i, j)] = 1;
    }
  }

  // Count the pieces, and note which folds each one reaches.
  const seen = new Uint8Array(nx * ny);
  let pieces = 0;
  let joined = false;
  for (let start = 0; start < nx * ny; start++) {
    if (!sturdy[start] || seen[start]) continue;
    pieces++;
    let spine = false;
    let valley = false;
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      const cur = stack.pop() as number;
      const i = cur % nx;
      const j = (cur - i) / nx;
      if (j === 0) spine = true;
      // On the valley fold: the cell above, or the one to the left, is outside the wedge.
      if (j + 1 >= ny || !inWedge[idx(i, j + 1)] || i === 0 || !inWedge[idx(i - 1, j)]) valley = true;
      for (const [di, dj] of steps) {
        const a = i + di;
        const b = j + dj;
        if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
        const n = idx(a, b);
        if (sturdy[n] && !seen[n]) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    if (spine && valley) joined = true;
  }

  return { holdsTogether: pieces === 1 && joined, pieces };
}

/* ------------------------------------------------------------------ */
/* Numbers for the "one snip becomes many" lesson                      */
/* ------------------------------------------------------------------ */

export interface Counts {
  /** How many separate cuts the scissors make in the folded wedge. */
  snips: number;
  /** How many holes appear in the unfolded snowflake. */
  holes: number;
}

export function counts(design: Design): Counts {
  const kept = keptPolygon(design);
  const all = holes(design);
  let enclosed = 0;
  for (const h of all) {
    if (h.kind === "centre") {
      enclosed += 1;
      continue;
    }
    // A cut that runs out past the edge of the paper (the slit) shapes the
    // outline instead of leaving a hole.
    const inside = h.poly
      .filter((p) => p[1] >= -1e-9 && p[1] <= p[0] * TAN30 + 1e-9)
      .every((p) => {
        // Points sitting exactly on a fold are nudged just inside the wedge.
        const deg = Math.min(29.5, Math.max(0.5, Math.atan2(p[1], p[0]) / RAD));
        return inPolygon(polar(Math.hypot(p[0], p[1]), deg), kept);
      });
    if (inside) enclosed += 6;
  }
  return { snips: 1 + all.length, holes: enclosed };
}

export type Difficulty = "easy" | "medium" | "tricky";

export function difficulty(design: Design): Difficulty {
  const snips = counts(design).snips;
  if (design.tip === "fir" || design.tip === "branches" || design.arm === "heart" || snips >= 7) return "tricky";
  if (snips >= 4 || design.tip === "petal" || design.tip === "fork") return "medium";
  return "easy";
}

/** Every design the pickers can produce. */
export function allDesigns(): Design[] {
  const out: Design[] = [];
  for (const tip of TIP_IDS)
    for (const arm of ARM_IDS)
      for (const gap of GAP_IDS) {
        // Where the gap cuts do nothing, every gap choice is the same snowflake.
        if (gap !== "none" && !hasGapCuts(tip)) continue;
        for (const centre of CENTRE_IDS) out.push({ tip, arm, gap, centre });
      }
  return out;
}

/* ------------------------------------------------------------------ */
/* SVG helpers                                                         */
/* ------------------------------------------------------------------ */

/** An SVG path for a closed polygon, scaled, with y flipped so +y is up the page. */
export function pathOf(poly: readonly Pt[], scale = 1): string {
  return (
    poly
      .map((p, i) => `${i ? "L" : "M"}${(p[0] * scale).toFixed(2)} ${(-p[1] * scale).toFixed(2)}`)
      .join("") + "Z"
  );
}

/** Every hole of a design, in all the places folding copies it to. */
export function holePaths(design: Design, scale: number): string[] {
  return holes(design).flatMap((h) =>
    repeats(h).map((deg) => pathOf(h.poly.map((p) => rotate(p, deg)), scale)),
  );
}

/* ------------------------------------------------------------------ */
/* Printable cutting sheet                                             */
/* ------------------------------------------------------------------ */

/**
 * The whole snowflake at full size with every cut shaded and the three sets of
 * fold lines numbered. Printing the cuts on all twelve slices (not just one)
 * means it does not matter which slice ends up on top after folding: whichever
 * it is carries the pattern, as long as the printing faces out on the first fold.
 */
export function sheetSvg(design: Design): string {
  const R = 92; // mm from the centre to the tip of an arm
  const c = 105;
  const line = (deg: number, dash: string) => {
    const [x, y] = polar(c - 6, deg);
    return `<line x1="${c - x}" y1="${c + y}" x2="${c + x}" y2="${c - y}" stroke="#2563eb" stroke-width="0.35"${
      dash ? ` stroke-dasharray="${dash}"` : ""
    }/>`;
  };
  const tag = (deg: number, n: number) => {
    const [x, y] = polar(c - 2.5, deg);
    return (
      `<circle cx="${c + x}" cy="${c - y}" r="2.6" fill="#2563eb"/>` +
      `<text x="${c + x}" y="${c - y + 1.2}" font-size="3.4" font-weight="700" fill="#fff" text-anchor="middle">${n}</text>`
    );
  };
  const cuts = holePaths(design, R)
    .map((d) => `<path d="${d}" fill="#d4d4d8" stroke="#18181b" stroke-width="0.3"/>`)
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c * 2} ${c * 2}" width="190mm" height="190mm" font-family="Arial, Helvetica, sans-serif">` +
    `<circle cx="${c}" cy="${c}" r="${R + 5}" fill="#e4e4e7"/>` +
    `<g transform="translate(${c} ${c})">` +
    `<path d="${pathOf(silhouette(design), R)}" fill="#fff" stroke="#18181b" stroke-width="0.3"/>${cuts}</g>` +
    line(0, "") +
    [60, 120].map((d) => line(d, "2.5 1.5")).join("") +
    [30, 90, 150].map((d) => line(d, "0.6 1.4")).join("") +
    [0, 180].map((d) => tag(d, 1)).join("") +
    [60, 120, 240, 300].map((d) => tag(d, 2)).join("") +
    [30, 90, 150, 210, 270, 330].map((d) => tag(d, 3)).join("") +
    `</svg>`
  );
}
