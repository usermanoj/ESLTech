import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { hasSupabase } from "@/lib/supabase/config";
import IngestPanel from "@/components/teacher/IngestPanel";

export default async function TeacherIngestPage() {
  // Only the auth gate runs before the HTML is sent. The document list is
  // deliberately NOT fetched here: it used to block the entire page behind
  // an auth lookup plus three queries that pull every chunk's full text, so
  // nothing rendered — not even the upload form — until all of it finished.
  // The form doesn't depend on that data, so the panel now loads it itself
  // and the page paints immediately (loading.tsx covers this auth check).
  await requireRole("teacher", "/teacher/ingest");

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/teacher" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">← Teacher dashboard</Link>
        <span className="rounded-full bg-[rgba(99,102,241,0.18)] px-3 py-1 text-sm text-[var(--brand2)]">📤 Upload material</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">Add curriculum material</h1>
      <p className="mt-1 text-[var(--muted)]">
        Upload one or more .docx, .pdf, .pptx or .txt files — each gets split into cited chunks for you to review
        before students ever see it.
      </p>

      {!hasSupabase() ? (
        <div className="glass mt-8 rounded-3xl p-6 text-sm text-[var(--muted)]">
          Uploads aren&apos;t configured for this deployment yet — Supabase env vars aren&apos;t set.
        </div>
      ) : (
        <div className="mt-8">
          <IngestPanel />
        </div>
      )}
    </main>
  );
}
