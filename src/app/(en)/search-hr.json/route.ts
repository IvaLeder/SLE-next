import { searchDocuments } from "@/lib/search-data";

// Static export: written once at build time to out/search-hr.json, which
// the browser loads on first search (src/lib/search-client.ts).
export const dynamic = "force-static";

export function GET() {
  return Response.json(searchDocuments("hr"));
}
