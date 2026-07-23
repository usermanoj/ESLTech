// Instant loading UI for /teacher/ingest. Next.js renders this immediately on
// navigation (and prefetches it), so the route never shows a dead white gap
// while the server does its auth check — see
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md
export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 h-5 w-40 animate-pulse rounded bg-white/5" />
      <div className="h-9 w-72 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/5" />

      <div className="glass mt-8 h-24 animate-pulse rounded-3xl" />

      <div className="mt-6 h-4 w-32 animate-pulse rounded bg-white/5" />
      <div className="mt-4 space-y-4">
        <div className="glass h-20 animate-pulse rounded-3xl" />
        <div className="glass h-20 animate-pulse rounded-3xl" />
      </div>
    </main>
  );
}
