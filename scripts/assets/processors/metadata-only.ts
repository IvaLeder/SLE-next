import sharp from "sharp";
import type { ResolvedConfig } from "../config.ts";
import type { ProcessResult, SourceAsset } from "../types.ts";
import type { AssetProcessor } from "./index.ts";
import { extractVisuals } from "./visuals.ts";

/**
 * Fallback for anything that shouldn't get variants:
 *
 *   - unsupported-but-recognised formats (GIF — re-encoding loses animation)
 *   - assets no article references (encoding variants nobody links to would
 *     triple output size and build time; this corpus has ~435 orphans)
 *
 * The entry still carries dimensions and colours so components reserve
 * layout space and validation can size-check. If an article later references
 * the file, the usage flip invalidates its cache entry and it gets the full
 * treatment on the next run.
 */
export const metadataOnlyProcessor: AssetProcessor = {
  name: "metadata-only",
  matches: () => true,
  async process(source: SourceAsset, { cfg }: { cfg: ResolvedConfig }): Promise<ProcessResult> {
    const base = sharp(source.absPath); // first frame only — fine for metadata
    const meta = await base.metadata();
    if (!meta.width || !meta.height) {
      throw new Error("could not read dimensions");
    }

    let visuals = {};
    try {
      visuals = await extractVisuals(base, cfg);
    } catch {
      // Colours/blur are best-effort here.
    }

    return {
      entry: {
        kind: "image",
        src: source.publicPath,
        stem: source.stem,
        width: meta.width,
        height: meta.height,
        aspectRatio: Number((meta.width / meta.height).toFixed(4)),
        bytes: source.bytes,
        hash: source.hash.slice(0, 8),
        format: source.ext,
        hasAlpha: Boolean(meta.hasAlpha),
        ...visuals,
        variants: {},
        passthrough: true,
      },
      outputs: [],
    };
  },
};
