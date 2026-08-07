"use client";

import { useMemo, useState } from "react";

type Lang = "en" | "hr";
type Tab = "frame" | "bridge" | "quiz";

/** How far an unbraced square leans over when it is pushed, as a shear factor
 *  (x shifts by k × height). Purely cosmetic: bar lengths are unchanged, which
 *  is the whole point of the demonstration. */
const RACK = 0.3;
const BAYS = 5;

/* Frame tab geometry — a square pinned at its four corners. */
const SQ = { left: 70, right: 270, top: 60, bottom: 180 };

/* Bridge tab geometry — five square bays between two chords. */
const BRIDGE = { x0: 26, bayW: 58, top: 78, bottom: 168 };

const COPY = {
  en: {
    tabFrame: "Push the square",
    tabBridge: "Brace the bridge",
    tabQuiz: "Will it hold?",

    /* frame */
    frameIntro:
      "Four bars, pinned at the corners so they can turn but not stretch. Push the top corner and see what a square thinks of that.",
    push: "Push the frame",
    release: "Stand it back up",
    diagA: "Add diagonal ╱",
    diagB: "Add diagonal ╲",
    removeA: "Remove diagonal ╱",
    removeB: "Remove diagonal ╲",
    tapHint: "Tap a dashed line in the drawing, or use the buttons.",
    joints: "Joints",
    bars: "Bars",
    triangles: "Triangles",
    floppyTitle: "The square folds flat.",
    floppyBody:
      "Not one of the four bars changed length. They only turned at the corners, and the square leaned over into a squashed diamond. Engineers call this racking, and it is why a bookshelf with no back panel goes wobbly.",
    rigidTitle: "It holds.",
    rigidBody:
      "To lean over, the frame would have to make the diagonal longer, and a bar cannot stretch. One extra bar cut the square into two triangles, and the shape is now locked.",
    whyTitle: "Why a triangle cannot change shape",
    whyBody:
      "Tell me the three side lengths of a triangle and there is exactly one triangle I can build. Tell me four side lengths and I can build endlessly many four-sided shapes from them. A triangle's angles are decided by its sides. Nothing else's are. That is the entire reason bridges, roofs, cranes and electricity pylons are full of triangles.",

    /* bridge */
    bridgeIntro:
      "A deck, two chords and five square bays. Tap a bay to drop a diagonal into it, then send the truck across.",
    testLoad: "Send the truck across",
    clear: "Clear the bridge",
    bayLabel: (i: number) => `Bay ${i}`,
    used: (n: number) => `Diagonals used: ${n} of ${BAYS}`,
    passTitle: "It holds. The deck stays flat.",
    passBody:
      "Every bay is two triangles now. The truck's weight runs down through the bars to the supports at the ends, and no corner can change its angle on the way.",
    failTitle: (n: number) => (n === 1 ? "One bay folded." : `${n} bays folded.`),
    failBody:
      "An empty square has nothing to hold its corners square, so it leans, and the deck above it goes with it. Every bay needs a diagonal.",
    directionNote:
      "Which way a diagonal leans makes no difference to whether the bridge holds its shape. It does decide whether that bar gets squeezed or stretched by the load, which is why real trusses alternate them.",

    /* quiz */
    quizIntro:
      "Rigid or floppy? Count the joints, count the bars, then decide before you tap.",
    isRigid: "It holds",
    isFloppy: "It wobbles",
    right: "Right!",
    nope: "Not quite.",
    next: "Next frame",
    score: "Score",
    countRule: (j: number, need: number, have: number) =>
      `${j} joints need at least ${need} bars to be rigid. This frame has ${have}.`,
    ruleTitle: "The counting rule",
    ruleBody:
      "A flat frame with J joints needs at least 2 × J − 3 bars before it can be rigid. Three of the bars are used up just holding the frame in place, and every joint after that needs two more. Being short of bars always means floppy. Having enough is not a promise on its own, because the bars still have to be in the right places, but it tells you where to look.",

    /* a11y */
    a11ySquare: "A square frame of four bars",
  },
  hr: {
    tabFrame: "Gurni kvadrat",
    tabBridge: "Ukruti most",
    tabQuiz: "Hoće li izdržati?",

    frameIntro:
      "Četiri štapa, spojena u uglovima tako da se mogu okretati, ali se ne mogu rastegnuti. Gurni gornji ugao i vidi što kvadrat misli o tome.",
    push: "Gurni okvir",
    release: "Vrati ga u kvadrat",
    diagA: "Dodaj dijagonalu ╱",
    diagB: "Dodaj dijagonalu ╲",
    removeA: "Makni dijagonalu ╱",
    removeB: "Makni dijagonalu ╲",
    tapHint: "Dotakni crtkanu liniju na crtežu ili upotrijebi gumbe.",
    joints: "Spojeva",
    bars: "Štapova",
    triangles: "Trokuta",
    floppyTitle: "Kvadrat se preklopio.",
    floppyBody:
      "Nijedan od četiri štapa nije promijenio duljinu. Samo su se zakrenuli u uglovima i kvadrat se nakrivio u spljošteni romb. Zbog istoga se klima polica za knjige koja nema stražnju stranicu.",
    rigidTitle: "Drži.",
    rigidBody:
      "Da bi se nakrivio, okvir bi morao produljiti dijagonalu, a štap se ne može rastegnuti. Jedan jedini dodatni štap presjekao je kvadrat na dva trokuta i oblik je sada zaključan.",
    whyTitle: "Zašto trokut ne može promijeniti oblik",
    whyBody:
      "Reci mi duljine triju stranica trokuta i postoji točno jedan trokut koji od njih mogu složiti. Reci mi duljine četiriju stranica i od njih mogu složiti beskonačno mnogo četverokuta. Kutove trokuta određuju njegove stranice. Ni kod jednog drugog lika to nije tako. To je cijeli razlog zašto su mostovi, krovovi, dizalice i dalekovodni stupovi puni trokuta.",

    bridgeIntro:
      "Kolnik, dva pojasa i pet kvadratnih polja. Dotakni polje da u njega spustiš dijagonalu, pa pusti kamion preko mosta.",
    testLoad: "Pusti kamion preko",
    clear: "Isprazni most",
    bayLabel: (i: number) => `Polje ${i}`,
    used: (n: number) => `Iskorištenih dijagonala: ${n} od ${BAYS}`,
    passTitle: "Drži. Kolnik je ostao ravan.",
    passBody:
      "Svako je polje sada dvostruki trokut. Težina kamiona spušta se kroz štapove do oslonaca na krajevima, a nijedan ugao usput ne može promijeniti svoj kut.",
    failTitle: (n: number) =>
      n === 1
        ? "Jedno se polje preklopilo."
        : n < 5
          ? `${n} polja su se preklopila.`
          : `${n} polja se preklopilo.`,
    failBody:
      "Prazan kvadrat nema ništa što bi mu držalo uglove pravima, pa se nakrivi, a kolnik iznad njega ide s njim. Svako polje treba svoju dijagonalu.",
    directionNote:
      "Na koju stranu dijagonala pada, ne mijenja hoće li most zadržati oblik. Odlučuje pak hoće li taj štap opterećenje stiskati ili rastezati, i zato ih pravi rešetkasti nosači slažu naizmjenično.",

    quizIntro:
      "Krut ili klimav? Prebroji spojeve, prebroji štapove i odluči prije nego što dotakneš.",
    isRigid: "Drži",
    isFloppy: "Klima se",
    right: "Točno!",
    nope: "Nije baš.",
    next: "Sljedeći okvir",
    score: "Rezultat",
    countRule: (j: number, need: number, have: number) =>
      `Za ${j} spojeva treba najmanje ${need} štapova da bi okvir bio krut. Ovaj ih ima ${have}.`,
    ruleTitle: "Pravilo brojanja",
    ruleBody:
      "Ravan okvir sa S spojeva treba najmanje 2 × S − 3 štapa da bi uopće mogao biti krut. Tri štapa potroše se već na to da okvir ostane na mjestu, a svaki sljedeći spoj traži još dva. Ako štapova nedostaje, okvir je sigurno klimav. Ako ih ima dovoljno, to samo po sebi nije jamstvo, jer moraju biti i na pravim mjestima, ali znaš gdje gledati.",

    a11ySquare: "Kvadratni okvir od četiri štapa",
  },
} as const;

