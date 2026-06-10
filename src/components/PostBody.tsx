import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx";

/**
 * Renders a chunk of MDX article body with the site's standard plugin set.
 * Factored out so the article page can render the body either as one block or
 * as two halves (with an in-article ad between them) without duplicating the
 * remark/rehype config. Heading ids come from rehype-slug and depend only on
 * the heading text, so they stay consistent across a split.
 */
export default function PostBody({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
          ],
        },
      }}
    />
  );
}
