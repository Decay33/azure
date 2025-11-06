import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 px-6 text-center text-white">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">404</p>
        <h1 className="text-4xl font-semibold md:text-5xl">We couldn&apos;t find that page.</h1>
        <p className="max-w-xl text-base text-white/70">
          The profile you&apos;re looking for may have been removed or set to private. Double-check the URL or head
          back to the homepage.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105"
      >
        Go home
      </Link>
    </main>
  );
}
