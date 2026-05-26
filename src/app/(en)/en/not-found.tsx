import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

// Read the file system at build time to suggest the 4 most-recent posts.
// not-found pages are statically rendered, so this runs once.
function getSuggestedPosts() {
  return getAllPosts("en").slice(0, 4);
}

export default function NotFound() {
  const suggestions = getSuggestedPosts();

  return (
    <main id="main-content" className="max-w-4xl mx-auto p-6 py-12">
      <div className="text-center mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand font-sans mb-2">
          404
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, the page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>
        <div className="flex flex-wrap justify-center gap-3 font-sans">
          <Link
            href="/en"
            className="inline-block px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/en/search"
            className="inline-block px-5 py-2.5 bg-white text-brand text-sm font-semibold rounded-lg ring-1 ring-brand hover:bg-brand-soft transition-colors"
          >
            Search posts
          </Link>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 font-sans">Or try one of these:</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((post, i) => (
              <PostCard key={post.slug} post={post} lang="en" priority={i < 2} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
