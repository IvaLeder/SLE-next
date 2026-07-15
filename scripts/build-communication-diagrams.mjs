#!/usr/bin/env node
/**
 * build-communication-diagrams.mjs — renders the two article diagrams for the
 * "history of communication" post to PNG (EN + HR), the same SVG -> sharp
 * pipeline used for the other article diagrams.
 *
 *   1. communication-timeline  — the six milestones from smoke signals to the
 *      internet, on a "farther and faster over time" arrow.
 *   2. communication-model     — the shared recipe every method follows:
 *      sender -> signal -> channel -> receiver, with one shared code.
 *
 * Usage:  node scripts/build-communication-diagrams.mjs
 *
 * Output: public/images/posts/communication-{timeline,model}-{en,hr}.png
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/images/posts");
const SCALE = 2; // render at 2x for crisp retina assets; pipeline optimises later

const FONT = "'Trebuchet MS','Segoe UI',Helvetica,Arial,sans-serif";
const INK = "#2c2940";
const MUTE = "#6b6880";
const HAIR = "#E4E0D6";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Per-stage colour: [strong stroke/icon, soft tint fill].
const HUES = {
  coral: ["#E05A34", "#FBE7DF"],
  amber: ["#D98A0E", "#FBEFD8"],
  teal: ["#14A098", "#DBF1EF"],
  blue: ["#2F7FD0", "#E2EFFB"],
  purple: ["#6D63D8", "#ECEAFB"],
  indigo: ["#4F46E5", "#E7E5FB"],
};

/* ---- timeline icons (drawn around a centre cx,cy, colour = strong hue) ---- */
const icons = {
  fire: (cx, cy, c) => `
    <path d="M ${cx - 34},${cy + 34} q 34,-14 68,0" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity="0.4"/>
    <path d="M ${cx},${cy + 30} C ${cx - 26},${cy + 10} ${cx - 16},${cy - 14} ${cx},${cy - 30} C ${cx + 16},${cy - 14} ${cx + 26},${cy + 10} ${cx},${cy + 30} Z" fill="${c}"/>
    <path d="M ${cx},${cy + 22} C ${cx - 12},${cy + 8} ${cx - 7},${cy - 6} ${cx},${cy - 16} C ${cx + 7},${cy - 6} ${cx + 12},${cy + 8} ${cx},${cy + 22} Z" fill="#FFFFFF" opacity="0.6"/>`,
  envelope: (cx, cy, c) => `
    <rect x="${cx - 34}" y="${cy - 24}" width="68" height="48" rx="7" fill="#FFFFFF" stroke="${c}" stroke-width="4"/>
    <path d="M ${cx - 34},${cy - 20} L ${cx},${cy + 6} L ${cx + 34},${cy - 20}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`,
  morse: (cx, cy, c) => `
    <circle cx="${cx - 36}" cy="${cy - 12}" r="7" fill="${c}"/>
    <rect x="${cx - 18}" y="${cy - 18}" width="30" height="12" rx="6" fill="${c}"/>
    <circle cx="${cx + 30}" cy="${cy - 12}" r="7" fill="${c}"/>
    <rect x="${cx - 28}" y="${cy + 10}" width="30" height="12" rx="6" fill="${c}"/>
    <circle cx="${cx + 16}" cy="${cy + 16}" r="7" fill="${c}"/>`,
  phone: (cx, cy, c) => `
    <line x1="${cx - 14}" y1="${cy - 14}" x2="${cx + 14}" y2="${cy + 14}" stroke="${c}" stroke-width="13" stroke-linecap="round"/>
    <circle cx="${cx - 20}" cy="${cy - 20}" r="13" fill="${c}"/>
    <circle cx="${cx + 20}" cy="${cy + 20}" r="13" fill="${c}"/>`,
  radio: (cx, cy, c) => {
    const ox = cx, oy = cy + 20;
    const arc = (R) => {
      const x0 = ox - 0.866 * R, y0 = oy - 0.5 * R;
      const x1 = ox + 0.866 * R, y1 = oy - 0.5 * R;
      return `<path d="M ${x0.toFixed(1)},${y0.toFixed(1)} A ${R},${R} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
    };
    return `<circle cx="${ox}" cy="${oy}" r="7" fill="${c}"/>${arc(20)}${arc(34)}${arc(48)}`;
  },
  globe: (cx, cy, c) => `
    <circle cx="${cx}" cy="${cy}" r="34" fill="#FFFFFF" stroke="${c}" stroke-width="4"/>
    <ellipse cx="${cx}" cy="${cy}" rx="34" ry="13" fill="none" stroke="${c}" stroke-width="3.5"/>
    <ellipse cx="${cx}" cy="${cy}" rx="13" ry="34" fill="none" stroke="${c}" stroke-width="3.5"/>
    <line x1="${cx - 34}" y1="${cy}" x2="${cx + 34}" y2="${cy}" stroke="${c}" stroke-width="3"/>`,
};

const TIMELINE = {
  en: {
    title: "How messages have travelled through history",
    stages: [
      { hue: "coral", icon: "fire", label: "Smoke & fire", cap: "seen far away" },
      { hue: "amber", icon: "envelope", label: "Letters & post", cap: "a written note" },
      { hue: "teal", icon: "morse", label: "Telegraph", cap: "dots & dashes" },
      { hue: "blue", icon: "phone", label: "Telephone", cap: "send your voice" },
      { hue: "purple", icon: "radio", label: "Radio", cap: "through the air" },
      { hue: "indigo", icon: "globe", label: "Internet", cap: "1s and 0s" },
    ],
    past: "long ago",
    now: "today",
    foot: "Each new way reached farther and arrived faster",
  },
  hr: {
    title: "Kako su poruke putovale kroz povijest",
    stages: [
      { hue: "coral", icon: "fire", label: "Dim i vatra", cap: "vidi se izdaleka" },
      { hue: "amber", icon: "envelope", label: "Pisma i pošta", cap: "pisana poruka" },
      { hue: "teal", icon: "morse", label: "Telegraf", cap: "točke i crtice" },
      { hue: "blue", icon: "phone", label: "Telefon", cap: "šalje vaš glas" },
      { hue: "purple", icon: "radio", label: "Radio", cap: "kroz zrak" },
      { hue: "indigo", icon: "globe", label: "Internet", cap: "jedinice i nule" },
    ],
    past: "nekad",
    now: "danas",
    foot: "Svaki novi način dopirao je dalje i stizao brže",
  },
};

function timelineSvg(lang) {
  const t = TIMELINE[lang];
  const W = 1500, H = 690, cy = 300, r = 66;
  const xs = t.stages.map((_, i) => Math.round(90 + (i + 0.5) * ((W - 180) / 6)));
  const line = `<line x1="${xs[0]}" y1="${cy}" x2="${xs[5]}" y2="${cy}" stroke="${HAIR}" stroke-width="4"/>`;
  const stages = t.stages
    .map((s, i) => {
      const cx = xs[i];
      const [strong, tint] = HUES[s.hue];
      return `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${tint}" stroke="${strong}" stroke-width="3.5"/>
        ${icons[s.icon](cx, cy, strong)}
        <text x="${cx}" y="${cy + r + 40}" text-anchor="middle" font-size="26" font-weight="700" fill="${INK}" font-family="${FONT}">${esc(s.label)}</text>
        <text x="${cx}" y="${cy + r + 72}" text-anchor="middle" font-size="20" fill="${MUTE}" font-family="${FONT}">${esc(s.cap)}</text>`;
    })
    .join("");
  const arrowY = 585;
  const arrow = `
    <line x1="150" y1="${arrowY}" x2="1338" y2="${arrowY}" stroke="#C6C1D2" stroke-width="4" stroke-linecap="round"/>
    <path d="M 1338,${arrowY - 10} L 1356,${arrowY} L 1338,${arrowY + 10} Z" fill="#C6C1D2"/>
    <text x="150" y="${arrowY - 16}" font-size="21" font-weight="700" fill="${MUTE}" font-family="${FONT}">${esc(t.past)}</text>
    <text x="1356" y="${arrowY - 16}" text-anchor="end" font-size="21" font-weight="700" fill="${MUTE}" font-family="${FONT}">${esc(t.now)}</text>
    <text x="${W / 2}" y="${arrowY + 74}" text-anchor="middle" font-size="23" fill="${INK}" font-family="${FONT}">${esc(t.foot)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}">
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="26" fill="#FFFDF9" stroke="${HAIR}" stroke-width="2"/>
    <text x="${W / 2}" y="70" text-anchor="middle" font-size="34" font-weight="800" fill="${INK}" font-family="${FONT}">${esc(t.title)}</text>
    ${line}${stages}${arrow}
  </svg>`;
}

/* ---- model diagram ---- */
const MODEL = {
  en: {
    title: "Every message works the same way",
    sender: "Sender", senderSub: "has a message",
    receiver: "Receiver", receiverSub: "reads the message",
    encode: ["Turn it into", "a signal"],
    channelTitle: "Channel",
    channelSub: "air · wire · ocean",
    decode: ["Turn it back", "into the message"],
    ribbon: "Both sides share the same code",
  },
  hr: {
    title: "Svaka poruka radi na isti način",
    sender: "Pošiljatelj", senderSub: "ima poruku",
    receiver: "Primatelj", receiverSub: "čita poruku",
    encode: ["Pretvori u", "signal"],
    channelTitle: "Kanal",
    channelSub: "zrak · žica · ocean",
    decode: ["Vrati natrag", "u poruku"],
    ribbon: "Obje strane dijele isti kod",
  },
};

const person = (cx, cy, strong, tint) => `
  <circle cx="${cx}" cy="${cy}" r="58" fill="${tint}" stroke="${strong}" stroke-width="3.5"/>
  <circle cx="${cx}" cy="${cy - 14}" r="15" fill="${strong}"/>
  <path d="M ${cx - 26},${cy + 30} a 26,23 0 0 1 52,0 Z" fill="${strong}"/>`;
const bulb = (cx, cy, c) => `
  <circle cx="${cx}" cy="${cy}" r="13" fill="#FFFFFF" stroke="${c}" stroke-width="3.5"/>
  <rect x="${cx - 6}" y="${cy + 11}" width="12" height="7" rx="2" fill="${c}"/>`;
const dotdash = (cx, cy, c) => `
  <circle cx="${cx - 12}" cy="${cy}" r="5.5" fill="${c}"/>
  <rect x="${cx - 1}" y="${cy - 4.5}" width="22" height="9" rx="4.5" fill="${c}"/>`;
const miniArrow = (cx, cy) => `
  <path d="M ${cx - 9},${cy} L ${cx + 9},${cy} M ${cx + 2},${cy - 6} L ${cx + 9},${cy} L ${cx + 2},${cy + 6}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
const bigArrow = (x1, x2, y) => `
  <line x1="${x1}" y1="${y}" x2="${x2 - 12}" y2="${y}" stroke="#B9B4C7" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M ${x2 - 18},${y - 10} L ${x2},${y} L ${x2 - 18},${y + 10} Z" fill="#B9B4C7"/>`;

function card(cx, cy, w, h, strong, tint, lines, iconFrag) {
  const x = cx - w / 2, y = cy - h / 2;
  const text = lines
    .map((ln, i) => `<text x="${cx}" y="${cy + 30 + i * 30}" text-anchor="middle" font-size="22" font-weight="700" fill="${INK}" font-family="${FONT}">${esc(ln)}</text>`)
    .join("");
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${tint}" stroke="${strong}" stroke-width="3"/>
    ${iconFrag(cx, cy - h / 2 + 42)}
    ${text}`;
}

function modelSvg(lang) {
  const t = MODEL[lang];
  const W = 1500, H = 660, cy = 300;
  const [bStrong, bTint] = HUES.indigo;
  const [tStrong, tTint] = HUES.teal;
  const [pStrong, pTint] = HUES.purple;
  const xs = [210, 480, 750, 1020, 1290];
  const cw = 210, ch = 150;

  const encodeIcon = (cx, cy) => `${bulb(cx - 34, cy, tStrong)}${miniArrow(cx, cy)}${dotdash(cx + 22, cy, tStrong)}`;
  const decodeIcon = (cx, cy) => `${dotdash(cx - 34, cy, tStrong)}${miniArrow(cx, cy)}${bulb(cx + 30, cy, tStrong)}`;
  const channelIcon = (cx, cy) => `
    <path d="M ${cx - 78},${cy + 6} q 19.5,-20 39,0 t 39,0 t 39,0 t 39,0" fill="none" stroke="${tStrong}" stroke-width="3.5"/>
    <circle cx="${cx - 30}" cy="${cy - 8}" r="5" fill="${tStrong}"/>
    <rect x="${cx + 6}" y="${cy - 12}" width="20" height="8" rx="4" fill="${tStrong}"/>`;

  const nodes = `
    ${person(xs[0], cy, pStrong, pTint)}
    <text x="${xs[0]}" y="${cy + 92}" text-anchor="middle" font-size="26" font-weight="700" fill="${INK}" font-family="${FONT}">${esc(t.sender)}</text>
    <text x="${xs[0]}" y="${cy + 122}" text-anchor="middle" font-size="19" fill="${MUTE}" font-family="${FONT}">${esc(t.senderSub)}</text>
    ${card(xs[1], cy, cw, ch, tStrong, tTint, t.encode, encodeIcon)}
    ${card(xs[2], cy, cw, ch, bStrong, bTint, [t.channelTitle], (cx, cyy) => channelIcon(cx, cyy))}
    <text x="${xs[2]}" y="${cy + 62}" text-anchor="middle" font-size="18" fill="${MUTE}" font-family="${FONT}">${esc(t.channelSub)}</text>
    ${card(xs[3], cy, cw, ch, tStrong, tTint, t.decode, decodeIcon)}
    ${person(xs[4], cy, pStrong, pTint)}
    <text x="${xs[4]}" y="${cy + 92}" text-anchor="middle" font-size="26" font-weight="700" fill="${INK}" font-family="${FONT}">${esc(t.receiver)}</text>
    <text x="${xs[4]}" y="${cy + 122}" text-anchor="middle" font-size="19" fill="${MUTE}" font-family="${FONT}">${esc(t.receiverSub)}</text>`;

  const arrows = `
    ${bigArrow(xs[0] + 62, xs[1] - cw / 2 - 8, cy)}
    ${bigArrow(xs[1] + cw / 2 + 8, xs[2] - cw / 2 - 8, cy)}
    ${bigArrow(xs[2] + cw / 2 + 8, xs[3] - cw / 2 - 8, cy)}
    ${bigArrow(xs[3] + cw / 2 + 8, xs[4] - 62, cy)}`;

  const ribX = xs[1] - cw / 2, ribW = xs[3] + cw / 2 - ribX, ribY = 468;
  const ribbon = `
    <rect x="${ribX}" y="${ribY}" width="${ribW}" height="60" rx="30" fill="${bTint}" stroke="${bStrong}" stroke-width="2.5"/>
    <text x="${(ribX + ribX + ribW) / 2}" y="${ribY + 38}" text-anchor="middle" font-size="24" font-weight="700" fill="${bStrong}" font-family="${FONT}">${esc(t.ribbon)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}">
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="26" fill="#FFFDF9" stroke="${HAIR}" stroke-width="2"/>
    <text x="${W / 2}" y="70" text-anchor="middle" font-size="34" font-weight="800" fill="${INK}" font-family="${FONT}">${esc(t.title)}</text>
    ${arrows}${nodes}${ribbon}
  </svg>`;
}

/* ---- cover illustration (text-free, 16:9, serves both languages) ---- */
function cloud(cx, cy, s) {
  return `<g fill="#FFFFFF" opacity="0.85">
    <ellipse cx="${cx}" cy="${cy}" rx="${38 * s}" ry="${22 * s}"/>
    <ellipse cx="${cx - 34 * s}" cy="${cy + 8 * s}" rx="${26 * s}" ry="${17 * s}"/>
    <ellipse cx="${cx + 34 * s}" cy="${cy + 8 * s}" rx="${28 * s}" ry="${18 * s}"/></g>`;
}

function coverSvg() {
  const W = 1600, H = 900;
  const defs = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E9EEFF"/><stop offset="0.6" stop-color="#F4EFFB"/><stop offset="1" stop-color="#FFF2E7"/>
    </linearGradient>
    <linearGradient id="thread" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#E0603A"/><stop offset="1" stop-color="#5B4FD0"/>
    </linearGradient>
  </defs>`;

  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    return `<line x1="${(250 + 82 * Math.cos(a)).toFixed(1)}" y1="${(240 + 82 * Math.sin(a)).toFixed(1)}" x2="${(250 + 100 * Math.cos(a)).toFixed(1)}" y2="${(240 + 100 * Math.sin(a)).toFixed(1)}" stroke="#FBC15E" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`;
  }).join("");
  const sun = `<circle cx="250" cy="240" r="98" fill="#FBD89A" opacity="0.35"/>${rays}<circle cx="250" cy="240" r="66" fill="#FBC15E"/>`;
  const stars = `<g fill="#B7A9E8">
    <circle cx="1160" cy="120" r="4"/><circle cx="1300" cy="82" r="3"/><circle cx="1420" cy="150" r="4.5"/><circle cx="1240" cy="205" r="3"/></g>`;
  const thread = `
    <path d="M 250,250 Q 800,70 1330,250" fill="none" stroke="url(#thread)" stroke-width="5" stroke-linecap="round" stroke-dasharray="5 13 22 13" opacity="0.9"/>
    <g transform="translate(795,104) rotate(11)"><path d="M -24,-9 L 24,0 L -24,11 L -15,1 Z" fill="#5B4FD0"/><path d="M -15,1 L 24,0 L -7,9 Z" fill="#3F34A0"/></g>`;

  const hills = `
    <path d="M 0,650 C 320,600 620,668 900,620 C 1180,574 1420,624 1600,606 L 1600,900 L 0,900 Z" fill="#D6EBDA"/>
    <path d="M 0,704 C 360,662 720,720 1060,676 C 1330,642 1500,700 1600,686 L 1600,900 L 0,900 Z" fill="#B4DEC2"/>`;

  const shadow = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${Math.round(rx * 0.24)}" fill="#8FBEA3" opacity="0.5"/>`;

  const beacon = `<g transform="translate(190,672)">
    ${shadow(0, 6, 46)}
    <path d="M -16,0 L 16,0 L 11,-20 L -11,-20 Z" fill="#8A6A52"/>
    <path d="M -13,-20 L 13,-20" stroke="#6F5340" stroke-width="4" stroke-linecap="round"/>
    <path d="M 0,-24 C -18,-40 -10,-58 0,-76 C 10,-58 18,-40 0,-24 Z" fill="#E0603A"/>
    <path d="M 0,-30 C -9,-42 -5,-54 0,-66 C 5,-54 9,-42 0,-30 Z" fill="#FBC15E"/>
    <path d="M 5,-80 q -11,-9 0,-18 q 11,-9 0,-18" fill="none" stroke="#C9C2D8" stroke-width="4" stroke-linecap="round" opacity="0.65"/></g>`;

  const letter = `<g transform="translate(445,604)">
    <path d="M -78,44 q 22,-7 48,-16" stroke="#E0910E" stroke-width="3" stroke-dasharray="2 10" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M -25,-1 q -22,-11 -34,4 q 20,5 34,3 Z" fill="#F4D9A0"/>
    <path d="M 25,-1 q 22,-11 34,4 q -20,5 -34,3 Z" fill="#F4D9A0"/>
    <rect x="-27" y="-17" width="54" height="35" rx="5" fill="#FFFFFF" stroke="#E0910E" stroke-width="4"/>
    <path d="M -27,-13 L 0,6 L 27,-13" fill="none" stroke="#E0910E" stroke-width="4" stroke-linejoin="round"/></g>`;

  const pole = `<g transform="translate(690,672)">
    <path d="M -30,-118 Q -130,-98 -215,-122" stroke="#1F9E86" stroke-width="2.5" fill="none" opacity="0.6"/>
    <path d="M 30,-118 Q 130,-98 215,-122" stroke="#1F9E86" stroke-width="2.5" fill="none" opacity="0.6"/>
    <rect x="-5" y="-128" width="10" height="132" rx="2" fill="#7C6A58"/>
    <rect x="-36" y="-118" width="72" height="8" rx="3" fill="#6F5340"/>
    <rect x="-30" y="-94" width="60" height="8" rx="3" fill="#6F5340"/>
    <circle cx="-28" cy="-120" r="4" fill="#1F9E86"/><circle cx="28" cy="-120" r="4" fill="#1F9E86"/>
    <circle cx="-22" cy="-96" r="4" fill="#1F9E86"/><circle cx="22" cy="-96" r="4" fill="#1F9E86"/>
    <circle cx="78" cy="-112" r="4" fill="#1F9E86"/><rect x="100" y="-115" width="18" height="7" rx="3.5" fill="#1F9E86"/></g>`;

  const phone = `<g transform="translate(952,672)">
    ${shadow(0, 4, 46)}
    <path d="M -40,-4 L 40,-4 L 34,-42 L -34,-42 Z" fill="#2F7FD0"/>
    <circle cx="0" cy="-23" r="14" fill="#EAF2FB"/><circle cx="0" cy="-23" r="6" fill="#2F7FD0"/>
    <rect x="-45" y="-60" width="90" height="16" rx="8" fill="#245FA6"/>
    <circle cx="-41" cy="-52" r="10" fill="#245FA6"/><circle cx="41" cy="-52" r="10" fill="#245FA6"/></g>`;

  const radio = `<g transform="translate(1200,672)">
    <path d="M -30,0 L -6,-122 M 30,0 L 6,-122" stroke="#6D63D8" stroke-width="6" stroke-linecap="round"/>
    <path d="M -24,-32 L 24,-60 M -18,-62 L 18,-86 M -12,-90 L 12,-106" stroke="#6D63D8" stroke-width="3" opacity="0.8"/>
    <path d="M 24,-32 L -24,-60 M 18,-62 L -18,-86 M 12,-90 L -12,-106" stroke="#6D63D8" stroke-width="3" opacity="0.45"/>
    <circle cx="0" cy="-126" r="6" fill="#E0603A"/>
    <path d="M 14,-140 A 22,22 0 0 1 44,-118" stroke="#6D63D8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M 22,-152 A 36,36 0 0 1 60,-114" stroke="#6D63D8" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.65"/>
    <path d="M -14,-140 A 22,22 0 0 0 -44,-118" stroke="#6D63D8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M -22,-152 A 36,36 0 0 0 -60,-114" stroke="#6D63D8" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.65"/></g>`;

  const globe = `<g transform="translate(1440,662)">
    ${shadow(0, 54, 42)}
    <ellipse cx="0" cy="0" rx="62" ry="24" fill="none" stroke="#6D63D8" stroke-width="2.5" stroke-dasharray="3 9" transform="rotate(-20)"/>
    <circle cx="0" cy="0" r="46" fill="#EDF7FF" stroke="#4F46E5" stroke-width="4"/>
    <ellipse cx="0" cy="0" rx="46" ry="17" fill="none" stroke="#4F46E5" stroke-width="3"/>
    <ellipse cx="0" cy="0" rx="17" ry="46" fill="none" stroke="#4F46E5" stroke-width="3"/>
    <line x1="-46" y1="0" x2="46" y2="0" stroke="#4F46E5" stroke-width="2.5"/>
    <path d="M -22,-15 q 11,-6 19,2 q -2,9 -13,9 q -11,-3 -6,-11 Z" fill="#7FBF9A"/>
    <path d="M 5,11 q 13,-2 15,8 q -9,9 -17,2 Z" fill="#7FBF9A"/>
    <circle cx="53" cy="-31" r="5" fill="#E0603A"/></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}">
    ${defs}
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${sun}${stars}${cloud(560, 175, 1)}${cloud(1040, 135, 0.8)}
    ${thread}
    ${hills}
    ${beacon}${letter}${pole}${phone}${radio}${globe}
  </svg>`;
}

// The cover is no longer generated here: it was replaced by a hand-made
// illustration at public/images/posts/communication-cover.jpg. Re-adding a
// cover job would overwrite it.
const jobs = [
  ["communication-timeline-en.png", timelineSvg("en")],
  ["communication-timeline-hr.png", timelineSvg("hr")],
  ["communication-model-en.png", modelSvg("en")],
  ["communication-model-hr.png", modelSvg("hr")],
];

fs.mkdirSync(OUT, { recursive: true });
for (const [name, svg] of jobs) {
  const out = path.join(OUT, name);
  await sharp(Buffer.from(svg)).png().toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`✓ ${name}  (${kb} KB)`);
}
