import DraftPostPage, {
  draftMetadata,
  draftStaticParams,
  type DraftRouteProps,
} from "@/components/DraftPostPage";

// Static export: one page per draft at /en/draft/<slug>/<previewToken>. The
// shareable /en/draft/<slug>?key=<previewToken> links are mapped onto these
// files by worker/index.ts; any other draft URL is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return draftStaticParams("en");
}

export async function generateMetadata(props: DraftRouteProps) {
  return draftMetadata("en", props);
}

export default function Page(props: DraftRouteProps) {
  return <DraftPostPage lang="en" {...props} />;
}
