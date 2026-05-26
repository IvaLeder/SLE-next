import Link from "next/link";


export default function NotFound() {
  return (
    <main id="main-content" className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-6">
        Sorry, the page you're looking for doesn’t exist.
      </p>

      <Link
        href="/en"
        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Back to Home
      </Link>
    </main>
  );
}