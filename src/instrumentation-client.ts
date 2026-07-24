// Browser-side observability bootstrap — a true no-op, and now a zero-byte
// one, until NEXT_PUBLIC_SENTRY_DSN is set in Vercel.
//
// The import MUST stay dynamic and inside the conditional. A top-level
// `import * as Sentry from "@sentry/nextjs"` bundles the whole SDK into the
// client regardless of the DSN check — the `if` only skips the init *call*,
// not the import. That shipped ~441 kB of Sentry into the root bundle of
// every page for a feature doing nothing, and was the dominant cost of
// time-to-interactive (measured live at 4364ms, against a 5ms server render).
//
// Because NEXT_PUBLIC_SENTRY_DSN is inlined at build time, an unset DSN makes
// this block statically unreachable, so the dynamic import is never emitted.
// Setting the DSN restores full error tracking with no code change — the same
// "wired but dormant" contract as before, without the weight. Mirrors how
// src/instrumentation.ts already loads Sentry on the server.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
    });
  });
}
