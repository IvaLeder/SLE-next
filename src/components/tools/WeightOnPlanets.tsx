"use client";

import { useState } from "react";

type Lang = "en" | "hr";

/**
 * Surface gravity relative to Earth, from each body's mass and its equatorial
 * radius (for the gas giants, the radius at the 1 bar pressure level — they
 * have no solid surface to stand on). Earth = 1 by definition, 9.81 m/s².
 *
 * Note this is *gravity*, not what a scale reads while the planet spins under
 * you. Saturn is the one place the difference is big enough to notice: its
 * gravity is 1.06 g, but at the fast-spinning equator a scale would read about
 * 0.91 g. We use the plain gravity figure because that is what every reference
 * table a teacher checks against will show.
 */
interface World {
  id: string;
  /** surface gravity, Earth = 1 */
  g: number;
  /** disc colour */
  c: string;
  /** true for bodies with no surface you could ever stand on */
  noSurface?: boolean;
}

const WORLDS: World[] = [
  { id: "mercury", g: 0.38, c: "#9a8f86" },
  { id: "venus", g: 0.9, c: "#d9a441" },
  { id: "earth", g: 1, c: "#3b82c4" },
  { id: "moon", g: 0.17, c: "#b7b3ad" },
  { id: "mars", g: 0.38, c: "#c4573a" },
  { id: "jupiter", g: 2.53, c: "#c98b5e", noSurface: true },
  { id: "saturn", g: 1.06, c: "#dcc08a", noSurface: true },
  { id: "uranus", g: 0.9, c: "#8ec9d4", noSurface: true },
  { id: "neptune", g: 1.14, c: "#4a6fc4", noSurface: true },
];

const EXTRAS: World[] = [
  { id: "pluto", g: 0.06, c: "#c8b7a6" },
  { id: "ceres", g: 0.03, c: "#a5a09a" },
  { id: "titan", g: 0.14, c: "#d7a15c" },
  { id: "europa", g: 0.13, c: "#e4ddd0" },
  { id: "sun", g: 27.9, c: "#f0a92b", noSurface: true },
  { id: "neutron", g: 2e11, c: "#6d63d8", noSurface: true },
];

/** Bars are drawn against Jupiter, the heaviest pull you could almost stand in. */
const BAR_MAX = 2.53;

/** A typical standing jump for a child, in metres. Used for the jump line. */
const EARTH_JUMP_M = 0.4;

const NAMES: Record<Lang, Record<string, string>> = {
  en: {
    mercury: "Mercury",
    venus: "Venus",
    earth: "Earth",
    moon: "The Moon",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    uranus: "Uranus",
    neptune: "Neptune",
    pluto: "Pluto",
    ceres: "Ceres",
    titan: "Titan",
    europa: "Europa",
    sun: "The Sun",
    neutron: "A neutron star",
  },
  hr: {
    mercury: "Merkur",
    venus: "Venera",
    earth: "Zemlja",
    moon: "Mjesec",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    uranus: "Uran",
    neptune: "Neptun",
    pluto: "Pluton",
    ceres: "Ceres",
    titan: "Titan",
    europa: "Europa",
    sun: "Sunce",
    neutron: "Neutronska zvijezda",
  },
};

