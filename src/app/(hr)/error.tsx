"use client";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main id="main-content" className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Nešto je pošlo po zlu</h1>
      <p className="text-gray-600 mb-6">
        Dogodila se neočekivana pogreška. Molimo pokušajte ponovno.
      </p>

      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-hover transition"
      >
        Pokušaj ponovno
      </button>
    </main>
  );
}
