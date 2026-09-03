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
 *   npm run social -- --back-to-school   # campaign hub, 3 articles + multiplication series
 *   npm run social -- --tools-hub        # tools hub Pinterest + Instagram cards/copy
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
import {
  DIMS,
  FONTS,
  GRADIENTS,
  articleEl,
  backToSchoolHubEl,
  brandedEl,
  campaignArticleEl,
  fileDataUri,
  imageDataUri,
  learningCardEl,
  toolsHubSocialEl,
  type BrandedContent,
  type CampaignContent,
  type LearningCardContent,
  type ToolsHubSocialContent,
} from "./templates.ts";

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

const TOOLS_HUB_PIN: ToolsHubSocialContent = {
  eyebrow: "Play · discover · create",
  title: ["Free STEM tools", "& games for kids"],
  topics: "Binary  ·  Secret codes  ·  Math  ·  Color",
  promise: "No download  ·  No sign-up",
};

const TOOLS_HUB_INSTAGRAM: ToolsHubSocialContent = {
  eyebrow: "Play · discover · create",
  title: ["Free STEM tools", "& games for kids"],
  topics: "",
  promise: "No download  ·  No sign-up",
};

type Job = {
  name: string;
  kind: "article" | "branded" | "tools-hub" | "campaign-article" | "campaign-hub" | "learning-card";
  photo?: string;
  title?: string;
  content?: BrandedContent;
  campaign?: CampaignContent;
  learningCard?: LearningCardContent;
  pin?: PinCopy;
  formats?: string[];
  photos?: Record<string, string>;
  instagramCaption?: string;
  copyFiles?: Record<string, string>;
};

