import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { normalizeSupabaseUrl } from "./url";
type CookieItem = { name: string; value: string; options: CookieOptions };
export async function createClient() {
  const store = await cookies();
  return createServerClient(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(items: CookieItem[]) {
          try { items.forEach(({ name, value, options }) => store.set(name, value, options)); }
          catch { /* Called from a Server Component; middleware refreshes the session. */ }
        },
      },
    }
  );
}
