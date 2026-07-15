import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "/Users/iva/my-blog/src/content/posts";

// Recursively collect .mdx files
function collect(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...collect(p));
    else if (name.endsWith(".mdx")) out.push(p);
  }
  return out;
}

const URL_RE = /https?:\/\/[^\s<>"'`\\)\]}]+/g;

// url -> Set(article)
const map = new Map();
for (const file of collect(ROOT)) {
  const text = readFileSync(file, "utf8");
  const art = relative(ROOT, file);
  for (let m of text.match(URL_RE) ?? []) {
    // trim trailing punctuation that regex may have swallowed
    m = m.replace(/[.,;:!?]+$/, "");
    if (!map.has(m)) map.set(m, new Set());
    map.get(m).add(art);
  }
}

const urls = [...map.keys()].sort();
console.error(`Found ${urls.length} unique URLs across ${new Set([...map.values()].flatMap(s => [...s])).size} articles`);

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function check(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": UA, Accept: "*/*", "Accept-Language": "en" },
      });
      // Some servers reject HEAD (405/403/501) — retry with GET before trusting it
      if (method === "HEAD" && [403, 405, 501].includes(res.status)) continue;
      return { status: res.status, finalUrl: res.url };
    } catch (e) {
      if (method === "GET") return { status: null, error: e.cause?.code || e.name || String(e) };
    }
  }
}

const results = [];
const queue = [...urls];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const r = await check(url);
    results.push({ url, articles: [...map.get(url)].sort(), ...r });
    process.stderr.write(`${r.status ?? "ERR"} ${url}\n`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

results.sort((a, b) => a.url.localeCompare(b.url));
console.log(JSON.stringify(results, null, 2));
