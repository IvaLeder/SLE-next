import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Stranica nije pronađena</h1>
      <p className="text-gray-600 mb-6">
        Žao nam je, tražena stranica ne postoji.
      </p>

      <Link
        href="/hr"
        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Povratak na naslovnicu
      </Link>
    </main>
  );
}
