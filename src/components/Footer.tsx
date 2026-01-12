import Link from "next/link";

export default function Footer({ lang }: { lang: string }) {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 text-sm grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="font-semibold mb-2">
            {lang === "en" ? "About" : "O nama"}
          </h3>
          <p className="text-gray-600">
            {lang === "en"
              ? "STEM activities and psychology insights for kids."
              : "STEM aktivnosti i psihologija za djecu."}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">
            {lang === "en" ? "Navigation" : "Navigacija"}
          </h3>
          <ul className="space-y-1">
            <li><Link href={`/${lang}`}>Home</Link></li>
            <li><Link href={`/${lang}/about`}>About</Link></li>
            <li><Link href={`/${lang}/contact`}>Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Legal</h3>
          <ul className="space-y-1">
            <li><Link href={`/${lang}/privacy`}>Privacy</Link></li>
            <li><Link href={`/${lang}/terms`}>Terms</Link></li>
          </ul>
        </div>

      </div>

      <div className="border-t py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} STEM Little Explorers
      </div>
    </footer>
  );
}
