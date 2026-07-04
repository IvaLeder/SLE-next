/**
 * Minimal colorized logger — deliberately dependency-free. Colours are
 * disabled when not writing to a TTY or when NO_COLOR is set.
 */

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

const paint = (code: string) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);

export const color = {
  bold: paint("1"),
  dim: paint("2"),
  red: paint("31"),
  green: paint("32"),
  yellow: paint("33"),
  cyan: paint("36"),
  magenta: paint("35"),
};

export const log = {
  verbose: false,

  info(msg: string): void {
    console.log(msg);
  },
  step(msg: string): void {
    console.log(color.cyan("▸ ") + msg);
  },
  ok(msg: string): void {
    console.log(color.green("✓ ") + msg);
  },
  warn(msg: string): void {
    console.warn(color.yellow("⚠ ") + msg);
  },
  error(msg: string): void {
    console.error(color.red("✗ ") + msg);
  },
  debug(msg: string): void {
    if (this.verbose) console.log(color.dim("  · " + msg));
  },

  /** In-place progress counter (TTY only; falls back to silence otherwise). */
  progress(done: number, total: number, label: string): void {
    if (!process.stdout.isTTY) return;
    process.stdout.write(`\r  ${done}/${total} ${label}`.padEnd(60));
    if (done === total) process.stdout.write("\n");
  },
};

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function formatMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}