async function renderJob(job: Job) {
  const outDir = path.join(OUT_ROOT, LANG, job.name);
  fs.mkdirSync(outDir, { recursive: true });
  const formats = Object.entries(DIMS).filter(([fmt]) => !job.formats || job.formats.includes(fmt));
  for (const [fmt, [W, H]] of formats) {
    const photo = job.photos?.[fmt] ?? job.photo;
    const el = (() => {
      if (job.kind === "article") return articleEl(fmt, W, H, photo!, job.title!);
      if (job.kind === "campaign-article") return campaignArticleEl(fmt, W, H, photo!, job.campaign!);
      if (job.kind === "campaign-hub") return backToSchoolHubEl(fmt, W, H, job.campaign!);
      if (job.kind === "learning-card") return learningCardEl(W, H, job.learningCard!);
      if (job.kind === "tools-hub") {
        return toolsHubSocialEl(
          fmt as "pinterest" | "instagram",
          W,
          H,
          photo!,
          fmt === "instagram" ? TOOLS_HUB_INSTAGRAM : TOOLS_HUB_PIN,
        );
      }
      return brandedEl(fmt, W, H, GRADIENTS.coral, job.content!);
    })();
    // Branded cards use a colour emoji (fetched); article cards need no network.
    const opts = job.kind === "branded" ? { emoji: "twemoji" as const } : {};
    const res = new ImageResponse(el, { width: W, height: H, fonts: FONTS, ...opts });
    fs.writeFileSync(path.join(outDir, `${fmt}.png`), Buffer.from(await res.arrayBuffer()));
  }
  if (job.pin) fs.writeFileSync(path.join(outDir, "pin.txt"), pinFileBody(job.name, job.pin));
  if (job.instagramCaption) {
    fs.writeFileSync(path.join(outDir, "instagram.txt"), `${job.instagramCaption.trim()}\n`);
  }
  for (const [filename, body] of Object.entries(job.copyFiles ?? {})) {
    fs.writeFileSync(path.join(outDir, filename), `${body.trim()}\n`);
  }
  const copyFiles = [
    job.pin ? "pin.txt" : "",
    job.instagramCaption ? "instagram.txt" : "",
    ...Object.keys(job.copyFiles ?? {}),
  ].filter(Boolean);
  console.log(`  ✓ ${job.name}  (${formats.map(([fmt]) => fmt).join(", ")}${copyFiles.length ? ` + ${copyFiles.join(", ")}` : ""})`);
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

function toolsHubJob(): Job {
  return {
    name: "tools-hub",
    kind: "tools-hub",
    formats: ["pinterest", "instagram"],
    photos: {
      pinterest: fileDataUri("src/lib/og-art/tools-hub-pinterest.jpg"),
      instagram: fileDataUri("src/lib/og-art/tools-hub-instagram.jpg"),
    },
    instagramCaption: [
      "Looking for screen time that gets kids thinking? 🔐🧠",
      "",
      "Our free STEM tools turn names into binary, crack Caesar and Morse codes, make fractions visible, practise telling time, mix colors, solve the Tower of Hanoi and more.",
      "",
      "Nothing to download. No account to create. Just choose a tool and start exploring.",
      "",
      "Which one would your child or class try first? Tell me below 👇",
      "",
      "Save this post for later and share it with a parent, teacher or homeschooler who loves learning through play.",
      "",
      `Explore all the tools: ${siteConfig.url}/${LANG}/${TOOLS_SLUG.en}`,
      "",
      "#STEMForKids #LearningThroughPlay #STEMEducation #KidsActivities #HomeschoolIdeas",
    ].join("\n"),
    pin: {
      url: `${siteConfig.url}/${LANG}/${TOOLS_SLUG.en}`,
      title: "Free STEM tools and games for kids",
      description:
        "Explore free online STEM tools and games for kids: turn names into binary, crack Caesar and Morse codes, visualize fractions, practise telling time, mix colors, solve the Tower of Hanoi and more. Nothing to download and no sign-up required—just pick a tool and start learning through play. Great for curious kids, families, homeschool and classroom activities.",
    },
  };
}

// ---- back-to-school campaign ----------------------------------------------
const BACK_TO_SCHOOL_CAMPAIGN = "back_to_school_2026";
const MULTIPLICATION_SLUG = "how-to-learn-multiplication-tables";

function trackedUrl(slug: string, source: string, content: string): string {
  return `${siteConfig.url}/${LANG}/${slug}?utm_source=${source}&utm_medium=social&utm_campaign=${BACK_TO_SCHOOL_CAMPAIGN}&utm_content=${content}`;
}

type CampaignEntry = {
  slug: string;
  kind: "campaign-article" | "campaign-hub";
  cover?: string;
  visual: CampaignContent;
  pinTitle: string;
  pinDescription: string;
  instagram: string;
  facebook: string;
  story: string;
  storySticker: string;
  gmb: string;
  facebookImage: string;
};

const BACK_TO_SCHOOL_ENTRIES: CampaignEntry[] = [
  {
    slug: "back-to-school",
    kind: "campaign-hub",
    visual: {
      kicker: "Curious, calm & ready to learn",
      title: "Back to school without the pressure",
      tagline: "3 practical guides + a free 8-page printable",
      cta: "Explore the hub",
      accent: "#F8C75A",
    },
    pinTitle: "A Calmer Back-to-School Plan for Children",
    pinDescription:
      "Back-to-school readiness is about more than letters and numbers. Explore practical guides to emotional, social and cognitive readiness, calmer routines and multiplication—plus a free 8-page Curious & Calm printable for families and educators.",
    instagram: [
      "A new backpack helps. A predictable goodbye, a calmer morning and a child who feels understood help even more.",
      "",
      "Our Back-to-School Hub brings together three practical guides: school readiness beyond academics, calmer routines and transitions, and multiplication strategies that make sense.",
      "",
      "There is also a free 8-page Curious & Calm printable. Save this collection for the first weeks of school—and send it to a parent or educator beginning the transition with a child.",
      "",
      "Explore the hub through the link in our bio.",
      "",
      "#BackToSchool #SchoolReadiness #ParentingTips #TeachersOfInstagram #ChildDevelopment",
    ].join("\n"),
    facebook: [
      "A new backpack helps. A predictable goodbye, a calmer morning and a child who feels understood help even more.",
      "",
      "Our Back-to-School Hub brings together three practical guides: school readiness beyond academics, calmer routines and transitions, and multiplication strategies that make sense. There is also a free 8-page Curious & Calm printable.",
      "",
      "Save it for the first weeks of school and share it with a parent or educator:",
    ].join("\n"),
    story: [
      "Back to school is more than a supplies list.",
      "Readiness · regulation · routines · confident learning",
      "3 free guides + an 8-page printable",
    ].join("\n"),
    storySticker: "Explore the hub",
    gmb: "Help children begin school curious, calm and ready to learn. Explore our free back-to-school collection with practical guides to readiness, regulation, routines and multiplication, plus an 8-page printable.",
    facebookImage: "Use the hub's automatically generated Facebook link-preview image.",
  },
  {
    slug: "school-readiness-beyond-letters-and-numbers",
    kind: "campaign-article",
    cover: "/images/posts/school-readiness-beyond-letters-and-numbers-cover.png",
    visual: {
      kicker: "School readiness",
      title: "Is my child ready for school?",
      tagline: "6 areas to look at beyond letters and numbers",
      cta: "Read the guide",
      accent: "#F8C75A",
    },
    pinTitle: "6 Signs of School Readiness Beyond ABCs",
    pinDescription:
      "School readiness includes physical, language, cognitive, executive-function, emotional and social skills. Learn what to observe, what children do not need to know yet and how to support readiness without testing them.",
    instagram: [
      "Can your child ask for help? Follow a short routine? Join a group? Recover after a disappointment?",
      "",
      "These abilities matter alongside letters and numbers. This guide explains six connected areas of school readiness, what children do—and do not—need before the first day, and how to notice strengths without turning home into a test.",
      "",
      "Save this for a calm readiness check-in, then read the guide through the link in our bio.",
      "",
      "#SchoolReadiness #BackToSchool #ChildDevelopment #ExecutiveFunction #ParentingTips",
    ].join("\n"),
    facebook: [
      "Can your child ask for help? Follow a short routine? Join a group? Recover after a disappointment?",
      "",
      "These abilities matter alongside letters and numbers. This guide explains six connected areas of school readiness, what children do—and do not—need before the first day, and how to notice strengths without turning home into a test.",
    ].join("\n"),
    story: [
      "Is my child ready for school?",
      "Look beyond letters and numbers.",
      "Body · language · thinking · executive functions · emotions · relationships",
      "Observe, don't test.",
    ].join("\n"),
    storySticker: "Read the guide",
    gmb: "What does being ready for school actually mean? Explore six important areas of readiness—from communication and executive functions to regulation and relationships—and learn how to support them without testing or pressure.",
    facebookImage: "public/images/posts/school-readiness-beyond-letters-and-numbers-cover.png",
  },
  {
    slug: "curious-and-calm-back-to-school",
    kind: "campaign-article",
    cover: "/images/posts/curious-and-calm-back-to-school-cover.png",
    visual: {
      kicker: "Curious & calm",
      title: "Calmer mornings. Easier goodbyes.",
      tagline: "A gentle back-to-school plan + free 8-page printable",
      cta: "Get the plan",
      accent: "#F8C75A",
    },
    pinTitle: "A Gentle Plan for Calmer School Mornings",
    pinDescription:
      "Practical ways to make school transitions easier: predictable mornings, trusted goodbye routines, emotional check-ins, after-school decompression and plans for common worries. Includes a free 8-page printable.",
    instagram: [
      "A difficult school morning is not a character flaw. Transitions ask a great deal of a child's nervous system—and children often borrow our calm before they can find their own.",
      "",
      "This gentle plan covers morning routines, reliable goodbyes, three-minute check-ins, after-school recovery and ways to turn worries into concrete plans. It includes a free 8-page Curious & Calm printable for home or the classroom.",
      "",
      "Save it for the mornings that need less pressure and more support. Read through the link in our bio.",
      "",
      "#BackToSchool #EmotionalRegulation #ParentingTips #SchoolRoutine #ChildDevelopment",
    ].join("\n"),
    facebook: [
      "A difficult school morning is not a character flaw. Transitions ask a great deal of a child's nervous system—and children often borrow our calm before they can find their own.",
      "",
      "This gentle plan covers morning routines, reliable goodbyes, three-minute check-ins, after-school recovery and ways to turn worries into concrete plans. It includes a free 8-page Curious & Calm printable for home or the classroom.",
    ].join("\n"),
    story: [
      "Which part of the school day is hardest?",
      "The morning · goodbye · after school · bedtime worries",
      "Make the next step predictable, small and safe.",
      "Get the gentle plan + free printable",
    ].join("\n"),
    storySticker: "Get the free printable",
    gmb: "Make the return to school gentler with practical routines for mornings, goodbyes, emotional check-ins and after-school recovery. The guide includes a free 8-page Curious & Calm printable for families and educators.",
    facebookImage: "public/images/posts/curious-and-calm-back-to-school-cover.png",
  },
  {
    slug: MULTIPLICATION_SLUG,
    kind: "campaign-article",
    cover: "/images/posts/multiplication-tables-cover.jpg",
    visual: {
      kicker: "Multiplication that makes sense",
      title: "100 multiplication facts? Actually, only 15.",
      tagline: "Patterns, shortcuts + a free visualizer",
      cta: "See the tricks",
      accent: "#F8C75A",
    },
    pinTitle: "Only 15 Multiplication Facts Left to Learn",
    pinDescription:
      "Help children understand multiplication instead of memorising 100 separate answers. Use flip facts, easy families, doubling, friendly facts, the 9s finger trick and a free interactive multiplication visualizer.",
    instagram: [
      "Multiplication can look like 100 separate facts to memorise. It isn't.",
      "",
      "Once children use the easy families, flip equivalent facts and treat square facts as landmarks, only 15 target facts remain. The guide shows how to double, break facts apart, solve the 9s in two ways and practise without stressful timed tests.",
      "",
      "Save the strategy carousel, then try the free interactive visualizer through the link in our bio.",
      "",
      "#Multiplication #MathForKids #MathTeacher #HomeschoolMath #LearningThroughPlay",
    ].join("\n"),
    facebook: [
      "Multiplication can look like 100 separate facts to memorise. It isn't.",
      "",
      "Once children use the easy families, flip equivalent facts and treat square facts as landmarks, only 15 target facts remain. This guide shows how to double, break facts apart, solve the 9s in two ways and practise without stressful timed tests. It also includes a free interactive visualizer.",
    ].join("\n"),
    story: [
      "Does multiplication mean memorising 100 answers?",
      "Patterns and shortcuts reduce the load.",
      "After the easy families, flips and squares: only 15 target facts remain.",
      "See the strategies + try the free visualizer",
    ].join("\n"),
    storySticker: "Try the visualizer",
    gmb: "Multiplication does not need to mean memorising 100 unrelated answers. Discover visual strategies, patterns and shortcuts that reduce the load to just 15 target facts—and try the free interactive visualizer.",
    facebookImage: "public/images/posts/multiplication-tables-cover.jpg",
  },
];

function campaignJob(entry: CampaignEntry): Job {
  const contentKey = entry.slug === "back-to-school" ? "hub" : entry.slug.replace(/-/g, "_");
  const instagramUrl = trackedUrl(entry.slug, "instagram", contentKey);
  const facebookUrl = trackedUrl(entry.slug, "facebook", contentKey);
  const storyUrl = trackedUrl(entry.slug, "facebook", `${contentKey}_story`);
  const gmbUrl = trackedUrl(entry.slug, "google_business_profile", contentKey);
  const copyFiles: Record<string, string> = {
    "facebook.txt": `${entry.facebookImage}\n\n${entry.facebook}\n\n${facebookUrl}`,
    "story.txt": `Ready-to-upload image: story.png\n\nLink sticker: ${entry.storySticker}\n${storyUrl}\n\nOptional supporting text for a follow-up Story frame:\n${entry.story}`,
    "gmb.txt": `${entry.gmb}\n\nButton: Learn more\n${gmbUrl}`,
  };
  if (entry.slug === "back-to-school") {
    copyFiles["campaign-schedule.txt"] = [
      "BACK-TO-SCHOOL CAMPAIGN SCHEDULE",
      "",
      "Day 1 · Hub launch",
      "Instagram feed · Facebook cover/link post · Facebook Story · Pinterest · Google Business Profile",
      "",
      "Day 3 · School readiness",
      "Instagram feed · Facebook cover/link post · Facebook Story · Pinterest",
      "",
      "Day 6 · Curious & Calm + printable",
      "Instagram feed · Facebook cover/link post · Facebook Story · Pinterest",
      "",
      "Day 9 · Multiplication article + visualizer",
      "Instagram feed · Facebook cover/link post · Facebook Story · Pinterest",
      "",
      "Day 12 · Multiplication carousel",
      "Publish the eight Instagram carousel slides with instagram.txt as the caption.",
      "",
      "Then · Evergreen multiplication series",
      "Publish one new strategy Pin each week in numbered folder order. Reshare the strongest idea to Stories after 24–48 hours.",
      "",
      "Google Business Profile",
      "Use one update per week: hub, Curious & Calm, school readiness, multiplication.",
    ].join("\n");
  }
  if (entry.slug === MULTIPLICATION_SLUG) {
    copyFiles["carousel-order.txt"] = [
      "Instagram carousel (upload in this order):",
      "instagram-carousel/01/instagram.png — 100 facts? Only 15",
      "instagram-carousel/02/instagram.png — meaning before memory",
      "instagram-carousel/03/instagram.png — easy families",
      "instagram-carousel/04/instagram.png — flip facts",
      "instagram-carousel/05/instagram.png — doubling for ×4 and ×8",
      "instagram-carousel/06/instagram.png — friendly facts for ×6 and ×7",
      "instagram-carousel/07/instagram.png — two ways to solve ×9",
      "instagram-carousel/08/instagram.png — visualizer call to action",
      "",
      "Use instagram.txt as the carousel caption.",
    ].join("\n");
  }
  return {
    name: entry.slug,
    kind: entry.kind,
    photo: entry.cover ? imageDataUri(entry.cover) : undefined,
    campaign: entry.visual,
    pin: {
      url: trackedUrl(entry.slug, "pinterest", contentKey),
      title: entry.pinTitle,
      description: entry.pinDescription,
    },
    instagramCaption: `${entry.instagram}\n\nCampaign URL: ${instagramUrl}`,
    copyFiles,
  };
}

type StrategyEntry = {
  id: string;
  pinTitle: string;
  pinDescription: string;
  card: LearningCardContent;
};

const MULTIPLICATION_PIN_SERIES: StrategyEntry[] = [
  {
    id: "easy-facts",
    pinTitle: "Start With the Easy Multiplication Facts",
    pinDescription: "Begin multiplication tables with the reliable ×0, ×1, ×2, ×5 and ×10 families. These easy facts reduce the memory load and become anchors for solving the harder 3s, 4s, 6s, 7s, 8s and 9s.",
    card: {
      kicker: "Multiplication shortcut 1",
      title: "Start with the easy facts",
      tagline: "Build anchors before asking children to memorise harder facts.",
      rows: [
        { main: "×0: zero groups" },
        { main: "×1: the number stays itself" },
        { main: "×2: double it" },
        { main: "×5: half of ×10" },
        { main: "×10: use place value" },
      ],
      footer: "Meaning first · memory follows",
      accent: "#D86867",
    },
  },
  {
    id: "flip-facts",
    pinTitle: "Flip Facts Cut Multiplication Practice Nearly in Half",
    pinDescription: "Show children that 3 × 4 and 4 × 3 have the same total. The stories are different, but turning an array proves the answer stays 12. Learn one fact and its mirror twin comes free.",
    card: {
      kicker: "Multiplication shortcut 2",
      title: "One fact. Two directions.",
      tagline: "Turn the array. The groups change direction, but the total stays the same.",
      rows: [
        { main: "3 × 4 = 12", note: "3 rows of 4" },
        { main: "4 × 3 = 12", note: "4 rows of 3" },
        { main: "Learn 6 × 7; get 7 × 6 free" },
      ],
      footer: "Flip every mirror fact",
      accent: "#7B5AA6",
    },
  },
  {
    id: "doubles-4s-8s",
    pinTitle: "Learn the 4 and 8 Times Tables by Doubling",
    pinDescription: "Use a fact children already know: ×4 means double, then double again; ×8 means double three times. For 8 × 6, follow 6 → 12 → 24 → 48. A simple visual strategy for multiplication facts.",
    card: {
      kicker: "Multiplication shortcut 3",
      title: "Double your way to ×4 and ×8",
      tagline: "One addition skill powers two multiplication families.",
      rows: [
        { main: "×4: double, then double again" },
        { main: "×8: double three times" },
        { main: "6, 12, 24, 48", note: "Three doubles, so 8 × 6 = 48" },
      ],
      footer: "Make each step visible on paper",
      accent: "#338F8B",
    },
  },
  {
    id: "friendly-6s-7s",
    pinTitle: "Easy Strategies for the 6 and 7 Times Tables",
    pinDescription: "Build harder multiplication facts from friendly facts children already know. Use ×5 plus one more group for the 6s, and ×5 plus ×2 for the 7s. See clear examples for 6 × 7 and 7 × 8.",
    card: {
      kicker: "Multiplication shortcut 4",
      title: "Build ×6 and ×7 from friendly facts",
      tagline: "Break a hard fact into smaller facts the child already knows.",
      rows: [
        { main: "6 × 7 = 5 × 7 + 1 × 7", note: "35 + 7 = 42" },
        { main: "7 × 8 = 5 × 8 + 2 × 8", note: "40 + 16 = 56" },
      ],
      footer: "Known facts become stepping stones",
      accent: "#D89135",
    },
  },
  {
    id: "9-times-table",
    pinTitle: "Two Tricks for the 9 Times Table",
    pinDescription: "Teach the 9 times table with understanding: calculate ×10 minus one group, then use the finger trick as a memory support. For 9 × 7, think 70 − 7 = 63 or lower finger 7 to see 6 tens and 3 ones.",
    card: {
      kicker: "Multiplication shortcut 5",
      title: "Two ways to solve the 9 times table",
      tagline: "Use a strategy that explains the answer, then add a helpful memory hook.",
      rows: [
        { main: "9 × 7 = 10 × 7 − 1 × 7", note: "70 − 7 = 63" },
        { main: "Finger 7 down: 6 | 3", note: "6 tens and 3 ones = 63" },
        { main: "Check: 6 + 3 = 9" },
      ],
      footer: "Reason first · finger trick second",
      accent: "#B24F78",
    },
  },
  {
    id: "break-apart",
    pinTitle: "The Master Multiplication Trick: Break Facts Apart",
    pinDescription: "Most multiplication shortcuts use the same powerful idea: split one factor, multiply the friendly parts, then combine them. See how 7 × 8 becomes 5 × 8 + 2 × 8 = 56.",
    card: {
      kicker: "The master strategy",
      title: "Break multiplication apart",
      tagline: "Split one factor into friendly parts, multiply each part, then combine.",
      rows: [
        { main: "7 × 8" },
        { main: "= 5 × 8 + 2 × 8" },
        { main: "= 40 + 16 = 56" },
      ],
      footer: "One idea behind many shortcuts",
      accent: "#4F78B8",
    },
  },
  {
    id: "practice-routine",
    pinTitle: "A 15-Minute Multiplication Practice Routine",
    pinDescription: "A short multiplication routine for lasting recall: see one fact visually, connect it to a known strategy, retrieve it without the model, then mix it with earlier facts and finish with success.",
    card: {
      kicker: "Calm multiplication practice",
      title: "A 15-minute practice routine",
      tagline: "Short, varied practice works better than one long stressful session.",
      rows: [
        { main: "1. See it · 4 min", note: "Build groups, an array or jumps" },
        { main: "2. Find a route · 4 min", note: "Flip, double or break it apart" },
        { main: "3. Retrieve · 4 min", note: "Recall after a short delay" },
        { main: "4. Mix & finish · 3 min", note: "End with a fact the child knows" },
      ],
      footer: "Understanding + retrieval = fluency",
      accent: "#6E5AA8",
    },
  },
];

function multiplicationPinJobs(): Job[] {
  return MULTIPLICATION_PIN_SERIES.map((entry, index) => ({
    name: `${MULTIPLICATION_SLUG}/pinterest-series/${String(index + 1).padStart(2, "0")}-${entry.id}`,
    kind: "learning-card",
    formats: ["pinterest"],
    learningCard: entry.card,
    pin: {
      url: trackedUrl(MULTIPLICATION_SLUG, "pinterest", `multiplication_${entry.id.replace(/-/g, "_")}`),
      title: entry.pinTitle,
      description: entry.pinDescription,
    },
  }));
}

const MULTIPLICATION_CAROUSEL: LearningCardContent[] = [
  {
    kicker: "Multiplication without overload",
    title: "100 facts? Actually, only 15.",
    tagline: "Teach the connected system hiding inside the multiplication chart.",
    rows: [
      { main: "Use the easy families" },
      { main: "Flip every mirror fact" },
      { main: "Keep 15 target facts", note: "Then build those from known facts" },
    ],
    footer: "Swipe for the shortcuts",
    accent: "#D86867",
  },
  {
    kicker: "Step 1 · See the meaning",
    title: "Meaning comes before memory",
    tagline: "Move between four views of the same multiplication fact.",
    rows: [
      { main: "3 equal groups of 4" },
      { main: "4 + 4 + 4" },
      { main: "3 rows of 4 dots" },
      { main: "3 jumps of 4 land on 12" },
    ],
    footer: "Say the full equation: 3 × 4 = 12",
    accent: "#4F78B8",
  },
  MULTIPLICATION_PIN_SERIES[0].card,
  MULTIPLICATION_PIN_SERIES[1].card,
  MULTIPLICATION_PIN_SERIES[2].card,
  MULTIPLICATION_PIN_SERIES[3].card,
  MULTIPLICATION_PIN_SERIES[4].card,
  {
    kicker: "Free interactive tool",
    title: "See it. Flip it. Break it apart.",
    tagline: "Let children explore one fact as groups, arrays and number-line jumps.",
    rows: [
      { main: "Build understanding" },
      { main: "Choose a strategy" },
      { main: "Practise the 15 target facts" },
    ],
    footer: "Try the multiplication visualizer",
    accent: "#338F8B",
  },
];

function multiplicationCarouselJobs(): Job[] {
  return MULTIPLICATION_CAROUSEL.map((card, index) => ({
    name: `${MULTIPLICATION_SLUG}/instagram-carousel/${String(index + 1).padStart(2, "0")}`,
    kind: "learning-card",
    formats: ["instagram"],
    learningCard: card,
  }));
}

function backToSchoolCampaignJobs(): Job[] {
  return [
    ...BACK_TO_SCHOOL_ENTRIES.map(campaignJob),
    ...multiplicationPinJobs(),
    ...multiplicationCarouselJobs(),
  ];
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
    else if (a === "--back-to-school") jobs.push(...backToSchoolCampaignJobs());
    else if (a === "--tools-hub") jobs.push(toolsHubJob());
    else if (a === "--tool") jobs.push(toolJob(argv[++i]));
    else if (a === "--tools") tools.forEach((t) => jobs.push(toolJob(t.slug.en)));
    else if (a === "--all") allArticleSlugs().forEach((s) => slugs.push(s));
    else if (a.startsWith("--")) throw new Error(`unknown flag: ${a}`);
    else slugs.push(a);
  }
  slugs.forEach((s) => jobs.push(articleJob(s)));

  if (!jobs.length) {
    console.log("Nothing to do. Try: npm run social -- <post-slug> | --summer | --back-to-school | --tools-hub | --tool <slug> | --all | --tools");
    return;
  }
  console.log(`Generating ${jobs.length} card set(s) → ${OUT_ROOT}/${LANG}/`);
  for (const job of jobs) await renderJob(job);
  console.log("done");
}

main().catch((e) => { console.error("✗", e.message); process.exit(1); });
