/**
 * Text helpers for site search, shared by the server action (indexing,
 * snippets) and the client components (highlighting).
 *
 * Keep this file free of Node.js imports — it is bundled for the browser.
 */

// ---------------------------------------------------------------------------
// Folding: case + diacritics, length-preserving
// ---------------------------------------------------------------------------

const foldCache = new Map<string, string>();

/** Lowercase one UTF-16 unit and strip its diacritic (č→c, š→s, é→e, đ→d).
 *  Always returns exactly one unit, so folded strings keep the original's
 *  offsets — that is what lets us find a match in folded text and slice the
 *  same range out of the original for display. */
function foldChar(ch: string): string {
  const cached = foldCache.get(ch);
  if (cached !== undefined) return cached;
  let out = ch;
  const lower = ch.toLowerCase();
  if (lower.length === 1) {
    if (lower === "đ") out = "d";
    else {
      const base = lower.normalize("NFD");
      out = base.length > 1 && /^\p{M}+$/u.test(base.slice(1)) ? base[0] : lower;
    }
  }
  foldCache.set(ch, out);
  return out;
}

/** Fold a string for matching: lowercase, no diacritics, same length.
 *  Croatian readers often type without diacritics ("cokolada", "pokus s
 *  jajem"), so both the index and the query go through this. */
export function fold(text: string): string {
  const lower = text.toLowerCase();
  // Fast path (nearly always): lowercasing kept the length, so only the
  // non-ASCII characters need their diacritics stripped.
  if (lower.length === text.length) return lower.replace(/[^\x00-\x7f]/g, foldChar);
  let out = "";
  for (let i = 0; i < text.length; i++) out += foldChar(text[i]);
  return out;
}

const WORD_CHAR = /[\p{L}\p{N}]/u;

// ---------------------------------------------------------------------------
// MDX → plain text
// ---------------------------------------------------------------------------

/** Component props that carry reader-visible prose (Callout/Printable titles,
 *  FAQ questions, Material names, Term definitions). Everything else
 *  (src, id, type, width, q, …) is markup and is dropped. Alt text is left
 *  out too: a Figure's caption already says the same thing in prose. */
const PROSE_ATTRS = new Set(["title", "question", "name", "def", "label"]);

/** Matches one JSX/HTML tag, including multi-line attribute lists and quoted
 *  values that contain ">" (e.g. title="a > b"). */
const TAG_RE =
  /<\/?[A-Za-z][\w.]*(?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{[^{}]*\}))?)*\s*\/?>/g;
const ATTR_RE = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

const ENDS_SENTENCE = /[.!?:;…,]["'”’)]*$/;

function endSentence(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return ENDS_SENTENCE.test(t) ? t : `${t}.`;
}

/**
 * Turn an article's MDX body into readable plain text for the search index
 * and result snippets. Comments, component markup, Markdown syntax and code
 * blocks are removed; prose-carrying props are kept as sentences.
 *
 * Blocks (paragraphs, headings, list items, component lines) are joined as
 * sentences, so "## Materials" followed by a list doesn't run together into
 * one breathless line.
 */
export function mdxToPlainText(mdx: string): string {
  const src = mdx
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ") // MDX comments {/* PHOTO: … */}
    .replace(/<!--[\s\S]*?-->/g, " ") // HTML comments
    .replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, " ") // fenced code blocks
    // Images and links before line splitting: link text may wrap lines.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(TAG_RE, (tag) => {
      // Replace each tag with its prose props (if any) on their own line,
      // so they read as separate sentences.
      const parts: string[] = [];
      for (const m of tag.matchAll(ATTR_RE)) {
        if (PROSE_ATTRS.has(m[1])) parts.push(endSentence(m[2] ?? m[3] ?? ""));
      }
      return `\n${parts.join(" ")}\n`;
    });

  const blocks: string[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push(endSentence(paragraph.join(" ")));
    paragraph = [];
  };

  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) continue; // horizontal rule
    if (/^\|?[\s:|-]+\|?$/.test(line) && line.includes("-")) continue; // table separator

    const isBlockStart =
      /^#{1,6}\s/.test(line) || // heading
      /^([-*+]|\d+[.)])\s/.test(line) || // list item
      line.startsWith("|"); // table row
    const text = line
      .replace(/^#{1,6}\s+/, "")
      .replace(/^>\s?/, "")
      .replace(/^([-*+]|\d+[.)])\s+/, "")
      .replace(/^\/>$/, "") // stray self-close left over from a broken tag
      .replace(/\|/g, " ")
      .replace(/`+/g, "")
      .replace(/\*+/g, "")
      .replace(/(^|[^\p{L}\p{N}])_+|_+(?=[^\p{L}\p{N}]|$)/gu, "$1")
      .replace(/\\([\\`*_{}[\]()#+\-.!|<>~])/g, "$1") // Markdown escapes (\-)
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    if (isBlockStart) {
      flush();
      if (text) blocks.push(endSentence(text));
    } else if (text) {
      paragraph.push(text);
    }
  }
  flush();

  return blocks
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?:;])/g, "$1")
    .replace(/([.!?])\.+(?=\s|$)/g, "$1")
    .trim();
}

