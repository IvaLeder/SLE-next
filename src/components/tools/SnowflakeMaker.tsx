"use client";

import { useId, useState } from "react";
import { useToolEventOnce } from "@/components/tools/useToolAnalytics";
import {
  ARM_IDS,
  CENTRE_IDS,
  GAP_IDS,
  TIP_IDS,
  allDesigns,
  counts,
  difficulty,
  hasGapCuts,
  holePaths,
  holes,
  keptPolygon,
  pathOf,
  polar,
  rotate,
  sheetSvg,
  silhouette,
  tipCut,
  tipLabelSpot,
  type ArmId,
  type CentreId,
  type CutKind,
  type Design,
  type GapId,
  type Pt,
  type TipId,
} from "@/components/tools/snowflake-geometry";

type Lang = "en" | "hr";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

const COPY = {
  en: {
    previewEyebrow: "Your snowflake",
    surprise: "🎲 Surprise me",
    showFolds: "Show the folds",
    foldsNote: "The gold slice is the only piece you cut. Folding copies it 12 times.",
    snips: (n: number) => `${n} ${n === 1 ? "snip" : "snips"} with the scissors`,
    holes: (n: number) => `${n} ${n === 1 ? "hole" : "holes"} in the snowflake`,
    level: { easy: "Easy to cut", medium: "Medium", tricky: "Tricky to cut" },
    groups: {
      tip: "Arm tips",
      arm: "Along each arm",
      gap: "Between the arms",
      centre: "Centre",
    },
    tip: {
      star: "Pointy star",
      petal: "Round petals",
      fork: "Forked tips",
      fir: "Frosty branches",
      branches: "Long branches",
      hexagon: "Hexagon",
    },
    arm: { none: "Plain", diamonds: "Diamonds", dots: "Dots", heart: "Heart", window: "Long window" },
    gap: { none: "Plain", diamonds: "Diamonds", dots: "Dots", slit: "Deep slit" },
    centre: { none: "Closed", star: "Star", hexagon: "Hexagon", circle: "Circle" },
    noGap: "Long branches already fill the space between the arms, so there is nothing to cut here.",
    cutTitle: "How to cut it",
    cutIntro:
      "Fold your paper into a narrow wedge first, then hold it with the point down, like the picture. Cut away the striped parts.",
    foldTitle: "Fold first",
    foldSteps: [
      "Fold a square of paper in half, corner to corner, to make a triangle.",
      "Fold the triangle into three equal parts, like a fan closing over itself.",
      "Fold in half once more. You now have a narrow wedge, 12 layers thick.",
    ],
    fold: "fold",
    pointLabel: "centre",
    tipSteps: {
      star: "Cut the uneven top off with one straight, slanted snip: high on the right fold, lower on the left fold.",
      petal: "Cut the top off in a round curve, like the top of a balloon, then straight down to the left fold.",
      fork: "Cut a small V into the top of the right fold, then one long slanted snip down to the left fold.",
      fir: "Cut a zigzag from the top of the right fold down to the left fold: three teeth, each a little bigger.",
      branches:
        "Leave a narrow strip along the right fold: that strip is the arm. Start low on the left fold and cut in and out around three side branches, then finish with a point at the top of the right fold. The printed cutting sheet makes this shape much easier.",
      hexagon: "Cut the uneven top off straight across, square to the left fold.",
    },
    centreSteps: {
      star: "Snip the point off at a slant.",
      hexagon: "Snip the point off straight across.",
      circle: "Snip the point off in a small curve.",
    },
    side: { arm: "right", gap: "left" },
    holeSteps: {
      diamonds: (n: number, side: string) =>
        `Cut ${n} small ${n === 1 ? "triangle" : "triangles"} into the ${side} fold. ${n === 1 ? "It opens" : "Each one opens"} into a diamond.`,
      dots: (n: number, side: string) =>
        `Cut ${n} ${n === 1 ? "half-circle" : "half-circles"} into the ${side} fold. ${n === 1 ? "It opens" : "Each one opens"} into a round hole.`,
      heart: (_n: number, side: string) =>
        `Cut half a heart into the ${side} fold, with its point towards the centre.`,
      window: (_n: number, side: string) => `Cut one long, thin slot into the ${side} fold.`,
      slit: (_n: number, side: string) =>
        `Cut one long, thin V down the ${side} fold, from the top towards the point. Stop where the picture stops.`,
    },
    unfold: "Unfold slowly and press it flat under a heavy book.",
    helper: "Twelve layers are thick. A grown-up can help with the small cuts.",
    print: "🖨️ Print a cutting sheet",
    printNote:
      "The sheet has the fold lines and every cut printed on it, so there is nothing to copy by hand.",
    sheetTitle: "Snowflake cutting sheet",
    sheetSteps: [
      "Fold the page in half along line 1, with the printing on the outside.",
      "Fold along the two lines marked 2: one side to the front, the other side to the back, like a zigzag.",
      "Fold in half along line 3. You now have a narrow wedge.",
      "Cut along the black lines, through all the layers, so every grey part falls away. Then unfold slowly.",
    ],
    sheetFooter: "Made with the snowflake maker at stemlittleexplorers.com",
    flakeAlt: (tip: string) => `A six-armed paper snowflake: ${tip.toLowerCase()}`,
    guideAlt: "The folded paper wedge with the parts to cut away striped and numbered",
  },
  hr: {
    previewEyebrow: "Vaša pahulja",
    surprise: "🎲 Iznenadi me",
    showFolds: "Prikaži pregibe",
    foldsNote: "Zlatni isječak jedini je dio koji režete. Presavijanje ga umnoži 12 puta.",
    snips: (n: number) => `${n} ${n === 1 ? "rez" : n < 5 ? "reza" : "rezova"} škarama`,
    holes: (n: number) => {
      const last = n % 10;
      const teen = n % 100 >= 11 && n % 100 <= 14;
      const word = last === 1 && !teen ? "rupa" : last >= 2 && last <= 4 && !teen ? "rupe" : "rupa";
      return `${n} ${word} u pahulji`;
    },
    level: { easy: "Lako za rezanje", medium: "Srednje", tricky: "Zahtjevno za rezanje" },
    groups: {
      tip: "Vrhovi krakova",
      arm: "Duž svakog kraka",
      gap: "Između krakova",
      centre: "Središte",
    },
    tip: {
      star: "Šiljasta zvijezda",
      petal: "Okrugle latice",
      fork: "Rašljasti vrhovi",
      fir: "Ledene grančice",
      branches: "Duge grane",
      hexagon: "Šesterokut",
    },
    arm: { none: "Bez ukrasa", diamonds: "Rombovi", dots: "Točkice", heart: "Srce", window: "Dugi prozor" },
    gap: { none: "Bez ukrasa", diamonds: "Rombovi", dots: "Točkice", slit: "Duboki prorez" },
    centre: { none: "Zatvoreno", star: "Zvijezda", hexagon: "Šesterokut", circle: "Krug" },
    noGap: "Duge grane već ispunjavaju prostor između krakova, pa se ovdje ništa ne reže.",
    cutTitle: "Kako je izrezati",
    cutIntro:
      "Najprije presavijte papir u uzak klin, a zatim ga držite s vrhom prema dolje, kao na slici. Izrežite iscrtkane dijelove.",
    foldTitle: "Najprije presavijte",
    foldSteps: [
      "Presavijte kvadrat papira napola, od kuta do kuta, da dobijete trokut.",
      "Presavijte trokut na tri jednaka dijela, kao lepezu koja se sklapa.",
      "Presavijte još jednom napola. Sada imate uzak klin debeo 12 slojeva.",
    ],
    fold: "pregib",
    pointLabel: "središte",
    tipSteps: {
      star: "Odrežite neravni vrh jednim ravnim, kosim rezom: visoko na desnom pregibu, niže na lijevom.",
      petal: "Odrežite vrh u oblom luku, kao vrh balona, a zatim ravno dolje do lijevog pregiba.",
      fork: "Zarežite mali V u vrh desnog pregiba, a zatim jednim dugim kosim rezom dolje do lijevog pregiba.",
      fir: "Režite cik-cak od vrha desnog pregiba do lijevog pregiba: tri zupca, svaki malo veći.",
      branches:
        "Ostavite uzak pojas uz desni pregib: taj je pojas krak. Krenite nisko na lijevom pregibu i režite oko triju bočnih grana, a zatim završite šiljkom na vrhu desnog pregiba. S ispisanim listom za rezanje ovaj je oblik puno lakši.",
      hexagon: "Odrežite neravni vrh ravno poprijeko, pod pravim kutom na lijevi pregib.",
    },
    centreSteps: {
      star: "Odrežite sam vrh klina koso.",
      hexagon: "Odrežite sam vrh klina ravno poprijeko.",
      circle: "Odrežite sam vrh klina u malom luku.",
    },
    side: { arm: "desni", gap: "lijevi" },
    holeSteps: {
      diamonds: (n: number, side: string) =>
        `Izrežite ${n} ${n === 1 ? "mali trokut" : "mala trokuta"} u ${side} pregib. ${n === 1 ? "Otvara se" : "Svaki se otvara"} u romb.`,
      dots: (n: number, side: string) =>
        `Izrežite ${n} ${n === 1 ? "polukrug" : "polukruga"} u ${side} pregib. ${n === 1 ? "Otvara se" : "Svaki se otvara"} u okruglu rupu.`,
      heart: (_n: number, side: string) =>
        `Izrežite pola srca u ${side} pregib, sa šiljkom prema središtu.`,
      window: (_n: number, side: string) => `Izrežite jedan dug, tanak prorez u ${side} pregib.`,
      slit: (_n: number, side: string) =>
        `Izrežite jedan dug, tanak V niz ${side} pregib, od vrha prema šiljku. Stanite gdje staje i slika.`,
    },
    unfold: "Polako rastvorite i izravnajte pod teškom knjigom.",
    helper: "Dvanaest slojeva je debelo. Kod sitnih rezova može pomoći odrasla osoba.",
    print: "🖨️ Ispiši list za rezanje",
    printNote:
      "Na listu su otisnute linije pregiba i svi rezovi, pa ništa ne trebate precrtavati rukom.",
    sheetTitle: "List za rezanje pahulje",
    sheetSteps: [
      "Presavijte list napola po liniji 1, tako da otisak ostane izvana.",
      "Presavijte po dvjema linijama s brojem 2: jednu stranu prema naprijed, drugu prema natrag, cik-cak.",
      "Presavijte napola po liniji 3. Sada imate uzak klin.",
      "Režite po crnim linijama, kroz sve slojeve, tako da otpadnu svi sivi dijelovi. Zatim polako rastvorite.",
    ],
    sheetFooter: "Izrađeno pomoću alata za pahulje na stemlittleexplorers.com",
    flakeAlt: (tip: string) => `Papirnata pahulja sa šest krakova: ${tip.toLowerCase()}`,
    guideAlt: "Presavijeni papirnati klin s iscrtkanim i numeriranim dijelovima koje treba izrezati",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

const SKY = "#111830";
const FLAKE_SCALE = 100;

function Flake({
  design,
  size,
  fill,
  label,
  folds = false,
}: {
  design: Design;
  size: number;
  fill: string;
  label?: string;
  folds?: boolean;
}) {
  const maskId = useId();
  const box = 108;
  return (
    <svg
      viewBox={`${-box} ${-box} ${box * 2} ${box * 2}`}
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="shrink-0"
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-box} y={-box} width={box * 2} height={box * 2}>
          <path d={pathOf(silhouette(design), FLAKE_SCALE)} fill="#fff" />
          {holePaths(design, FLAKE_SCALE).map((d, i) => (
            <path key={i} d={d} fill="#000" />
          ))}
        </mask>
      </defs>
      {/* Turned a quarter so that one arm points straight up. */}
      <g transform="rotate(-90)">
        <rect x={-box} y={-box} width={box * 2} height={box * 2} fill={fill} mask={`url(#${maskId})`} />
        {folds && (
          <g>
            <path
              d={pathOf([[0, 0], polar(1.04, 0), polar(1.04, 30)], FLAKE_SCALE)}
              fill="#f5b942"
              fillOpacity="0.55"
            />
            {Array.from({ length: 12 }, (_, i) => {
              const [x, y] = polar(1.05 * FLAKE_SCALE, i * 30);
              return (
                <line
                  key={i}
                  x2={x}
                  y2={-y}
                  stroke="#f5b942"
                  strokeWidth="0.9"
                  strokeDasharray={i % 2 ? "3 3" : undefined}
                />
              );
            })}
          </g>
        )}
      </g>
    </svg>
  );
}

/** Wedge coordinates turned so the point is at the bottom and the wedge stands upright. */
const stand = (p: Pt): Pt => rotate(p, 75);
const GUIDE_SCALE = 300;

/** The middle of the tip cut, pushed outwards, for its step number. */
function tipLabel(design: Design): Pt {
  const spot = tipLabelSpot(design);
  if (spot) return spot;
  const cut = tipCut(design);
  let total = 0;
  for (let i = 1; i < cut.length; i++) total += Math.hypot(cut[i][0] - cut[i - 1][0], cut[i][1] - cut[i - 1][1]);
  let walked = 0;
  for (let i = 1; i < cut.length; i++) {
    const seg = Math.hypot(cut[i][0] - cut[i - 1][0], cut[i][1] - cut[i - 1][1]);
    if (walked + seg >= total / 2) {
      const f = (total / 2 - walked) / seg;
      const x = cut[i - 1][0] + (cut[i][0] - cut[i - 1][0]) * f;
      const y = cut[i - 1][1] + (cut[i][1] - cut[i - 1][1]) * f;
      const r = Math.hypot(x, y);
      return [(x / r) * (r + 0.1), (y / r) * (r + 0.1)];
    }
    walked += seg;
  }
  return cut[0];
}

/** The folded wedge before cutting: 30° wide with an uneven top. */
const RAW_WEDGE: Pt[] = [[0, 0], polar(1.12, 0), polar(1.17, 9), polar(1.09, 17), polar(1.16, 24), polar(1.1, 30)];

function CuttingGuide({
  design,
  numbers,
  label,
  foldWord,
  pointWord,
}: {
  design: Design;
  numbers: Record<CutKind, number>;
  label: string;
  foldWord: string;
  pointWord: string;
}) {
  const uid = useId();
  const clipId = `${uid}-clip`;
  const hatchId = `${uid}-hatch`;
  const S = GUIDE_SCALE;
  const at = (p: Pt) => {
    const q = stand(p);
    return { x: q[0] * S, y: -q[1] * S };
  };
  const path = (poly: readonly Pt[]) => pathOf(poly.map(stand), S);
  const badges: { kind: CutKind; p: Pt }[] = [
    { kind: "tip", p: tipLabel(design) },
    ...holes(design).map((h) => ({ kind: h.kind as CutKind, p: h.label })),
  ];
  const spineMid = at([0.96, -0.045]);
  const valleyMid = at(rotate([0.96, 0.045], 30));

  return (
    <svg
      viewBox="-150 -372 300 400"
      role="img"
      aria-label={label}
      className="mx-auto h-auto w-full max-w-[300px]"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path(RAW_WEDGE)} />
        </clipPath>
        <pattern id={hatchId} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#fde4de" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#f26b4f" strokeWidth="2.2" />
        </pattern>
      </defs>

      {/* Everything is waste until the kept paper is drawn on top. */}
      <path d={path(RAW_WEDGE)} fill={`url(#${hatchId})`} />
      <path d={path(keptPolygon(design))} fill="#fff" />
      <g clipPath={`url(#${clipId})`}>
        {holes(design).map((h, i) => (
          <path key={i} d={path(h.poly)} fill={`url(#${hatchId})`} stroke="#b4442f" strokeWidth="1.4" />
        ))}
        <path d={path(keptPolygon(design))} fill="none" stroke="#b4442f" strokeWidth="1.4" />
      </g>
      <path d={path(RAW_WEDGE)} fill="none" stroke="#475569" strokeWidth="1.4" strokeLinejoin="round" />

      {/* The two long edges are both folds. */}
      {[RAW_WEDGE[1], RAW_WEDGE[RAW_WEDGE.length - 1]].map((end, i) => {
        const e = at(end);
        return <line key={i} x1="0" y1="0" x2={e.x} y2={e.y} stroke="#4338ca" strokeWidth="3" strokeLinecap="round" />;
      })}
      <text
        x={spineMid.x}
        y={spineMid.y}
        transform={`rotate(-75 ${spineMid.x} ${spineMid.y})`}
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="#4338ca"
      >
        {foldWord}
      </text>
      <text
        x={valleyMid.x}
        y={valleyMid.y}
        transform={`rotate(75 ${valleyMid.x} ${valleyMid.y})`}
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="#4338ca"
      >
        {foldWord}
      </text>
      <text x="0" y="20" textAnchor="middle" fontSize="12" fill="#64748b">
        {pointWord}
      </text>

      {badges.map((b, i) => {
        const c = at(b.p);
        return (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="11" fill="#1e293b" />
            <text x={c.x} y={c.y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {numbers[b.kind]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Printable cutting sheet                                             */
/* ------------------------------------------------------------------ */

function openSheet(design: Design, t: (typeof COPY)[Lang]) {
  const w = window.open("", "_blank", "width=820,height=1060");
  if (!w) return;
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${t.sheetTitle}</title>` +
      `<style>*{box-sizing:border-box}body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#111;margin:0}` +
      `h1{font-size:15pt;margin:0 0 2mm}ol{margin:0 0 3mm;padding-left:5mm;font-size:9.5pt;line-height:1.35}` +
      `.sheet{text-align:center}.foot{margin-top:2mm;color:#777;font-size:8pt;text-align:center}@page{margin:9mm}</style>` +
      `</head><body><h1>✂️ ${t.sheetTitle}</h1><ol>${t.sheetSteps.map((s) => `<li>${s}</li>`).join("")}</ol>` +
      `<div class="sheet">${sheetSvg(design)}</div><div class="foot">${t.sheetFooter}</div></body></html>`,
  );
  w.document.close();
  w.focus();
  const go = () => {
    try {
      w.print();
    } catch {
      /* the visitor closed the window */
    }
  };
  if (w.document.readyState === "complete") setTimeout(go, 300);
  else w.onload = () => setTimeout(go, 300);
}

/* ------------------------------------------------------------------ */
/* Tool                                                                */
/* ------------------------------------------------------------------ */

const START: Design = { tip: "fork", arm: "diamonds", gap: "dots", centre: "star" };

export default function SnowflakeMaker({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [design, setDesign] = useState<Design>(START);
  const [folds, setFolds] = useState(false);
  const trackResult = useToolEventOnce("tool_result", "snowflake-maker", lang);
  const trackComplete = useToolEventOnce("tool_complete", "snowflake-maker", lang);

  const change = (patch: Partial<Design>) => {
    setDesign((d) => ({ ...d, ...patch }));
    trackResult("design");
  };

  const surprise = () => {
    const pool = allDesigns().filter(
      (d) => d.tip !== design.tip && (d.arm !== "none" || d.gap !== "none"),
    );
    setDesign(pool[Math.floor(Math.random() * pool.length)]);
    trackResult("surprise");
  };

  const tally = counts(design);
  const level = difficulty(design);

  // Number the cuts in the order a child should make them: big ones first.
  const all = holes(design);
  const armCuts = all.filter((h) => h.kind === "arm").length;
  const gapCuts = all.filter((h) => h.kind === "gap").length;
  const numbers = { tip: 1, centre: 0, arm: 0, gap: 0 } as Record<CutKind, number>;
  let next = 2;
  if (design.centre !== "none") numbers.centre = next++;
  if (armCuts) numbers.arm = next++;
  if (gapCuts) numbers.gap = next++;

  const steps: { n: number; text: string }[] = [{ n: 1, text: t.tipSteps[design.tip] }];
  if (design.centre !== "none") steps.push({ n: numbers.centre, text: t.centreSteps[design.centre] });
  if (design.arm !== "none" && armCuts) steps.push({ n: numbers.arm, text: t.holeSteps[design.arm](armCuts, t.side.arm) });
  if (design.gap !== "none" && gapCuts) steps.push({ n: numbers.gap, text: t.holeSteps[design.gap](gapCuts, t.side.gap) });

  const levelClass =
    level === "easy"
      ? "bg-emerald-400/20 text-emerald-200"
      : level === "medium"
        ? "bg-amber-400/20 text-amber-200"
        : "bg-rose-400/20 text-rose-200";

  /** One row of choices; each button shows the snowflake you would get. */
  function picker<K extends keyof Design>(key: K, ids: readonly Design[K][], names: Record<string, string>) {
    return (
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700">{t.groups[key]}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ids.map((id) => {
            const active = design[key] === id;
            return (
              <button
                key={String(id)}
                type="button"
                onClick={() => change({ [key]: id } as Partial<Design>)}
                aria-pressed={active}
                className={`flex w-[5.4rem] flex-col items-center gap-1 rounded-xl border px-1.5 pb-1.5 pt-2 text-center text-xs font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  active
                    ? "border-brand bg-brand-soft text-gray-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-brand/40 hover:bg-gray-50"
                }`}
              >
                <Flake design={{ ...design, [key]: id }} size={46} fill={active ? "#4338ca" : "#64748b"} />
                <span>{names[String(id)]}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      {/* ---- Preview ---- */}
      <div className="rounded-2xl p-5 text-white sm:p-6" style={{ background: SKY }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">{t.previewEyebrow}</p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${levelClass}`}>{t.level[level]}</span>
        </div>
        <div className="mt-2 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <Flake
            design={design}
            size={230}
            fill="#f8fafc"
            folds={folds}
            label={t.flakeAlt(t.tip[design.tip])}
          />
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-2xl font-bold">{t.tip[design.tip]}</p>
            <p className="mt-2 text-sm text-indigo-100">✂️ {t.snips(tally.snips)}</p>
            <p className="text-sm text-indigo-100">❄️ {t.holes(tally.holes)}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={surprise}
                className="rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-indigo-50"
              >
                {t.surprise}
              </button>
              <button
                type="button"
                onClick={() => setFolds((v) => !v)}
                aria-pressed={folds}
                className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
                  folds ? "border-amber-300 bg-amber-300/20 text-amber-100" : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {t.showFolds}
              </button>
            </div>
            {folds && <p className="mt-3 text-xs leading-relaxed text-amber-100">{t.foldsNote}</p>}
          </div>
        </div>
      </div>

      {/* ---- Pickers ---- */}
      <div className="mt-6 space-y-5">
        {picker("tip", TIP_IDS as readonly TipId[], t.tip)}
        {picker("arm", ARM_IDS as readonly ArmId[], t.arm)}
        {hasGapCuts(design.tip) ? (
          picker("gap", GAP_IDS as readonly GapId[], t.gap)
        ) : (
          <div>
            <p className="text-sm font-semibold text-gray-700">{t.groups.gap}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{t.noGap}</p>
          </div>
        )}
        {picker("centre", CENTRE_IDS as readonly CentreId[], t.centre)}
      </div>

      {/* ---- How to cut it ---- */}
      <div className="mt-7 border-t border-gray-100 pt-6">
        <h3 className="text-xl font-bold text-gray-900">✂️ {t.cutTitle}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.cutIntro}</p>

        <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,300px)_1fr] sm:items-start">
          <div className="rounded-2xl bg-slate-50 p-3">
            <CuttingGuide
              design={design}
              numbers={numbers}
              label={t.guideAlt}
              foldWord={t.fold}
              pointWord={t.pointLabel}
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700">{t.foldTitle}</p>
            <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-gray-600">
              {t.foldSteps.map((s) => (
                <li key={s} className="flex gap-2">
                  <span aria-hidden="true" className="text-gray-400">
                    •
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>

            <ol className="mt-4 space-y-2.5">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-3 text-[15px] leading-relaxed text-gray-800">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                    {s.n}
                  </span>
                  <span>{s.text}</span>
                </li>
              ))}
              <li className="flex gap-3 text-[15px] leading-relaxed text-gray-800">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-base" aria-hidden="true">
                  ❄️
                </span>
                <span>{t.unfold}</span>
              </li>
            </ol>

            <p className="mt-3 text-xs leading-relaxed text-gray-500">{t.helper}</p>

            <button
              type="button"
              onClick={() => {
                trackComplete("print");
                openSheet(design, t);
              }}
              className="mt-4 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              {t.print}
            </button>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{t.printNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
