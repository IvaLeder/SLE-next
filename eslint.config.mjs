import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
