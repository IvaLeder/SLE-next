// Checks every design the snowflake maker can produce (src/components/tools/
// snowflake-geometry.ts) and fails if any would fall apart or leave a bridge
// too thin to cut. Run it after adding or resizing a tip, hole or slot:
//
//   node scripts/check-snowflake-designs.mjs
import { allDesigns, check } from "../src/components/tools/snowflake-geometry.ts";

const designs = allDesigns();
const bad = designs.filter((d) => !check(d).holdsTogether);
for (const d of bad) console.log("FALLS APART:", JSON.stringify(d), `(${check(d).pieces} pieces)`);
console.log(`${designs.length - bad.length} of ${designs.length} designs hold together`);
process.exit(bad.length ? 1 : 0);