/** One short line per world, shown under the numbers. */
const FACTS: Record<Lang, Record<string, string>> = {
  en: {
    mercury: "Small and rocky, so it barely holds on to you.",
    venus: "Almost exactly Earth's size, so almost exactly Earth's pull.",
    earth: "Home. Everything here is measured against this one.",
    moon: "The astronauts bunny-hopped because walking normally was harder than jumping.",
    mars: "The same pull as Mercury, from a planet nearly three times wider.",
    jupiter: "There is no ground here. This is the pull at the top of the clouds.",
    saturn: "A hair more than Earth, even though Saturn is the least dense planet of all.",
    uranus: "A giant that pulls slightly less than Earth, because you would be so far from its centre.",
    neptune: "The strongest pull of any planet except Jupiter.",
    pluto: "A good jump here would send you two storeys up.",
    ceres: "The biggest object in the asteroid belt, and still barely holds you down.",
    titan: "Saturn's big moon, with thick air and lakes of liquid methane.",
    europa: "An icy moon of Jupiter with a salty ocean underneath.",
    sun: "Not a place with a surface. This is the pull at the top of the glowing gas.",
    neutron: "A dead star's core, squeezed so hard that a sugar cube of it would weigh as much as a mountain.",
  },
  hr: {
    mercury: "Malen i stjenovit, pa vas jedva drži.",
    venus: "Gotovo iste veličine kao Zemlja, pa i gotovo jednako privlači.",
    earth: "Dom. Sve ostalo mjerimo prema njoj.",
    moon: "Astronauti su skakutali jer je normalno hodanje bilo teže od skakanja.",
    mars: "Jednaka privlačnost kao na Merkuru, s planeta gotovo tri puta šireg.",
    jupiter: "Ovdje nema tla. Ovo je privlačnost na vrhu oblaka.",
    saturn: "Mrvicu jača nego na Zemlji, iako je Saturn planet najmanje gustoće.",
    uranus: "Div koji privlači nešto slabije od Zemlje jer biste bili jako daleko od njegova središta.",
    neptune: "Najjača privlačnost od svih planeta osim Jupitera.",
    pluto: "Dobar skok ovdje odveo bi vas do visine drugog kata.",
    ceres: "Najveće tijelo u asteroidnom pojasu, a jedva vas drži pri tlu.",
    titan: "Saturnov veliki mjesec, s gustim zrakom i jezerima tekućeg metana.",
    europa: "Ledeni Jupiterov mjesec sa slanim oceanom ispod površine.",
    sun: "Nije mjesto s površinom. Ovo je privlačnost na vrhu užarenog plina.",
    neutron: "Jezgra mrtve zvijezde, stisnuta toliko da bi kockica šećera od nje težila kao planina.",
  },
};

const COPY = {
  en: {
    label: "How much do you weigh?",
    unitKg: "kg",
    unitLb: "lb",
    showMore: "Show more worlds",
    hideMore: "Hide the extra worlds",
    lighter: "lighter than on Earth",
    heavier: "heavier than on Earth",
    same: "the same as on Earth",
    jump: "jump",
    offChart: "off the chart",
    noSurface: "no solid ground",
    hereYouAre: "you are here",
    footnote:
      "Your body never changes. What changes is how hard each world pulls on it, which is what a bathroom scale actually measures. Scientists say your mass stays the same while your weight changes.",
    jumpNote:
      "Jump heights assume a standing jump of 40 cm on Earth, which is about right for a child.",
    empty: "Type a number to see yourself land on nine worlds at once.",
    ratio: (n: string) => `${n}× Earth`,
    tonnes: "tonnes",
  },
  hr: {
    label: "Koliko ste teški?",
    unitKg: "kg",
    unitLb: "lb",
    showMore: "Prikaži još svjetova",
    hideMore: "Sakrij dodatne svjetove",
    lighter: "lakše nego na Zemlji",
    heavier: "teže nego na Zemlji",
    same: "isto kao na Zemlji",
    jump: "skok",
    offChart: "izvan ljestvice",
    noSurface: "nema čvrstog tla",
    hereYouAre: "vi ste ovdje",
    footnote:
      "Vaše se tijelo ne mijenja. Mijenja se koliko ga jako svaki svijet privlači, a upravo to vaga i mjeri. Znanstvenici kažu da masa ostaje ista, a težina se mijenja.",
    jumpNote:
      "Visine skoka računaju se za skok s mjesta od 40 cm na Zemlji, što je otprilike dječji skok.",
    empty: "Upišite broj i vidite se odjednom na devet svjetova.",
    ratio: (n: string) => `${n}× Zemlja`,
    tonnes: "tona",
  },
} as const;

const LB_PER_KG = 2.20462;