// ---------------------------------------------------------------------------
// Highlighting + snippets
// ---------------------------------------------------------------------------

export type Segment = { text: string; hit: boolean };

/** Ranges [start, end) in `text` where a word starts with one of `terms`
 *  (already folded). Longest term wins at each position. */
function findHits(folded: string, terms: string[], limit = Infinity): [number, number][] {
  const sorted = [...new Set(terms.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return [];
  const hits: [number, number][] = [];
  for (let i = 0; i < folded.length && hits.length < limit; i++) {
    if (i > 0 && WORD_CHAR.test(folded[i - 1])) continue;
    if (!WORD_CHAR.test(folded[i])) continue;
    // Terms are whole index words (MiniSearch reports the word it matched,
    // e.g. "vulkanu" for the query "vulkan"), so match whole words only:
    // the term "pi" must not light up "pizza".
    const term = sorted.find(
      (t) =>
        folded.startsWith(t, i) &&
        (i + t.length === folded.length || !WORD_CHAR.test(folded[i + t.length])),
    );
    if (term) {
      hits.push([i, i + term.length]);
      i += term.length - 1;
    }
  }
  return hits;
}

/** Split `text` into plain/highlighted segments for rendering <mark>s. */
export function highlight(text: string, terms: string[]): Segment[] {
  const hits = findHits(fold(text), terms);
  if (hits.length === 0) return [{ text, hit: false }];
  const out: Segment[] = [];
  let pos = 0;
  for (const [s, e] of hits) {
    if (s > pos) out.push({ text: text.slice(pos, s), hit: false });
    out.push({ text: text.slice(s, e), hit: true });
    pos = e;
  }
  if (pos < text.length) out.push({ text: text.slice(pos), hit: false });
  return out;
}

/** True when `text` contains at least one of the (folded) terms. */
export function hasHit(text: string, terms: string[]): boolean {
  return findHits(fold(text), terms, 1).length > 0;
}

/**
 * The ~`size`-character window of `text` that contains the most distinct
 * matched terms, trimmed to word boundaries with ellipses. `folded` must be
 * fold(text) (passed in so callers can cache it). Returns null when nothing
 * matches.
 */
export function bestWindow(
  text: string,
  folded: string,
  terms: string[],
  size = 180,
): string | null {
  const hits = findHits(folded, terms, 400);
  if (hits.length === 0) return null;

  // Slide over hit positions; score = distinct terms inside the window.
  let best = hits[0][0];
  let bestScore = 0;
  for (let i = 0; i < hits.length; i++) {
    const start = hits[i][0];
    const seen = new Set<string>();
    for (let j = i; j < hits.length && hits[j][1] - start <= size; j++) {
      seen.add(folded.slice(hits[j][0], hits[j][1]));
    }
    if (seen.size > bestScore) {
      bestScore = seen.size;
      best = start;
    }
  }

  // Give the hit some lead-in context, then snap both ends to spaces.
  let start = Math.max(0, best - 40);
  if (start > 0) {
    // Prefer starting at a sentence boundary if one is close.
    const sentence = text.lastIndexOf(". ", best);
    if (sentence >= 0 && best - sentence <= 70) start = sentence + 2;
    else {
      const space = text.indexOf(" ", start);
      start = space >= 0 && space < best ? space + 1 : start;
    }
  }
  let end = Math.min(text.length, start + size);
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > best) end = space;
  }

  const body = text.slice(start, end).trim().replace(/[,;:]$/, "");
  return `${start > 0 ? "…" : ""}${body}${end < text.length ? "…" : ""}`;
}
