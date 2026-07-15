# my-blog

## Read dev-quickstart.md first

`dev-quickstart.md` is the canonical dev guide for this repo. Read it early in the
session, before changing images, content, or the asset pipeline, and before
hand-optimizing or re-encoding anything.

It documents conventions that are easy to get wrong by guessing. In particular,
§Images → "Sizing & standardisation" covers:

- Source targets: **1500px wide** for inline `<Figure>` images, **1920×1080** for covers.
- The **500 KB** `oversizedSource` limit, when it is harmless, and the JPEG ~q90
  remedy for covers that exceed it.
- `npm run images` is the site's **only** image optimizer (`images.unoptimized: true`
  in next.config). Sources in `public/images/posts/` feed it; `_opt/` variants are
  generated and gitignored.

If you are about to invent an approach for something in this repo, check the guide
first. The house recipe is usually already written down.

## Checks

```bash
npm run validate    # frontmatter, missing files, broken translation links
npm run build       # the real check: static rendering fails loudly on MDX errors
```
