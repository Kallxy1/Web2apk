import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";
type CookieItem = { name: string; value: string; options: CookieOptions };
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items: CookieItem[]) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    }}
  );
  const { data: { user } } = await supabase.auth.getUser();
  const protectedRoute=request.nextUrl.pathname.startsWith("/dashboard")||request.nextUrl.pathname.startsWith("/c/");
  if(user&&protectedRoute){const {data:profile}=await supabase.from("profiles").select("is_suspended").eq("id",user.id).maybeSingle();if(profile?.is_suspended){const url=request.nextUrl.clone();url.pathname="/login";url.searchParams.set("error","suspended");return NextResponse.redirect(url)}}
  if (!user && protectedRoute) {
    const url = request.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url);
  }
  if (user && ["/login", "/register"].includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone(); url.pathname = "/dashboard"; return NextResponse.redirect(url);
  }
  return response;
}
export const config = { matcher: ["/dashboard/:path*", "/c/:path*", "/login", "/register"] };
