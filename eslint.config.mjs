import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Links must go through src/components/Link.tsx (prefetch on hover, not on
  // sight): viewport prefetching was ~65% of the site's Vercel CDN requests.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/Link.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{
          name: "next/link",
          message: 'Import Link from "@/components/Link" instead (hover-only prefetch keeps CDN requests down).',
        }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Root-level one-shot helper scripts — Node tooling, not app code.
    // They use CommonJS or have throwaway-quality. Don't lint them.
    "check-translations.js",
    "migrate-categories.js",
    "compress-images.mjs",
    "convert-gifs.mjs",
    "restore-larger-than-original.mjs",
    "scripts/**",
    // Husky's generated shim files
    ".husky/**",
  ]),
]);

export default eslintConfig;
