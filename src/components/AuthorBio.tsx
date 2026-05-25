import { authors } from "@/lib/authors";

export default function AuthorBio({
  name,
  lang,
}: {
  name?: string;
  lang: "en" | "hr";
}) {
  if (!name) return null;
  const author = authors[name];
  if (!author) return null;

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="mt-10 pt-6 border-t flex gap-4 items-start">
      {/* Avatar — initials until a photo is available */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg select-none"
        aria-hidden="true"
      >
        {initial}
      </div>

      <div>
        <p className="font-semibold text-gray-900">{author.name}</p>
        <p className="text-xs text-indigo-600 mb-1.5">
          {lang === "hr" ? author.roleHr : author.role}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {lang === "hr" ? author.bioHr : author.bio}
        </p>
      </div>
    </div>
  );
}
