import Link from "next/link";

export type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500 font-sans">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span aria-hidden="true" className="text-gray-300">
                ›
              </span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:underline hover:text-indigo-600 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-700 font-medium" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
