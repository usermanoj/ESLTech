import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./config";

// Callers must check hasSupabase() first — this throws rather than silently
// returning a broken client, since a Client Component that reaches this
// point without checking has a real bug, not a "not configured yet" state.
//
// NOTE: untyped for now. Once a real Supabase project exists, run
// `npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts`
// and parameterize createBrowserClient<Database>(...) here and in server.ts.
let client: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (!hasSupabase()) {
    throw new Error("Supabase is not configured — check hasSupabase() before calling supabaseBrowser().");
  }
  if (!client) {
    client = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return client;
}
