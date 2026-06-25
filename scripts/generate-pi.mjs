#!/usr/bin/env node
/**
 * generate-pi.mjs — writes the decimal digits of π to public/pi.txt, used by the
 * "Find your birthday in π" tool (fetched on demand, client-side search).
 *
 * Uses the Chudnovsky algorithm with binary splitting (fast, exact BigInt math).
 * Run once and commit the result; regenerate with a different count if needed:
 *   node scripts/generate-pi.mjs            (default 1,000,000 digits)
 *   node scripts/generate-pi.mjs 100000
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIGITS = Number(process.argv[2] || 1_000_000);

const A = 13591409n;
const B = 545140134n;
const C = 640320n;
const C3_24 = (C * C * C) / 24n;

// Integer square root of a (possibly huge) BigInt — floor(sqrt(n)).
function isqrt(n) {
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (;;) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
}

// Binary splitting of the Chudnovsky series over [a, b) → [P, Q, T].
function bs(a, b) {
  if (b - a === 1n) {
    let P, Q;
    if (a === 0n) {
      P = 1n;
      Q = 1n;
    } else {
      P = (6n * a - 5n) * (2n * a - 1n) * (6n * a - 1n);
      Q = a * a * a * C3_24;
    }
    let T = P * (A + B * a);
    if (a & 1n) T = -T;
    return [P, Q, T];
  }
  const m = (a + b) >> 1n;
  const [Pam, Qam, Tam] = bs(a, m);
  const [Pmb, Qmb, Tmb] = bs(m, b);
  return [Pam * Pmb, Qam * Qmb, Qmb * Tam + Pam * Tmb];
}

function computePi(digits) {
  const guard = 10;
  const terms = BigInt(Math.floor(digits / 14.1816474627) + 1);
  const [, Q, T] = bs(0n, terms);
  const one = 10n ** BigInt(digits + guard);
  const sqrtC = isqrt(10005n * one * one);
  const pi = (Q * 426880n * sqrtC) / T; // π × 10^(digits+guard)
  return pi.toString().slice(1, 1 + digits); // decimals only (drop the leading 3)
}

const t0 = Date.now();
const decimals = computePi(DIGITS);
const secs = ((Date.now() - t0) / 1000).toFixed(1);

const expected = "1415926535897932384626433832795028841971693993751058209749";
const ok = decimals.startsWith(expected);
console.log(`First 58 decimals: ${decimals.slice(0, 58)}`);
console.log(`Matches known π:   ${ok ? "✓ yes" : "✗ NO — generation is wrong!"}`);
if (!ok) process.exit(1);

const out = path.join(ROOT, "public", "pi.txt");
fs.writeFileSync(out, decimals);
console.log(`Wrote ${decimals.length.toLocaleString()} digits → ${path.relative(ROOT, out)} (${secs}s, ${(decimals.length / 1024).toFixed(0)} KB)`);
