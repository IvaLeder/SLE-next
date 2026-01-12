export type TocItem = {
  id: string;
  text: string;
  level: number; // 1, 2, 3
};

export function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");

  const toc: TocItem[] = [];

  for (const line of lines) {
    const match = /^(#{1,3})\s+(.*)/.exec(line);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();

      // create anchor-style ID
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      toc.push({ id, text, level });
    }
  }

  return toc;
}