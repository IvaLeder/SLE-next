import DraftPostPage, {
  draftMetadata,
  type DraftRouteProps,
} from "@/components/DraftPostPage";

// Never prerendered: the token check reads searchParams per request, and
// drafts must not end up in the static build output.
export const dynamic = "force-dynamic";

export async function generateMetadata(props: DraftRouteProps) {
  return draftMetadata("en", props);
}

export default function Page(props: DraftRouteProps) {
  return <DraftPostPage lang="en" {...props} />;
}
