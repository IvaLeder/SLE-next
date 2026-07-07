# Social image generator

Generates ready-to-upload **Pinterest / Instagram / GMB / Story** images for
new posts, the summer e-book and interactive tools. Opt-in and **local only** —
it is *not* part of `prebuild` / the Vercel build, and its output is gitignored.

```bash
npm run social -- <post-slug>...   # article cards (cover photo + title)
npm run social -- --summer         # summer e-book card
npm run social -- --tool <slug>    # one interactive-tool card
npm run social -- --all            # every published EN article
npm run social -- --tools          # every interactive tool
```

Output: `social-exports/en/<name>/{pinterest,story,instagram,gmb}.png`
(1000×1500, 1080×1920, 1080×1350, 1200×900). EN only for now.

## How it works
- Renders with the `@vercel/og` Node build already bundled in `next` (same
  Satori engine as the on-site OG cards) — no extra dependencies.
- Two template families in `templates.ts`:
  - **article** — photo-composite: big cover photo + thin gradient strip
    (title + logo) for tall formats; full-bleed photo + scrim for near-square.
  - **branded** — summer / tools / specials: centered content + generic
    decorative layer, on the brand/coral gradient.
- Fonts (`fonts/Inter-*.ttf`) and the white logo (`logo-white.png`) are
  committed so runs are deterministic. Regenerate the white logo with
  `node scripts/social/make-white-logos.mjs`.

## Per-post frontmatter overrides (optional)
- `socialTitle: "Shorter punchier title"` — overrides the H1 on the image.
- `socialOverlay: false` — cover already has baked-in text; skip our title.