/* ─────────────────────────────── quiz frames ─────────────────────────────── */

type Pt = [number, number];

interface Frame {
  id: string;
  /** Joint positions in the 340×220 viewBox. */
  nodes: Pt[];
  /** Bars as pairs of node indices. */
  bars: [number, number][];
  rigid: boolean;
  /** Where each node slides to when a floppy frame is pushed. */
  sway: Record<number, Pt>;
  note: { en: string; hr: string };
}

const FRAMES: Frame[] = [
  {
    id: "square",
    nodes: [
      [90, 180],
      [250, 180],
      [250, 70],
      [90, 70],
    ],
    bars: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
    rigid: false,
    sway: { 2: [285, 70], 3: [125, 70] },
    note: {
      en: "The plain square: the frame every beginner draws, and the first one to fold.",
      hr: "Obični kvadrat: okvir koji svatko prvo nacrta i prvi koji se preklopi.",
    },
  },
  {
    id: "triangle",
    nodes: [
      [90, 180],
      [250, 180],
      [170, 66],
    ],
    bars: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
    rigid: true,
    sway: {},
    note: {
      en: "Three bars, three joints, and nowhere left to move. The smallest rigid frame there is.",
      hr: "Tri štapa, tri spoja i nema se kamo maknuti. Najmanji kruti okvir koji postoji.",
    },
  },
  {
    id: "braced",
    nodes: [
      [90, 180],
      [250, 180],
      [250, 70],
      [90, 70],
    ],
    bars: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 2],
    ],
    rigid: true,
    sway: {},
    note: {
      en: "The same square with one diagonal. Two triangles, and the leaning stops.",
      hr: "Isti kvadrat s jednom dijagonalom. Dva trokuta i nakrivljivanja više nema.",
    },
  },
  {
    id: "pentagon",
    nodes: [
      [90, 180],
      [250, 180],
      [286, 108],
      [170, 52],
      [54, 108],
    ],
    bars: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
    rigid: false,
    sway: { 2: [292, 128], 3: [186, 60], 4: [58, 92] },
    note: {
      en: "More sides is not more strength. A five-sided frame needs two diagonals before it stops moving.",
      hr: "Više stranica ne znači više čvrstoće. Peterokutnom okviru trebaju dvije dijagonale da se prestane micati.",
    },
  },
  {
    id: "tower",
    nodes: [
      [110, 180],
      [230, 180],
      [230, 122],
      [110, 122],
      [230, 64],
      [110, 64],
    ],
    bars: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 2],
      [2, 4],
      [4, 5],
      [5, 3],
    ],
    rigid: false,
    sway: { 4: [258, 64], 5: [138, 64] },
    note: {
      en: "The bottom storey is braced and stays put. The unbraced one above it leans anyway, which is exactly how a tall building fails in an earthquake.",
      hr: "Donji je kat ukrućen i ostaje na mjestu. Gornji, neukrućeni, svejedno se nakrivi, a upravo tako visoka zgrada popušta u potresu.",
    },
  },
  {
    id: "house",
    nodes: [
      [90, 180],
      [250, 180],
      [250, 104],
      [90, 104],
      [170, 52],
    ],
    bars: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
      [4, 3],
    ],
    rigid: false,
    sway: { 2: [276, 104], 3: [116, 104], 4: [196, 52] },
    note: {
      en: "The roof is a perfect triangle and it survives. The square walls underneath it do not, so the whole house leans over with the roof still perfectly intact on top.",
      hr: "Krov je savršen trokut i on preživi. Kvadratni zidovi ispod njega ne prežive, pa se cijela kuća nakrivi s još uvijek netaknutim krovom na vrhu.",
    },
  },
];