export default function WeightOnPlanets({ lang = "en" }: { lang?: Lang }) {
  const t = COPY[lang];
  const locale = lang === "hr" ? "hr-HR" : "en-US";
  const [input, setInput] = useState("30");
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [showExtras, setShowExtras] = useState(false);

  const earthWeight = Number(input.replace(",", "."));
  const valid = Number.isFinite(earthWeight) && earthWeight > 0;

  /** Weight on a world, in whatever unit the user picked. */
  function weightText(g: number): string {
    const w = earthWeight * g;
    // A neutron star runs past any sensible unit, so switch to tonnes.
    if (w >= 1e6) {
      const tonnes = (unit === "kg" ? w : w / LB_PER_KG) / 1000;
      return `${tonnes.toLocaleString(locale, { maximumSignificantDigits: 3 })} ${t.tonnes}`;
    }
    const digits = w < 10 ? 1 : 0;
    return `${w.toLocaleString(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })} ${unit === "kg" ? t.unitKg : t.unitLb}`;
  }

  /** "3.4 m" / "12 cm" — the jump line, which is the fun half of the result. */
  function jumpText(g: number): string {
    const metres = EARTH_JUMP_M / g;
    if (metres < 1) {
      return `${Math.round(metres * 100).toLocaleString(locale)} cm`;
    }
    return `${metres.toLocaleString(locale, { maximumFractionDigits: 1 })} m`;
  }

  function ratioText(g: number): string {
    const digits = g < 10 ? 2 : 0;
    return t.ratio(
      g.toLocaleString(locale, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    );
  }

  function comparison(g: number): string {
    if (Math.abs(g - 1) < 0.02) return t.same;
    return g < 1 ? t.lighter : t.heavier;
  }

  function card(w: World) {
    const isEarth = w.id === "earth";
    const pct = Math.min(100, (w.g / BAR_MAX) * 100);
    const over = w.g > BAR_MAX;

    return (
      <li
        key={w.id}
        className={`rounded-xl border p-4 ${
          isEarth ? "border-brand bg-brand-soft" : "border-gray-100 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-8 shrink-0 rounded-full shadow-inner"
            style={{ background: `radial-gradient(circle at 32% 30%, #ffffff55, ${w.c})` }}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{NAMES[lang][w.id]}</p>
            {isEarth && (
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                {t.hereYouAre}
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">
          {valid ? weightText(w.g) : "—"}
        </p>
        <p className="text-xs text-gray-500">
          {ratioText(w.g)}
          {!isEarth && ` · ${comparison(w.g)}`}
        </p>

        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: w.c }}
          />
        </div>

        <p className="mt-2.5 text-xs text-gray-600">
          <span aria-hidden="true">🦘</span> {t.jump} {valid ? jumpText(w.g) : "—"}
          {over && <span className="text-gray-400"> · {t.offChart}</span>}
          {w.noSurface && <span className="text-gray-400"> · {t.noSurface}</span>}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-gray-500">{FACTS[lang][w.id]}</p>
      </li>
    );
  }

  return (
    <div className="not-prose rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="wop-weight"
            className="block text-sm font-medium text-gray-600"
          >
            {t.label}
          </label>
          <input
            id="wop-weight"
            type="number"
            min="1"
            max="500"
            inputMode="decimal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1 w-32 rounded-lg border border-gray-300 px-3 py-2 text-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div
          role="group"
          aria-label={`${t.unitKg} / ${t.unitLb}`}
          className="mb-1 inline-flex overflow-hidden rounded-lg border border-gray-300"
        >
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                unit === u
                  ? "bg-brand text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {u === "kg" ? t.unitKg : t.unitLb}
            </button>
          ))}
        </div>
      </div>

      {!valid && <p className="mt-3 text-sm text-gray-500">{t.empty}</p>}

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDS.map(card)}
      </ul>

      <button
        type="button"
        onClick={() => setShowExtras((v) => !v)}
        aria-expanded={showExtras}
        className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        {showExtras ? t.hideMore : t.showMore}
      </button>

      {showExtras && (
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXTRAS.map(card)}
        </ul>
      )}

      <p className="mt-5 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
        {t.footnote}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-gray-400">{t.jumpNote}</p>
    </div>
  );
}
