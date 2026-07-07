/**
 * Social-image generator — `npm run social`.
 *
 * Opt-in, LOCAL only (never wired into prebuild / the Vercel build). Produces
 * ready-to-upload Pinterest / Instagram / GMB / Story images for new posts,
 * the summer e-book and the interactive tools, into the gitignored
 * `social-exports/` folder.
 *
 *   npm run social -- <post-slug>...     # article cards from cover + title
 *   npm run social -- --summer           # summer e-book card
 *   npm run social -- --tool <slug>      # one interactive-tool card
 *   npm run social -- --all              # every published EN article
 *   npm run social -- --tools            # every interactive tool
 *
 * EN only for now (HR is a later pass).
 */
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";
import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";
import { tools, TOOLS_SLUG } from "../../src/lib/tools.ts";
import { siteConfig } from "../../src/config/site.ts";
import { DIMS, FONTS, GRADIENTS, articleEl, brandedEl, imageDataUri, type BrandedContent } from "./templates.ts";

const LANG = "en";
const POSTS_DIR = `src/content/posts/${LANG}`;
const OUT_ROOT = "social-exports";

// Pinterest is a search engine: the pin's title + description do the ranking,
// not the image alone. We emit them as a pin.txt next to the images, ready to
// paste on upload.
type PinCopy = { url: string; title: string; description: string };
const clamp = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");
function pinFileBody(name: string, p: PinCopy): string {
  return [
    `Pinterest pin copy for: ${name}`,
    `(paste these when you upload the image)`,
    ``,
    `URL:`,
    p.url,
    ``,
    `Title (max 100 chars):`,
    clamp(p.title, 100),
    ``,
    `Description (max 500 chars):`,
    clamp(p.description, 500),
    ``,
  ].join("\n");
}

const SUMMER: BrandedContent = {
  kicker: "Free summer e-book · STEM Little Explorers",
  emoji: "☀️",
  title: "Summer of curiosity",
  tagline: "30+ screen-free science activities for kids, sorted by age. Free PDF - no sign-up.",
};

type Job = { name: string; kind: "article" | "branded"; photo?: string; title?: string; content?: BrandedContent; pin: PinCopy };

async function renderJob(job: Job) {
  const outDir = path.join(OUT_ROOT, LANG, job.name);
  fs.mkdirSync(outDir, { recursive: true });
  for (const [fmt, [W, H]] of Object.entries(DIMS)) {
    const el =
      job.kind === "article"
        ? articleEl(fmt, W, H, job.photo!, job.title!)
        : brandedEl(fmt, W, H, GRADIENTS.coral, job.content!);
    // Branded cards use a colour emoji (fetched); article cards need no network.
    const opts = job.kind === "branded" ? { emoji: "twemoji" as const } : {};
    const res = new ImageResponse(el, { width: W, height: H, fonts: FONTS, ...opts });
    fs.writeFileSync(path.join(outDir, `${fmt}.png`), Buffer.from(await res.arrayBuffer()));
  }
  fs.writeFileSync(path.join(outDir, "pin.txt"), pinFileBody(job.name, job.pin));
  console.log(`  ✓ ${job.name}  (${Object.keys(DIMS).join(", ")} + pin.txt)`);
}

function articleJob(slug: string): Job {
  const file = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) throw new Error(`post not found: ${slug}`);
  const { data } = matter(fs.readFileSync(file, "utf8"));
  const desc = (data.description ?? data.excerpt ?? "").toString().trim();
  const pin: PinCopy = {
    url: `${siteConfig.url}/${LANG}/${slug}`,
    title: (data.socialTitle ?? data.title ?? "").toString(),
    description: [desc, "Save this for a fun, hands-on STEM activity to do with your kids."].filter(Boolean).join(" "),
  };
  // socialOverlay:false = cover already carries its own text; pass it through
  // without our overlaid title. Pin copy is still generated either way.
  const title = data.socialOverlay === false ? "" : (data.socialTitle ?? data.title);
  return { name: slug, kind: "article", photo: imageDataUri(data.coverImage), title, pin };
}

function toolJob(slug: string): Job {
  const tool = tools.find((t) => t.slug.en === slug || t.key === slug);
  if (!tool) throw new Error(`tool not found: ${slug}`);
  return {
    name: `tool-${tool.slug.en}`,
    kind: "branded",
    content: { kicker: "Free interactive tool · STEM Little Explorers", emoji: tool.icon, title: tool.title.en, tagline: tool.tagline.en },
    pin: {
      url: `${siteConfig.url}/${LANG}/${TOOLS_SLUG.en}/${tool.slug.en}`,
      title: tool.title.en,
      description: tool.description.en,
    },
  };
}

function summerJob(): Job {
  return {
    name: "summer",
    kind: "branded",
    content: SUMMER,
    pin: {
      url: `${siteConfig.url}/${LANG}/summer`,
      title: "Summer of curiosity: a free STEM activity e-book for kids",
      description: `${SUMMER.tagline} Grab the free PDF and keep kids busy and learning all summer.`,
    },
  };
}

function allArticleSlugs(): string[] {
  return fs.readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") && f !== "component-playground.mdx")
    .map((f) => f.replace(/\.mdx$/, ""));
}

async function main() {
  const argv = process.argv.slice(2);
  const jobs: Job[] = [];
  const slugs: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--summer") jobs.push(summerJob());
    else if (a === "--tool") jobs.push(toolJob(argv[++i]));
    else if (a === "--tools") tools.forEach((t) => jobs.push(toolJob(t.slug.en)));
    else if (a === "--all") allArticleSlugs().forEach((s) => slugs.push(s));
    else if (a.startsWith("--")) throw new Error(`unknown flag: ${a}`);
    else slugs.push(a);
  }
  slugs.forEach((s) => jobs.push(articleJob(s)));

  if (!jobs.length) {
    console.log("Nothing to do. Try: npm run social -- <post-slug> | --summer | --tool <slug> | --all | --tools");
    return;
  }
  console.log(`Generating ${jobs.length} card set(s) → ${OUT_ROOT}/${LANG}/`);
  for (const job of jobs) await renderJob(job);
  console.log("done");
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
