// Client-safe Supabase config — no server-only imports, so this can be
// shared by both the browser client and the server/middleware clients.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// True no-op gate, same pattern as hasApiKey()/hasSentryServer()/hasLangfuse():
// the app runs exactly as it does today (fully open, mock-data dashboards)
// until both of these are set in Vercel.
export const hasSupabase = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
