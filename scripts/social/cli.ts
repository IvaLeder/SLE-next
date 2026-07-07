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
import { tools } from "../../src/lib/tools.ts";
import { DIMS, FONTS, GRADIENTS, articleEl, brandedEl, imageDataUri, type BrandedContent } from "./templates.ts";

const LANG = "en";
const POSTS_DIR = `src/content/posts/${LANG}`;
const OUT_ROOT = "social-exports";

const SUMMER: BrandedContent = {
  kicker: "Free summer e-book · STEM Little Explorers",
  emoji: "☀️",
  title: "Summer of curiosity",
  tagline: "30+ screen-free science activities for kids, sorted by age. Free PDF - no sign-up.",
};

type Job = { name: string; kind: "article" | "branded"; photo?: string; title?: string; content?: BrandedContent };

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
  console.log(`  ✓ ${job.name}  (${Object.keys(DIMS).join(", ")})`);
}

function articleJob(slug: string): Job {
  const file = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) throw new Error(`post not found: ${slug}`);
  const { data } = matter(fs.readFileSync(file, "utf8"));
  if (data.socialOverlay === false) {
    // Cover already carries its own text — pass it through without our title.
    return { name: slug, kind: "article", photo: imageDataUri(data.coverImage), title: "" };
  }
  return { name: slug, kind: "article", photo: imageDataUri(data.coverImage), title: data.socialTitle ?? data.title };
}

function toolJob(slug: string): Job {
  const tool = tools.find((t) => t.slug.en === slug || t.key === slug);
  if (!tool) throw new Error(`tool not found: ${slug}`);
  return {
    name: `tool-${tool.slug.en}`,
    kind: "branded",
    content: { kicker: "Free interactive tool · STEM Little Explorers", emoji: tool.icon, title: tool.title.en, tagline: tool.tagline.en },
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
    if (a === "--summer") jobs.push({ name: "summer", kind: "branded", content: SUMMER });
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
