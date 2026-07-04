/**
 * Tiny bounded-concurrency mapper (hand-rolled p-limit). Order of results
 * matches the input order; the worker function's rejections propagate.
 */
export async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }

  const size = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: size }, () => worker()));
  return results;
}
