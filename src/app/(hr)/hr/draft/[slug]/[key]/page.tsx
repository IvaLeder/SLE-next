import DraftPostPage, {
  draftMetadata,
  draftStaticParams,
  type DraftRouteProps,
} from "@/components/DraftPostPage";

// Static export: one page per draft at /hr/draft/<slug>/<previewToken>. The
// shareable /hr/draft/<slug>?key=<previewToken> links are mapped onto these
// files by worker/index.ts; any other draft URL is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return draftStaticParams("hr");
}

export async function generateMetadata(props: DraftRouteProps) {
  return draftMetadata("hr", props);
}

export default function Page(props: DraftRouteProps) {
  return <DraftPostPage lang="hr" {...props} />;
}