/* ──────────────────────────────── the tool ───────────────────────────────── */

export default function TrussTester({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const [tab, setTab] = useState<Tab>("frame");

  /* frame tab */
  const [diagA, setDiagA] = useState(false);
  const [diagB, setDiagB] = useState(false);
  const [pushed, setPushed] = useState(false);

  /* bridge tab */
  const [bays, setBays] = useState<(null | "a" | "b")[]>(Array(BAYS).fill(null));
  const [loaded, setLoaded] = useState(false);

  /* quiz tab */
  const [qi, setQi] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [asked, setAsked] = useState(0);

  const chip = (active: boolean, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 font-sans text-sm font-semibold transition-colors ${
        active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  /* ───────────────────────────── frame tab ───────────────────────────────── */

  const braced = diagA || diagB;
  const k = pushed && !braced ? RACK : 0;
  /* Shear about the bottom edge: x → x + k(bottom − y). */
  const shear = `matrix(1,0,${-k},1,${k * SQ.bottom},0)`;
  const barCount = 4 + (diagA ? 1 : 0) + (diagB ? 1 : 0);
  const triCount = (diagA ? 2 : 0) + (diagB ? 2 : 0) || 0;

  const slot = (which: "a" | "b", on: boolean, toggle: () => void) => {
    const [x1, y1, x2, y2] =
      which === "a"
        ? [SQ.left, SQ.bottom, SQ.right, SQ.top]
        : [SQ.left, SQ.top, SQ.right, SQ.bottom];
    return (
      <g onClick={toggle} className="cursor-pointer" aria-hidden="true">
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={22} />
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={on ? "#D97706" : "#c7c0b0"}
          strokeWidth={on ? 7 : 3}
          strokeLinecap="round"
          strokeDasharray={on ? undefined : "7 8"}
        />
      </g>
    );
  };

  const frameTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.frameIntro}</p>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <svg viewBox="0 0 340 220" className="mx-auto block w-full max-w-md" role="img" aria-label={t.a11ySquare}>
          {/* ground */}
          <line x1={30} y1={190} x2={310} y2={190} stroke="#c7c0b0" strokeWidth={3} strokeLinecap="round" />
          {/* pushing hand */}
          <g style={{ transition: "transform 450ms ease-in-out" }} transform={`translate(${k * 120},0)`}>
            <line x1={SQ.left - 42} y1={SQ.top} x2={SQ.left - 12} y2={SQ.top} stroke="#FB6F52" strokeWidth={4} strokeLinecap="round" />
            <path d={`M ${SQ.left - 12} ${SQ.top} l -10 -6 v 12 z`} fill="#FB6F52" />
          </g>

          <g style={{ transition: "transform 450ms ease-in-out" }} transform={shear}>
            {/* the four bars */}
            <polygon
              points={`${SQ.left},${SQ.bottom} ${SQ.right},${SQ.bottom} ${SQ.right},${SQ.top} ${SQ.left},${SQ.top}`}
              fill={braced ? "#EEF2FF" : "#FFF7ED"}
              stroke="#4f46e5"
              strokeWidth={7}
              strokeLinejoin="round"
            />
            {slot("a", diagA, () => setDiagA((v) => !v))}
            {slot("b", diagB, () => setDiagB((v) => !v))}
            {/* joints */}
            {[
              [SQ.left, SQ.bottom],
              [SQ.right, SQ.bottom],
              [SQ.right, SQ.top],
              [SQ.left, SQ.top],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill="#fff" stroke="#312e81" strokeWidth={3} />
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setPushed((v) => !v)}
          className="rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          {pushed ? t.release : t.push}
        </button>
        <button
          type="button"
          onClick={() => setDiagA((v) => !v)}
          aria-pressed={diagA}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            diagA ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {diagA ? t.removeA : t.diagA}
        </button>
        <button
          type="button"
          onClick={() => setDiagB((v) => !v)}
          aria-pressed={diagB}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            diagB ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {diagB ? t.removeB : t.diagB}
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-400">{t.tapHint}</p>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
        <span>
          {t.joints}: <b className="text-gray-800">4</b>
        </span>
        <span>
          {t.bars}: <b className="text-gray-800">{barCount}</b>
        </span>
        <span>
          {t.triangles}: <b className="text-gray-800">{triCount}</b>
        </span>
      </div>

      {pushed && (
        <div
          className={`mt-4 rounded-xl px-4 py-3 ${braced ? "bg-emerald-50" : "bg-orange-50"}`}
          aria-live="polite"
        >
          <p className={`font-semibold ${braced ? "text-emerald-900" : "text-orange-900"}`}>
            {braced ? `✅ ${t.rigidTitle}` : `🫠 ${t.floppyTitle}`}
          </p>
          <p className={`mt-1 text-sm leading-relaxed ${braced ? "text-emerald-800" : "text-orange-800"}`}>
            {braced ? t.rigidBody : t.floppyBody}
          </p>
        </div>
      )}

      <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="font-semibold text-gray-800">{t.whyTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.whyBody}</p>
      </div>
    </div>
  );

  /* ───────────────────────────── bridge tab ──────────────────────────────── */

  const bracedCount = bays.filter(Boolean).length;
  const foldedCount = BAYS - bracedCount;
  const holds = foldedCount === 0;

  /* Each unbraced bay shears, and everything downstream of it slides along. */
  const topX = useMemo(() => {
    const out: number[] = [];
    let slide = 0;
    for (let i = 0; i <= BAYS; i++) {
      out.push(BRIDGE.x0 + i * BRIDGE.bayW + slide);
      if (loaded && i < BAYS && !bays[i]) slide += RACK * (BRIDGE.bottom - BRIDGE.top);
    }
    return out;
  }, [bays, loaded]);

  const botX = Array.from({ length: BAYS + 1 }, (_, i) => BRIDGE.x0 + i * BRIDGE.bayW);
  const sag = (i: number) => (loaded && !bays[i] ? 6 : 0);

  const bridgeTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.bridgeIntro}</p>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <svg viewBox="0 0 340 220" className="mx-auto block w-full max-w-md">
          {/* supports */}
          <line x1={10} y1={186} x2={330} y2={186} stroke="#c7c0b0" strokeWidth={3} strokeLinecap="round" />
          <path d={`M ${botX[0]} ${BRIDGE.bottom} l -14 18 h 28 z`} fill="#c7c0b0" />
          <path d={`M ${botX[BAYS]} ${BRIDGE.bottom} l -14 18 h 28 z`} fill="#c7c0b0" />

          {/* the truck */}
          {loaded && (
            <g>
              <rect x={150} y={BRIDGE.bottom - 30} width={44} height={20} rx={4} fill="#FB6F52" />
              <circle cx={160} cy={BRIDGE.bottom - 8} r={5} fill="#4b4a5a" />
              <circle cx={184} cy={BRIDGE.bottom - 8} r={5} fill="#4b4a5a" />
            </g>
          )}

          {/* bays */}
          {bays.map((d, i) => {
            const failed = loaded && !d;
            const stroke = failed ? "#EA580C" : "#4f46e5";
            const tl: Pt = [topX[i], BRIDGE.top + sag(i)];
            const tr: Pt = [topX[i + 1], BRIDGE.top + sag(i)];
            const bl: Pt = [botX[i], BRIDGE.bottom];
            const br: Pt = [botX[i + 1], BRIDGE.bottom];
            return (
              <g key={i} className={failed ? "animate-pulse" : undefined}>
                {/* clickable panel */}
                <polygon
                  points={`${bl[0]},${bl[1]} ${br[0]},${br[1]} ${tr[0]},${tr[1]} ${tl[0]},${tl[1]}`}
                  fill={d ? "#EEF2FF" : "#FFF7ED"}
                  stroke={stroke}
                  strokeWidth={5}
                  strokeLinejoin="round"
                  className="cursor-pointer"
                  onClick={() => {
                    setLoaded(false);
                    setBays((prev) =>
                      prev.map((v, j) => (j === i ? (v === null ? "a" : v === "a" ? "b" : null) : v)),
                    );
                  }}
                  aria-hidden="true"
                />
                {d && (
                  <line
                    x1={d === "a" ? bl[0] : tl[0]}
                    y1={d === "a" ? bl[1] : tl[1]}
                    x2={d === "a" ? tr[0] : br[0]}
                    y2={d === "a" ? tr[1] : br[1]}
                    stroke="#D97706"
                    strokeWidth={5}
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}

          {/* joints */}
          {topX.map((x, i) => (
            <circle key={`t${i}`} cx={x} cy={BRIDGE.top + sag(Math.min(i, BAYS - 1))} r={4.5} fill="#fff" stroke="#312e81" strokeWidth={2.5} />
          ))}
          {botX.map((x, i) => (
            <circle key={`b${i}`} cx={x} cy={BRIDGE.bottom} r={4.5} fill="#fff" stroke="#312e81" strokeWidth={2.5} />
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setLoaded(true)}
          disabled={loaded}
          className="rounded-full bg-indigo-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
        >
          🚚 {t.testLoad}
        </button>
        <button
          type="button"
          onClick={() => {
            setLoaded(false);
            setBays(Array(BAYS).fill(null));
          }}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
        >
          ↺ {t.clear}
        </button>
        <span className="text-sm text-gray-500">{t.used(bracedCount)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {bays.map((d, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={d !== null}
            onClick={() => {
              setLoaded(false);
              setBays((prev) =>
                prev.map((v, j) => (j === i ? (v === null ? "a" : v === "a" ? "b" : null) : v)),
              );
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              d ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.bayLabel(i + 1)} {d === "a" ? "╱" : d === "b" ? "╲" : "·"}
          </button>
        ))}
      </div>

      {loaded && (
        <div className={`mt-4 rounded-xl px-4 py-3 ${holds ? "bg-emerald-50" : "bg-orange-50"}`} aria-live="polite">
          <p className={`font-semibold ${holds ? "text-emerald-900" : "text-orange-900"}`}>
            {holds ? `✅ ${t.passTitle}` : `🫠 ${t.failTitle(foldedCount)}`}
          </p>
          <p className={`mt-1 text-sm leading-relaxed ${holds ? "text-emerald-800" : "text-orange-800"}`}>
            {holds ? t.passBody : t.failBody}
          </p>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-gray-400">{t.directionNote}</p>
    </div>
  );

  /* ────────────────────────────── quiz tab ───────────────────────────────── */

  const frame = FRAMES[qi];
  const need = 2 * frame.nodes.length - 3;
  const shown = answered !== null;
  const pos = (i: number): Pt =>
    shown && !frame.rigid && frame.sway[i] ? frame.sway[i] : frame.nodes[i];

  const answer = (saidRigid: boolean) => {
    if (answered !== null) return;
    const correct = saidRigid === frame.rigid;
    setAnswered(correct);
    setAsked((a) => a + 1);
    if (correct) setRight((r) => r + 1);
  };

  const quizTab = (
    <div>
      <p className="text-sm leading-relaxed text-gray-600">{t.quizIntro}</p>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <svg viewBox="0 0 340 220" className="mx-auto block w-full max-w-md">
          <line x1={30} y1={192} x2={310} y2={192} stroke="#c7c0b0" strokeWidth={3} strokeLinecap="round" />
          {frame.bars.map(([a, b], i) => {
            const [x1, y1] = pos(a);
            const [x2, y2] = pos(b);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={shown ? (frame.rigid ? "#059669" : "#EA580C") : "#4f46e5"}
                strokeWidth={7}
                strokeLinecap="round"
                style={{ transition: "all 450ms ease-in-out" }}
              />
            );
          })}
          {frame.nodes.map((_, i) => {
            const [cx, cy] = pos(i);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={6}
                fill="#fff"
                stroke="#312e81"
                strokeWidth={3}
                style={{ transition: "all 450ms ease-in-out" }}
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
        <span>
          {t.joints}: <b className="text-gray-800">{frame.nodes.length}</b>
        </span>
        <span>
          {t.bars}: <b className="text-gray-800">{frame.bars.length}</b>
        </span>
      </div>

      {!shown ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => answer(true)}
            className="rounded-full bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            {t.isRigid}
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            className="rounded-full bg-gray-200 px-6 py-2.5 font-semibold text-gray-800 hover:bg-gray-300"
          >
            {t.isFloppy}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div className={`rounded-xl px-4 py-3 ${answered ? "bg-emerald-50" : "bg-orange-50"}`} aria-live="polite">
            <p className={`font-semibold ${answered ? "text-emerald-900" : "text-orange-900"}`}>
              {answered ? `✅ ${t.right}` : `🤔 ${t.nope}`}
            </p>
            <p className={`mt-1 text-sm leading-relaxed ${answered ? "text-emerald-800" : "text-orange-800"}`}>
              {t.countRule(frame.nodes.length, need, frame.bars.length)} {frame.note[lang]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setQi((i) => (i + 1) % FRAMES.length);
              setAnswered(null);
            }}
            className="mt-3 rounded-full bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            {t.next} →
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {t.score}:{" "}
        <b className="text-gray-800">
          {right} / {asked}
        </b>
      </div>

      <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="font-semibold text-gray-800">{t.ruleTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{t.ruleBody}</p>
      </div>
    </div>
  );

  /* ─────────────────────────────── shell ─────────────────────────────────── */

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-wrap gap-2">
        {chip(tab === "frame", t.tabFrame, () => setTab("frame"))}
        {chip(tab === "bridge", t.tabBridge, () => setTab("bridge"))}
        {chip(tab === "quiz", t.tabQuiz, () => setTab("quiz"))}
      </div>

      <div className="mt-5">{tab === "frame" ? frameTab : tab === "bridge" ? bridgeTab : quizTab}</div>
    </div>
  );
}
