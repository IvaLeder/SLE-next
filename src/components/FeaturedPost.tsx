import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "@/types/post";

export default function FeaturedPost({
  post,
  lang,
}: {
  post: PostMeta;
  lang: "en" | "hr";
}) {
  return (
    <Link
      href={`/${lang}/${post.slug}`}
      className="group block rounded-2xl overflow-hidden shadow-md border bg-white hover:shadow-xl transition-all"
    >
      <div className="relative w-full h-72 sm:h-96">
        <Image
          src={post.coverImage || "/placeholder.jpg"}
          alt={post.heroAlt || post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-6 space-y-3">
        <div className="text-indigo-600 text-xs uppercase font-semibold tracking-wider">
          {post.categories?.[0]}
        </div>

        <h2 className="text-3xl font-serif font-bold group-hover:text-indigo-700 transition-colors">
          {post.title}
        </h2>

        <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>

        <div className="text-gray-400 text-sm">
          {new Date(post.date).toLocaleDateString(
            lang === "en" ? "en-US" : "hr-HR",
            { year: "numeric", month: "short", day: "numeric" }
          )}
        </div>
      </div>
    </Link>
  );
}