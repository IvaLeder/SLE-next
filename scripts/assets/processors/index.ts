import type { ResolvedConfig } from "../config.ts";
import type { ProcessResult, SourceAsset } from "../types.ts";
import { metadataOnlyProcessor } from "./metadata-only.ts";
import { rasterProcessor } from "./raster.ts";
import { svgProcessor } from "./svg.ts";

/**
 * Processor registry — the extension point of the pipeline.
 *
 * To support a new asset kind (video, PDF, worksheet, audio, 3D model…):
 *   1. widen AssetKind / add an entry interface in src/lib/assets/types.ts
 *   2. add a config section in asset.config.ts (mirror ImageKindConfig)
 *   3. implement an AssetProcessor here and add it to the registry
 * The scanner, cache, manifest, CLI and report don't change.
 */

export interface ProcessorContext {
  cfg: ResolvedConfig;
  /** Whether any article references this asset. */
  used: boolean;
}

export interface AssetProcessor {
  name: string;
  /** Claim a source by extension/shape. First match in the registry wins. */
  matches(source: SourceAsset): boolean;
  process(source: SourceAsset, ctx: ProcessorContext): Promise<ProcessResult>;
}

const registry: AssetProcessor[] = [svgProcessor, rasterProcessor];

/**
 * Pick the processor for a source. Usage is pipeline policy, not a processor
 * concern: unused and unsupported sources always get metadata-only entries,
 * regardless of which processor would otherwise claim them.
 */
export function selectProcessor(source: SourceAsset, ctx: ProcessorContext): AssetProcessor {
  if (!ctx.used || !source.supported) return metadataOnlyProcessor;
  return registry.find((p) => p.matches(source)) ?? metadataOnlyProcessor;
}
