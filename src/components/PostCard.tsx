import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "../lib/posts";

export default function PostCard({
  post,
  lang,
}: {
  post: PostMeta;
  lang: "en" | "hr";
}) {
  return (
    <Link
      href={`/${lang}/${post.slug}`}
      className="group block rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition-all border border-gray-100"
    >
      <div className="relative w-full h-48">
        <Image
          src={post.coverImage || "/placeholder.jpg"}
          alt={post.heroAlt || post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      <div className="p-4 space-y-2">
        <div className="text-xs uppercase font-semibold text-indigo-600 tracking-wide">
          {post.categories?.[0]}
        </div>

        <h3 className="font-serif text-lg font-bold group-hover:text-indigo-700">
          {post.title}
        </h3>

        <span className="text-xs text-gray-400">
          {new Date(post.date).toLocaleDateString(
            lang === "en" ? "en-US" : "hr-HR",
            { year: "numeric", month: "short", day: "numeric" }
          )}
        </span>
      </div>
    </Link>
  );
}
